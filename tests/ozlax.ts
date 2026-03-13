import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { strict as assert } from "assert";

describe("ozlax", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Ozlax as Program;
  const authority = provider.wallet as anchor.Wallet;
  const treasury = Keypair.generate();
  const user = Keypair.generate();

  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], program.programId);
  const [userPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-position"), user.publicKey.toBuffer()],
    program.programId,
  );

  const ozxMint = Keypair.generate().publicKey;
  const marinadeStakeAccount = Keypair.generate().publicKey;
  const jitoStakeAccount = Keypair.generate().publicKey;

  const depositLamports = new BN(0.1 * LAMPORTS_PER_SOL);
  const withdrawLamports = new BN(0.05 * LAMPORTS_PER_SOL);
  const marinadeYield = new BN(4_000_000);
  const jitoYield = new BN(6_000_000);
  const totalYield = marinadeYield.add(jitoYield);
  const expectedFee = totalYield.mul(new BN(1_000)).div(new BN(10_000));
  const expectedDistributable = totalYield.sub(expectedFee);

  const airdrop = async (pubkey: PublicKey, amountSol = 2) => {
    const sig = await provider.connection.requestAirdrop(pubkey, amountSol * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig, "confirmed");
  };

  const pendingYieldLamports = async () => {
    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;
    const userPosition = (await program.account.userPosition.fetch(userPositionPda)) as any;
    const acc = new BN(vault.accYieldPerShare.toString());
    const deposited = new BN(userPosition.depositedAmount.toString());
    const rewardDebt = new BN(userPosition.rewardDebt.toString());
    const precision = new BN("1000000000000");
    return deposited.mul(acc).div(precision).sub(rewardDebt);
  };

  before(async () => {
    await airdrop(authority.publicKey, 3);
    await airdrop(user.publicKey, 2);
    await airdrop(treasury.publicKey, 1);
  });

  it("initializes vault with a 10% fee", async () => {
    await program.methods
      .initializeVault(1_000, treasury.publicKey, ozxMint, marinadeStakeAccount, jitoStakeAccount)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;

    assert.equal(vault.feeBps, 1_000);
    assert.equal(vault.marinadePct, 50);
    assert.equal(vault.jitoPct, 50);
    assert.equal(vault.treasury.toBase58(), treasury.publicKey.toBase58());
  });

  it("deposits 0.1 SOL and creates the user position", async () => {
    await program.methods
      .deposit(depositLamports)
      .accounts({
        vault: vaultPda,
        userPosition: userPositionPda,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const userPosition = (await program.account.userPosition.fetch(userPositionPda)) as any;
    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;

    assert.equal(userPosition.owner.toBase58(), user.publicKey.toBase58());
    assert.equal(userPosition.depositedAmount.toString(), depositLamports.toString());
    assert.equal(vault.totalDeposited.toString(), depositLamports.toString());
  });

  it("harvests yield and sends the treasury fee", async () => {
    const treasuryBefore = await provider.connection.getBalance(treasury.publicKey);

    await program.methods
      .harvestYield(marinadeYield, jitoYield)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
        treasury: treasury.publicKey,
      })
      .rpc();

    const treasuryAfter = await provider.connection.getBalance(treasury.publicKey);
    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;

    assert.equal(treasuryAfter - treasuryBefore, expectedFee.toNumber());
    assert.equal(vault.totalYieldHarvested.toString(), totalYield.toString());

    const pending = await pendingYieldLamports();
    assert.ok(pending.eq(expectedDistributable), "user should have pending yield after harvest");
  });

  it("claims yield", async () => {
    const before = (await program.account.userPosition.fetch(userPositionPda)) as any;

    await program.methods
      .claimYield()
      .accounts({
        vault: vaultPda,
        userPosition: userPositionPda,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    const after = (await program.account.userPosition.fetch(userPositionPda)) as any;
    const pending = await pendingYieldLamports();

    assert.equal(
      new BN(after.yieldEarnedClaimed.toString()).sub(new BN(before.yieldEarnedClaimed.toString())).toString(),
      expectedDistributable.toString(),
    );
    assert.ok(pending.isZero(), "pending yield should be cleared after claim");
  });

  it("withdraws 0.05 SOL and leaves the position consistent", async () => {
    await program.methods
      .withdraw(withdrawLamports)
      .accounts({
        vault: vaultPda,
        userPosition: userPositionPda,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    const userPosition = (await program.account.userPosition.fetch(userPositionPda)) as any;
    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;

    assert.equal(
      userPosition.depositedAmount.toString(),
      depositLamports.sub(withdrawLamports).toString(),
    );
    assert.equal(vault.totalDeposited.toString(), depositLamports.sub(withdrawLamports).toString());
    assert.equal(userPosition.yieldEarnedClaimed.toString(), expectedDistributable.toString());
  });
});

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
  const nonAuthority = Keypair.generate();

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
  const rewardPrecision = new BN("1000000000000");

  const airdrop = async (pubkey: PublicKey, amountSol = 2) => {
    const sig = await provider.connection.requestAirdrop(pubkey, amountSol * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig, "confirmed");
  };

  const expectFailure = async (callback: () => Promise<unknown>, expectedPattern: RegExp) => {
    let message = "";

    try {
      await callback();
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    assert.ok(message, `expected failure matching ${expectedPattern}`);
    assert.match(message, expectedPattern);
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
    await airdrop(nonAuthority.publicKey, 1);
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

  it("rejects deposit below minimum (0.01 SOL)", async () => {
    await expectFailure(
      () =>
        program.methods
          .deposit(new BN(1_000))
          .accounts({
            vault: vaultPda,
            userPosition: userPositionPda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc(),
      /DepositTooSmall/,
    );
  });

  it("rejects withdraw of more than deposited", async () => {
    await expectFailure(
      () =>
        program.methods
          .withdraw(new BN(LAMPORTS_PER_SOL))
          .accounts({
            vault: vaultPda,
            userPosition: userPositionPda,
            user: user.publicKey,
          })
          .signers([user])
          .rpc(),
      /InsufficientDeposit/,
    );
  });

  it("rejects harvest from non-authority", async () => {
    await expectFailure(
      () =>
        program.methods
          .harvestYield(new BN(1), new BN(1))
          .accounts({
            vault: vaultPda,
            authority: nonAuthority.publicKey,
            treasury: treasury.publicKey,
          })
          .signers([nonAuthority])
          .rpc(),
      /(Unauthorized|Constraint)/,
    );
  });

  it("rejects claim when no yield pending", async () => {
    await expectFailure(
      () =>
        program.methods
          .claimYield()
          .accounts({
            vault: vaultPda,
            userPosition: userPositionPda,
            user: user.publicKey,
          })
          .signers([user])
          .rpc(),
      /NoYieldAvailable/,
    );
  });

  it("handles second deposit correctly", async () => {
    const secondDepositLamports = withdrawLamports;
    const before = (await program.account.userPosition.fetch(userPositionPda)) as any;

    await program.methods
      .deposit(secondDepositLamports)
      .accounts({
        vault: vaultPda,
        userPosition: userPositionPda,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const after = (await program.account.userPosition.fetch(userPositionPda)) as any;
    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;
    const expectedDeposited = depositLamports;
    const expectedRewardDebt = expectedDeposited.mul(new BN(vault.accYieldPerShare.toString())).div(rewardPrecision);

    assert.equal(after.depositedAmount.toString(), expectedDeposited.toString());
    assert.ok(new BN(after.rewardDebt.toString()).gt(new BN(before.rewardDebt.toString())));
    assert.equal(after.rewardDebt.toString(), expectedRewardDebt.toString());
  });

  it("rebalance updates allocation", async () => {
    await program.methods
      .rebalance(60, 40)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
      })
      .rpc();

    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;
    assert.equal(vault.marinadePct, 60);
    assert.equal(vault.jitoPct, 40);
    assert.equal(vault.marinadePct + vault.jitoPct, 100);
  });

  it("rejects invalid rebalance (sum != 100)", async () => {
    await expectFailure(
      () =>
        program.methods
          .rebalance(60, 50)
          .accounts({
            vault: vaultPda,
            authority: authority.publicKey,
          })
          .rpc(),
      /InvalidAllocation/,
    );
  });
});

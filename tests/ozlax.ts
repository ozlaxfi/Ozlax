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
  const secondUser = Keypair.generate();
  const fullWithdrawUser = Keypair.generate();
  const nonAuthority = Keypair.generate();
  const stressUserA = Keypair.generate();
  const stressUserB = Keypair.generate();
  const stressUserC = Keypair.generate();
  const rebalanceUser = Keypair.generate();

  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], program.programId);
  const [userPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-position"), user.publicKey.toBuffer()],
    program.programId,
  );
  const [secondUserPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-position"), secondUser.publicKey.toBuffer()],
    program.programId,
  );
  const [fullWithdrawUserPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-position"), fullWithdrawUser.publicKey.toBuffer()],
    program.programId,
  );
  const [stressUserAPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-position"), stressUserA.publicKey.toBuffer()],
    program.programId,
  );
  const [stressUserBPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-position"), stressUserB.publicKey.toBuffer()],
    program.programId,
  );
  const [stressUserCPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-position"), stressUserC.publicKey.toBuffer()],
    program.programId,
  );
  const [rebalanceUserPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-position"), rebalanceUser.publicKey.toBuffer()],
    program.programId,
  );

  const ozxMint = Keypair.generate().publicKey;
  const marinadeStakeAccount = Keypair.generate().publicKey;
  const jitoStakeAccount = Keypair.generate().publicKey;
  let initializedTreasury = treasury.publicKey;
  let vaultPreinitialized = false;

  const depositLamports = new BN(0.1 * LAMPORTS_PER_SOL);
  const withdrawLamports = new BN(0.05 * LAMPORTS_PER_SOL);
  const secondUserDepositLamports = new BN(0.2 * LAMPORTS_PER_SOL);
  const redepositLamports = new BN(0.02 * LAMPORTS_PER_SOL);
  const marinadeYield = new BN(4_000_000);
  const jitoYield = new BN(6_000_000);
  const totalYield = marinadeYield.add(jitoYield);
  const expectedFee = totalYield.mul(new BN(1_000)).div(new BN(10_000));
  const expectedDistributable = totalYield.sub(expectedFee);
  const rewardPrecision = new BN("1000000000000");
  const stressDepositA = new BN(0.03 * LAMPORTS_PER_SOL);
  const stressDepositB = new BN(0.05 * LAMPORTS_PER_SOL);
  const stressDepositC = new BN(0.08 * LAMPORTS_PER_SOL);
  const rebalanceDepositLamports = new BN(0.07 * LAMPORTS_PER_SOL);

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

  const assertBnClose = (actual: BN, expected: BN, tolerance = 1) => {
    const delta = actual.sub(expected).abs();
    assert.ok(
      delta.lte(new BN(tolerance)),
      `expected ${actual.toString()} to be within ${tolerance} lamports of ${expected.toString()}`,
    );
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

  const pendingYieldLamportsFor = async (positionPda: PublicKey) => {
    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;
    const userPosition = (await program.account.userPosition.fetch(positionPda)) as any;
    const acc = new BN(vault.accYieldPerShare.toString());
    const deposited = new BN(userPosition.depositedAmount.toString());
    const rewardDebt = new BN(userPosition.rewardDebt.toString());
    return deposited.mul(acc).div(rewardPrecision).sub(rewardDebt);
  };

  before(async () => {
    await airdrop(authority.publicKey, 3);
    await airdrop(user.publicKey, 2);
    await airdrop(secondUser.publicKey, 2);
    await airdrop(fullWithdrawUser.publicKey, 2);
    await airdrop(treasury.publicKey, 1);
    await airdrop(nonAuthority.publicKey, 1);
    await airdrop(stressUserA.publicKey, 2);
    await airdrop(stressUserB.publicKey, 2);
    await airdrop(stressUserC.publicKey, 2);
    await airdrop(rebalanceUser.publicKey, 2);

    try {
      const existingVault = (await program.account.vaultState.fetch(vaultPda)) as any;
      initializedTreasury = existingVault.treasury;
      vaultPreinitialized = true;
    } catch {
      initializedTreasury = treasury.publicKey;
      vaultPreinitialized = false;
    }
  });

  it("initializes vault with a 10% fee", async () => {
    if (!vaultPreinitialized) {
      await program.methods
        .initializeVault(1_000, treasury.publicKey, ozxMint, marinadeStakeAccount, jitoStakeAccount)
        .accounts({
          vault: vaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }

    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;

    assert.equal(vault.feeBps, 1_000);
    assert.equal(vault.marinadePct, 50);
    assert.equal(vault.jitoPct, 50);
    assert.equal(vault.treasury.toBase58(), initializedTreasury.toBase58());
  });

  it("rejects double vault initialization", async () => {
    await expectFailure(
      () =>
        program.methods
          .initializeVault(1_000, treasury.publicKey, ozxMint, marinadeStakeAccount, jitoStakeAccount)
          .accounts({
            vault: vaultPda,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc(),
      /already in use|account .* in use|Allocate/i,
    );
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
    const treasuryBefore = await provider.connection.getBalance(initializedTreasury);

    await program.methods
      .harvestYield(marinadeYield, jitoYield)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
        treasury: initializedTreasury,
      })
      .rpc();

    const treasuryAfter = await provider.connection.getBalance(initializedTreasury);
    const vault = (await program.account.vaultState.fetch(vaultPda)) as any;
    if (initializedTreasury.equals(authority.publicKey)) {
      const netTreasuryIncrease = treasuryAfter - treasuryBefore;
      assert.ok(netTreasuryIncrease > 0, "treasury should still receive a positive net increase");
      assert.ok(
        expectedFee.toNumber() - netTreasuryIncrease < 20_000,
        `expected treasury delta ${netTreasuryIncrease} to land within validator fee tolerance of ${expectedFee.toString()}`,
      );
    } else {
      assert.equal(treasuryAfter - treasuryBefore, expectedFee.toNumber());
    }
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

  it("handles full withdraw of entire deposited amount", async () => {
    await program.methods
      .deposit(depositLamports)
      .accounts({
        vault: vaultPda,
        userPosition: fullWithdrawUserPositionPda,
        user: fullWithdrawUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([fullWithdrawUser])
      .rpc();

    await program.methods
      .withdraw(depositLamports)
      .accounts({
        vault: vaultPda,
        userPosition: fullWithdrawUserPositionPda,
        user: fullWithdrawUser.publicKey,
      })
      .signers([fullWithdrawUser])
      .rpc();

    let userPosition = (await program.account.userPosition.fetch(fullWithdrawUserPositionPda)) as any;
    assert.equal(userPosition.depositedAmount.toString(), "0");

    await program.methods
      .deposit(redepositLamports)
      .accounts({
        vault: vaultPda,
        userPosition: fullWithdrawUserPositionPda,
        user: fullWithdrawUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([fullWithdrawUser])
      .rpc();

    userPosition = (await program.account.userPosition.fetch(fullWithdrawUserPositionPda)) as any;
    assert.equal(userPosition.depositedAmount.toString(), redepositLamports.toString());

    await program.methods
      .withdraw(redepositLamports)
      .accounts({
        vault: vaultPda,
        userPosition: fullWithdrawUserPositionPda,
        user: fullWithdrawUser.publicKey,
      })
      .signers([fullWithdrawUser])
      .rpc();

    userPosition = (await program.account.userPosition.fetch(fullWithdrawUserPositionPda)) as any;
    assert.equal(userPosition.depositedAmount.toString(), "0");
  });

  it("rebalance followed by harvest uses new allocation correctly", async () => {
    await program.methods
      .rebalance(70, 30)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
      })
      .rpc();

    await program.methods
      .deposit(rebalanceDepositLamports)
      .accounts({
        vault: vaultPda,
        userPosition: rebalanceUserPositionPda,
        user: rebalanceUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([rebalanceUser])
      .rpc();

    const vaultBeforeHarvest = (await program.account.vaultState.fetch(vaultPda)) as any;
    const totalDepositedBefore = new BN(vaultBeforeHarvest.totalDeposited.toString());
    const totalYieldBefore = new BN(vaultBeforeHarvest.totalYieldHarvested.toString());

    assert.equal(vaultBeforeHarvest.marinadePct, 70);
    assert.equal(vaultBeforeHarvest.jitoPct, 30);

    const rebalanceMarinadeYield = new BN(7_000_000);
    const rebalanceJitoYield = new BN(3_000_000);
    const rebalanceTotalYield = rebalanceMarinadeYield.add(rebalanceJitoYield);
    const rebalanceFee = rebalanceTotalYield.mul(new BN(1_000)).div(new BN(10_000));
    const rebalanceDistributable = rebalanceTotalYield.sub(rebalanceFee);
    const rebalanceIncrement = rebalanceDistributable.mul(rewardPrecision).div(totalDepositedBefore);
    const expectedPending = rebalanceDepositLamports.mul(rebalanceIncrement).div(rewardPrecision);

    await program.methods
      .harvestYield(rebalanceMarinadeYield, rebalanceJitoYield)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
        treasury: initializedTreasury,
      })
      .rpc();

    const pending = await pendingYieldLamportsFor(rebalanceUserPositionPda);
    assertBnClose(pending, expectedPending);

    await program.methods
      .claimYield()
      .accounts({
        vault: vaultPda,
        userPosition: rebalanceUserPositionPda,
        user: rebalanceUser.publicKey,
      })
      .signers([rebalanceUser])
      .rpc();

    const rebalanceUserAfter = (await program.account.userPosition.fetch(rebalanceUserPositionPda)) as any;
    const vaultAfterHarvest = (await program.account.vaultState.fetch(vaultPda)) as any;
    const currentAcc = new BN(vaultAfterHarvest.accYieldPerShare.toString());

    assertBnClose(new BN(rebalanceUserAfter.yieldEarnedClaimed.toString()), expectedPending);
    assert.equal(
      rebalanceUserAfter.rewardDebt.toString(),
      rebalanceDepositLamports.mul(currentAcc).div(rewardPrecision).toString(),
    );
    assert.equal(vaultAfterHarvest.marinadePct, 70);
    assert.equal(vaultAfterHarvest.jitoPct, 30);
    assert.equal(
      vaultAfterHarvest.totalYieldHarvested.toString(),
      totalYieldBefore.add(rebalanceTotalYield).toString(),
    );
  });

  it("multiple harvests accumulate correctly", async () => {
    const firstMarinadeYield = new BN(2_000_000);
    const firstJitoYield = new BN(3_000_000);
    const secondMarinadeYield = new BN(1_000_000);
    const secondJitoYield = new BN(5_000_000);

    const vaultBefore = (await program.account.vaultState.fetch(vaultPda)) as any;
    const totalDepositedBefore = new BN(vaultBefore.totalDeposited.toString());
    const accBefore = new BN(vaultBefore.accYieldPerShare.toString());
    const totalYieldBefore = new BN(vaultBefore.totalYieldHarvested.toString());

    await program.methods
      .harvestYield(firstMarinadeYield, firstJitoYield)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
        treasury: initializedTreasury,
      })
      .rpc();

    await program.methods
      .harvestYield(secondMarinadeYield, secondJitoYield)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
        treasury: initializedTreasury,
      })
      .rpc();

    const firstTotalYield = firstMarinadeYield.add(firstJitoYield);
    const secondTotalYield = secondMarinadeYield.add(secondJitoYield);
    const firstFee = firstTotalYield.mul(new BN(1_000)).div(new BN(10_000));
    const secondFee = secondTotalYield.mul(new BN(1_000)).div(new BN(10_000));
    const firstIncrement = firstTotalYield
      .sub(firstFee)
      .mul(rewardPrecision)
      .div(totalDepositedBefore);
    const secondIncrement = secondTotalYield
      .sub(secondFee)
      .mul(rewardPrecision)
      .div(totalDepositedBefore);

    const vaultAfter = (await program.account.vaultState.fetch(vaultPda)) as any;
    assert.equal(
      vaultAfter.accYieldPerShare.toString(),
      accBefore.add(firstIncrement).add(secondIncrement).toString(),
    );
    assert.equal(
      vaultAfter.totalYieldHarvested.toString(),
      totalYieldBefore.add(firstTotalYield).add(secondTotalYield).toString(),
    );
  });

  it("second user deposits and claims independently", async () => {
    const existingPending = await pendingYieldLamports();
    if (existingPending.gt(new BN(0))) {
      await program.methods
        .claimYield()
        .accounts({
          vault: vaultPda,
          userPosition: userPositionPda,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
    }

    await program.methods
      .deposit(secondUserDepositLamports)
      .accounts({
        vault: vaultPda,
        userPosition: secondUserPositionPda,
        user: secondUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([secondUser])
      .rpc();

    const firstUserBefore = (await program.account.userPosition.fetch(userPositionPda)) as any;
    const secondUserBefore = (await program.account.userPosition.fetch(secondUserPositionPda)) as any;
    const vaultBeforeHarvest = (await program.account.vaultState.fetch(vaultPda)) as any;
    const firstUserDeposit = new BN(firstUserBefore.depositedAmount.toString());
    const secondUserDeposit = new BN(secondUserBefore.depositedAmount.toString());
    const totalDeposited = new BN(vaultBeforeHarvest.totalDeposited.toString());
    const firstClaimedBefore = new BN(firstUserBefore.yieldEarnedClaimed.toString());
    const secondClaimedBefore = new BN(secondUserBefore.yieldEarnedClaimed.toString());

    const sharedMarinadeYield = new BN(3_000_000);
    const sharedJitoYield = new BN(9_000_000);
    const sharedTotalYield = sharedMarinadeYield.add(sharedJitoYield);
    const sharedFee = sharedTotalYield.mul(new BN(1_000)).div(new BN(10_000));
    const sharedDistributable = sharedTotalYield.sub(sharedFee);
    const sharedIncrement = sharedDistributable.mul(rewardPrecision).div(totalDeposited);
    const expectedFirstPending = firstUserDeposit.mul(sharedIncrement).div(rewardPrecision);
    const expectedSecondPending = secondUserDeposit.mul(sharedIncrement).div(rewardPrecision);

    await program.methods
      .harvestYield(sharedMarinadeYield, sharedJitoYield)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
        treasury: initializedTreasury,
      })
      .rpc();

    const firstPending = await pendingYieldLamportsFor(userPositionPda);
    const secondPending = await pendingYieldLamportsFor(secondUserPositionPda);

    assertBnClose(firstPending, expectedFirstPending);
    assertBnClose(secondPending, expectedSecondPending);

    await program.methods
      .claimYield()
      .accounts({
        vault: vaultPda,
        userPosition: userPositionPda,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    await program.methods
      .claimYield()
      .accounts({
        vault: vaultPda,
        userPosition: secondUserPositionPda,
        user: secondUser.publicKey,
      })
      .signers([secondUser])
      .rpc();

    const firstUserAfter = (await program.account.userPosition.fetch(userPositionPda)) as any;
    const secondUserAfter = (await program.account.userPosition.fetch(secondUserPositionPda)) as any;
    const vaultAfterClaims = (await program.account.vaultState.fetch(vaultPda)) as any;
    const currentAcc = new BN(vaultAfterClaims.accYieldPerShare.toString());

    assertBnClose(new BN(firstUserAfter.yieldEarnedClaimed.toString()).sub(firstClaimedBefore), expectedFirstPending);
    assertBnClose(new BN(secondUserAfter.yieldEarnedClaimed.toString()).sub(secondClaimedBefore), expectedSecondPending);
    assert.equal(
      firstUserAfter.rewardDebt.toString(),
      firstUserDeposit.mul(currentAcc).div(rewardPrecision).toString(),
    );
    assert.equal(
      secondUserAfter.rewardDebt.toString(),
      secondUserDeposit.mul(currentAcc).div(rewardPrecision).toString(),
    );
  });

  it("handles rapid deposit-harvest-claim cycle for multiple users", async () => {
    for (const [wallet, positionPda, amount] of [
      [stressUserA, stressUserAPositionPda, stressDepositA],
      [stressUserB, stressUserBPositionPda, stressDepositB],
      [stressUserC, stressUserCPositionPda, stressDepositC],
    ] as const) {
      await program.methods
        .deposit(amount)
        .accounts({
          vault: vaultPda,
          userPosition: positionPda,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([wallet])
        .rpc();
    }

    const vaultBeforeHarvest = (await program.account.vaultState.fetch(vaultPda)) as any;
    const totalDepositedBefore = new BN(vaultBeforeHarvest.totalDeposited.toString());
    const totalYieldBefore = new BN(vaultBeforeHarvest.totalYieldHarvested.toString());

    const stressMarinadeYield = new BN(6_000_000);
    const stressJitoYield = new BN(9_000_000);
    const stressTotalYield = stressMarinadeYield.add(stressJitoYield);
    const stressFee = stressTotalYield.mul(new BN(1_000)).div(new BN(10_000));
    const stressDistributable = stressTotalYield.sub(stressFee);
    const stressIncrement = stressDistributable.mul(rewardPrecision).div(totalDepositedBefore);

    await program.methods
      .harvestYield(stressMarinadeYield, stressJitoYield)
      .accounts({
        vault: vaultPda,
        authority: authority.publicKey,
        treasury: initializedTreasury,
      })
      .rpc();

    const expectedPendingA = stressDepositA.mul(stressIncrement).div(rewardPrecision);
    const expectedPendingB = stressDepositB.mul(stressIncrement).div(rewardPrecision);
    const expectedPendingC = stressDepositC.mul(stressIncrement).div(rewardPrecision);

    assertBnClose(await pendingYieldLamportsFor(stressUserAPositionPda), expectedPendingA);
    assertBnClose(await pendingYieldLamportsFor(stressUserBPositionPda), expectedPendingB);
    assertBnClose(await pendingYieldLamportsFor(stressUserCPositionPda), expectedPendingC);

    const claimedBeforeA = new BN(
      ((await program.account.userPosition.fetch(stressUserAPositionPda)) as any).yieldEarnedClaimed.toString(),
    );
    const claimedBeforeB = new BN(
      ((await program.account.userPosition.fetch(stressUserBPositionPda)) as any).yieldEarnedClaimed.toString(),
    );
    const claimedBeforeC = new BN(
      ((await program.account.userPosition.fetch(stressUserCPositionPda)) as any).yieldEarnedClaimed.toString(),
    );

    for (const [wallet, positionPda] of [
      [stressUserA, stressUserAPositionPda],
      [stressUserB, stressUserBPositionPda],
      [stressUserC, stressUserCPositionPda],
    ] as const) {
      await program.methods
        .claimYield()
        .accounts({
          vault: vaultPda,
          userPosition: positionPda,
          user: wallet.publicKey,
        })
        .signers([wallet])
        .rpc();
    }

    const positionA = (await program.account.userPosition.fetch(stressUserAPositionPda)) as any;
    const positionB = (await program.account.userPosition.fetch(stressUserBPositionPda)) as any;
    const positionC = (await program.account.userPosition.fetch(stressUserCPositionPda)) as any;
    const vaultAfterClaims = (await program.account.vaultState.fetch(vaultPda)) as any;
    const currentAcc = new BN(vaultAfterClaims.accYieldPerShare.toString());

    assertBnClose(new BN(positionA.yieldEarnedClaimed.toString()).sub(claimedBeforeA), expectedPendingA);
    assertBnClose(new BN(positionB.yieldEarnedClaimed.toString()).sub(claimedBeforeB), expectedPendingB);
    assertBnClose(new BN(positionC.yieldEarnedClaimed.toString()).sub(claimedBeforeC), expectedPendingC);

    assert.equal(positionA.rewardDebt.toString(), stressDepositA.mul(currentAcc).div(rewardPrecision).toString());
    assert.equal(positionB.rewardDebt.toString(), stressDepositB.mul(currentAcc).div(rewardPrecision).toString());
    assert.equal(positionC.rewardDebt.toString(), stressDepositC.mul(currentAcc).div(rewardPrecision).toString());
    assert.equal(
      vaultAfterClaims.totalYieldHarvested.toString(),
      totalYieldBefore.add(stressTotalYield).toString(),
    );
    assert.equal(vaultAfterClaims.totalDeposited.toString(), totalDepositedBefore.toString());
  });
});

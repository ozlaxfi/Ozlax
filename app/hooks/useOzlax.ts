import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { useEffect, useState } from "react";

import { getProgram } from "../utils/anchor";

const MIN_DEPOSIT_SOL = 0.01;
const MARINADE_ESTIMATED_APY = 0.072;
const JITO_ESTIMATED_APY = 0.081;
const ACC_PRECISION = 1_000_000_000_000n;

type ActionName = "deposit" | "withdraw" | "claimYield" | null;

export type ActionResult = {
  ok: boolean;
  message: string;
  signature?: string;
  amount?: number;
};

type VaultState = {
  totalDeposited: BN;
  totalYieldHarvested: BN;
  accYieldPerShare: BN;
  feeBps: number;
  marinadePct: number;
  jitoPct: number;
};

type UserPosition = {
  depositedAmount: BN;
  rewardDebt: BN;
  yieldEarnedClaimed: BN;
  lastHarvestSlot: BN;
};

const lamportsToSol = (lamports: string | number | bigint) => Number(lamports) / LAMPORTS_PER_SOL;

const describeError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("DepositTooSmall")) {
    return "Deposits must be at least 0.01 SOL.";
  }
  if (message.includes("InsufficientDeposit")) {
    return "That withdrawal is larger than your deposited balance.";
  }
  if (message.includes("NoYieldAvailable")) {
    return "There is nothing ready to claim right now.";
  }
  if (message.includes("WalletSignTransactionError")) {
    return "The transaction was cancelled in your wallet.";
  }
  if (message.includes("failed to fetch") || message.includes("NetworkError")) {
    return "The RPC request failed. Please retry once the connection is stable.";
  }

  return message;
};

export const useOzlax = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [actionLoading, setActionLoading] = useState<ActionName>(null);
  const [error, setError] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [previewReason, setPreviewReason] = useState("");
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [pendingYield, setPendingYield] = useState(0);
  const [weightedApy, setWeightedApy] = useState<number | null>(null);
  const [tvl, setTvl] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const getPdas = () => {
    const program = getProgram(connection, wallet as any);
    const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], program.programId);
    const walletKey = wallet.publicKey || PublicKey.default;
    const [userPositionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user-position"), walletKey.toBuffer()],
      program.programId,
    );

    return { program, vaultPda, userPositionPda };
  };

  const refresh = async () => {
    setIsRefreshing(true);
    setError("");

    try {
      const { program, vaultPda, userPositionPda } = getPdas();
      let nextVaultState: VaultState | null = null;

      try {
        nextVaultState = (await program.account.vaultState.fetch(vaultPda)) as VaultState;
      } catch {
        nextVaultState = null;
      }

      if (!nextVaultState) {
        setVaultState(null);
        setTvl(null);
        setWeightedApy(null);
        setIsPreview(true);
        setPreviewReason("The selected RPC is not serving a live Ozlax vault right now.");
        setStatusNote("Switch to the network where Ozlax is deployed if you want live vault state and transactions.");
        setUserPosition(null);
        setPendingYield(0);
      } else {
        setVaultState(nextVaultState);
        setTvl(lamportsToSol(nextVaultState.totalDeposited.toString()));
        setWeightedApy(
          (MARINADE_ESTIMATED_APY * nextVaultState.marinadePct + JITO_ESTIMATED_APY * nextVaultState.jitoPct) / 100,
        );
        setIsPreview(false);
        setPreviewReason("");
        setStatusNote("Live vault state loaded from chain.");

        if (wallet.publicKey) {
          try {
            const nextUserPosition = (await program.account.userPosition.fetch(userPositionPda)) as UserPosition;
            setUserPosition(nextUserPosition);

            const deposited = BigInt(nextUserPosition.depositedAmount.toString());
            const accYieldPerShare = BigInt(nextVaultState.accYieldPerShare.toString());
            const rewardDebt = BigInt(nextUserPosition.rewardDebt.toString());
            const accruedLamports = deposited * accYieldPerShare / ACC_PRECISION;
            const pendingLamports = accruedLamports > rewardDebt ? accruedLamports - rewardDebt : 0n;

            setPendingYield(Number(pendingLamports) / LAMPORTS_PER_SOL);
          } catch {
            setUserPosition(null);
            setPendingYield(0);
          }
        } else {
          setUserPosition(null);
          setPendingYield(0);
        }
      }

      if (wallet.publicKey) {
        const balanceLamports = await connection.getBalance(wallet.publicKey, "confirmed");
        setWalletBalance(balanceLamports / LAMPORTS_PER_SOL);
      } else {
        setWalletBalance(null);
      }
    } catch (refreshError) {
      setError(describeError(refreshError));
      setStatusNote("Ozlax could not read vault state from the selected RPC. Check the network and try again.");
      setIsPreview(true);
      setPreviewReason("The selected RPC is not returning live Ozlax state right now.");
      setVaultState(null);
      setTvl(null);
      setWeightedApy(null);
      setUserPosition(null);
      setPendingYield(0);
      setWalletBalance(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [wallet.publicKey?.toBase58(), connection.rpcEndpoint]);

  const requireLiveWallet = () => {
    if (!wallet.publicKey) {
      return "Connect a wallet to interact with the vault.";
    }
    if (isPreview || !vaultState) {
      return "Switch to the network where Ozlax is deployed if you want to interact with the live vault.";
    }

    return null;
  };

  const runAction = async (
    action: Exclude<ActionName, null>,
    callback: () => Promise<string>,
    successMessage: string,
    amount?: number,
  ): Promise<ActionResult> => {
    setActionLoading(action);
    setError("");

    try {
      const signature = await callback();
      await refresh();
      return { ok: true, message: successMessage, signature, amount };
    } catch (submitError) {
      const message = describeError(submitError);
      setError(message);
      return { ok: false, message };
    } finally {
      setActionLoading(null);
    }
  };

  const deposit = async (amount: number): Promise<ActionResult> => {
    const blocker = requireLiveWallet();
    if (blocker) {
      setError(blocker);
      return { ok: false, message: blocker };
    }
    if (!Number.isFinite(amount) || amount < MIN_DEPOSIT_SOL) {
      const message = "Deposits must be at least 0.01 SOL.";
      setError(message);
      return { ok: false, message };
    }

    const { program, vaultPda, userPositionPda } = getPdas();
    return runAction(
      "deposit",
      () =>
        program.methods
          .deposit(new BN(Math.round(amount * LAMPORTS_PER_SOL)))
          .accounts({
            vault: vaultPda,
            userPosition: userPositionPda,
            user: wallet.publicKey!,
            systemProgram: SystemProgram.programId,
          })
          .rpc(),
      `Deposit submitted for ${amount.toFixed(2)} SOL.`,
      amount,
    );
  };

  const withdraw = async (amount: number): Promise<ActionResult> => {
    const blocker = requireLiveWallet();
    if (blocker) {
      setError(blocker);
      return { ok: false, message: blocker };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      const message = "Enter a valid withdrawal amount.";
      setError(message);
      return { ok: false, message };
    }

    const { program, vaultPda, userPositionPda } = getPdas();
    return runAction(
      "withdraw",
      () =>
        program.methods
          .withdraw(new BN(Math.round(amount * LAMPORTS_PER_SOL)))
          .accounts({
            vault: vaultPda,
            userPosition: userPositionPda,
            user: wallet.publicKey!,
          })
          .rpc(),
      `Withdrawal submitted for ${amount.toFixed(2)} SOL.`,
      amount,
    );
  };

  const claimYield = async (): Promise<ActionResult> => {
    const blocker = requireLiveWallet();
    if (blocker) {
      setError(blocker);
      return { ok: false, message: blocker };
    }
    if (pendingYield <= 0) {
      const message = "There is nothing ready to claim right now.";
      setError(message);
      return { ok: false, message };
    }

    const { program, vaultPda, userPositionPda } = getPdas();
    const amount = pendingYield;

    return runAction(
      "claimYield",
      () =>
        program.methods
          .claimYield()
          .accounts({
            vault: vaultPda,
            userPosition: userPositionPda,
            user: wallet.publicKey!,
          })
          .rpc(),
      `Claim submitted for ${amount.toFixed(4)} SOL.`,
      amount,
    );
  };

  return {
    deposit,
    withdraw,
    claimYield,
    refresh,
    isRefreshing,
    actionLoading,
    error,
    statusNote,
    previewReason,
    userPosition,
    vaultState,
    pendingYield,
    weightedApy,
    tvl,
    walletBalance,
    isPreview,
  };
};

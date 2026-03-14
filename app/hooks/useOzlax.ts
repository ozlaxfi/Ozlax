import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { useEffect, useState } from "react";

import { getProgram } from "../utils/anchor";

const MARINADE_ESTIMATED_APY = 0.072;
const JITO_ESTIMATED_APY = 0.081;
const ACC_PRECISION = 1_000_000_000_000n;
const DEMO_TVL = 182.46;

const demoVaultState = {
  totalDeposited: new BN(Math.round(DEMO_TVL * LAMPORTS_PER_SOL)),
  totalYieldHarvested: new BN(Math.round(8.12 * LAMPORTS_PER_SOL)),
  accYieldPerShare: new BN("431125000000"),
  feeBps: 1000,
  marinadePct: 58,
  jitoPct: 42,
};

export const useOzlax = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [userPosition, setUserPosition] = useState<any>(null);
  const [vaultState, setVaultState] = useState<any>(null);
  const [pendingYield, setPendingYield] = useState(0);
  const [weightedApy, setWeightedApy] = useState(0);
  const [tvl, setTvl] = useState(0);
  const [isFallback, setIsFallback] = useState(false);

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
    try {
      const { program, vaultPda, userPositionPda } = getPdas();
      let nextVaultState: any = demoVaultState;
      let usingFallback = false;

      try {
        nextVaultState = await program.account.vaultState.fetch(vaultPda);
      } catch {
        usingFallback = true;
      }

      setVaultState(nextVaultState);
      setTvl(Number(nextVaultState.totalDeposited.toString()) / LAMPORTS_PER_SOL);
      setIsFallback(usingFallback);
      setStatusNote(
        usingFallback
          ? "Vault state is not available on the current RPC yet. The dashboard is showing a protocol preview so the interface stays usable while the vault is uninitialized or the frontend program config is still pointed at preview values."
          : "Vault state loaded from chain.",
      );

      const apy =
        (MARINADE_ESTIMATED_APY * nextVaultState.marinadePct + JITO_ESTIMATED_APY * nextVaultState.jitoPct) / 100;
      setWeightedApy(apy);

      if (!wallet.publicKey || usingFallback) {
        setUserPosition(null);
        setPendingYield(0);
        return;
      }

      try {
        const nextUserPosition = await program.account.userPosition.fetch(userPositionPda);
        setUserPosition(nextUserPosition);
        const deposited = BigInt(nextUserPosition.depositedAmount.toString());
        const accYieldPerShare = BigInt(nextVaultState.accYieldPerShare.toString());
        const rewardDebt = BigInt(nextUserPosition.rewardDebt.toString());
        const pending = Number((deposited * accYieldPerShare) / ACC_PRECISION - rewardDebt) / LAMPORTS_PER_SOL;
        setPendingYield(Math.max(0, pending));
      } catch {
        setUserPosition(null);
        setPendingYield(0);
      }
    } catch (refreshError) {
      setError((refreshError as Error).message);
    }
  };

  useEffect(() => {
    void refresh();
  }, [wallet.publicKey?.toBase58(), connection.rpcEndpoint]);

  const deposit = async (amount: number) => {
    if (!wallet.publicKey) {
      setError("Connect a wallet first.");
      return;
    }
    if (isFallback) {
      setError("The vault is not initialized on this cluster yet. Deploy and initialize it before accepting live deposits.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { program, vaultPda, userPositionPda } = getPdas();
      await program.methods
        .deposit(new BN(Math.round(amount * LAMPORTS_PER_SOL)))
        .accounts({
          vault: vaultPda,
          userPosition: userPositionPda,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await refresh();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount: number) => {
    if (!wallet.publicKey) {
      setError("Connect a wallet first.");
      return;
    }
    if (isFallback) {
      setError("The vault is not initialized on this cluster yet. Withdrawals are unavailable in preview mode.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { program, vaultPda, userPositionPda } = getPdas();
      await program.methods
        .withdraw(new BN(Math.round(amount * LAMPORTS_PER_SOL)))
        .accounts({
          vault: vaultPda,
          userPosition: userPositionPda,
          user: wallet.publicKey,
        })
        .rpc();
      await refresh();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const claimYield = async () => {
    if (!wallet.publicKey) {
      setError("Connect a wallet first.");
      return;
    }
    if (isFallback) {
      setError("The vault is not initialized on this cluster yet. Claims are unavailable in preview mode.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { program, vaultPda, userPositionPda } = getPdas();
      await program.methods
        .claimYield()
        .accounts({
          vault: vaultPda,
          userPosition: userPositionPda,
          user: wallet.publicKey,
        })
        .rpc();
      await refresh();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    deposit,
    withdraw,
    claimYield,
    refresh,
    loading,
    error,
    statusNote,
    userPosition,
    vaultState,
    pendingYield,
    weightedApy,
    tvl,
    isFallback,
  };
};

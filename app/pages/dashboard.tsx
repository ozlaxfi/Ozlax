import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import ClaimYieldButton from "../components/ClaimYieldButton";
import ConnectWallet from "../components/ConnectWallet";
import DepositForm from "../components/DepositForm";
import Layout from "../components/Layout";
import SettingsPanel from "../components/SettingsPanel";
import WithdrawForm from "../components/WithdrawForm";
import YieldDashboard from "../components/YieldDashboard";
import { useOzlax } from "../hooks/useOzlax";
import { fetchWalletTransactions, HeliusTransaction, isHeliusConfigured } from "../utils/helius";

export default function DashboardPage() {
  const wallet = useWallet();
  const ozlax = useOzlax();
  const [transactions, setTransactions] = useState<HeliusTransaction[]>([]);
  const [activityMessage, setActivityMessage] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      if (!wallet.publicKey) {
        setTransactions([]);
        setActivityMessage("Connect your wallet to see the most recent activity tied to this address.");
        return;
      }

      if (!isHeliusConfigured()) {
        setTransactions([]);
        setActivityMessage("Add a Helius API key if you want wallet history to appear here.");
        return;
      }

      const items = await fetchWalletTransactions(wallet.publicKey.toBase58());
      setTransactions(items.slice(0, 5));
      setActivityMessage(items.length ? "" : "No recent transactions have shown up for this wallet yet.");
    };

    void loadTransactions();
  }, [wallet.publicKey?.toBase58(), ozlax.isRefreshing]);

  const depositedAmount = Number(ozlax.userPosition?.depositedAmount?.toString?.() || 0) / 1_000_000_000;
  const actionsDisabled = !wallet.connected || ozlax.isPreview;

  return (
    <Layout
      title="Ozlax Dashboard | Micro-Staking Yield Aggregator on Solana"
      description="Monitor your Ozlax vault position, view protocol metrics, and manage deposits, withdrawals, and yield claims."
    >
      <section className="page-section dashboard-page">
        <div className="dashboard-hero glass-card">
          <div>
            <span className="section-kicker">Dashboard</span>
            <h1>Protocol controls for depositors, operators, and devnet users.</h1>
            <p>
              Track your deposited SOL, pending rewards, protocol TVL, live allocation split, and recent wallet activity from a
              single protocol surface that still makes the accounting legible.
            </p>
          </div>
          <div className="dashboard-hero-badges">
            <span>Reward-per-share accounting</span>
            <span>Marinade + Jito routing</span>
            <span>10% harvest fee</span>
          </div>
        </div>

        {(!wallet.connected || ozlax.isPreview) && (
          <div className="preview-banner">
            <strong>Network view</strong>
            <span>
              {wallet.connected
                ? ozlax.previewReason || "This wallet is connected, but the selected RPC is not serving a live Ozlax vault."
                : "Connect a wallet on devnet to move straight into the live Ozlax interface."}
            </span>
          </div>
        )}

        {!wallet.connected && (
          <div className="connect-gate glass-card">
            <span className="card-eyebrow">Wallet connection</span>
            <h2>Connect a Solana wallet to load your live Ozlax position.</h2>
            <p>
              The dashboard is ready to use. Once your wallet is connected on the right network, Ozlax can read your position and send
              real deposit, withdrawal, and claim transactions through the vault.
            </p>
            <ConnectWallet className="wallet-button-large" />
          </div>
        )}

        {ozlax.statusNote ? <div className="dashboard-note glass-card">{ozlax.statusNote}</div> : null}
        {ozlax.error ? <div className="dashboard-error glass-card">{ozlax.error}</div> : null}

        <YieldDashboard
          ozlax={ozlax}
          walletAddress={wallet.publicKey?.toBase58()}
          transactions={transactions}
          heliusConfigured={isHeliusConfigured()}
          activityMessage={activityMessage}
        />

        <div className="action-grid" id="earn">
          <DepositForm
            onSubmit={ozlax.deposit}
            loading={ozlax.actionLoading === "deposit"}
            disabled={actionsDisabled}
            walletBalance={ozlax.walletBalance}
          />
          <WithdrawForm
            onSubmit={ozlax.withdraw}
            loading={ozlax.actionLoading === "withdraw"}
            disabled={actionsDisabled}
            maxAmount={depositedAmount}
          />
          <ClaimYieldButton
            onClick={ozlax.claimYield}
            loading={ozlax.actionLoading === "claimYield"}
            pendingYield={ozlax.pendingYield}
            disabled={actionsDisabled}
          />
        </div>

        <SettingsPanel walletAddress={wallet.publicKey?.toBase58()} />
      </section>
    </Layout>
  );
}

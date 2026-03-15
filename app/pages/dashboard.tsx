import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";

import ClaimYieldButton from "../components/ClaimYieldButton";
import ConnectWallet from "../components/ConnectWallet";
import DepositForm from "../components/DepositForm";
import Layout from "../components/Layout";
import SettingsPanel from "../components/SettingsPanel";
import WithdrawForm from "../components/WithdrawForm";
import YieldDashboard from "../components/YieldDashboard";
import { useOzlax } from "../hooks/useOzlax";
import { fetchWalletTransactions, HeliusTransaction, WalletActivityResult } from "../utils/helius";
import { getNetworkLabel, resolveNetwork } from "../utils/network";

function EmptyStateIcon({ kind }: { kind: "vault" | "yield" }) {
  if (kind === "vault") {
    return (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M16 24c0-4.4 3.6-8 8-8h16c4.4 0 8 3.6 8 8v20c0 2.2-1.8 4-4 4H20c-2.2 0-4-1.8-4-4V24Z" stroke="currentColor" strokeWidth="3" />
        <path d="M24 24v-4c0-4.4 3.6-8 8-8s8 3.6 8 8v4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="35" r="4" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M16 42c5-2.7 8.7-8.1 9.5-14.5C27.1 31.5 32 35 38 35c5.5 0 10.1-2.9 12.8-7.3C50.2 39.6 42.1 49 32 49c-5.7 0-11-2.9-16-7Z" fill="currentColor" />
      <path d="M22 18h.01M32 12h.01M42 18h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const ozlax = useOzlax();
  const [transactions, setTransactions] = useState<HeliusTransaction[]>([]);
  const [activityMessage, setActivityMessage] = useState("");
  const [activitySource, setActivitySource] = useState<WalletActivityResult["source"]>("unavailable");
  const network = resolveNetwork(connection.rpcEndpoint);
  const networkLabel = getNetworkLabel(network);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!wallet.publicKey) {
        setTransactions([]);
        setActivityMessage("Connect your wallet to see the most recent activity tied to this address.");
        setActivitySource("unavailable");
        return;
      }

      const result = await fetchWalletTransactions(wallet.publicKey.toBase58(), connection.rpcEndpoint);
      setTransactions(result.items.slice(0, 10));
      setActivitySource(result.source);
      setActivityMessage(result.message);
    };

    void loadTransactions();
  }, [wallet.publicKey?.toBase58(), ozlax.isRefreshing, connection.rpcEndpoint]);

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
            <span className={`network-badge network-badge-${network}`}>{networkLabel}</span>
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
                ? ozlax.previewReason || "This wallet is connected, but the selected RPC is not returning a live Ozlax vault yet."
                : "Connect a wallet on devnet and the live Ozlax interface will take over from there."}
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
            <ConnectWallet className="wallet-button-large" showHint />
          </div>
        )}

        {ozlax.statusNote ? <div className="dashboard-note glass-card">{ozlax.statusNote}</div> : null}
        {ozlax.error ? <div className="dashboard-error glass-card">{ozlax.error}</div> : null}

        <YieldDashboard
          ozlax={ozlax}
          walletAddress={wallet.publicKey?.toBase58()}
          transactions={transactions}
          activitySource={activitySource}
          activityMessage={activityMessage}
          rpcEndpoint={connection.rpcEndpoint}
        />

        {wallet.connected && (depositedAmount <= 0 || ozlax.pendingYield <= 0) ? (
          <div className="dashboard-empty-grid">
            {depositedAmount <= 0 ? (
              <section className="glass-card dashboard-empty-card">
                <div className="empty-state-icon">
                  <EmptyStateIcon kind="vault" />
                </div>
                <h3>Your vault is empty.</h3>
                <p>Deposit SOL to open your position and start participating in the next harvest cycle.</p>
              </section>
            ) : null}

            {ozlax.pendingYield <= 0 ? (
              <section className="glass-card dashboard-empty-card">
                <div className="empty-state-icon">
                  <EmptyStateIcon kind="yield" />
                </div>
                <h3>No yield is ready to claim yet.</h3>
                <p>Yield becomes claimable after a harvest settles and your position is refreshed against the latest vault state.</p>
              </section>
            ) : null}
          </div>
        ) : null}

        <div className="action-grid" id="earn">
          <DepositForm
            onSubmit={ozlax.deposit}
            loading={ozlax.actionLoading === "deposit"}
            disabled={actionsDisabled}
            walletBalance={ozlax.walletBalance}
            weightedApy={ozlax.weightedApy}
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

        <SettingsPanel
          walletAddress={wallet.publicKey?.toBase58()}
          previewReason={ozlax.previewReason}
          activitySource={activitySource}
          activityMessage={activityMessage}
        />
      </section>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import ClaimYieldButton from "../components/ClaimYieldButton";
import DepositForm from "../components/DepositForm";
import Layout from "../components/Layout";
import WithdrawForm from "../components/WithdrawForm";
import YieldDashboard from "../components/YieldDashboard";
import { useOzlax } from "../hooks/useOzlax";
import { fetchWalletTransactions, HeliusTransaction } from "../utils/helius";

export default function DashboardPage() {
  const wallet = useWallet();
  const ozlax = useOzlax();
  const [transactions, setTransactions] = useState<HeliusTransaction[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!wallet.publicKey) {
        setTransactions([]);
        return;
      }

      const items = await fetchWalletTransactions(wallet.publicKey.toBase58());
      setTransactions(items.slice(0, 5));
    };

    void loadTransactions();
  }, [wallet.publicKey, ozlax.loading]);

  return (
    <Layout
      title="Ozlax Dashboard | Vault Operations"
      description="Manage Ozlax deposits, withdrawals, yield claims, and vault activity from the Solana dashboard."
    >
      <section className="dashboard-shell">
        <div className="dash-hero panel">
          <div>
            <span className="section-kicker">Vault dashboard</span>
            <h1>Manage your SOL position with the same protocol view the keeper sees.</h1>
            <p>
              Track weighted APY, claim accrued rewards, review wallet activity, and see how current vault allocation is split across
              Marinade and Jito.
            </p>
          </div>
          <div className="hero-badges">
            <span>Reward-per-share accounting</span>
            <span>24h keeper cadence</span>
            <span>10% harvest fee</span>
          </div>
        </div>

        {ozlax.statusNote ? <div className="notice-card panel">{ozlax.statusNote}</div> : null}

        {wallet.connected ? (
          <div className="dashboard-grid">
            <YieldDashboard ozlax={ozlax} walletAddress={wallet.publicKey?.toBase58() || ""} transactions={transactions} />
            <div className="action-column" id="earn">
              <DepositForm onSubmit={ozlax.deposit} loading={ozlax.loading} />
              <WithdrawForm onSubmit={ozlax.withdraw} loading={ozlax.loading} />
              <ClaimYieldButton onClick={ozlax.claimYield} loading={ozlax.loading} pendingYield={ozlax.pendingYield} />
              {ozlax.error ? <div className="error-card panel">{ozlax.error}</div> : null}
            </div>
          </div>
        ) : (
          <div className="empty-card panel">
            <span className="section-kicker">Wallet required</span>
            <h2>Connect a Solana wallet to read your position.</h2>
            <p>The dashboard will fetch your `UserPosition` PDA and recent Helius activity once a wallet is connected.</p>
          </div>
        )}
      </section>
    </Layout>
  );
}

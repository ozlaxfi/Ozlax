import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import ClaimYieldButton from "../components/ClaimYieldButton";
import ConnectWallet from "../components/ConnectWallet";
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
    <Layout>
      <section className="dashboard-shell">
        <div className="dashboard-header glass-panel">
          <div>
            <span className="eyebrow">Vault Dashboard</span>
            <h1>Manage your SOL position</h1>
            <p>Deposits, withdrawals, reward claims, and recent wallet activity in one place.</p>
          </div>
          <ConnectWallet />
        </div>

        {wallet.connected ? (
          <div className="dashboard-grid">
            <YieldDashboard ozlax={ozlax} walletAddress={wallet.publicKey?.toBase58() || ""} transactions={transactions} />
            <div className="action-column">
              <DepositForm onSubmit={ozlax.deposit} loading={ozlax.loading} />
              <WithdrawForm onSubmit={ozlax.withdraw} loading={ozlax.loading} />
              <ClaimYieldButton onClick={ozlax.claimYield} loading={ozlax.loading} pendingYield={ozlax.pendingYield} />
              {ozlax.error ? <div className="error-card">{ozlax.error}</div> : null}
            </div>
          </div>
        ) : (
          <div className="glass-panel empty-state">
            <h2>Connect a wallet to continue</h2>
            <p>The dashboard reads your user position PDA once a wallet is available.</p>
          </div>
        )}
      </section>
    </Layout>
  );
}

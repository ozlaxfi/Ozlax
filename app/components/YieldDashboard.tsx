import { HeliusTransaction } from "../utils/helius";
import { formatNumber, formatPercent, formatSol, formatTimestamp, shortenAddress } from "../utils/format";

type Props = {
  ozlax: {
    userPosition: any;
    vaultState: any;
    pendingYield: number;
    weightedApy: number;
    tvl: number;
    isFallback: boolean;
  };
  walletAddress: string;
  transactions: HeliusTransaction[];
};

const stat = (label: string, value: string) => (
  <div className="stat-card panel" key={label}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default function YieldDashboard({ ozlax, walletAddress, transactions }: Props) {
  const deposited = Number(ozlax.userPosition?.depositedAmount?.toString?.() || 0) / 1_000_000_000;
  const claimed = Number(ozlax.userPosition?.yieldEarnedClaimed?.toString?.() || 0) / 1_000_000_000;
  const marinadePct = ozlax.vaultState?.marinadePct ?? 50;
  const jitoPct = ozlax.vaultState?.jitoPct ?? 50;

  return (
    <div className="metrics-column">
      <div className="panel wallet-card">
        <div>
          <span className="card-eyebrow">Connected Wallet</span>
          <strong>{shortenAddress(walletAddress)}</strong>
        </div>
        <span className="status-pill">{ozlax.isFallback ? "Preview mode" : "Live state"}</span>
      </div>
      <div className="stats-grid">
        {stat("Deposited SOL", formatSol(deposited))}
        {stat("Pending Yield", formatSol(ozlax.pendingYield))}
        {stat("Yield Claimed", formatSol(claimed))}
        {stat("Weighted APY", formatPercent(ozlax.weightedApy))}
        {stat("TVL", formatSol(ozlax.tvl))}
        {stat("Vault Split", `${marinadePct}% / ${jitoPct}%`)}
      </div>
      <div className="panel history-card">
        <div className="card-head">
          <div>
            <span className="card-eyebrow">Activity</span>
            <h3>Recent wallet transactions</h3>
          </div>
          <span className="card-hint">{formatNumber(transactions.length)} items</span>
        </div>
        <table className="history-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Description</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.signature}>
                  <td>{formatTimestamp(transaction.timestamp)}</td>
                  <td>{transaction.description}</td>
                  <td>{formatSol(transaction.fee / 1_000_000_000)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>No recent transactions available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

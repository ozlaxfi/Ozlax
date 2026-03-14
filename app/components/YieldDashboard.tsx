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

const stat = (label: string, value: string, tone?: "success" | "neutral") => (
  <div className={`stat-card panel${tone === "success" ? " stat-card-success" : ""}`} key={label}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default function YieldDashboard({ ozlax, walletAddress, transactions }: Props) {
  const deposited = Number(ozlax.userPosition?.depositedAmount?.toString?.() || 0) / 1_000_000_000;
  const claimed = Number(ozlax.userPosition?.yieldEarnedClaimed?.toString?.() || 0) / 1_000_000_000;
  const totalHarvested = Number(ozlax.vaultState?.totalYieldHarvested?.toString?.() || 0) / 1_000_000_000;
  const feeBps = ozlax.vaultState?.feeBps ?? 1000;
  const marinadePct = ozlax.vaultState?.marinadePct ?? 50;
  const jitoPct = ozlax.vaultState?.jitoPct ?? 50;

  return (
    <div className="metrics-column">
      <div className="dashboard-summary panel">
        <div className="dashboard-summary-head">
          <div>
            <span className="card-eyebrow">Position overview</span>
            <h3>Vault + wallet state</h3>
          </div>
          <span className="status-pill">{ozlax.isFallback ? "Preview mode" : "Live state"}</span>
        </div>
        <div className="summary-grid">
          <div className="summary-cell">
            <span>Connected wallet</span>
            <strong>{shortenAddress(walletAddress)}</strong>
          </div>
          <div className="summary-cell">
            <span>Current TVL</span>
            <strong>{formatSol(ozlax.tvl)}</strong>
          </div>
          <div className="summary-cell">
            <span>Total harvested</span>
            <strong>{formatSol(totalHarvested)}</strong>
          </div>
          <div className="summary-cell">
            <span>Protocol fee</span>
            <strong>{(feeBps / 100).toFixed(2)}%</strong>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stat("Deposited SOL", formatSol(deposited))}
        {stat("Pending Yield", formatSol(ozlax.pendingYield), "success")}
        {stat("Yield Claimed", formatSol(claimed))}
        {stat("Weighted APY", formatPercent(ozlax.weightedApy))}
      </div>

      <div className="dashboard-lower-grid">
        <div className="panel protocol-state-card">
          <div className="card-head">
            <div>
              <span className="card-eyebrow">Protocol state</span>
              <h3>Vault execution model</h3>
            </div>
            <span className="card-hint">{ozlax.isFallback ? "Preview-safe" : "Chain-backed"}</span>
          </div>
          <div className="protocol-state-grid">
            <div className="summary-cell">
              <span>Harvest cadence</span>
              <strong>Every 24h</strong>
            </div>
            <div className="summary-cell">
              <span>Treasury take</span>
              <strong>{(feeBps / 100).toFixed(2)}%</strong>
            </div>
            <div className="summary-cell">
              <span>Settlement</span>
              <strong>Reward-per-share</strong>
            </div>
            <div className="summary-cell">
              <span>User iteration</span>
              <strong>None on harvest</strong>
            </div>
          </div>
        </div>

        <div className="panel strategy-state-card">
          <div className="card-head">
            <div>
              <span className="card-eyebrow">Allocation</span>
              <h3>Current strategy split</h3>
            </div>
            <span className="card-hint">Vault target exposure</span>
          </div>
          <div className="allocation-bars">
            <div>
              <div className="bar-label">
                <span>Marinade</span>
                <strong>{marinadePct}%</strong>
              </div>
              <div className="progress-rail">
                <span style={{ width: `${marinadePct}%` }} />
              </div>
            </div>
            <div>
              <div className="bar-label">
                <span>Jito</span>
                <strong>{jitoPct}%</strong>
              </div>
              <div className="progress-rail progress-rail-alt">
                <span style={{ width: `${jitoPct}%` }} />
              </div>
            </div>
          </div>
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
                <tr className="history-empty-row">
                  <td colSpan={3}>
                    {ozlax.isFallback
                      ? "Preview mode is active. Recent wallet transactions appear here after live interaction data is available."
                      : "No recent transactions available for this wallet yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

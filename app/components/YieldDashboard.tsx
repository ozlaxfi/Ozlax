import { HeliusTransaction } from "../utils/helius";
import {
  formatCompactSol,
  formatPercent,
  formatSlot,
  formatSol,
  formatTimestamp,
  formatWholePercent,
  shortenAddress,
  shortenSignature,
} from "../utils/format";

type OzlaxState = {
  userPosition: any;
  vaultState: any;
  pendingYield: number;
  weightedApy: number | null;
  tvl: number | null;
  isPreview: boolean;
  isRefreshing: boolean;
};

type Props = {
  ozlax: OzlaxState;
  walletAddress?: string;
  transactions: HeliusTransaction[];
  heliusConfigured: boolean;
  activityMessage: string;
};

const metric = (label: string, value: string, tone?: "accent" | "positive") => (
  <article className={`glass-card metric-card${tone ? ` metric-card-${tone}` : ""}`} key={label}>
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);

export default function YieldDashboard({ ozlax, walletAddress, transactions, heliusConfigured, activityMessage }: Props) {
  const deposited = Number(ozlax.userPosition?.depositedAmount?.toString?.() || 0) / 1_000_000_000;
  const claimed = Number(ozlax.userPosition?.yieldEarnedClaimed?.toString?.() || 0) / 1_000_000_000;
  const feeBps = ozlax.vaultState?.feeBps ?? 1000;
  const marinadePct = ozlax.vaultState?.marinadePct ?? null;
  const jitoPct = ozlax.vaultState?.jitoPct ?? null;
  const lastHarvestSlot = ozlax.vaultState?.lastHarvestSlot ?? null;

  return (
    <div className="dashboard-stack">
      <div className="metrics-grid">
        {metric("Your Deposited SOL", formatSol(deposited), "accent")}
        {metric("Pending Yield", formatSol(ozlax.pendingYield), "positive")}
        {metric("Total Claimed", formatSol(claimed))}
        {metric("Protocol TVL", formatCompactSol(ozlax.tvl))}
      </div>

      <div className="dashboard-detail-grid">
        <div className="dashboard-side-stack">
          <section className="glass-card vault-status-card">
            <div className="section-title-row">
              <div>
                <span className="card-eyebrow">Vault status</span>
                <h3>Live protocol state</h3>
              </div>
              <span className={`status-chip${ozlax.isPreview ? " status-chip-muted" : ""}`}>
                {ozlax.isPreview ? "Preview" : ozlax.isRefreshing ? "Refreshing" : "Live"}
              </span>
            </div>

            <div className="status-grid">
              <div>
                <span>Weighted APY</span>
                <strong>{formatPercent(ozlax.weightedApy)}</strong>
              </div>
              <div>
                <span>Fee rate</span>
                <strong>{formatWholePercent(feeBps / 100)}</strong>
              </div>
              <div>
                <span>Marinade allocation</span>
                <strong>{formatWholePercent(marinadePct)}</strong>
              </div>
              <div>
                <span>Jito allocation</span>
                <strong>{formatWholePercent(jitoPct)}</strong>
              </div>
              <div>
                <span>Last harvest slot</span>
                <strong>{formatSlot(lastHarvestSlot)}</strong>
              </div>
              <div>
                <span>Connected wallet</span>
                <strong>{walletAddress ? shortenAddress(walletAddress) : "Connect wallet"}</strong>
              </div>
            </div>

            <p className="supporting-copy">
              Harvest cadence is keeper driven. The current account model does not store a separate timestamp, so the interface shows
              the last confirmed slot when that state is available.
            </p>
          </section>

          <section className="glass-card protocol-state-card">
            <div className="section-title-row">
              <div>
                <span className="card-eyebrow">Protocol state</span>
                <h3>How the vault settles value</h3>
              </div>
              <span className="card-hint">24h cadence</span>
            </div>

            <p className="supporting-copy">
              Ozlax is designed around one daily keeper rhythm, a fixed 10% treasury fee on harvested yield, and reward-per-share
              settlement that updates globally before users realize rewards through their own interactions.
            </p>
            <p className="supporting-copy">
              That design keeps harvests constant-time, avoids looping across depositors, and makes the protocol easier to inspect than
              a system that hides state changes behind multiple moving parts.
            </p>
          </section>
        </div>

        <section className="glass-card activity-card">
          <div className="section-title-row">
            <div>
              <span className="card-eyebrow">Recent activity</span>
              <h3>Wallet transactions</h3>
            </div>
            <span className="card-hint">{transactions.length} / 5</span>
          </div>

          <div className="table-shell">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Time</th>
                  <th>Signature</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.signature}>
                      <td>{transaction.type}</td>
                      <td>{formatSol(transaction.amount, 4)}</td>
                      <td>{formatTimestamp(transaction.timestamp)}</td>
                      <td>
                        <a href={transaction.explorerUrl} target="_blank" rel="noopener noreferrer" className="table-link">
                          {shortenSignature(transaction.signature)}
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      {heliusConfigured
                        ? activityMessage || "No recent transactions were returned for this wallet yet."
                        : "Add a Helius API key and recent wallet activity will appear here."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

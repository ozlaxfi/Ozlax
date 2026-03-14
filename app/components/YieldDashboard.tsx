import { useState } from "react";
import Skeleton from "./Skeleton";
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
import { getNetworkLabel, resolveNetwork } from "../utils/network";

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
  rpcEndpoint: string;
};

function ActivityEmptyState({ message }: { message: string }) {
  return (
    <div className="table-empty-state">
      <div className="empty-state-icon">
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="12" y="16" width="40" height="32" rx="8" stroke="currentColor" strokeWidth="3" />
          <path d="M22 28h20M22 36h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <p>{message}</p>
    </div>
  );
}

const metric = (label: string, value: string, tone?: "accent" | "positive") => (
  <article className={`glass-card metric-card${tone ? ` metric-card-${tone}` : ""}`} key={label}>
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);

export default function YieldDashboard({
  ozlax,
  walletAddress,
  transactions,
  heliusConfigured,
  activityMessage,
  rpcEndpoint,
}: Props) {
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedSignature, setCopiedSignature] = useState<string | null>(null);
  const deposited = Number(ozlax.userPosition?.depositedAmount?.toString?.() || 0) / 1_000_000_000;
  const claimed = Number(ozlax.userPosition?.yieldEarnedClaimed?.toString?.() || 0) / 1_000_000_000;
  const totalYieldHarvested = Number(ozlax.vaultState?.totalYieldHarvested?.toString?.() || 0) / 1_000_000_000;
  const feeBps = ozlax.vaultState?.feeBps ?? 1000;
  const marinadePct = ozlax.vaultState?.marinadePct ?? null;
  const jitoPct = ozlax.vaultState?.jitoPct ?? null;
  const lastHarvestSlot = ozlax.vaultState?.lastHarvestSlot ?? null;
  const showSkeleton = ozlax.isRefreshing && !ozlax.vaultState;
  const networkLabel = getNetworkLabel(resolveNetwork(rpcEndpoint));
  const marinadeWidth = Math.max(0, Math.min(100, marinadePct ?? 0));
  const jitoWidth = Math.max(0, Math.min(100, jitoPct ?? 0));

  const getActivityTone = (type: string) => {
    const value = type.toLowerCase();
    if (value.includes("deposit")) {
      return "deposit";
    }
    if (value.includes("withdraw")) {
      return "withdraw";
    }
    if (value.includes("claim")) {
      return "claim";
    }

    return "other";
  };

  const copyWallet = async () => {
    if (!walletAddress) {
      return;
    }

    await navigator.clipboard.writeText(walletAddress);
    setCopiedWallet(true);
    window.setTimeout(() => setCopiedWallet(false), 1000);
  };

  const copySignature = async (signature: string) => {
    await navigator.clipboard.writeText(signature);
    setCopiedSignature(signature);
    window.setTimeout(() => setCopiedSignature((current) => (current === signature ? null : current)), 1000);
  };

  const renderMetric = (label: string, value: string, tone?: "accent" | "positive") =>
    showSkeleton ? (
      <article className={`glass-card metric-card${tone ? ` metric-card-${tone}` : ""}`} key={label}>
        <span>{label}</span>
        <Skeleton height="1.55rem" width="72%" />
      </article>
    ) : (
      metric(label, value, tone)
    );

  return (
    <div className="dashboard-stack">
      <div className="metrics-grid">
        {renderMetric("Your Deposited SOL", formatSol(deposited), "accent")}
        {renderMetric("Pending Yield", formatSol(ozlax.pendingYield), "positive")}
        {renderMetric("Total Claimed", formatSol(claimed))}
        {renderMetric("Protocol TVL", formatCompactSol(ozlax.tvl))}
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
              {showSkeleton ? (
                [...Array(8)].map((_, index) => (
                  <div key={`status-skeleton-${index}`}>
                    <span>Loading</span>
                    <Skeleton height="1.1rem" width={index % 2 === 0 ? "68%" : "84%"} />
                  </div>
                ))
              ) : (
                <>
                  <div>
                    <span>Weighted APY</span>
                    <strong>{formatPercent(ozlax.weightedApy)}</strong>
                  </div>
                  <div>
                    <span>Fee rate</span>
                    <strong>{`${formatWholePercent(feeBps / 100)} of harvested yield`}</strong>
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
                    <span>Last harvest</span>
                    <strong>{formatSlot(lastHarvestSlot)}</strong>
                  </div>
                  <div>
                    <span>Connected wallet</span>
                    <strong className="copyable-inline">
                      <span>{walletAddress ? shortenAddress(walletAddress) : "Connect wallet"}</span>
                      {walletAddress ? (
                        <button
                          type="button"
                          className="copy-chip"
                          onClick={() => void copyWallet()}
                        >
                          {copiedWallet ? "Copied!" : "Copy"}
                        </button>
                      ) : null}
                    </strong>
                  </div>
                  <div>
                    <span>Network</span>
                    <strong>{networkLabel}</strong>
                  </div>
                  <div>
                    <span>Total yield harvested</span>
                    <strong>{formatSol(totalYieldHarvested, 6)}</strong>
                  </div>
                </>
              )}
            </div>

            {!showSkeleton ? (
              <div className="allocation-shell">
                <div className="allocation-head">
                  <span>Allocation split</span>
                  <strong>{`${formatWholePercent(marinadePct)} / ${formatWholePercent(jitoPct)}`}</strong>
                </div>
                <div className="allocation-bar" aria-label="Vault allocation split">
                  <div className="allocation-segment allocation-segment-marinade" style={{ width: `${marinadeWidth}%` }}>
                    <span>{formatWholePercent(marinadePct)}</span>
                  </div>
                  <div className="allocation-segment allocation-segment-jito" style={{ width: `${jitoWidth}%` }}>
                    <span>{formatWholePercent(jitoPct)}</span>
                  </div>
                </div>
                <div className="allocation-labels">
                  <span>Marinade</span>
                  <span>Jito</span>
                </div>
              </div>
            ) : (
              <div className="allocation-shell">
                <Skeleton height="0.95rem" width="34%" />
                <Skeleton height="1.05rem" width="100%" />
              </div>
            )}

            <p className="supporting-copy">
              Harvest cadence is keeper driven. The current account model stores the latest slot rather than a wall-clock timestamp, so
              the dashboard shows that on-chain marker until a timestamp field exists.
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
            <span className="card-hint">{transactions.length} / 10</span>
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
                      <td>
                        <span className={`activity-type-chip activity-type-${getActivityTone(transaction.type)}`}>
                          <span className="activity-type-dot" aria-hidden="true" />
                          {transaction.type}
                        </span>
                      </td>
                      <td>{transaction.amount !== null ? formatSol(transaction.amount, 4) : "—"}</td>
                      <td>{formatTimestamp(transaction.timestamp)}</td>
                      <td className="signature-cell">
                        <div className="signature-actions">
                          <a href={transaction.explorerUrl} target="_blank" rel="noopener noreferrer" className="table-link">
                            {shortenSignature(transaction.signature)}
                          </a>
                          <button
                            type="button"
                            className="copy-chip"
                            onClick={() => void copySignature(transaction.signature)}
                          >
                            {copiedSignature === transaction.signature ? "Copied!" : "Copy"}
                          </button>
                          <a href={transaction.explorerUrl} target="_blank" rel="noopener noreferrer" className="table-link table-link-secondary">
                            View on Explorer
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      <ActivityEmptyState
                        message={heliusConfigured ? activityMessage || "No recent activity." : "Transaction history requires a Helius API key."}
                      />
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

import Link from "next/link";

import FeatureCard from "../components/FeatureCard";
import Layout from "../components/Layout";
import TVLCounter from "../components/TVLCounter";

const overviewCards = [
  {
    eyebrow: "Deposit",
    title: "Single SOL entry point",
    description: "Users deposit SOL once and the vault tracks principal plus accrued rewards with compact on-chain state.",
  },
  {
    eyebrow: "Aggregation",
    title: "Marinade + Jito routing",
    description: "Capital is allocated across two liquid staking lanes so the protocol can keep a balanced, yield-aware posture.",
  },
  {
    eyebrow: "Distribution",
    title: "Harvested yield accounting",
    description: "Rewards are distributed through a cumulative reward-per-share model instead of looping across all depositors.",
  },
];

const aggregationSteps = [
  {
    step: "01",
    title: "Deposit SOL into the Ozlax vault",
    description: "The vault PDA receives user principal and tracks each position with deposited amount, reward debt, and claimed yield.",
  },
  {
    step: "02",
    title: "Allocate across Marinade and Jito",
    description: "Ozlax keeps strategy exposure split across Marinade and Jito so the vault can diversify staking execution paths.",
  },
  {
    step: "03",
    title: "Harvest yield on a keeper cadence",
    description: "The keeper settles realized or simulated yield into the vault accumulator and forwards the protocol fee to treasury.",
  },
  {
    step: "04",
    title: "Users claim or withdraw on demand",
    description: "Pending yield is settled lazily when users interact, which keeps harvests scalable while preserving a simple UX.",
  },
];

const strategyCards = [
  {
    title: "Marinade",
    summary: "Liquid staking base exposure",
    description: "Marinade gives Ozlax broad liquid staking coverage and a familiar path for baseline SOL yield routing.",
    allocation: "58%",
  },
  {
    title: "Jito",
    summary: "Yield lane with MEV-aware flow",
    description: "Jito rounds out the vault with an additional staking route that complements the Marinade allocation.",
    allocation: "42%",
  },
];

const feeChecklist = [
  "The protocol fee is fixed at 10% of harvested yield.",
  "Deposited SOL principal is not taxed.",
  "Treasury revenue compounds whenever harvests settle.",
  "$OZX remains the governance asset aligned to protocol growth.",
];

const vaultFlow = [
  {
    label: "Deposit",
    title: "Users deposit SOL once",
    body: "Principal enters the Ozlax vault PDA and the user position records deposited amount plus reward debt.",
  },
  {
    label: "Route",
    title: "Vault allocates across Marinade and Jito",
    body: "The global vault tracks strategy weights while keeping a single user-facing entry point.",
  },
  {
    label: "Harvest",
    title: "Keeper settles yield on cadence",
    body: "The keeper forwards treasury fees and updates the reward accumulator once per harvest cycle.",
  },
  {
    label: "Claim",
    title: "Users realize rewards on interaction",
    body: "Claims, deposits, and withdrawals settle pending rewards lazily without touching every account.",
  },
];

const keeperLoop = [
  {
    title: "Every 24 hours",
    detail: "The keeper reads vault TVL and current allocation percentages.",
  },
  {
    title: "Estimate strategy yield",
    detail: "Marinade and Jito APY inputs roll into one weighted daily harvest simulation.",
  },
  {
    title: "Send 10% to treasury",
    detail: "Protocol revenue is carved out once per harvest before user distribution is applied.",
  },
  {
    title: "Distribute 90% to depositors",
    detail: "The remaining amount increases `acc_yield_per_share` so users settle on demand.",
  },
];

const accountingPrinciples = [
  "Global accumulator updates once per harvest instead of iterating across user accounts.",
  "Each user position stores reward debt so pending yield is computed in O(1) time.",
  "Principal, claimed yield, and vault-level totals stay compact for lower rent and simpler reads.",
];

const protocolFacts = [
  "One Anchor program keeps the deploy surface compact and the account model easy to reason about.",
  "Treasury fees only accrue on harvested yield, not on principal deposits or withdrawals.",
  "Devnet-first rollout keeps the protocol safe to iterate while preserving a mainnet-ready architecture.",
];

export default function HomePage() {
  return (
    <Layout>
      <div className="home-page">
        <section className="hero-section section" id="hero">
          <div className="hero-copy">
            <span className="section-kicker">Solana micro-staking yield aggregator</span>
            <h1>Deposit SOL once. Ozlax allocates, harvests, and accounts for the yield.</h1>
            <p className="hero-text">
              Ozlax routes vault capital across Marinade and Jito, harvests yield on a keeper loop, forwards a fixed 10% fee to
              treasury, and keeps distribution scalable through reward-per-share accounting.
            </p>
            <div className="hero-actions">
              <Link href="/dashboard" className="primary-button">
                Open Dashboard
              </Link>
              <a href="#yield-aggregation" className="secondary-button">
                How It Works
              </a>
            </div>
            <div className="hero-metric-row">
              <div className="metric-card panel">
                <span className="metric-label">Protocol TVL</span>
                <TVLCounter value={182.46} />
              </div>
              <div className="metric-card panel">
                <span className="metric-label">Fee on harvests</span>
                <strong className="metric-value">10% to treasury</strong>
              </div>
              <div className="metric-card panel">
                <span className="metric-label">Governance</span>
                <strong className="metric-value">$OZX protocol-aligned</strong>
              </div>
            </div>
          </div>
          <div className="hero-visual panel">
            <div className="visual-orbit" />
            <div className="visual-grid">
              <div className="signal-card signal-card-wide">
                <span>Protocol flow</span>
                <strong>SOL in, yield out, treasury aligned</strong>
                <p>One vault, two staking routes, one keeper loop, and O(1) reward accounting at harvest time.</p>
              </div>
              <div className="signal-card">
                <span>Allocation</span>
                <strong>Marinade 58%</strong>
                <div className="progress-rail">
                  <span style={{ width: "58%" }} />
                </div>
              </div>
              <div className="signal-card">
                <span>Allocation</span>
                <strong>Jito 42%</strong>
                <div className="progress-rail progress-rail-alt">
                  <span style={{ width: "42%" }} />
                </div>
              </div>
              <div className="signal-card">
                <span>Keeper cadence</span>
                <strong>24 hour harvest loop</strong>
                <p>Reward distribution updates the accumulator once instead of touching every user account.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="protocol-overview" className="section">
          <div className="section-heading">
            <span className="section-kicker">Protocol overview</span>
            <h2>Ozlax packages Solana staking yield into a single vault experience.</h2>
            <p>
              Users interact with one protocol surface while the vault handles allocation, harvest accounting, and treasury fee
              routing behind the scenes.
            </p>
          </div>
          <div className="feature-grid">
            {overviewCards.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <section id="yield-aggregation" className="section section-grid">
          <div>
            <div className="section-heading left">
              <span className="section-kicker">How yield aggregation works</span>
              <h2>Clear protocol flow from deposit to reward claim.</h2>
              <p>
                The vault stays user-facing and simple, while the accounting model keeps harvests scalable and predictable on Solana.
              </p>
            </div>
            <div className="step-list">
              {aggregationSteps.map((item) => (
                <article key={item.step} className="step-card panel">
                  <span className="step-index">{item.step}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="pipeline-panel panel">
            <span className="card-eyebrow">Vault pipeline</span>
            <h3>Reward-per-share accounting keeps the protocol lightweight.</h3>
            <div className="pipeline-list">
              <div className="pipeline-item">
                <strong>Vault state</strong>
                <span>Total deposited, harvested yield, fee rate, allocations, and accumulator.</span>
              </div>
              <div className="pipeline-item">
                <strong>User position</strong>
                <span>Deposited principal, reward debt, and claimed yield settle only when the user interacts.</span>
              </div>
              <div className="pipeline-item">
                <strong>Keeper harvest</strong>
                <span>Treasury fee is paid once, distributable yield updates the accumulator once.</span>
              </div>
            </div>
          </div>
        </section>

        <section id="how-ozlax-works" className="section section-grid">
          <div className="panel docs-card">
            <span className="card-eyebrow">How Ozlax works</span>
            <h3>Protocol documentation in product form.</h3>
            <div className="docs-list">
              <article className="docs-item">
                <strong>1. Users deposit SOL into one vault.</strong>
                <p>The vault receives principal and each user position stores deposited amount, claimed yield, and reward debt.</p>
              </article>
              <article className="docs-item">
                <strong>2. Capital routes across Marinade and Jito.</strong>
                <p>Vault strategy weights determine how the keeper models the split between both staking lanes.</p>
              </article>
              <article className="docs-item">
                <strong>3. Harvest updates one global accumulator.</strong>
                <p>Keeper harvests increase `acc_yield_per_share` once, while 10% of harvested yield is routed to treasury.</p>
              </article>
              <article className="docs-item">
                <strong>4. Users realize yield through interaction.</strong>
                <p>Deposits, withdrawals, and explicit claims settle pending rewards lazily without any user-wide harvest loop.</p>
              </article>
            </div>
          </div>
          <div className="panel credibility-card">
            <span className="card-eyebrow">Protocol credibility</span>
            <h3>Scalable accounting and compact deployment posture.</h3>
            <ul className="check-list">
              {protocolFacts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="vault-flow" className="section">
          <div className="section-heading">
            <span className="section-kicker">Vault flow</span>
            <h2>One vault path from user deposit to realized yield.</h2>
            <p>
              Ozlax keeps the user flow compact while separating protocol routing, keeper harvest, and on-chain accounting into
              clear stages.
            </p>
          </div>
          <div className="flow-diagram panel">
            <div className="flow-line" aria-hidden="true" />
            {vaultFlow.map((item) => (
              <article key={item.label} className="flow-node">
                <span className="flow-tag">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="strategies" className="section section-grid">
          <div className="section-heading left">
            <span className="section-kicker">Strategies</span>
            <h2>Allocation across Marinade and Jito.</h2>
            <p>
              Ozlax uses two liquid staking routes so the vault can distribute capital across complementary yield lanes rather than
              relying on a single provider.
            </p>
          </div>
          <div className="strategy-stack">
            {strategyCards.map((strategy) => (
              <article key={strategy.title} className="panel strategy-detail-card">
                <div className="strategy-topline">
                  <div>
                    <span className="card-eyebrow">{strategy.title}</span>
                    <h3>{strategy.summary}</h3>
                  </div>
                  <strong className="strategy-allocation">{strategy.allocation}</strong>
                </div>
                <p>{strategy.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="fee-model" className="section section-grid">
          <div className="panel fee-card">
            <span className="card-eyebrow">Protocol fee model</span>
            <h3>10% of harvested yield flows to treasury.</h3>
            <p>
              The fee only applies when yield is harvested. Principal remains intact, and treasury revenue scales with protocol
              activity rather than upfront user deposits.
            </p>
            <div className="fee-split">
              <div>
                <strong>90%</strong>
                <span>distributed to depositors</span>
              </div>
              <div>
                <strong>10%</strong>
                <span>routed to treasury</span>
              </div>
            </div>
          </div>
          <div className="panel checklist-card">
            <span className="card-eyebrow">Treasury alignment</span>
            <h3>Protocol economics stay simple.</h3>
            <ul className="check-list">
              {feeChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="keeper-loop" className="section section-grid">
          <div className="panel keeper-loop-card">
            <span className="card-eyebrow">Keeper loop</span>
            <h3>Harvest automation runs on a 24 hour rhythm.</h3>
            <div className="loop-grid">
              {keeperLoop.map((item, index) => (
                <div key={item.title} className="loop-step">
                  <strong>{`${index + 1}. ${item.title}`}</strong>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel accounting-card">
            <span className="card-eyebrow">Reward-per-share accounting</span>
            <h3>Protocol-grade settlement without user iteration.</h3>
            <ul className="check-list">
              {accountingPrinciples.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <span className="section-kicker">Dashboard preview</span>
            <h2>A more realistic operator interface for deposits, rewards, and vault health.</h2>
            <p>
              The dashboard is designed to feel like a protocol surface, not a template page. It pairs position metrics with vault
              state, strategy split, and recent wallet activity.
            </p>
          </div>
          <div className="dashboard-preview panel">
            <div className="preview-sidebar">
              <span className="card-eyebrow">Preview</span>
              <h3>Protocol control center</h3>
              <p>Track TVL, weighted APY, pending yield, vault split, and recent Helius activity from one surface.</p>
              <div className="preview-badges">
                <span>Preview mode fallback</span>
                <span>Wallet-aware state</span>
              </div>
              <Link href="/dashboard" className="primary-button">
                Launch dashboard
              </Link>
            </div>
            <div className="preview-grid">
              <div className="preview-card">
                <span>Deposited SOL</span>
                <strong>14.2500 SOL</strong>
              </div>
              <div className="preview-card">
                <span>Pending Yield</span>
                <strong>0.1842 SOL</strong>
              </div>
              <div className="preview-card">
                <span>Weighted APY</span>
                <strong>7.58%</strong>
              </div>
              <div className="preview-card">
                <span>Vault TVL</span>
                <strong>182.4600 SOL</strong>
              </div>
              <div className="preview-card preview-table">
                <span>Recent activity</span>
                <ul>
                  <li>
                    <strong>Harvest</strong>
                    <span>Keeper settled daily rewards</span>
                  </li>
                  <li>
                    <strong>Deposit</strong>
                    <span>User position increased</span>
                  </li>
                  <li>
                    <strong>Claim</strong>
                    <span>Yield realized in SOL</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="section section-grid">
          <div className="panel security-card">
            <span className="section-kicker">Security and architecture</span>
            <h2>Compact accounts, predictable SOL flows, and devnet-first deployment discipline.</h2>
            <ul className="bullet-list">
              <li>One Anchor program and compact PDAs keep deployment and rent costs tightly controlled.</li>
              <li>Lamport transfers use the vault PDA directly so principal movement stays straightforward.</li>
              <li>Harvests update a single accumulator instead of iterating across every depositor on-chain.</li>
              <li>The current build is an MVP and should be audited before it is trusted with meaningful value.</li>
            </ul>
          </div>
          <div className="panel community-card" id="community">
            <span className="section-kicker">Community</span>
            <h2>Follow the protocol as the vault goes live.</h2>
            <p>
              Ozlax is being built openly with a devnet-first rollout, keeper-driven harvest flow, treasury alignment, and future
              $OZX governance in view.
            </p>
            <div className="community-links">
              <a href="https://discord.gg/hZ4BE84qc3" target="_blank" rel="noreferrer">Discord</a>
              <a href="https://x.com/OzlaxHQ" target="_blank" rel="noreferrer">Twitter/X</a>
              <a href="https://t.me/ozlaxfi" target="_blank" rel="noreferrer">Telegram</a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

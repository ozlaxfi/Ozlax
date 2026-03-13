import Link from "next/link";

import FeatureCard from "../components/FeatureCard";
import Layout from "../components/Layout";
import TVLCounter from "../components/TVLCounter";

const features = [
  {
    eyebrow: "Execution",
    title: "Auto-Rebalancing",
    description: "Ozlax tracks target exposure across Marinade and Jito so the vault can stay aligned to the current staking mix.",
  },
  {
    eyebrow: "Revenue",
    title: "10% Protocol Fee",
    description: "Fees are only taken on harvested yield. User principal remains untouched while treasury participation stays permanent.",
  },
  {
    eyebrow: "Strategies",
    title: "Powered by Marinade + Jito",
    description: "One SOL deposit flow, two liquid staking routes, and a keeper loop built around practical devnet-to-mainnet rollout.",
  },
];

const steps = [
  "Users deposit SOL into the Ozlax vault PDA.",
  "Capital is targeted across Marinade and Jito according to the current allocation split.",
  "The keeper simulates daily yield, harvests rewards, and updates the reward accumulator.",
  "Users claim accrued SOL or withdraw principal without forcing a full vault-wide settlement.",
];

export default function HomePage() {
  return (
    <Layout>
      <div className="home-page">
        <section className="hero-section section">
          <div className="hero-copy">
            <span className="section-kicker">Solana micro-staking yield aggregator</span>
            <h1>Stake SOL once. Let Ozlax route, harvest, and compound the yield.</h1>
            <p className="hero-text">
              Ozlax allocates user capital between Marinade and Jito, settles harvested rewards with reward-per-share accounting,
              and routes a fixed 10% fee on harvested yield to treasury.
            </p>
            <div className="hero-actions">
              <Link href="/dashboard" className="primary-button">
                Open Dashboard
              </Link>
              <a href="#protocol-overview" className="secondary-button">
                Explore Protocol
              </a>
            </div>
            <div className="hero-metric-row">
              <div className="metric-card panel">
                <span className="metric-label">Devnet TVL Snapshot</span>
                <TVLCounter value={182.46} />
              </div>
              <div className="metric-card panel">
                <span className="metric-label">Protocol Fee</span>
                <strong className="metric-value">10% of harvested yield</strong>
              </div>
              <div className="metric-card panel">
                <span className="metric-label">Governance</span>
                <strong className="metric-value">$OZX treasury aligned</strong>
              </div>
            </div>
          </div>
          <div className="hero-visual panel">
            <div className="visual-orbit" />
            <div className="visual-grid">
              <div className="signal-card">
                <span>Deposit lane</span>
                <strong>SOL vault</strong>
                <p>Single deposit flow into a compact Anchor vault designed for low deployment cost.</p>
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
                <strong>24h harvest loop</strong>
                <p>Harvests settle protocol fees and update one accumulator instead of touching every depositor.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="protocol-overview" className="section">
          <div className="section-heading">
            <span className="section-kicker">Protocol overview</span>
            <h2>Built for scalable yield accounting on Solana.</h2>
            <p>
              Ozlax keeps on-chain state compact. Harvests update a vault-wide accumulator, while users settle rewards lazily on
              deposit, withdraw, or claim.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section section-grid">
          <div>
            <div className="section-heading left">
              <span className="section-kicker">How it works</span>
              <h2>Four protocol steps, one user-facing vault.</h2>
            </div>
            <div className="step-list">
              {steps.map((item, index) => (
                <article key={item} className="step-card panel">
                  <span className="step-index">0{index + 1}</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="allocation-stack">
            <article className="panel strategy-card">
              <span className="card-eyebrow">Strategy allocation</span>
              <h3>Weighted exposure across Marinade and Jito.</h3>
              <div className="allocation-bars">
                <div>
                  <div className="bar-label">
                    <span>Marinade</span>
                    <strong>58%</strong>
                  </div>
                  <div className="progress-rail">
                    <span style={{ width: "58%" }} />
                  </div>
                </div>
                <div>
                  <div className="bar-label">
                    <span>Jito</span>
                    <strong>42%</strong>
                  </div>
                  <div className="progress-rail progress-rail-alt">
                    <span style={{ width: "42%" }} />
                  </div>
                </div>
              </div>
            </article>
            <article className="panel fee-card">
              <span className="card-eyebrow">Protocol fee model</span>
              <h3>10% only on harvested yield.</h3>
              <p>
                Principal is never taxed. The treasury receives protocol revenue only when yield is realized, keeping depositor and
                protocol incentives aligned.
              </p>
              <div className="fee-split">
                <div>
                  <strong>90%</strong>
                  <span>distributed to depositors</span>
                </div>
                <div>
                  <strong>10%</strong>
                  <span>sent to treasury</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <span className="section-kicker">Dashboard preview</span>
            <h2>A focused operator view for deposits, claims, and vault health.</h2>
            <p>The dashboard carries the same design system, allocation context, and protocol surfaces as the landing page.</p>
          </div>
          <div className="dashboard-preview panel">
            <div className="preview-sidebar">
              <span className="card-eyebrow">Preview</span>
              <h3>Protocol control center</h3>
              <p>Read TVL, pending rewards, weighted APY, and recent Helius activity in one place.</p>
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
              <div className="preview-card preview-table">
                <span>Recent transactions</span>
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

        <section className="section section-grid">
          <div className="panel security-card">
            <span className="section-kicker">Security and architecture</span>
            <h2>Compact accounts, predictable SOL flows, and devnet-first deployment.</h2>
            <ul className="bullet-list">
              <li>One Anchor program and compact PDAs to stay within a sub-3 SOL mainnet deployment target.</li>
              <li>Lamport transfers use the vault PDA directly to avoid unnecessary token wrappers for principal.</li>
              <li>Harvests update a single accumulator instead of iterating every depositor on-chain.</li>
              <li>This MVP should be audited before it is trusted with real capital.</li>
            </ul>
          </div>
          <div className="panel community-card">
            <span className="section-kicker">Community</span>
            <h2>Follow the protocol as the vault goes live.</h2>
            <p>Ozlax is being built in the open with a devnet-first rollout, production-minded keeper flow, and $OZX governance in view.</p>
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

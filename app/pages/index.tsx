import Link from "next/link";

import ConnectWallet from "../components/ConnectWallet";
import FeatureCard from "../components/FeatureCard";
import Layout from "../components/Layout";
import TVLCounter from "../components/TVLCounter";

const features = [
  {
    title: "Auto-Rebalancing",
    description: "Ozlax tracks the target mix across Marinade and Jito so deposits stay pointed at the strongest staking lane.",
  },
  {
    title: "10% Protocol Fee",
    description: "Fees are only taken on harvested yield. Principal stays untouched and the treasury compounds protocol upside.",
  },
  {
    title: "Powered by Marinade + Jito",
    description: "A single SOL vault, two proven liquid staking routes, and keeper-driven yield harvests built for devnet first.",
  },
];

export default function HomePage() {
  return (
    <Layout>
      <section className="hero-shell">
        <div className="hero-logo-wrap">
          <img src="/logo.svg" alt="Ozlax" className="hero-logo" />
        </div>
        <div className="hero-copy">
          <span className="eyebrow">Solana Micro-Staking Yield Aggregator</span>
          <h1>Stake SOL. Earn Yield. Automatically.</h1>
          <p>
            Deposit SOL once. Ozlax allocates across Marinade and Jito, harvests yield on a keeper cadence,
            and routes a fixed 10% protocol fee to treasury.
          </p>
          <div className="hero-actions">
            <ConnectWallet />
            <Link href="/dashboard" className="cta-link">
              Open Dashboard
            </Link>
          </div>
        </div>
        <div className="hero-metrics glass-panel">
          <span className="metric-label">Protocol TVL</span>
          <TVLCounter value={128.46} />
          <p className="metric-note">Devnet demo value until your vault is live.</p>
        </div>
      </section>

      <section className="feature-grid">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </section>
    </Layout>
  );
}

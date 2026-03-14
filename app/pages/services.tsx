import Link from "next/link";

import Layout from "../components/Layout";

export default function ServicesPage() {
  return (
    <Layout title="Ozlax Services Overview" description="Overview of Ozlax protocol services for SOL depositors and governance participants.">
      <section className="page-section legal-page">
        <div className="glass-card legal-hero">
          <span className="section-kicker">Services Overview</span>
          <h1>Ozlax Services</h1>
          <p>Last updated: March 2025</p>
        </div>

        <div className="legal-stack">
          <section className="glass-card legal-section">
            <h2>1. SOL Deposit and Yield Aggregation</h2>
            <p>
              Ozlax provides a unified SOL deposit interface that routes user capital into a protocol-managed vault for micro-staking
              yield aggregation on Solana.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>2. Automated Strategy Allocation</h2>
            <p>
              The vault tracks allocation across Marinade and Jito, allowing Ozlax to manage exposure across two liquid staking lanes
              without forcing users to rebalance manually.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>3. Periodic Yield Harvesting</h2>
            <p>
              Ozlax includes keeper logic that harvests yield on a recurring cadence and updates protocol accounting through a global
              reward-per-share accumulator.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>4. Transparent Fee Model</h2>
            <p>
              The protocol applies a 10% fee to harvested yield only. Principal deposits and principal withdrawals are not charged a
              protocol fee.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>5. $OZX Governance Token</h2>
            <p>
              Ozlax includes the $OZX governance token with a fixed supply and revoked mint authority, intended for future protocol
              governance utility as the product matures.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>6. Interface Access</h2>
            <p>
              You can explore or interact with the vault through the{" "}
              <Link href="/dashboard">Ozlax dashboard</Link>.
            </p>
          </section>
        </div>
      </section>
    </Layout>
  );
}

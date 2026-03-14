import Link from "next/link";

import Layout from "../components/Layout";

export default function ServicesPage() {
  return (
    <Layout title="Ozlax Services Overview" description="Overview of Ozlax protocol services for SOL depositors and governance participants.">
      <section className="page-section legal-page">
        <div className="glass-card legal-hero">
          <span className="section-kicker">Services Overview</span>
          <h1>What Ozlax does</h1>
          <p>Last updated: March 2026</p>
        </div>

        <div className="legal-stack">
          <section className="glass-card legal-section">
            <h2>1. A single deposit path for SOL yield aggregation</h2>
            <p>
              Ozlax gives users one place to deposit SOL into a protocol-managed vault. From there, the vault tracks principal,
              harvested yield, and user settlement through a compact on-chain accounting model instead of asking users to manage
              multiple staking positions themselves.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>2. Strategy allocation across Marinade and Jito</h2>
            <p>
              The vault is built to work across Marinade and Jito rather than lean on a single staking route. That lets Ozlax manage
              a strategy split inside the protocol while keeping the user experience centered on one deposit and one position.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>3. Periodic harvests and transparent fee flow</h2>
            <p>
              Ozlax includes keeper-driven harvest logic that settles yield on cadence and routes a fixed 10% share of harvested yield
              to treasury. The rest becomes distributable to depositors through the reward-per-share model. The fee is tied to realized
              harvests, not to user principal.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>4. A governance token with fixed supply</h2>
            <p>
              Ozlax also includes the $OZX governance token. The current supply is fixed at one billion tokens with nine decimals, and
              the mint authority has been revoked. Governance utility is intended for a later phase as the protocol matures.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>5. Access through the dashboard</h2>
            <p>
              The protocol interface is available through the{" "}
              <Link href="/dashboard">Ozlax dashboard</Link>, where users can monitor vault state, manage deposits and withdrawals, and
              claim any yield that has already accrued to their position.
            </p>
          </section>
        </div>
      </section>
    </Layout>
  );
}

import Layout from "../components/Layout";

export default function ChangelogPage() {
  return (
    <Layout title="Ozlax Changelog | Product Milestones" description="Track the major Ozlax milestones and the current 0.1.0 protocol state.">
      <section className="page-section legal-page">
        <div className="glass-card legal-hero">
          <span className="section-kicker">What&apos;s new</span>
          <h1>Changelog</h1>
          <p>
            This page tracks the milestones that matter to operators and users. Ozlax is still early, so each version note focuses
            on the protocol surface that actually changed rather than padding the page with release noise.
          </p>
          <p>Last updated: March 2026</p>
        </div>

        <article className="glass-card legal-section">
          <h2>Version 0.1.0</h2>
          <p>
            Ozlax now supports the full MVP vault loop on localnet, including deposit, withdraw, claim, harvest, keeper dry-runs,
            multi-wallet connection, and a production-grade dashboard with dark and light themes.
          </p>
          <p>
            The current release also ships the full workflow validation script, confirmation modals for user actions, live network
            and protocol context in the dashboard, and nineteen localnet integration tests that cover multi-user accounting,
            rebalancing, and full-withdraw flows.
          </p>
        </article>
      </section>
    </Layout>
  );
}

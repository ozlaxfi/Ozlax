import Layout from "../components/Layout";

export default function PolicyPage() {
  return (
    <Layout title="Ozlax Cookie Policy" description="Cookie Policy for the Ozlax frontend and protocol interface.">
      <section className="page-section legal-page">
        <div className="glass-card legal-hero">
          <span className="section-kicker">Cookie Policy</span>
          <h1>Cookie Policy</h1>
          <p>Last updated: March 2025</p>
        </div>

        <div className="legal-stack">
          <section className="glass-card legal-section">
            <h2>1. Purpose</h2>
            <p>
              This Cookie Policy explains how Ozlax uses browser cookies or similar storage mechanisms when you access the protocol
              interface.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>2. Essential Cookies Only</h2>
            <p>
              Ozlax uses only essential browser storage needed to support normal interface behavior such as wallet connection state,
              provider preferences, and basic UI continuity. These items help the application function correctly.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>3. No Tracking or Advertising Cookies</h2>
            <p>
              The current Ozlax frontend does not intentionally use tracking cookies, advertising cookies, retargeting technologies,
              or behavioral profiling scripts.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>4. Managing Cookies</h2>
            <p>
              You can disable or remove cookies through your browser settings. Doing so may affect wallet connection persistence or
              other interface preferences, but it should not affect public blockchain data that is already visible on-chain.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>5. Contact</h2>
            <p>
              Questions about this Cookie Policy can be sent through the Ozlax community on{" "}
              <a href="https://discord.gg/hZ4BE84qc3" target="_blank" rel="noreferrer">
                Discord
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </Layout>
  );
}

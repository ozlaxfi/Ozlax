import Layout from "../components/Layout";

export default function PolicyPage() {
  return (
    <Layout title="Ozlax Cookie Policy" description="Cookie Policy for the Ozlax frontend and protocol interface.">
      <section className="page-section legal-page">
        <div className="glass-card legal-hero">
          <span className="section-kicker">Cookie Policy</span>
          <h1>Cookie Policy</h1>
          <p>Last updated: March 2026</p>
        </div>

        <div className="legal-stack">
          <section className="glass-card legal-section">
            <h2>1. What this policy covers</h2>
            <p>
              This Cookie Policy explains how Ozlax uses cookies or similar browser storage when you access the website and dashboard.
              The goal is not to track you around the internet. The goal is simply to let the interface behave like a functional web
              application.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>2. Essential cookies only</h2>
            <p>
              Ozlax uses only the limited browser storage needed for things like wallet connection continuity, provider selection, and
              basic interface preferences. Those settings help the site reopen in a usable state rather than forcing you to reconnect
              every time you refresh.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>3. No tracking or advertising cookies</h2>
            <p>
              The current Ozlax frontend does not intentionally use advertising cookies, retargeting technology, or tracking cookies
              designed to follow you across other websites.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>4. How to disable cookies</h2>
            <p>
              You can disable or clear cookies and local storage through your browser settings. Doing so may reset wallet connection
              persistence or interface preferences, but it does not remove public blockchain data that has already been written on chain.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>5. Contact</h2>
            <p>
              Questions about this Cookie Policy can be sent through the Ozlax community on{" "}
              <a href="https://discord.gg/hZ4BE84qc3" target="_blank" rel="noopener noreferrer">
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

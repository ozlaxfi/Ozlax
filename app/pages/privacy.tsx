import Layout from "../components/Layout";

export default function PrivacyPage() {
  return (
    <Layout title="Ozlax Privacy Policy" description="Privacy Policy for the Ozlax protocol website and Solana interface.">
      <section className="page-section legal-page">
        <div className="glass-card legal-hero">
          <span className="section-kicker">Privacy Policy</span>
          <h1>Privacy Policy</h1>
          <p>Last updated: March 2025</p>
        </div>

        <div className="legal-stack">
          <section className="glass-card legal-section">
            <h2>1. Overview</h2>
            <p>
              Ozlax is designed to provide a frontend interface for a decentralized protocol on Solana. This Privacy Policy explains
              what information the site does and does not collect when you access the Ozlax interface.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>2. Information We Collect</h2>
            <p>
              Ozlax does not collect traditional personal account data such as names, email addresses, phone numbers, or passwords
              through the frontend. If you connect a wallet, your wallet address and transaction activity are publicly visible on the
              Solana blockchain by design.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>3. On-Chain Data</h2>
            <p>
              Blockchain data is public and immutable. When you interact with Ozlax, your wallet address, transaction signatures,
              account balances, and related protocol interactions may be visible to anyone through Solana explorers, RPC providers, or
              other public indexing services.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>4. Cookies and Local Storage</h2>
            <p>
              Ozlax uses only minimal browser storage required for normal wallet connection or interface behavior. The current site
              does not use advertising cookies and does not intentionally profile users for marketing purposes.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>5. Third-Party Services</h2>
            <p>
              The frontend may rely on third-party infrastructure such as Solana RPC providers, Helius APIs, wallet providers,
              GitHub, and Vercel hosting. These providers may process standard network metadata such as IP address, request logs, user
              agent strings, and request timing as part of normal service delivery.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>6. No Sale of Personal Data</h2>
            <p>
              Ozlax does not sell personal data to third parties. Because the interface does not intentionally collect personal
              identity information, there is no user profile database to sell or rent.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>7. Children&apos;s Privacy</h2>
            <p>
              Ozlax is not directed to children and is not intended for use by anyone who is not of legal age in their jurisdiction.
              The interface does not knowingly collect personal information from children.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>8. Changes to This Policy</h2>
            <p>
              This Privacy Policy may be updated from time to time as the protocol evolves. Continued use of the interface after an
              update constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>9. Contact</h2>
            <p>
              Questions about this Privacy Policy can be sent through the Ozlax community on{" "}
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

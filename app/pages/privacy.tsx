import Layout from "../components/Layout";

export default function PrivacyPage() {
  return (
    <Layout title="Ozlax Privacy Policy" description="Privacy Policy for the Ozlax protocol website and Solana interface.">
      <section className="page-section legal-page">
        <div className="glass-card legal-hero">
          <span className="section-kicker">Privacy Policy</span>
          <h1>Privacy Policy</h1>
          <p>Last updated: March 2026</p>
        </div>

        <div className="legal-stack">
          <section className="glass-card legal-section">
            <h2>1. Overview</h2>
            <p>
              This Privacy Policy explains what information Ozlax does and does not collect through the website and protocol interface.
              Ozlax is built around public blockchain interactions, which means some of the most important data you generate is already
              public by design before it ever touches this frontend.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>2. Information the frontend collects</h2>
            <p>
              The Ozlax frontend does not ask you to create an account and does not intentionally collect personal information such as
              your name, email address, phone number, or home address. If you connect a wallet, the interface can read your public
              wallet address and the public on-chain state required to render your position.
            </p>
            <p>
              That wallet data is used to show protocol information back to you. It is not treated as a private customer record.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>3. Public blockchain data</h2>
            <p>
              Transactions on Solana are public and immutable. If you interact with Ozlax, your wallet address, balances, transaction
              signatures, and protocol activity may be visible through explorers, RPC providers, indexers, and other public services.
            </p>
            <p>
              Ozlax cannot make on-chain data private and cannot delete it after it has been submitted to the network.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>4. Browser storage and cookies</h2>
            <p>
              The site uses minimal browser storage that may be necessary for wallet connection continuity, provider preferences, or
              basic interface behavior. Ozlax does not intentionally use the frontend to build behavioral advertising profiles.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>5. Third-party services</h2>
            <p>
              The interface may rely on third-party infrastructure such as Solana RPC providers, Helius, wallet adapters, GitHub, and
              Vercel. Those providers may process standard technical metadata such as IP address, browser information, and request logs
              in the ordinary course of delivering their services.
            </p>
            <p>
              Their handling of that information is governed by their own privacy terms, not this policy alone.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>6. No sale of personal data</h2>
            <p>
              Ozlax does not sell personal data to third parties. Because the frontend does not intentionally collect conventional
              personal profiles, there is no user marketing database to sell, rent, or broker.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>7. Children&apos;s privacy</h2>
            <p>
              Ozlax is not directed to children and is not intended for anyone who is not of legal age to use the relevant services in
              their jurisdiction. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>8. Changes to this policy</h2>
            <p>
              This policy may change as the protocol evolves or as supporting infrastructure changes. When that happens, the updated
              version will be posted here with a revised date.
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

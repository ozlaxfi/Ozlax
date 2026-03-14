import Layout from "../components/Layout";

export default function TermsPage() {
  return (
    <Layout title="Ozlax Terms of Service" description="Terms of Service for the Ozlax protocol interface and decentralized vault experience.">
      <section className="page-section legal-page">
        <div className="glass-card legal-hero">
          <span className="section-kicker">Terms of Service</span>
          <h1>Terms of Service</h1>
          <p>Last updated: March 2025</p>
        </div>

        <div className="legal-stack">
          <section className="glass-card legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Ozlax website, interface, smart contracts, scripts, or related protocol services, you agree to
              be bound by these Terms of Service. If you do not agree, do not use the Ozlax interface or interact with the protocol.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>2. Description of Service</h2>
            <p>
              Ozlax is a decentralized protocol on Solana designed for SOL yield aggregation. The protocol provides an interface for
              depositing SOL into an on-chain vault, allocating exposure across Marinade and Jito, harvesting yield periodically, and
              allowing users to claim yield or withdraw principal subject to the rules of the deployed smart contracts.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>3. Eligibility and Restricted Use</h2>
            <p>
              You represent that you are of legal age in your jurisdiction and legally capable of entering into binding agreements.
              You are responsible for ensuring that your use of the protocol is lawful in your location. You must not use Ozlax if you
              are located in, organized in, or ordinarily resident in a jurisdiction where use of decentralized finance applications is
              prohibited or restricted by applicable law.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>4. Wallets, Keys, and Funds</h2>
            <p>
              Ozlax does not take custody of your wallet, private keys, seed phrases, or funds. You alone control your wallet and are
              solely responsible for securing your keys, approving transactions, reviewing transaction details, and understanding the
              consequences of every on-chain action you sign.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>5. Risks</h2>
            <p>
              Using Ozlax involves material risk, including smart contract risk, validator risk, staking risk, protocol risk, oracle
              or infrastructure risk, wallet compromise, user error, and the possibility of partial or total loss of funds. Yield is
              not guaranteed. Historical or estimated yield does not predict future performance.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>6. Protocol Fees</h2>
            <p>
              Ozlax currently applies a protocol fee equal to 10% of harvested yield. The fee is taken only from harvested yield and
              not from principal deposits or principal withdrawals. Future governance or protocol updates may change fee mechanics, and
              any such changes will be reflected in the protocol interface or related documentation when applicable.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>7. No Warranty</h2>
            <p>
              The Ozlax protocol and interface are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind,
              whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose,
              non-infringement, availability, or uninterrupted access.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, the Ozlax team, contributors, operators, and affiliates will not be
              liable for any indirect, incidental, consequential, special, punitive, or exemplary damages, or for any loss of funds,
              profits, opportunities, goodwill, or data arising out of or relating to use of the protocol or interface.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>9. Governing Law</h2>
            <p>
              These terms are governed by applicable law, without prejudice to any mandatory legal rights that may apply in your
              jurisdiction. If any provision is held unenforceable, the remaining provisions will remain in full force and effect.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>10. Changes to These Terms</h2>
            <p>
              Ozlax may update these Terms of Service from time to time to reflect protocol changes, legal requirements, or operational
              improvements. Continued use of the interface after an update constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>11. Contact</h2>
            <p>
              Questions about these terms can be directed through the Ozlax community on{" "}
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

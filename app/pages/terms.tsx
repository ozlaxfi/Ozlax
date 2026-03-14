import Layout from "../components/Layout";

export default function TermsPage() {
  return (
    <Layout title="Ozlax Terms of Service" description="Terms of Service for the Ozlax protocol interface and decentralized vault experience.">
      <section className="page-section legal-page">
        <div className="glass-card legal-hero">
          <span className="section-kicker">Terms of Service</span>
          <h1>Terms of Service</h1>
          <p>Last updated: March 2026</p>
        </div>

        <div className="legal-stack">
          <section className="glass-card legal-section">
            <h2>1. Acceptance of these terms</h2>
            <p>
              By visiting the Ozlax website, using the interface, or interacting with the underlying smart contracts, you agree to
              these Terms of Service. If you do not agree, you should not use the site or submit transactions through the protocol.
            </p>
            <p>
              These terms apply to the website, the dashboard, the scripts and supporting infrastructure we publish, and the public
              documentation that explains how the protocol is intended to work.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>2. What Ozlax is</h2>
            <p>
              Ozlax is a decentralized protocol on Solana for yield aggregation around deposited SOL. The interface is designed to help
              users deposit into the Ozlax vault, observe strategy allocation across Marinade and Jito, follow harvested yield, and
              claim rewards or withdraw principal according to the rules enforced by the deployed program.
            </p>
            <p>
              The website is an access point to an on-chain system. It is not a bank account, a brokerage account, or a promise of
              profit, and it should not be treated as any of those things.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>3. Eligibility and restricted use</h2>
            <p>
              You may only use Ozlax if you are legally capable of entering into binding agreements under the laws that apply to you.
              You are responsible for knowing whether decentralized finance activity is lawful in your jurisdiction before you use the
              protocol.
            </p>
            <p>
              If local law restricts access to staking products, crypto assets, or decentralized applications, you must not use Ozlax.
              We do not represent that the interface or protocol is appropriate in every jurisdiction.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>4. Wallet responsibility and control of funds</h2>
            <p>
              Ozlax does not custody your wallet, private keys, seed phrase, or assets. You control your wallet, you approve every
              transaction, and you bear the full responsibility for reviewing what you sign.
            </p>
            <p>
              If you lose access to your wallet, share private credentials, use malicious software, or approve a transaction you do not
              understand, Ozlax cannot reverse those consequences for you.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>5. Protocol risks</h2>
            <p>
              Using Ozlax involves meaningful technical and financial risk. That includes smart contract bugs, validator risk, RPC or
              infrastructure failure, liquidity and market volatility, wallet compromise, user error, and the possibility of partial or
              total loss of funds.
            </p>
            <p>
              Yield is never guaranteed. Any estimated APY or historical performance shown in the interface is informational only and
              should not be read as a promise of future return.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>6. Protocol fees</h2>
            <p>
              Ozlax currently applies a protocol fee equal to 10% of harvested yield. The intended model is simple: yield is harvested,
              ten percent is routed to treasury, and the remaining amount becomes distributable to depositors through the on-chain
              accounting model.
            </p>
            <p>
              Principal deposits and principal withdrawals are not charged a protocol fee under the current design. If the fee model
              changes in the future, the updated terms and interface will reflect that change.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>7. No warranty</h2>
            <p>
              Ozlax is provided on an as-is and as-available basis. To the fullest extent permitted by applicable law, we disclaim all
              warranties, whether express, implied, or statutory, including any warranty of merchantability, fitness for a particular
              purpose, non-infringement, availability, security, or uninterrupted operation.
            </p>
            <p>
              We do not warrant that the interface will always be available, that transactions will execute successfully, or that the
              protocol will be free from defects, delays, or third-party outages.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>8. Limitation of liability</h2>
            <p>
              To the maximum extent allowed by law, the Ozlax team, contributors, maintainers, and affiliates are not liable for any
              indirect, incidental, special, consequential, punitive, or exemplary damages arising out of or related to your use of the
              interface or protocol.
            </p>
            <p>
              That limitation includes loss of assets, loss of yield, loss of business opportunity, data loss, and damage resulting from
              third-party services or blockchain conditions outside our control.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>9. Governing law and severability</h2>
            <p>
              These terms are governed by applicable law, subject to any mandatory rights that cannot be waived in your jurisdiction.
              If any provision is found unenforceable, the remaining provisions will continue in full force to the extent allowed by law.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>10. Changes to these terms</h2>
            <p>
              Ozlax may update these terms as the protocol, interface, or legal environment changes. When we do, the updated version
              will be posted on this site with a revised date.
            </p>
            <p>
              Continued use of the interface after an update means you accept the revised terms.
            </p>
          </section>

          <section className="glass-card legal-section">
            <h2>11. Contact</h2>
            <p>
              Questions about these terms can be raised through the Ozlax community on{" "}
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

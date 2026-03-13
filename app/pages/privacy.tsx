import Layout from "../components/Layout";

export default function PrivacyPage() {
  return (
    <Layout title="Ozlax Privacy" description="Privacy page for Ozlax.">
      <section className="legal-shell panel">
        <span className="section-kicker">Privacy</span>
        <h1>Privacy notice</h1>
        <p>
          The Ozlax frontend is a public protocol interface. Wallet addresses, public transaction history, and on-chain account data
          are visible on Solana by design.
        </p>
        <p>
          No additional private user database is bundled into this MVP site. External RPC, wallet, analytics, and hosting providers
          may still process request metadata as part of normal web infrastructure.
        </p>
      </section>
    </Layout>
  );
}

import Layout from "../components/Layout";

export default function TermsPage() {
  return (
    <Layout title="Ozlax Terms" description="Placeholder terms page for the Ozlax protocol site.">
      <section className="legal-shell panel">
        <span className="section-kicker">Terms</span>
        <h1>Terms of use</h1>
        <p>
          Ozlax is currently an MVP. These placeholder terms exist so the production site has complete navigation and footer coverage
          while the protocol, keeper flow, and legal docs are finalized.
        </p>
        <p>
          Do not treat the current deployment as audited or production-safe for meaningful value until the protocol has completed a
          formal security review.
        </p>
      </section>
    </Layout>
  );
}

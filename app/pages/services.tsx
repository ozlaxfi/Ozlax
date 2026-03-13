import Layout from "../components/Layout";

export default function ServicesPage() {
  return (
    <Layout title="Ozlax Services" description="Protocol service summary page for Ozlax.">
      <section className="legal-shell panel">
        <span className="section-kicker">Services</span>
        <h1>Protocol services</h1>
        <p>
          Ozlax provides a Solana vault interface, keeper-managed harvest cycle, strategy allocation between Marinade and Jito, and a
          user dashboard for deposits, withdrawals, and reward claims.
        </p>
        <p>
          This page is intentionally lightweight for the MVP and will expand as the live vault, governance process, and treasury
          policies are finalized.
        </p>
      </section>
    </Layout>
  );
}

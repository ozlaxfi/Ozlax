import Layout from "../components/Layout";

export default function PolicyPage() {
  return (
    <Layout title="Ozlax Policy" description="Operational policy page for Ozlax.">
      <section className="legal-shell panel">
        <span className="section-kicker">Policy</span>
        <h1>Operational policy</h1>
        <p>
          Ozlax is designed around compact account layouts, a reward-per-share harvest model, and a devnet-first release path. The
          keeper targets a daily cadence and the protocol fee is only applied to harvested yield.
        </p>
        <p>
          Mainnet activation, treasury controls, and governance policy should be considered provisional until an audited release is
          published.
        </p>
      </section>
    </Layout>
  );
}

import Link from "next/link";

import Layout from "../components/Layout";

export default function NotFoundPage() {
  return (
    <Layout title="Ozlax | Page not found" description="The requested Ozlax page could not be found.">
      <section className="legal-shell panel">
        <span className="section-kicker">404</span>
        <h1>Page not found</h1>
        <p>The route you requested is not part of the current Ozlax protocol site.</p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">
            Back to home
          </Link>
          <Link href="/dashboard" className="secondary-button">
            Open dashboard
          </Link>
        </div>
      </section>
    </Layout>
  );
}

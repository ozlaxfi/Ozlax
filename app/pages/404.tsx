import Link from "next/link";

import Layout from "../components/Layout";

export default function NotFoundPage() {
  return (
    <Layout title="Ozlax | Page Not Found" description="The requested Ozlax page could not be found.">
      <section className="page-section">
        <div className="glass-card not-found-shell">
          <span className="section-kicker">404</span>
          <h1>Page Not Found</h1>
          <p>
            The page you asked for is not part of the current Ozlax site map. Head back to the main site or jump straight into the dashboard and we will get you moving again.
          </p>
          <div className="hero-actions">
            <Link href="/" className="button-primary">
              Go Home
            </Link>
            <Link href="/dashboard" className="button-secondary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

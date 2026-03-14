import Link from "next/link";

import Layout from "../components/Layout";

export default function NotFoundPage() {
  return (
    <Layout title="Ozlax | Page Not Found" description="The requested Ozlax page could not be found.">
      <section className="page-section">
        <div className="glass-card not-found-shell">
          <span className="section-kicker">404</span>
          <h1>Page Not Found</h1>
          <p>The page you were looking for is not part of the current Ozlax site map. Head back to the main interface and we will get you moving again.</p>
          <div className="hero-actions">
            <Link href="/" className="button-primary">
              Back to Home
            </Link>
            <Link href="/dashboard" className="button-secondary">
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

import Link from "next/link";

import Layout from "../components/Layout";

export default function NotFoundPage() {
  return (
    <Layout title="Ozlax — Page Not Found" description="The requested Ozlax page could not be found.">
      <section className="page-section">
        <div className="glass-card not-found-shell">
          <img src="/logo.svg" alt="Ozlax" className="not-found-logo" />
          <span className="section-kicker">404</span>
          <h1>Page Not Found</h1>
          <p>The page you requested does not exist in the current Ozlax site map.</p>
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

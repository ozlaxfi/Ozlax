import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren, useMemo, useState } from "react";

import ConnectWallet from "./ConnectWallet";
import { SocialIconRow } from "./SocialIcons";
import ThemeToggle from "./ThemeToggle";

const headerLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#how-it-works", label: "How It Works" },
];

const footerLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "https://github.com/ozlaxfi/Ozlax", label: "Docs", external: true },
  { href: "/#community", label: "Community" },
];

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/policy", label: "Cookie Policy" },
  { href: "/services", label: "Services Overview" },
];

type LayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

function Icon({ children }: PropsWithChildren) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function Layout({
  children,
  title = "Ozlax | Micro-Staking Yield Aggregator on Solana",
  description = "Deposit SOL into the Ozlax vault and earn optimized micro-staking yield across Marinade and Jito with transparent protocol fees.",
}: LayoutProps) {
  const router = useRouter();
  const canonicalPath = router.asPath.split("#")[0];
  const canonicalUrl = useMemo(() => `https://www.ozlax.com${canonicalPath === "/" ? "" : canonicalPath}`, [canonicalPath]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:site_name" content="Ozlax" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://www.ozlax.com/logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://www.ozlax.com/logo.svg" />
        <meta name="theme-color" content="#070b16" />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="site-shell">
        <div className="site-backdrop site-backdrop-a" />
        <div className="site-backdrop site-backdrop-b" />

        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="brand-link" aria-label="Ozlax home">
              <img src="/logo.svg" alt="Ozlax" className="brand-logo" />
              <span className="brand-copy">
                <strong>Ozlax</strong>
                <span>Micro-Staking Yield Aggregator</span>
              </span>
            </Link>

            <nav className={`header-nav${menuOpen ? " header-nav-open" : ""}`}>
              {headerLinks.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              <ThemeToggle />
              <ConnectWallet />
              <button
                type="button"
                className="menu-toggle"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
              >
                <Icon>
                  {menuOpen ? (
                    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  ) : (
                    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  )}
                </Icon>
              </button>
            </div>
          </div>
        </header>

        <main className="site-main">{children}</main>

        <footer className="site-footer">
          <div className="footer-top glass-card">
            <div className="footer-brand">
              <img src="/logo.svg" alt="Ozlax" className="footer-logo" />
              <div>
                <strong>Ozlax</strong>
                <p>
                  Solana-native micro-staking yield aggregation across Marinade and Jito with transparent treasury fees and compact
                  on-chain accounting.
                </p>
              </div>
            </div>

            <div className="footer-columns">
              <div>
                <span className="footer-heading">Navigation</span>
                <div className="footer-link-list">
                  {footerLinks.map((item) =>
                    item.external ? (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.label}
                      </a>
                    ) : (
                      <Link key={item.label} href={item.href}>
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>
              </div>

              <div>
                <span className="footer-heading">Legal</span>
                <div className="footer-link-list">
                  {legalLinks.map((item) => (
                    <Link key={item.label} href={item.href}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div id="community">
                <span className="footer-heading">Community</span>
                <SocialIconRow />
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Ozlax. All rights reserved.</span>
            <a href="https://github.com/ozlaxfi/Ozlax" target="_blank" rel="noopener noreferrer">
              Open source on GitHub
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren, useMemo, useState } from "react";

import ConnectWallet from "./ConnectWallet";

const cleanUrl = (value: string | undefined, fallback: string) => (value || fallback).trim();

const communityLinks = [
  {
    href: cleanUrl(process.env.NEXT_PUBLIC_DISCORD, "https://discord.gg/hZ4BE84qc3"),
    label: "Discord",
    icon: (
      <path d="M20.3 5.5A16.7 16.7 0 0 0 16.2 4a11.6 11.6 0 0 0-.5 1l-.2.5a15.4 15.4 0 0 0-7 0l-.2-.5c-.2-.4-.3-.7-.5-1A16.7 16.7 0 0 0 3.7 5.5 18.4 18.4 0 0 0 1 17.8a16.9 16.9 0 0 0 5 2.5l1.1-1.8a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.4 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a16.9 16.9 0 0 0 5-2.5 18.4 18.4 0 0 0-2.7-12.3ZM8.2 15.4c-.9 0-1.6-.8-1.6-1.8S7.3 12 8.2 12s1.7.8 1.6 1.7c0 1-.7 1.8-1.6 1.8Zm7.6 0c-.9 0-1.6-.8-1.6-1.8S14.9 12 15.8 12s1.7.8 1.6 1.7c0 1-.7 1.8-1.6 1.8Z" />
    ),
  },
  {
    href: cleanUrl(process.env.NEXT_PUBLIC_TWITTER, "https://x.com/OzlaxHQ"),
    label: "X",
    icon: <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.4L1 2h6.3l4.3 5.7L18.9 2Zm-1.1 18h1.7L6.4 3.8H4.6L17.8 20Z" />,
  },
  {
    href: cleanUrl(process.env.NEXT_PUBLIC_TELEGRAM, "https://t.me/ozlaxfi"),
    label: "Telegram",
    icon: <path d="m21.9 4.4-3.2 15.1c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.6.6-1.1.6l.4-5.1 9.4-8.5c.4-.3-.1-.5-.6-.1L6.1 13.1l-4.8-1.5c-1-.3-1-.9.2-1.4l18.7-7.2c.9-.3 1.7.2 1.4 1.4Z" />,
  },
];

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
  title = "Ozlax — Micro-Staking Yield Aggregator on Solana",
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
                      <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
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
                <div className="social-links">
                  {communityLinks.map((item) => (
                    <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="social-link" aria-label={item.label}>
                      <Icon>{item.icon}</Icon>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2025 Ozlax. All rights reserved.</span>
            <a href="https://github.com/ozlaxfi/Ozlax" target="_blank" rel="noreferrer">
              Open source on GitHub
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

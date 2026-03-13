import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";

import ConnectWallet from "./ConnectWallet";
import ThemeToggle from "./ThemeToggle";

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
    href: cleanUrl(process.env.NEXT_PUBLIC_TWITTER, "https://x.com/ozlaxfi"),
    label: "Twitter/X",
    icon: (
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.4L1 2h6.3l4.3 5.7L18.9 2Zm-1.1 18h1.7L6.4 3.8H4.6L17.8 20Z" />
    ),
  },
  {
    href: cleanUrl(process.env.NEXT_PUBLIC_TELEGRAM, "https://t.me/ozlaxfi"),
    label: "Telegram",
    icon: (
      <path d="m21.9 4.4-3.2 15.1c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.6.6-1.1.6l.4-5.1 9.4-8.5c.4-.3-.1-.5-.6-.1L6.1 13.1l-4.8-1.5c-1-.3-1-.9.2-1.4l18.7-7.2c.9-.3 1.7.2 1.4 1.4Z" />
    ),
  },
];

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard#earn", label: "Earn / Deposit" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#community", label: "Community" },
  { href: "https://github.com/ozlaxfi/Ozlax", label: "Documentation", external: true },
];

const footerLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/services", label: "Services" },
  { href: "/policy", label: "Policy" },
  { href: "/privacy", label: "Privacy" },
];

type LayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

function Icon({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

export default function Layout({
  children,
  title = "Ozlax | Solana Micro-Staking Yield Aggregator",
  description = "Deposit SOL once. Ozlax routes capital across Marinade and Jito, harvests staking yield, and compounds protocol revenue to treasury.",
}: LayoutProps) {
  const router = useRouter();
  const canonicalPath = router.asPath.split("#")[0];
  const canonicalUrl = useMemo(() => `https://www.ozlax.com${canonicalPath === "/" ? "" : canonicalPath}`, [canonicalPath]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isReady, setIsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ozlax-theme");
    const preferredTheme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";

    document.documentElement.dataset.theme = preferredTheme;
    setTheme(preferredTheme);
    setIsReady(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [router.asPath]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("ozlax-theme", nextTheme);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://www.ozlax.com/logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content={theme === "light" ? "#f4f6fb" : "#090b12"} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <div className="site-shell">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />
        <header className="site-header">
          <Link href="/" className="brand-link" aria-label="Ozlax home">
            <img src="/logo.svg" alt="Ozlax" className="brand-logo" />
            <span className="brand-copy">
              <strong>Ozlax</strong>
              <span>Micro-staking yield aggregator</span>
            </span>
          </Link>
          <div className="header-actions">
            <button
              type="button"
              className="menu-button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
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
            <nav className={`site-nav${menuOpen ? " site-nav-open" : ""}`}>
              {navLinks.map((link) =>
                link.external ? (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href}>
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
            <ThemeToggle theme={theme} onToggle={toggleTheme} ready={isReady} />
            <ConnectWallet />
          </div>
        </header>
        <main className="page-shell">{children}</main>
        <footer className="site-footer">
          <div className="footer-brand">
            <img src="/logo.svg" alt="Ozlax" className="footer-logo" />
            <div>
              <strong>Ozlax</strong>
              <p>Yield routing for SOL across Marinade and Jito with keeper-managed harvests and treasury-aligned protocol fees.</p>
            </div>
          </div>
          <div className="footer-grid">
            <div>
              <span className="footer-heading">Navigation</span>
              <div className="footer-link-list">
                {navLinks.slice(0, 4).map((link) =>
                  link.external ? (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href}>
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
            <div>
              <span className="footer-heading">Legal</span>
              <div className="footer-link-list">
                {footerLinks.map((link) => (
                  <Link key={link.label} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div id="community">
              <span className="footer-heading">Community</span>
              <div className="social-links">
                {communityLinks.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="social-link" aria-label={link.label}>
                    <Icon className="social-icon">{link.icon}</Icon>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-bar">
            <span>© {new Date().getFullYear()} Ozlax. MVP build. Audit before real value.</span>
            <a href="https://github.com/ozlaxfi/Ozlax" target="_blank" rel="noreferrer">
              Documentation
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

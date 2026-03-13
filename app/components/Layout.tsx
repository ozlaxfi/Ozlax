import Head from "next/head";
import Link from "next/link";
import { PropsWithChildren } from "react";

import ConnectWallet from "./ConnectWallet";

const links = [
  { href: process.env.NEXT_PUBLIC_DISCORD || "https://discord.gg/hZ4BE84qc3", label: "Discord" },
  { href: process.env.NEXT_PUBLIC_TWITTER || "https://x.com/ozlaxfi", label: "Twitter/X" },
  { href: process.env.NEXT_PUBLIC_TELEGRAM || "https://t.me/ozlaxfi", label: "Telegram" },
];

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Head>
        <title>Ozlax</title>
        <meta
          name="description"
          content="Ozlax is a Solana micro-staking yield aggregator routing SOL across Marinade and Jito."
        />
      </Head>
      <div className="site-shell">
        <header className="site-header">
          <Link href="/" className="brand-mark" aria-label="Ozlax home">
            <img src="/logo-white.svg" alt="" />
          </Link>
          <nav className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <a href="https://github.com/ozlaxfi/Ozlax" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
          <ConnectWallet />
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <span>Ozlax MVP</span>
          <div className="footer-links">
            {links.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}

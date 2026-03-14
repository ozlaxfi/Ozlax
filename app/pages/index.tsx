import type { ReactNode } from "react";
import Link from "next/link";

import FeatureCard from "../components/FeatureCard";
import Layout from "../components/Layout";
import TVLCounter from "../components/TVLCounter";
import { useOzlax } from "../hooks/useOzlax";

const flowSteps = [
  {
    step: "01",
    title: "Deposit SOL into the Ozlax vault",
    body: "Users interact with one Solana vault entry point instead of managing separate staking routes themselves.",
  },
  {
    step: "02",
    title: "Allocate capital across Marinade and Jito",
    body: "Vault allocation targets split exposure between mSOL and jitoSOL strategy lanes.",
  },
  {
    step: "03",
    title: "Keeper harvests yield every 24 hours",
    body: "Yield is harvested on a fixed keeper cadence and settled through one accumulator update.",
  },
  {
    step: "04",
    title: "Treasury takes 10%, depositors receive 90%",
    body: "Protocol fees apply only to harvested yield, not to principal deposits or withdrawals.",
  },
  {
    step: "05",
    title: "Users claim yield or withdraw principal anytime",
    body: "Claims and withdrawals settle each user position lazily without looping across all depositors.",
  },
];

const architectureCards = [
  {
    eyebrow: "Accounting",
    title: "O(1) harvest settlement",
    description: "A single global accumulator updates on harvest, so the keeper never iterates through all user accounts.",
  },
  {
    eyebrow: "Surface area",
    title: "One compact Anchor program",
    description: "The protocol keeps its on-chain footprint small: one vault state, one user position PDA, one program surface.",
  },
  {
    eyebrow: "Deployment",
    title: "Devnet-first, mainnet-ready",
    description: "The protocol is staged for devnet verification today with a clean path to mainnet configuration later.",
  },
  {
    eyebrow: "Revenue",
    title: "Transparent treasury fee",
    description: "Ozlax applies a fixed 10% fee to harvested yield while preserving principal and claim visibility for depositors.",
  },
];

const communityLinks = [
  {
    href: process.env.NEXT_PUBLIC_DISCORD || "https://discord.gg/hZ4BE84qc3",
    label: "Discord",
    icon: (
      <path d="M20.3 5.5A16.7 16.7 0 0 0 16.2 4a11.6 11.6 0 0 0-.5 1l-.2.5a15.4 15.4 0 0 0-7 0l-.2-.5c-.2-.4-.3-.7-.5-1A16.7 16.7 0 0 0 3.7 5.5 18.4 18.4 0 0 0 1 17.8a16.9 16.9 0 0 0 5 2.5l1.1-1.8a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.4 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a16.9 16.9 0 0 0 5-2.5 18.4 18.4 0 0 0-2.7-12.3ZM8.2 15.4c-.9 0-1.6-.8-1.6-1.8S7.3 12 8.2 12s1.7.8 1.6 1.7c0 1-.7 1.8-1.6 1.8Zm7.6 0c-.9 0-1.6-.8-1.6-1.8S14.9 12 15.8 12s1.7.8 1.6 1.7c0 1-.7 1.8-1.6 1.8Z" />
    ),
  },
  {
    href: process.env.NEXT_PUBLIC_TWITTER || "https://x.com/OzlaxHQ",
    label: "X",
    icon: <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.4L1 2h6.3l4.3 5.7L18.9 2Zm-1.1 18h1.7L6.4 3.8H4.6L17.8 20Z" />,
  },
  {
    href: process.env.NEXT_PUBLIC_TELEGRAM || "https://t.me/ozlaxfi",
    label: "Telegram",
    icon: <path d="m21.9 4.4-3.2 15.1c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.6.6-1.1.6l.4-5.1 9.4-8.5c.4-.3-.1-.5-.6-.1L6.1 13.1l-4.8-1.5c-1-.3-1-.9.2-1.4l18.7-7.2c.9-.3 1.7.2 1.4 1.4Z" />,
  },
];

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="community-icon">
      {children}
    </svg>
  );
}

export default function HomePage() {
  const ozlax = useOzlax();

  return (
    <Layout>
      <section className="page-section home-page">
        <div className="home-hero">
          <div className="hero-content glass-card">
            <div className="hero-mark">
              <img src="/logo.svg" alt="Ozlax" className="hero-logo" />
              <span className="section-kicker">Solana-native protocol</span>
            </div>

            <h1>Micro-Staking Yield Aggregator on Solana</h1>
            <p className="hero-subheadline">
              Deposit SOL, earn optimized yield across Marinade and Jito automatically, and settle rewards through a compact,
              transparent Solana vault architecture.
            </p>

            <div className="hero-actions">
              <Link href="/dashboard" className="button-primary">
                Launch App
              </Link>
              <a href="#how-it-works" className="button-secondary">
                Learn How It Works
              </a>
            </div>

            <div className="hero-metrics">
              <article className="glass-card hero-metric">
                <span>Protocol TVL</span>
                <TVLCounter value={ozlax.tvl} />
                <p>{ozlax.isPreview ? "Vault not initialized on the current RPC yet." : "Live vault state loaded from chain."}</p>
              </article>
              <article className="glass-card hero-metric">
                <span>Fee model</span>
                <strong>10% of harvested yield</strong>
                <p>Principal deposits and withdrawals are never charged a protocol fee.</p>
              </article>
              <article className="glass-card hero-metric">
                <span>Execution</span>
                <strong>Keeper-harvested every 24h</strong>
                <p>Accumulator-based distribution keeps harvests scalable even as depositor count grows.</p>
              </article>
            </div>
          </div>

          <div className="hero-visual glass-card">
            <span className="card-eyebrow">Protocol signal</span>
            <h2>One vault. Two yield lanes. One deterministic accounting model.</h2>
            <div className="protocol-visual">
              <div className="protocol-orbit">
                <span className="protocol-core">Ozlax Vault</span>
                <span className="protocol-node protocol-node-a">Marinade</span>
                <span className="protocol-node protocol-node-b">Jito</span>
              </div>
              <div className="protocol-summary">
                <div>
                  <span>Current weighted APY</span>
                  <strong>{ozlax.weightedApy ? `${(ozlax.weightedApy * 100).toFixed(2)}%` : "—"}</strong>
                </div>
                <div>
                  <span>Current TVL</span>
                  <strong>{ozlax.tvl !== null ? `${ozlax.tvl.toFixed(2)} SOL` : "—"}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{ozlax.isPreview ? "Preview mode" : "Live vault state"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="section-shell" id="how-it-works">
          <div className="section-head">
            <span className="section-kicker">How Ozlax Works</span>
            <h2>Visual protocol flow from deposit to claim.</h2>
            <p>
              Ozlax keeps the user journey simple while the vault, keeper, and reward accounting system handle the operational
              complexity in the background.
            </p>
          </div>

          <div className="flow-grid">
            {flowSteps.map((item) => (
              <article key={item.step} className="glass-card flow-step">
                <span className="flow-index">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell">
          <div className="section-head">
            <span className="section-kicker">Strategy allocation</span>
            <h2>Two staking lanes, one vault entry point.</h2>
            <p>Ozlax uses Marinade and Jito as complementary liquid staking routes for SOL yield aggregation.</p>
          </div>

          <div className="strategy-grid">
            <article className="glass-card strategy-card">
              <div className="strategy-head">
                <div>
                  <span className="card-eyebrow">Marinade Finance</span>
                  <h3>{ozlax.vaultState?.marinadePct ?? "—"}% allocation</h3>
                </div>
                <span className="strategy-pill">mSOL liquidity</span>
              </div>
              <p>
                Marinade provides a deep and familiar liquid staking route, giving Ozlax a strong base layer for capital allocation
                and user-friendly SOL exposure.
              </p>
            </article>

            <article className="glass-card strategy-card">
              <div className="strategy-head">
                <div>
                  <span className="card-eyebrow">Jito</span>
                  <h3>{ozlax.vaultState?.jitoPct ?? "—"}% allocation</h3>
                </div>
                <span className="strategy-pill">MEV-aware yield</span>
              </div>
              <p>
                Jito adds a second staking lane with MEV-aware yield characteristics, helping the vault avoid dependence on a single
                liquid staking path.
              </p>
            </article>
          </div>
        </section>

        <section className="section-shell">
          <div className="section-head">
            <span className="section-kicker">Protocol architecture</span>
            <h2>Documentation-grade design presented in product form.</h2>
            <p>
              Ozlax is designed around compact accounts, deterministic reward settlement, and a deployment model that scales without
              forcing harvests to iterate through every depositor.
            </p>
          </div>

          <div className="feature-grid">
            {architectureCards.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <section className="section-shell token-trust-grid">
          <article className="glass-card token-card">
            <span className="section-kicker">$OZX Governance Token</span>
            <h2>Fixed supply, clean mint posture.</h2>
            <ul className="detail-list">
              <li>1,000,000,000 total supply</li>
              <li>9 decimals</li>
              <li>Mint authority permanently revoked</li>
              <li>Future governance utility for protocol direction and treasury policy</li>
            </ul>
          </article>

          <article className="glass-card trust-card">
            <span className="section-kicker">Security &amp; Trust</span>
            <h2>Designed transparently, shipped conservatively.</h2>
            <ul className="detail-list">
              <li>MVP status is clearly disclosed: this protocol is still pre-audit.</li>
              <li>Open source code is published on GitHub.</li>
              <li>The fee model is fixed and transparent at 10% of harvested yield.</li>
              <li>Compact account design helps minimize rent overhead and keeps state easy to inspect.</li>
            </ul>
          </article>
        </section>

        <section className="section-shell community-shell" id="community">
          <div className="section-head">
            <span className="section-kicker">Community</span>
            <h2>Follow the protocol as it moves from devnet toward production.</h2>
            <p>Join the operator channels, follow product updates, and track protocol progress in public.</p>
          </div>

          <div className="community-icon-grid">
            {communityLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="community-link-card">
                <Icon>{link.icon}</Icon>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </section>
      </section>
    </Layout>
  );
}

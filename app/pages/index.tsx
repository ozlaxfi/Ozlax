import Link from "next/link";
import { useEffect, useState } from "react";

import BackToTopButton from "../components/BackToTopButton";
import FaqSection from "../components/FaqSection";
import FeatureCard from "../components/FeatureCard";
import Layout from "../components/Layout";
import { SOCIAL_LINKS, SocialIcon } from "../components/SocialIcons";
import TVLCounter from "../components/TVLCounter";
import { useOzlax } from "../hooks/useOzlax";
import { formatCompactSol, formatPercent, formatSol, formatWholePercent } from "../utils/format";

const overviewCards = [
  {
    eyebrow: "Deposit flow",
    title: "One vault, one user surface",
    description:
      "Users deposit SOL once and the vault keeps the accounting compact. Principal, reward debt, and claimed yield stay easy to reason about on chain.",
  },
  {
    eyebrow: "Allocation",
    title: "Marinade and Jito in one strategy",
    description:
      "Ozlax keeps exposure across two liquid staking lanes instead of making depositors manage multiple positions by hand.",
  },
  {
    eyebrow: "Harvest",
    title: "Yield distribution without user iteration",
    description:
      "The keeper updates one global accumulator on harvest so settlement remains predictable even as the depositor set grows.",
  },
  {
    eyebrow: "Treasury",
    title: "Fees only when yield is real",
    description:
      "The treasury takes its share from harvested yield rather than from principal, which keeps the fee model aligned with protocol performance.",
  },
];

const flowSteps = [
  {
    index: "01",
    title: "Deposit SOL into the Ozlax vault",
    copy:
      "User capital enters a single vault PDA. From that point on, Ozlax tracks principal and yield with one compact user position per wallet.",
  },
  {
    index: "02",
    title: "Allocate across Marinade and Jito",
    copy:
      "The vault keeps an allocation split across Marinade and Jito so the protocol can balance baseline liquid staking with a second yield lane.",
  },
  {
    index: "03",
    title: "Harvest on a keeper rhythm",
    copy:
      "The keeper settles yield on cadence, routes the treasury fee, and updates the global reward accumulator in a single protocol action.",
  },
  {
    index: "04",
    title: "Distribute rewards through the accumulator",
    copy:
      "Every depositor shares in the harvest through reward-per-share accounting, which avoids looping across all users on chain.",
  },
  {
    index: "05",
    title: "Claim yield or withdraw principal anytime",
    copy:
      "Users settle what they are owed when they interact. Claims, deposits, and withdrawals all read the same accounting model.",
  },
];

const strategyCards = [
  {
    title: "Marinade Finance",
    allocation: 60,
    description:
      "Marinade gives Ozlax a liquid staking base layer that feels familiar to Solana users and keeps the vault anchored to a well-known route for SOL yield.",
  },
  {
    title: "Jito",
    allocation: 40,
    description:
      "Jito adds a second lane with MEV-aware staking flow, which helps the vault avoid looking at Solana yield through a single provider.",
  },
];

const keeperLoop = [
  {
    title: "The keeper reads the vault every day",
    detail:
      "The cycle starts by checking vault TVL, allocation percentages, and the state needed to settle the next harvest cleanly.",
  },
  {
    title: "Yield is estimated against the current split",
    detail:
      "Marinade and Jito inputs roll into one weighted harvest result so the protocol updates from the strategy mix it is actually running.",
  },
  {
    title: "Treasury takes its share when harvest settles",
    detail:
      "Ten percent of harvested yield is routed to treasury at settlement time, which keeps protocol revenue tied to realized performance.",
  },
  {
    title: "The remaining yield becomes claimable",
    detail:
      "Ninety percent of the harvest increases the accumulator so depositors can realize rewards the next time they interact with the vault.",
  },
];

const protocolFacts = [
  "Ozlax runs as one compact Anchor program, which keeps the deployment surface and account graph straightforward.",
  "The reward-per-share model settles in O(1) time per harvest, so scale does not come from iterating across every depositor.",
  "The treasury model is simple on purpose. A fixed 10% fee applies to harvested yield and leaves principal untouched.",
];

const tokenFacts = [
  "The $OZX token has a fixed supply of one billion units with nine decimals.",
  "The mint authority has been permanently revoked, so the current supply cannot be expanded by a hidden admin path.",
  "Governance utility is planned for a later phase once the protocol has completed its devnet-first rollout and more operational history exists.",
];

const credibilityParagraphs = [
  "Ozlax is intentionally narrow in scope. One program, one vault, one accumulator, and a fee model that is easy to inspect beat a sprawling account model that is hard to trust.",
  "The protocol is being run devnet-first because that is the right tradeoff for a system that is still earning its production history. The architecture is already shaped for mainnet, but the rollout stays disciplined.",
];

export default function HomePage() {
  const ozlax = useOzlax();
  const [mounted, setMounted] = useState(false);
  const marinadeAllocation = ozlax.vaultState?.marinadePct ?? strategyCards[0].allocation;
  const jitoAllocation = ozlax.vaultState?.jitoPct ?? strategyCards[1].allocation;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Layout>
      <section className="page-section home-page">
        <section className="home-hero">
          <div className="glass-card hero-content">
            <span className="section-kicker">Micro-staking yield aggregator</span>

            <div>
              <h1>Micro-Staking Yield Aggregator on Solana</h1>
              <p className="hero-subheadline">
                Deposit SOL once and let Ozlax route the vault across Marinade and Jito, harvest the yield on cadence, and keep
                distribution transparent from treasury fee to final user claim.
              </p>
            </div>

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
                <p>{ozlax.isPreview ? "Switch to the live Ozlax network and the vault total will load here." : "Live vault TVL pulled from the current RPC."}</p>
              </article>
              <article className="glass-card hero-metric">
                <span>Weighted APY</span>
                <strong>{formatPercent(ozlax.weightedApy)}</strong>
                <p>The front end estimates weighted yield from the current on-chain split across Marinade and Jito.</p>
              </article>
              <article className="glass-card hero-metric">
                <span>Treasury fee</span>
                <strong>10%</strong>
                <p>The protocol fee only applies when yield is harvested. Principal deposits and withdrawals stay untouched.</p>
              </article>
            </div>
          </div>

          <div className="glass-card hero-visual">
            <div className="protocol-orbit">
              <span className="protocol-stream protocol-stream-a" aria-hidden="true" />
              <span className="protocol-stream protocol-stream-b" aria-hidden="true" />
              <span className="protocol-stream protocol-stream-c" aria-hidden="true" />
              <span className="protocol-flow-badge protocol-flow-badge-left">Deposit SOL</span>
              <a
                href="https://marinade.finance"
                target="_blank"
                rel="noopener noreferrer"
                className="protocol-node protocol-node-a protocol-partner-link"
              >
                <span>Marinade</span>
                <small>Liquid staking base</small>
              </a>
              <a href="https://www.ozlax.com" target="_blank" rel="noopener noreferrer" className="protocol-core protocol-core-link">
                <img src="/logo.svg" alt="Ozlax Vault" className="protocol-core-logo" />
                <span>Ozlax Vault</span>
                <small>Vault accumulator</small>
              </a>
              <a
                href="https://www.jito.network"
                target="_blank"
                rel="noopener noreferrer"
                className="protocol-node protocol-node-b protocol-partner-link"
              >
                <span>Jito</span>
                <small>MEV-aware lane</small>
              </a>
              <span className="protocol-flow-badge protocol-flow-badge-right">Yield returns to depositors</span>
            </div>

            <div className="protocol-summary">
              <div>
                <span>Current split</span>
                <strong>{`${formatWholePercent(marinadeAllocation)} / ${formatWholePercent(jitoAllocation)}`}</strong>
              </div>
              <div>
                <span>Settlement model</span>
                <strong>O(1) per harvest</strong>
              </div>
              <div>
                <span>Program footprint</span>
                <strong>One Anchor program</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="protocol-stats-shell">
          <div className="section-head compact-section-head">
            <span className="section-kicker">Protocol stats</span>
            <h2>The live vault footprint stays visible from the landing page.</h2>
            <p>
              These numbers come from the same read path the dashboard uses. If the active RPC is not serving a live Ozlax vault yet,
              the cards stay honest instead of pretending the protocol has data it cannot currently verify.
            </p>
          </div>

          <div className="protocol-stats-grid">
            <article className="glass-card protocol-stat-card">
              <span>Total value locked</span>
              <strong>{ozlax.tvl !== null ? formatCompactSol(ozlax.tvl) : "—"}</strong>
              <p>Total SOL currently deposited in the vault.</p>
            </article>
            <article className="glass-card protocol-stat-card">
              <span>Total yield distributed</span>
              <strong>
                {ozlax.vaultState ? formatSol(Number(ozlax.vaultState.totalYieldHarvested.toString()) / 1_000_000_000, 6) : "—"}
              </strong>
              <p>Lifetime harvested yield tracked on chain.</p>
            </article>
            <article className="glass-card protocol-stat-card">
              <span>Active depositors</span>
              <strong>—</strong>
              <p>The current program does not track depositor count as a separate on-chain metric.</p>
            </article>
            <article className="glass-card protocol-stat-card">
              <span>Protocol fee rate</span>
              <strong>{`${formatWholePercent((ozlax.vaultState?.feeBps ?? 1000) / 100)}`}</strong>
              <p>The treasury only earns when a harvest settles real protocol yield.</p>
            </article>
          </div>
        </section>

        <section className="section-shell">
          <div className="section-head">
            <span className="section-kicker">Protocol overview</span>
            <h2>Ozlax keeps the product surface simple while the vault does the harder work underneath.</h2>
            <p>
              Users should not need to think in terms of account graphs, reward debt, or strategy routing every time they deposit.
              The protocol handles that machinery so the interface can stay clear without hiding how the system actually works.
            </p>
          </div>

          <div className="feature-grid overview-grid">
            {overviewCards.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section-shell protocol-flow-shell">
          <div className="section-head">
            <span className="section-kicker">How Ozlax works</span>
            <h2>What happens to your SOL after it reaches the vault.</h2>
            <p>
              The protocol flow is short on purpose. Deposit once, let the vault allocate across staking routes, let the keeper
              settle harvests, and realize your rewards the next time you interact.
            </p>
          </div>

          <div className="flow-grid flow-grid-rich">
            {flowSteps.map((step) => (
              <article key={step.index} className="glass-card flow-step">
                <span className="flow-index">{step.index}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell narrative-shell">
          <div className="glass-card narrative-card">
            <span className="card-eyebrow">Vault flow</span>
            <h3>The user path stays direct even though the accounting is doing real protocol work.</h3>
            <p>
              Each depositor sees a straightforward experience, but the vault is still maintaining principal, reward debt, claimed
              yield, total harvested yield, and the strategy split that drives the keeper’s daily cycle.
            </p>
            <p>
              That combination is what makes Ozlax feel like a real DeFi primitive instead of a wrapper around a single staking
              endpoint. The protocol is simple at the surface because the design underneath is compact, not because the mechanics were
              hidden.
            </p>
          </div>

          <div className="glass-card pipeline-card">
            <div className="pipeline-line" aria-hidden="true" />
            <article className="pipeline-item-card">
              <span className="card-eyebrow">Vault state</span>
              <h3>Global state keeps the system coherent.</h3>
              <p>The vault stores TVL, fee rate, allocation percentages, and the accumulator that turns harvests into claimable yield.</p>
            </article>
            <article className="pipeline-item-card">
              <span className="card-eyebrow">User position</span>
              <h3>Every wallet carries only the state it needs.</h3>
              <p>Deposited principal, reward debt, and claimed rewards stay compact so reads and settlements remain predictable.</p>
            </article>
            <article className="pipeline-item-card">
              <span className="card-eyebrow">Keeper harvest</span>
              <h3>One update moves the whole vault forward.</h3>
              <p>The keeper settles the treasury share and lifts the accumulator once, which is the core reason the protocol can scale cleanly.</p>
            </article>
          </div>
        </section>

        <section className="section-shell">
          <div className="section-head">
            <span className="section-kicker">Strategy cards</span>
            <h2>Two staking routes, one vault strategy.</h2>
            <p>
              Ozlax is not trying to pretend every yield source looks the same. Marinade and Jito are in the vault for different
              reasons, and that distinction matters when you explain why the strategy exists.
            </p>
          </div>

          <div className="strategy-grid">
            <article className="glass-card strategy-card">
              <div className="strategy-head">
                <div>
                  <span className="card-eyebrow">Marinade Finance</span>
                  <h3>Liquid staking base exposure</h3>
                </div>
                <span className="strategy-pill">{formatWholePercent(marinadeAllocation)}</span>
              </div>
              <p>{strategyCards[0].description}</p>
            </article>

            <article className="glass-card strategy-card">
              <div className="strategy-head">
                <div>
                  <span className="card-eyebrow">Jito</span>
                  <h3>MEV-aware staking lane</h3>
                </div>
                <span className="strategy-pill">{formatWholePercent(jitoAllocation)}</span>
              </div>
              <p>{strategyCards[1].description}</p>
            </article>
          </div>
        </section>

        <section id="keeper-loop" className="section-shell keeper-shell">
          <div className="glass-card keeper-loop-card">
            <span className="section-kicker">Keeper loop explainer</span>
            <h2>The harvest cycle runs on a steady 24 hour rhythm.</h2>
            <p>
              The keeper is not there to create mystery. It reads the vault, models the harvest against the current allocation, routes
              treasury fees, and leaves the rest behind as user yield. That rhythm is the operational heartbeat of the protocol.
            </p>

            <div className="loop-grid">
              {keeperLoop.map((item) => (
                <article key={item.title} className="loop-step">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="glass-card credibility-card">
            <span className="card-eyebrow">Protocol credibility</span>
            <h3>Compact design choices that keep the system legible.</h3>
            {credibilityParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="section-shell">
          <div className="section-head">
            <span className="section-kicker">Protocol architecture</span>
            <h2>Reward-per-share accounting does the heavy lifting without turning the program into a maze.</h2>
            <p>
              Ozlax uses the familiar accumulator pattern because it solves the right problem. Harvests should stay constant-time,
              users should settle lazily when they interact, and the account model should stay small enough to audit with confidence.
            </p>
          </div>

          <div className="feature-grid">
            {protocolFacts.map((description, index) => (
              <FeatureCard
                key={description}
                eyebrow={index === 0 ? "Accounting" : index === 1 ? "Settlement" : "Treasury"}
                title={
                  index === 0
                    ? "One compact program"
                    : index === 1
                      ? "Single accumulator updates"
                      : "Yield-aligned fee model"
                }
                description={description}
              />
            ))}
            <FeatureCard
              eyebrow="Deployment"
              title="Devnet-first, mainnet-ready posture"
              description="The live path starts on devnet because operational discipline matters. The same core design is already shaped for a clean mainnet transition when the rollout is ready."
            />
          </div>
        </section>

        <section className="token-trust-grid">
          <article className="glass-card token-card">
            <span className="section-kicker">$OZX governance token</span>
            <h2>A fixed-supply token with room to grow into governance.</h2>
            {tokenFacts.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>

          <article className="glass-card trust-card" id="security">
            <span className="section-kicker">Security and trust</span>
            <h2>Clear on the design, honest about the current stage.</h2>
            <p>
              Ozlax is still an MVP and should be treated that way. The protocol is open source, the fee model is easy to inspect, and
              the account design stays compact to keep rent costs and attack surface lower.
            </p>
            <p>
              That does not replace a professional audit. It does mean the design is being built in public with choices that are easier
              to verify than a sprawling program full of hidden branches.
            </p>
          </article>
        </section>

        <section className="section-shell credibility-shell">
          <div className="section-head">
            <span className="section-kicker">Protocol credibility</span>
            <h2>Built like infrastructure, explained like infrastructure.</h2>
          </div>

          <div className="credibility-grid">
            <article className="glass-card credibility-panel">
              <h3>One-program design</h3>
              <p>
                Ozlax keeps the program surface intentionally small. That makes deploys, reads, and future review work more manageable
                than a fragmented architecture that spreads state across too many moving pieces.
              </p>
            </article>
            <article className="glass-card credibility-panel">
              <h3>Treasury model</h3>
              <p>
                The treasury only grows when the protocol harvests real yield. That is a cleaner relationship with users than charging
                fees on entry or quietly clipping principal through hidden mechanics.
              </p>
            </article>
            <article className="glass-card credibility-panel">
              <h3>Devnet-first rollout</h3>
              <p>
                The current posture is deliberate. Ozlax is proving the program, the scripts, the keeper, and the interface end to end
                before it asks anyone to treat the system like finished infrastructure.
              </p>
            </article>
          </div>
        </section>

        <FaqSection />

        <section id="community" className="section-shell community-shell">
          <div className="section-head">
            <span className="section-kicker">Community</span>
            <h2>Follow the build in public.</h2>
            <p>
              Ozlax is being shipped in the open. If you want to watch the protocol mature, track deployments, and talk directly to the
              people building it, these are the places to do it.
            </p>
          </div>

          <div className="community-icon-grid">
            {SOCIAL_LINKS.map((item) => (
              <article key={item.label} className="community-link-card">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="community-link-icon"
                  aria-label={item.label}
                >
                  <SocialIcon label={item.label} />
                </a>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {mounted ? <BackToTopButton /> : null}
      </section>
    </Layout>
  );
}

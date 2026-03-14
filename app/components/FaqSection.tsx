import { useState } from "react";

const faqItems = [
  {
    question: "What is Ozlax?",
    answer:
      "Ozlax is a Solana-native yield aggregator built around one vault and one compact accounting model. You deposit SOL once, and the protocol handles strategy allocation, harvest settlement, and claimable yield from there.",
  },
  {
    question: "How does yield aggregation work?",
    answer:
      "The vault keeps a live split across Marinade and Jito, and the keeper settles harvested yield into one reward-per-share accumulator. That lets every depositor share fairly in the harvest without the program looping across every user on chain.",
  },
  {
    question: "What wallets are supported?",
    answer:
      "The app supports Phantom, Solflare, and Coinbase Wallet directly, and it can still recognize wallet-standard providers the browser exposes. Once a wallet is connected, Ozlax reads the live position from chain and sends transactions through that wallet.",
  },
  {
    question: "What are the fees?",
    answer:
      "Ozlax takes a fixed 10% fee on harvested yield. It does not charge entry or exit fees against principal, so the treasury only earns when the vault actually settles yield.",
  },
  {
    question: "Is my SOL safe?",
    answer:
      "Ozlax is still an MVP, so it should be approached with the same caution you would give any pre-audit protocol. The design is compact and open source, which makes it easier to inspect, but that transparency is not a substitute for a formal audit and longer live operating history.",
  },
  {
    question: "What is the $OZX token?",
    answer:
      "OZX is the protocol token recorded alongside the vault for future governance use. The supply is fixed at one billion units with nine decimals, and the mint authority has already been revoked.",
  },
  {
    question: "How do I get started?",
    answer:
      "Connect a supported Solana wallet, switch to the network where Ozlax is live, and open the dashboard. From there you can deposit SOL, monitor your position, claim harvested yield, and withdraw principal whenever you want to leave the vault.",
  },
] as const;

export default function FaqSection() {
  const [openItem, setOpenItem] = useState<number | null>(0);

  return (
    <section className="section-shell faq-shell">
      <div className="section-head">
        <span className="section-kicker">FAQ</span>
        <h2>Questions people ask once the vault starts to click.</h2>
        <p>
          Ozlax is easier to trust when the mechanics are explained plainly. These answers stay close to how the protocol actually behaves today instead of drifting into vague marketing language.
        </p>
      </div>

      <div className="faq-list">
        {faqItems.map((item, index) => {
          const isOpen = openItem === index;

          return (
            <article key={item.question} className={`glass-card faq-item${isOpen ? " faq-item-open" : ""}`}>
              <button
                type="button"
                className="faq-trigger"
                aria-expanded={isOpen}
                onClick={() => setOpenItem(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <span className="faq-toggle" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div className={`faq-answer${isOpen ? " faq-answer-open" : ""}`}>
                <p>{item.answer}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

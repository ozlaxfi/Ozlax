import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { SocialIconRow } from "./SocialIcons";

const explorerUrlFor = (address: string, network: "devnet" | "mainnet-beta") =>
  `https://explorer.solana.com/address/${address}${network === "mainnet-beta" ? "" : "?cluster=devnet"}`;

const resolveNetwork = (): "devnet" | "mainnet-beta" => {
  if (process.env.NEXT_PUBLIC_NETWORK === "mainnet-beta") {
    return "mainnet-beta";
  }

  return (process.env.NEXT_PUBLIC_RPC_URL || "").includes("mainnet") ? "mainnet-beta" : "devnet";
};

type Props = {
  walletAddress?: string;
};

export default function SettingsPanel({ walletAddress }: Props) {
  const { disconnect, disconnecting } = useWallet();
  const [copied, setCopied] = useState(false);
  const network = useMemo(resolveNetwork, []);

  if (!walletAddress) {
    return null;
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="glass-card settings-card">
      <div className="section-title-row">
        <div>
          <span className="card-eyebrow">Settings</span>
          <h3>Your wallet and network context</h3>
        </div>
        <span className="card-hint">{network === "mainnet-beta" ? "Mainnet" : "Devnet"}</span>
      </div>

      <div className="settings-grid">
        <div className="settings-row">
          <span>Connected wallet</span>
          <strong className="settings-address">{walletAddress}</strong>
        </div>
        <div className="settings-row">
          <span>Current network</span>
          <strong>{network === "mainnet-beta" ? "Mainnet" : "Devnet"}</strong>
        </div>
      </div>

      <div className="settings-actions">
        <button type="button" className="button-secondary" onClick={() => void copyAddress()}>
          {copied ? "Address copied" : "Copy address"}
        </button>
        <a
          href={explorerUrlFor(walletAddress, network)}
          target="_blank"
          rel="noreferrer"
          className="button-secondary"
        >
          View on Explorer
        </a>
        <button type="button" className="button-primary" onClick={() => void disconnect()} disabled={disconnecting}>
          {disconnecting ? "Disconnecting..." : "Disconnect wallet"}
        </button>
      </div>

      <div className="settings-socials">
        <span className="field-label">Follow Ozlax</span>
        <SocialIconRow className="settings-social-row" linkClassName="settings-social-link" />
      </div>
    </section>
  );
}

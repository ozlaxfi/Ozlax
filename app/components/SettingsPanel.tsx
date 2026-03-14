import { useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { PROGRAM_ID } from "../utils/anchor";
import { explorerAddressUrl, getNetworkLabel, resolveNetwork } from "../utils/network";
import { SocialIconRow } from "./SocialIcons";

type Props = {
  walletAddress?: string;
};

export default function SettingsPanel({ walletAddress }: Props) {
  const { connection } = useConnection();
  const { disconnect, disconnecting } = useWallet();
  const [copiedField, setCopiedField] = useState<"address" | "program" | null>(null);
  const network = useMemo(() => resolveNetwork(connection.rpcEndpoint), [connection.rpcEndpoint]);
  const networkLabel = getNetworkLabel(network);

  if (!walletAddress) {
    return null;
  }

  const copyValue = async (value: string, field: "address" | "program") => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1200);
  };

  return (
    <section className="glass-card settings-card">
      <div className="section-title-row">
        <div>
          <span className="card-eyebrow">Settings</span>
          <h3>Your wallet and network context</h3>
        </div>
        <span className={`network-badge network-badge-${network}`}>{networkLabel}</span>
      </div>

      <div className="settings-grid">
        <div className="settings-row">
          <span>Connected wallet</span>
          <strong className="settings-address">{walletAddress}</strong>
        </div>
        <div className="settings-row">
          <span>Current network</span>
          <strong>{networkLabel}</strong>
        </div>
        <div className="settings-row">
          <span>Program ID</span>
          <strong className="settings-address">{PROGRAM_ID.toBase58()}</strong>
        </div>
      </div>

      <div className="settings-actions">
        <button type="button" className="button-secondary" onClick={() => void copyValue(walletAddress, "address")}>
          {copiedField === "address" ? "Copied" : "Copy wallet"}
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={() => void copyValue(PROGRAM_ID.toBase58(), "program")}
        >
          {copiedField === "program" ? "Copied" : "Copy program ID"}
        </button>
        <a
          href={explorerAddressUrl(walletAddress, connection.rpcEndpoint)}
          target="_blank"
          rel="noopener noreferrer"
          className="button-secondary"
        >
          View on Explorer
        </a>
        <button type="button" className="button-primary" onClick={() => void disconnect()} disabled={disconnecting}>
          {disconnecting ? "Disconnecting..." : "Disconnect wallet"}
        </button>
      </div>

      <div className="settings-socials">
        <span className="field-label">Stay close to the protocol</span>
        <SocialIconRow className="settings-social-row" linkClassName="settings-social-link" />
      </div>
    </section>
  );
}

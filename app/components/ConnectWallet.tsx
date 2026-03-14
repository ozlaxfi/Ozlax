import { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import { shortenAddress } from "../utils/format";

type Props = {
  className?: string;
};

export default function ConnectWallet({ className = "" }: Props) {
  const { connected, publicKey, wallet, disconnect, disconnecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const address = publicKey?.toBase58();
  const isConnected = connected && Boolean(address);
  const buttonLabel = useMemo(() => (address ? shortenAddress(address) : "Connect Wallet"), [address]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCopy = async () => {
    if (!address) {
      return;
    }

    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="wallet-shell" ref={menuRef}>
      <button
        type="button"
        className={`wallet-button ${className}`.trim()}
        onClick={() => (isConnected ? setMenuOpen((current) => !current) : setVisible(true))}
      >
        <span className={`wallet-status-dot${isConnected ? " wallet-status-live" : ""}`} />
        <span>{buttonLabel}</span>
      </button>

      {menuOpen && isConnected ? (
        <div className="wallet-menu">
          <div className="wallet-menu-copy">
            <span className="field-label">Connected wallet</span>
            <strong>{address}</strong>
            <p>{wallet?.adapter.name || "Solana wallet"} is connected through the standard wallet adapter.</p>
          </div>
          <div className="wallet-menu-actions">
            <button type="button" className="button-secondary" onClick={() => void handleCopy()}>
              {copied ? "Address copied" : "Copy address"}
            </button>
            <button type="button" className="button-secondary" onClick={() => setVisible(true)}>
              Change wallet
            </button>
            <button type="button" className="button-primary" onClick={() => void disconnect()} disabled={disconnecting}>
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

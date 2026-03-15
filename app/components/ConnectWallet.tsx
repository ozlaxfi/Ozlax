import { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";

import { shortenAddress } from "../utils/format";
import { useToast } from "./Toast";

type Props = {
  className?: string;
  showHint?: boolean;
};

const preferredWalletOrder = ["Phantom", "Solflare", "Coinbase Wallet"];
const fallbackWalletNames = ["Phantom", "Solflare", "Coinbase Wallet", "Supported wallet extension"];

const availabilityCopy = (readyState: WalletReadyState, isTouchRuntime: boolean) => {
  if (readyState === WalletReadyState.Installed) {
    return "Detected";
  }
  if (readyState === WalletReadyState.Loadable) {
    return isTouchRuntime ? "Open in app" : "Mobile app";
  }

  return "Unavailable in this browser";
};

const canOpenWallet = (readyState: WalletReadyState, isTouchRuntime: boolean) =>
  readyState === WalletReadyState.Installed || (readyState === WalletReadyState.Loadable && isTouchRuntime);

const describeWalletError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("WalletNotReadyError")) {
    return "That wallet is not available in this browser. Open the extension or app first, then try again.";
  }
  if (message.includes("WalletConnectionError")) {
    return "The wallet connection did not complete. Try again once the wallet window is open.";
  }
  if (message.includes("WalletWindowClosedError") || message.includes("rejected")) {
    return "The wallet request was closed before it finished.";
  }

  return message;
};

export default function ConnectWallet({ className = "", showHint = false }: Props) {
  const { connected, publicKey, wallet, wallets, connect, connecting, disconnect, disconnecting, select } = useWallet();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTouchRuntime, setIsTouchRuntime] = useState(false);
  const [pendingWalletName, setPendingWalletName] = useState<string | null>(null);
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const address = publicKey?.toBase58();
  const isConnected = connected && Boolean(address);
  const buttonLabel = useMemo(() => {
    if (connecting || pendingWalletName) {
      return "Connecting...";
    }

    return address ? shortenAddress(address) : "Connect Wallet";
  }, [address, connecting, pendingWalletName]);

  const sortedWallets = useMemo(
    () =>
      [...wallets].sort((a, b) => {
        const aPriority = preferredWalletOrder.indexOf(a.adapter.name);
        const bPriority = preferredWalletOrder.indexOf(b.adapter.name);
        const aAvailable = canOpenWallet(a.readyState, isTouchRuntime) ? 0 : 1;
        const bAvailable = canOpenWallet(b.readyState, isTouchRuntime) ? 0 : 1;

        return (
          aAvailable - bAvailable ||
          (aPriority === -1 ? preferredWalletOrder.length : aPriority) -
            (bPriority === -1 ? preferredWalletOrder.length : bPriority)
        );
      }),
    [wallets, isTouchRuntime],
  );

  const availableWallets = sortedWallets.filter((entry) => canOpenWallet(entry.readyState, isTouchRuntime));
  const connectInProgress = connecting || Boolean(pendingWalletName);
  const hasConfiguredWallets = sortedWallets.length > 0;
  const walletRows = hasConfiguredWallets
    ? sortedWallets.map((entry) => ({
        name: entry.adapter.name,
        detail:
          entry.readyState === WalletReadyState.Installed
            ? "Installed in this browser and ready to connect."
            : entry.readyState === WalletReadyState.Loadable
              ? isTouchRuntime
                ? "Opens through the wallet app on this device."
                : "This wallet only exposes an app-based flow here, so it is not treated as a primary desktop connection path."
              : "Unavailable in this browser right now.",
        available: canOpenWallet(entry.readyState, isTouchRuntime),
        status: availabilityCopy(entry.readyState, isTouchRuntime),
      }))
    : fallbackWalletNames.map((name) => ({
        name,
        detail: mounted
          ? "Open the wallet extension or mobile app in this browser to connect."
          : "Checking this browser for supported wallets.",
        available: false,
        status: mounted ? "Not detected" : "Checking...",
      }));
  const connectableRows = walletRows.filter((entry) => entry.available);
  const unavailableRows = walletRows.filter((entry) => !entry.available);

  useEffect(() => {
    setMounted(true);
    setIsTouchRuntime("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      setMenuOpen(false);
      setConnectedWalletName(null);
      return;
    }

    const nextWalletName = wallet?.adapter.name || null;
    if (nextWalletName && nextWalletName !== connectedWalletName) {
      setConnectedWalletName(nextWalletName);
      showToast({
        tone: "success",
        title: "Wallet connected",
        message: `${nextWalletName} is connected and ready to sign Ozlax transactions.`,
      });
    }
  }, [isConnected, wallet?.adapter.name, connectedWalletName, showToast]);

  useEffect(() => {
    const closeInteractiveState = () => {
      setMenuOpen(false);
      setPickerOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeInteractiveState();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pickerOpen]);

  useEffect(() => {
    if (!pendingWalletName) {
      return;
    }

    if (wallet?.adapter.name !== pendingWalletName || connected || connecting) {
      return;
    }

    let cancelled = false;

    const runConnect = async () => {
      try {
        await connect();
        if (!cancelled) {
          setPickerOpen(false);
          setPendingWalletName(null);
        }
      } catch (error) {
        if (!cancelled) {
          setPendingWalletName(null);
          showToast({
            tone: "error",
            title: "Wallet connection failed",
            message: describeWalletError(error),
          });
        }
      }
    };

    void runConnect();

    return () => {
      cancelled = true;
    };
  }, [pendingWalletName, wallet?.adapter.name, connected, connecting, connect, showToast]);

  const handleCopy = async () => {
    if (!address) {
      return;
    }

    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleSelectWallet = async (walletName: string) => {
    setPendingWalletName(walletName);

    try {
      select(walletName as any);
    } catch (error) {
      setPendingWalletName(null);
      showToast({
        tone: "error",
        title: "Wallet selection failed",
        message: describeWalletError(error),
      });
    }
  };

  return (
    <div className="wallet-shell" ref={menuRef}>
      <button
        type="button"
        className={`wallet-button ${className}`.trim()}
        onClick={() => {
          if (connectInProgress) {
            return;
          }

          if (isConnected) {
            setMenuOpen((current) => !current);
            return;
          }

          setPickerOpen(true);
        }}
        aria-haspopup={isConnected ? "menu" : "dialog"}
        aria-expanded={isConnected ? menuOpen : pickerOpen}
        disabled={connectInProgress}
      >
        <span className={`wallet-status-dot${isConnected ? " wallet-status-live" : ""}`} />
        <span>{buttonLabel}</span>
      </button>

      {showHint && !isConnected ? (
        <p className="wallet-support-note">
          {availableWallets.length > 0
            ? "Choose a supported wallet to connect. If a wallet window is already open, wait for it to finish before clicking again."
            : mounted
              ? "Open Phantom, Solflare, Coinbase Wallet, or another supported wallet in this browser to connect."
              : "Checking this browser for supported wallets now."}
        </p>
      ) : null}

      {menuOpen && isConnected ? (
        <div className="wallet-menu" role="menu">
          <div className="wallet-menu-copy">
            <span className="field-label">Connected wallet</span>
            <strong>{address}</strong>
            <p>{wallet?.adapter.name || "Solana wallet"} is connected through the standard wallet adapter.</p>
          </div>
          <div className="wallet-menu-actions">
            <button type="button" className="button-secondary" onClick={() => void handleCopy()}>
              {copied ? "Address copied" : "Copy address"}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                setMenuOpen(false);
                setPickerOpen(true);
              }}
            >
              Change wallet
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={() => {
                setMenuOpen(false);
                void disconnect();
              }}
              disabled={disconnecting}
            >
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        </div>
      ) : null}

      {pickerOpen && !isConnected ? (
        <div className="wallet-picker-overlay" role="presentation" onClick={(event) => {
          if (event.target === event.currentTarget && !connectInProgress) {
            setPickerOpen(false);
            setPendingWalletName(null);
          }
        }}>
          <div className="wallet-picker glass-card" role="dialog" aria-modal="true" aria-labelledby="wallet-picker-title">
            <div className="confirm-modal-head">
              <div>
                <span className="card-eyebrow">Wallet connection</span>
                <h3 id="wallet-picker-title">Choose a wallet</h3>
                <p className="wallet-picker-intro">
                  Connect with a supported Solana wallet to read live Ozlax vault state and sign deposit, withdrawal, and claim transactions.
                </p>
              </div>
              <button
                type="button"
                className="confirm-modal-close"
                onClick={() => {
                  setPickerOpen(false);
                  setPendingWalletName(null);
                }}
                disabled={connectInProgress}
                aria-label="Close wallet picker"
              >
                <span aria-hidden="true">x</span>
              </button>
            </div>

            {connectableRows.length > 0 ? (
              <div className="wallet-picker-section">
                <div className="wallet-picker-section-head">
                  <span className="wallet-picker-section-label">Available now</span>
                  <span className="wallet-picker-section-count">{connectableRows.length}</span>
                </div>
                <div className="wallet-picker-list">
                  {connectableRows.map((entry) => {
                    const isPending = pendingWalletName === entry.name;

                    return (
                      <button
                        key={entry.name}
                        type="button"
                        className="wallet-picker-item"
                        disabled={connectInProgress}
                        onClick={() => void handleSelectWallet(entry.name)}
                      >
                        <span className="wallet-picker-copy">
                          <strong>{entry.name}</strong>
                          <span>{entry.detail}</span>
                        </span>
                        <span className="wallet-picker-state wallet-picker-state-live">
                          {isPending ? "Connecting..." : entry.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {unavailableRows.length > 0 ? (
              <div className="wallet-picker-section">
                <div className="wallet-picker-section-head">
                  <span className="wallet-picker-section-label">Unavailable in this runtime</span>
                  <span className="wallet-picker-section-count">{unavailableRows.length}</span>
                </div>
                <div className="wallet-picker-list">
                  {unavailableRows.map((entry) => (
                    <button
                      key={entry.name}
                      type="button"
                      className="wallet-picker-item"
                      disabled
                    >
                      <span className="wallet-picker-copy">
                        <strong>{entry.name}</strong>
                        <span>{entry.detail}</span>
                      </span>
                      <span className="wallet-picker-state">
                        {entry.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="wallet-support-note wallet-support-note-modal">
              {availableWallets.length > 0
                ? "Installed wallets are listed first. If a wallet appears in the unavailable section, open the extension or app first and then reopen this picker."
                : mounted
                  ? "No supported wallet extension is active in this browser right now. Open a wallet and then reopen this picker to refresh detection."
                  : "The wallet list is still loading for this browser. If no adapter appears after a moment, open a supported wallet extension and try again."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

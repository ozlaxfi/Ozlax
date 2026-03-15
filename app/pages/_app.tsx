import type { AppProps } from "next/app";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { CoinbaseWalletAdapter } from "@solana/wallet-adapter-coinbase";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";

import ErrorBoundary from "../components/ErrorBoundary";
import { ToastProvider } from "../components/Toast";
import "../styles/globals.css";

export default function OzlaxApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com", []);
  const network = useMemo(
    () =>
      process.env.NEXT_PUBLIC_NETWORK === "mainnet-beta"
        ? WalletAdapterNetwork.Mainnet
        : WalletAdapterNetwork.Devnet,
    [],
  );
  const wallets = useMemo(() => {
    if (!mounted) {
      return [];
    }

    return [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network }), new CoinbaseWalletAdapter()];
  }, [mounted, network]);

  useEffect(() => {
    setMounted(true);

    const storedTheme = window.localStorage.getItem("ozlax-theme");
    document.documentElement.dataset.theme = storedTheme === "light" ? "light" : "dark";
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <ToastProvider>
          <ErrorBoundary>
            <div key={router.asPath} className="page-transition">
              <Component {...pageProps} />
            </div>
          </ErrorBoundary>
        </ToastProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

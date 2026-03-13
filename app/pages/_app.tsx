import type { AppProps } from "next/app";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";

import "../styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const endpoint = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
const network =
  process.env.NEXT_PUBLIC_NETWORK === "mainnet-beta"
    ? WalletAdapterNetwork.Mainnet
    : WalletAdapterNetwork.Devnet;
const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })];

export default function OzlaxApp({ Component, pageProps }: AppProps) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

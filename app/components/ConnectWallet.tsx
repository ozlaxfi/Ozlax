import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export default function ConnectWallet() {
  return <WalletMultiButton className="wallet-button" />;
}

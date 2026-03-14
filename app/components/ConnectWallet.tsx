import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

type Props = {
  className?: string;
};

export default function ConnectWallet({ className = "" }: Props) {
  return <WalletMultiButton className={`wallet-button ${className}`.trim()} />;
}

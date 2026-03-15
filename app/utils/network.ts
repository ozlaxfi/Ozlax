export type OzlaxNetwork = "devnet" | "mainnet-beta" | "localnet" | "unknown";

const DEFAULT_DEVNET_RPC = "https://api.devnet.solana.com";

export const getRpcEndpoint = () => process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_DEVNET_RPC;

export const resolveNetwork = (endpoint?: string | null): OzlaxNetwork => {
  const explicit = (process.env.NEXT_PUBLIC_NETWORK || "").trim().toLowerCase();
  const rpc = (endpoint || getRpcEndpoint()).trim().toLowerCase();

  if (explicit === "mainnet-beta" || explicit === "mainnet") {
    return "mainnet-beta";
  }
  if (explicit === "devnet") {
    return "devnet";
  }
  if (explicit === "localnet") {
    return "localnet";
  }
  if (rpc.includes("localhost") || rpc.includes("127.0.0.1")) {
    return "localnet";
  }
  if (rpc.includes("mainnet")) {
    return "mainnet-beta";
  }
  if (rpc.includes("devnet")) {
    return "devnet";
  }

  return "unknown";
};

export const getNetworkLabel = (network: OzlaxNetwork) => {
  if (network === "mainnet-beta") {
    return "Mainnet";
  }
  if (network === "devnet") {
    return "Devnet";
  }
  if (network === "localnet") {
    return "Local";
  }

  return "Unknown Network";
};

export const hasPublicExplorer = (network: OzlaxNetwork) => network === "devnet" || network === "mainnet-beta";

export const explorerTxUrl = (signature: string, endpoint?: string | null) => {
  const network = resolveNetwork(endpoint);

  if (network === "mainnet-beta") {
    return `https://explorer.solana.com/tx/${signature}`;
  }
  if (network === "devnet") {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  }

  return null;
};

export const explorerAddressUrl = (address: string, endpoint?: string | null) => {
  const network = resolveNetwork(endpoint);

  if (network === "mainnet-beta") {
    return `https://explorer.solana.com/address/${address}`;
  }
  if (network === "devnet") {
    return `https://explorer.solana.com/address/${address}?cluster=devnet`;
  }

  return null;
};

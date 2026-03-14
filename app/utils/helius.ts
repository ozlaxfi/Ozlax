import axios from "axios";
import { explorerTxUrl } from "./network";

export type HeliusTransaction = {
  signature: string;
  type: string;
  description: string;
  amount: number | null;
  timestamp: number;
  fee: number;
  explorerUrl: string;
};

const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || process.env.HELIUS_API_KEY;

const humanizeType = (transaction: any) => {
  const rawType = String(transaction?.type || "").toUpperCase();
  const description = String(transaction?.description || "");

  if (rawType.includes("TRANSFER")) {
    return "Transfer";
  }
  if (rawType.includes("SWAP")) {
    return "Swap";
  }
  if (rawType.includes("STAKE")) {
    return "Stake";
  }
  if (rawType.includes("NFT")) {
    return "NFT";
  }
  if (description.toLowerCase().includes("claim")) {
    return "Claim";
  }
  if (description.toLowerCase().includes("deposit")) {
    return "Deposit";
  }
  if (description.toLowerCase().includes("withdraw")) {
    return "Withdraw";
  }

  return "Activity";
};

const toAmount = (address: string, transaction: any) => {
  const nativeTransfers = Array.isArray(transaction?.nativeTransfers) ? transaction.nativeTransfers : [];
  const relevantTransfer = nativeTransfers.find(
    (item: any) => item?.fromUserAccount === address || item?.toUserAccount === address,
  );

  if (!relevantTransfer) {
    return null;
  }

  const lamports = Number(relevantTransfer.amount || 0);
  if (!Number.isFinite(lamports)) {
    return null;
  }

  return lamports / 1_000_000_000;
};

export const isHeliusConfigured = () => Boolean(apiKey);

export const fetchWalletTransactions = async (address: string, rpcEndpoint?: string): Promise<HeliusTransaction[]> => {
  if (!apiKey) {
    return [];
  }

  try {
    const response = await axios.get(
      `https://api.helius.xyz/v0/addresses/${address}/transactions`,
      {
        params: { "api-key": apiKey, limit: 5 },
        timeout: 10_000,
      },
    );

    return (response.data || []).map((transaction: any) => ({
      signature: transaction.signature,
      type: humanizeType(transaction),
      description: transaction.description || transaction.type || "Solana transaction",
      amount: toAmount(address, transaction),
      timestamp: transaction.timestamp || 0,
      fee: transaction.fee || 0,
      explorerUrl: explorerTxUrl(transaction.signature, rpcEndpoint),
    }));
  } catch {
    return [];
  }
};

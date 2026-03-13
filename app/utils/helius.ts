import axios from "axios";

export type HeliusTransaction = {
  signature: string;
  description: string;
  timestamp: number;
  fee: number;
};

export const fetchWalletTransactions = async (address: string): Promise<HeliusTransaction[]> => {
  const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || process.env.HELIUS_API_KEY;
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
      description: transaction.description || transaction.type || "Solana transaction",
      timestamp: transaction.timestamp || 0,
      fee: transaction.fee || 0,
    }));
  } catch {
    return [];
  }
};

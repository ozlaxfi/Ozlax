import axios from "axios";
import { Connection, ParsedInstruction, PartiallyDecodedInstruction, PublicKey } from "@solana/web3.js";

import { explorerTxUrl, resolveNetwork } from "./network";

export type HeliusTransaction = {
  signature: string;
  type: string;
  description: string;
  amount: number | null;
  timestamp: number;
  fee: number;
  explorerUrl: string | null;
};

export type WalletActivityResult = {
  items: HeliusTransaction[];
  source: "helius" | "rpc" | "unavailable";
  message: string;
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

const getInstructionProgram = (instruction: ParsedInstruction | PartiallyDecodedInstruction) => {
  if ("program" in instruction) {
    return instruction.program;
  }

  return instruction.programId.toBase58();
};

const inferRpcType = (instructions: (ParsedInstruction | PartiallyDecodedInstruction)[], netLamports: number | null) => {
  const programs = instructions.map(getInstructionProgram);

  if (programs.some((program) => program === "system")) {
    return netLamports !== null && netLamports >= 0 ? "Deposit" : "Withdraw";
  }
  if (programs.some((program) => program === "stake")) {
    return "Stake";
  }
  if (programs.some((program) => program === "vote")) {
    return "Vote";
  }

  return "Activity";
};

const getNetLamports = (address: string, parsedTransaction: any) => {
  const accountKeys = parsedTransaction?.transaction?.message?.accountKeys || [];
  const index = accountKeys.findIndex((entry: any) => {
    if (entry?.pubkey?.toBase58) {
      return entry.pubkey.toBase58() === address;
    }

    return entry?.pubkey === address;
  });

  if (index < 0) {
    return null;
  }

  const pre = parsedTransaction?.meta?.preBalances?.[index];
  const post = parsedTransaction?.meta?.postBalances?.[index];
  if (typeof pre !== "number" || typeof post !== "number") {
    return null;
  }

  return post - pre;
};

const fetchHeliusTransactions = async (address: string, rpcEndpoint?: string): Promise<WalletActivityResult | null> => {
  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.get(`https://api.helius.xyz/v0/addresses/${address}/transactions`, {
      params: { "api-key": apiKey, limit: 10 },
      timeout: 10_000,
    });

    return {
      items: (response.data || []).map((transaction: any) => ({
        signature: transaction.signature,
        type: humanizeType(transaction),
        description: transaction.description || transaction.type || "Solana transaction",
        amount: toAmount(address, transaction),
        timestamp: transaction.timestamp || 0,
        fee: transaction.fee || 0,
        explorerUrl: explorerTxUrl(transaction.signature, rpcEndpoint),
      })),
      source: "helius",
      message: response.data?.length ? "" : "No recent activity.",
    };
  } catch {
    return null;
  }
};

const fetchRpcTransactions = async (address: string, rpcEndpoint?: string): Promise<WalletActivityResult> => {
  if (!rpcEndpoint) {
    return {
      items: [],
      source: "unavailable",
      message: "Recent activity is unavailable on this RPC without enhanced indexing.",
    };
  }

  const network = resolveNetwork(rpcEndpoint);
  const connection = new Connection(rpcEndpoint, "confirmed");
  const publicKey = new PublicKey(address);

  try {
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 }, "confirmed");
    if (!signatures.length) {
      return {
        items: [],
        source: "rpc",
        message:
          network === "localnet"
            ? "No recent activity in the local validator yet."
            : "No recent activity.",
      };
    }

    const parsedTransactions = await connection.getParsedTransactions(
      signatures.map((entry) => entry.signature),
      { maxSupportedTransactionVersion: 0 },
    );

    const items = parsedTransactions
      .map((transaction, index) => {
        if (!transaction) {
          return null;
        }

        const netLamports = getNetLamports(address, transaction);
        const instructions = transaction.transaction.message.instructions as (ParsedInstruction | PartiallyDecodedInstruction)[];

        return {
          signature: signatures[index].signature,
          type: inferRpcType(instructions, netLamports),
          description: "Recent activity from the connected RPC",
          amount: netLamports === null ? null : Math.abs(netLamports) / 1_000_000_000,
          timestamp: signatures[index].blockTime || 0,
          fee: transaction.meta?.fee || 0,
          explorerUrl: explorerTxUrl(signatures[index].signature, rpcEndpoint),
        } satisfies HeliusTransaction;
      })
      .filter((item): item is HeliusTransaction => Boolean(item));

    return {
      items,
      source: "rpc",
      message:
        "Showing recent activity from the connected RPC. Some transaction details are limited without enhanced indexing.",
    };
  } catch {
    return {
      items: [],
      source: "unavailable",
      message: "Recent activity is limited on this RPC right now.",
    };
  }
};

export const isHeliusConfigured = () => Boolean(apiKey);

export const fetchWalletTransactions = async (address: string, rpcEndpoint?: string): Promise<WalletActivityResult> => {
  const heliusResult = await fetchHeliusTransactions(address, rpcEndpoint);
  if (heliusResult) {
    return heliusResult;
  }

  return fetchRpcTransactions(address, rpcEndpoint);
};

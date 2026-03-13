import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

const programIdValue = (
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
  process.env.PROGRAM_ID ||
  "9W7SdAuyoHwg1F8Mn8tuGJhGpwp7YGi3Vt6t9CcBFSSW"
).trim();

export const PROGRAM_ID = new PublicKey(
  programIdValue,
);

const fallbackWallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T) => tx,
  signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]) => txs,
} as AnchorWallet;

export const OZLAX_IDL = {
  version: "0.1.0",
  name: "ozlax",
  instructions: [
    {
      name: "initializeVault",
      accounts: [
        { name: "vault", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "feeBps", type: "u16" },
        { name: "treasury", type: "publicKey" },
        { name: "ozxMint", type: "publicKey" },
        { name: "marinadeStakeAccount", type: "publicKey" },
        { name: "jitoStakeAccount", type: "publicKey" },
      ],
    },
    {
      name: "deposit",
      accounts: [
        { name: "vault", isMut: true, isSigner: false },
        { name: "userPosition", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
    {
      name: "withdraw",
      accounts: [
        { name: "vault", isMut: true, isSigner: false },
        { name: "userPosition", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
    {
      name: "claimYield",
      accounts: [
        { name: "vault", isMut: true, isSigner: false },
        { name: "userPosition", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
      ],
      args: [],
    },
    {
      name: "harvestYield",
      accounts: [
        { name: "vault", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
        { name: "treasury", isMut: true, isSigner: false },
      ],
      args: [
        { name: "marinadeYield", type: "u64" },
        { name: "jitoYield", type: "u64" },
      ],
    },
    {
      name: "rebalance",
      accounts: [
        { name: "vault", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [
        { name: "marinadePct", type: "u8" },
        { name: "jitoPct", type: "u8" },
      ],
    },
  ],
  accounts: [
    {
      name: "vaultState",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "treasury", type: "publicKey" },
          { name: "totalDeposited", type: "u64" },
          { name: "totalYieldHarvested", type: "u64" },
          { name: "accYieldPerShare", type: "u128" },
          { name: "feeBps", type: "u16" },
          { name: "marinadePct", type: "u8" },
          { name: "jitoPct", type: "u8" },
          { name: "bump", type: "u8" },
          { name: "ozxMint", type: "publicKey" },
          { name: "marinadeStakeAccount", type: "publicKey" },
          { name: "jitoStakeAccount", type: "publicKey" },
        ],
      },
    },
    {
      name: "userPosition",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "depositedAmount", type: "u64" },
          { name: "yieldEarnedClaimed", type: "u64" },
          { name: "rewardDebt", type: "u128" },
          { name: "lastHarvestSlot", type: "u64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
} satisfies Idl;

export const getProvider = (connection: Connection, wallet?: AnchorWallet | null) => {
  return new AnchorProvider(connection, wallet || fallbackWallet, AnchorProvider.defaultOptions());
};

export const getProgram = (connection: Connection, wallet?: AnchorWallet | null) => {
  return new Program(OZLAX_IDL, PROGRAM_ID, getProvider(connection, wallet));
};

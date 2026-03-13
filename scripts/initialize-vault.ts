import "dotenv/config";

import * as anchor from "@coral-xyz/anchor";
import { Idl, Program } from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import path from "path";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const requireEnv = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set before initializing the vault.`);
  }

  return value;
};

const idl = {
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
  ],
} satisfies Idl;

const loadKeypair = (keypairPath: string) => {
  const secret = JSON.parse(readFileSync(path.resolve(keypairPath), "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secret));
};

const main = async () => {
  const rawPath = process.env.KEEPER_KEYPAIR_PATH || process.env.ANCHOR_WALLET || "~/.config/solana/id.json";
  const resolvedPath = rawPath.replace(/^~(?=\/)/, process.env.USERPROFILE || "");
  const payer = loadKeypair(resolvedPath);
  const rpcUrl = (process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "").trim();
  if (!rpcUrl) {
    throw new Error("HELIUS_RPC_URL or NEXT_PUBLIC_RPC_URL must be set before initializing the vault.");
  }

  const programId = new PublicKey(requireEnv("PROGRAM_ID"));
  const treasury = new PublicKey((process.env.TREASURY_WALLET || payer.publicKey.toBase58()).trim());
  const ozxMint = new PublicKey((process.env.OZX_MINT || payer.publicKey.toBase58()).trim());
  const connection = new Connection(rpcUrl, "confirmed");
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  anchor.setProvider(provider);

  const program = new Program(
    idl,
    programId,
    provider,
  );
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], program.programId);

  console.log(`RPC URL: ${rpcUrl}`);
  console.log(`Program ID: ${program.programId.toBase58()}`);
  console.log(`Authority: ${payer.publicKey.toBase58()}`);
  console.log(`Treasury: ${treasury.toBase58()}`);
  console.log(`OZX mint: ${ozxMint.toBase58()}`);
  console.log(`Derived vault PDA: ${vaultPda.toBase58()}`);

  const signature = await program.methods
    .initializeVault(
      1_000,
      treasury,
      ozxMint,
      payer.publicKey,
      payer.publicKey,
    )
    .accounts({
      vault: vaultPda,
      authority: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log(`Initialize tx: ${signature}`);

  const vaultAccount = await connection.getAccountInfo(vaultPda, "confirmed");
  if (!vaultAccount) {
    throw new Error(`Vault PDA ${vaultPda.toBase58()} was not created.`);
  }

  console.log(`Vault account confirmed: ${vaultPda.toBase58()}`);
  console.log(`Vault account lamports: ${vaultAccount.lamports}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

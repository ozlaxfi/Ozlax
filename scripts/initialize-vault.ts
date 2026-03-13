import "dotenv/config";

import * as anchor from "@coral-xyz/anchor";
import { Idl, Program } from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import path from "path";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const DEFAULT_PROGRAM_ID = "9W7SdAuyoHwg1F8Mn8tuGJhGpwp7YGi3Vt6t9CcBFSSW";

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
  const connection = new Connection(process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "", "confirmed");
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  anchor.setProvider(provider);

  const program = new Program(
    idl,
    new PublicKey(process.env.PROGRAM_ID || DEFAULT_PROGRAM_ID),
    provider,
  );
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], program.programId);

  const signature = await program.methods
    .initializeVault(
      1_000,
      new PublicKey(process.env.TREASURY_WALLET || payer.publicKey),
      new PublicKey(process.env.OZX_MINT || payer.publicKey),
      payer.publicKey,
      payer.publicKey,
    )
    .accounts({
      vault: vaultPda,
      authority: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log(`Vault PDA: ${vaultPda.toBase58()}`);
  console.log(`Initialize tx: ${signature}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import "dotenv/config";

import * as anchor from "@coral-xyz/anchor";
import { BN, Idl, Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const requireEnv = (name: string, fallback?: string) => {
  const value = process.env[name]?.trim() || fallback?.trim();
  if (!value) {
    throw new Error(`${name} must be set before verifying the deployment.`);
  }

  return value;
};

const formatSol = (lamports: BN | number | bigint) => {
  const raw = typeof lamports === "number" ? lamports : Number(lamports.toString());
  return `${(raw / anchor.web3.LAMPORTS_PER_SOL).toFixed(6)} SOL`;
};

const idl = {
  version: "0.1.0",
  name: "ozlax",
  instructions: [],
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
  ],
} satisfies Idl;

type VaultState = {
  authority: PublicKey;
  treasury: PublicKey;
  totalDeposited: BN;
  totalYieldHarvested: BN;
  feeBps: number;
  marinadePct: number;
  jitoPct: number;
  ozxMint: PublicKey;
};

const main = async () => {
  const programId = new PublicKey(requireEnv("PROGRAM_ID"));
  const frontendProgramIdValue = process.env.NEXT_PUBLIC_PROGRAM_ID?.trim();
  const deployRpc = requireEnv("HELIUS_RPC_URL", process.env.NEXT_PUBLIC_RPC_URL);
  const frontendRpc = requireEnv("NEXT_PUBLIC_RPC_URL", process.env.HELIUS_RPC_URL);
  const connection = new Connection(deployRpc, "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: Keypair.generate().publicKey,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    },
    anchor.AnchorProvider.defaultOptions(),
  );
  const program = new Program(idl, programId, provider);
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], programId);

  const programAccount = await connection.getAccountInfo(programId, "confirmed");
  if (!programAccount || !programAccount.executable) {
    throw new Error(`Program ${programId.toBase58()} is not deployed or not executable on ${deployRpc}.`);
  }

  const vault = (await program.account.vaultState.fetch(vaultPda)) as VaultState;

  console.log("Verification summary:");
  console.log(`  RPC:                 ${deployRpc}`);
  console.log(`  Frontend RPC:        ${frontendRpc}`);
  console.log(`  Program ID:          ${programId.toBase58()}`);
  console.log(`  Frontend Program ID: ${frontendProgramIdValue || "(not set in current shell)"}`);
  console.log(`  Vault PDA:           ${vaultPda.toBase58()}`);
  console.log(`  Authority:           ${vault.authority.toBase58()}`);
  console.log(`  Treasury:            ${vault.treasury.toBase58()}`);
  console.log(`  OZX mint:            ${vault.ozxMint.toBase58()}`);
  console.log(`  Fee bps:             ${vault.feeBps}`);
  console.log(`  Allocation split:    Marinade ${vault.marinadePct}% / Jito ${vault.jitoPct}%`);
  console.log(`  Total deposited:     ${formatSol(vault.totalDeposited)}`);
  console.log(`  Total yield:         ${formatSol(vault.totalYieldHarvested)}`);

  if (frontendProgramIdValue && frontendProgramIdValue !== programId.toBase58()) {
    throw new Error(
      `NEXT_PUBLIC_PROGRAM_ID (${frontendProgramIdValue}) does not match PROGRAM_ID (${programId.toBase58()}).`,
    );
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

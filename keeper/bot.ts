import "dotenv/config";

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import axios from "axios";
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const PLACEHOLDER_PROGRAM_ID = "BSaLVpWMCC6sjuyy4D1r8UHFQ2xc9LXNSeHBZqbjguyx";
const MARINADE_FALLBACK_APY = 0.072;
const JITO_FALLBACK_APY = 0.081;
const ONCE_MODE = process.argv.includes("--once");
const DRY_RUN_MODE = process.argv.includes("--dry-run");

const requireEnv = (name: string, fallback?: string) => {
  const value = process.env[name]?.trim() || fallback?.trim();
  if (!value) {
    throw new Error(`${name} must be set before running the keeper.`);
  }

  return value;
};

const idl = {
  version: "0.1.0",
  name: "ozlax",
  instructions: [
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
  ],
} satisfies Idl;

type VaultState = {
  authority: PublicKey;
  treasury: PublicKey;
  totalDeposited: BN;
  feeBps: number;
  marinadePct: number;
  jitoPct: number;
};

const log = (message: string) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const loadOptionalModule = async (specifier: string) => {
  const importer = new Function("modulePath", "return import(modulePath);") as (modulePath: string) => Promise<any>;
  return importer(specifier);
};

export const loadKeypair = (keypairPath = requireEnv("KEEPER_KEYPAIR_PATH", process.env.ANCHOR_WALLET)) => {
  const resolved = path.resolve(keypairPath);
  const secret = JSON.parse(fs.readFileSync(resolved, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secret));
};

export const getProvider = () => {
  const wallet = new anchor.Wallet(loadKeypair());
  const rpcUrl = requireEnv("HELIUS_RPC_URL", process.env.NEXT_PUBLIC_RPC_URL);
  const connection = new Connection(rpcUrl, "confirmed");
  return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
};

export const getProgram = (provider = getProvider()) => {
  const programId = new PublicKey(process.env.PROGRAM_ID || PLACEHOLDER_PROGRAM_ID);
  return new Program(idl, programId, provider);
};

export const fetchVaultState = async (program = getProgram()) => {
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], program.programId);
  const vault = (await program.account.vaultState.fetch(vaultPda)) as VaultState;
  return { vaultPda, vault };
};

export const fetchMarinadeApy = async (connection: Connection) => {
  try {
    const sdk = await loadOptionalModule("@marinade.finance/marinade-ts-sdk");
    if ("Marinade" in sdk) {
      const MarinadeCtor = (sdk as any).Marinade;
      const MarinadeConfigCtor = (sdk as any).MarinadeConfig;
      const config = MarinadeConfigCtor ? new MarinadeConfigCtor({ connection }) : undefined;
      const marinade = config ? new MarinadeCtor(config) : new MarinadeCtor();
      const state = await marinade.getMarinadeState?.();
      const apy = state?.msolPriceApy ?? state?.apy ?? state?.stakingApy;
      if (typeof apy === "number" && Number.isFinite(apy)) {
        return apy > 1 ? apy / 100 : apy;
      }
    }
  } catch (error) {
    log(`Marinade SDK APY lookup failed, using fallback path. ${(error as Error).message}`);
  }

  try {
    const response = await axios.get("https://api.marinade.finance/msol/apy/30d", { timeout: 10_000 });
    const value = Number(response.data);
    if (Number.isFinite(value)) {
      return value > 1 ? value / 100 : value;
    }
  } catch (error) {
    log(`Marinade API fallback failed. ${(error as Error).message}`);
  }

  return MARINADE_FALLBACK_APY;
};

export const fetchJitoApy = async () => {
  try {
    const sdk = await loadOptionalModule("@jito-foundation/restaking-sdk");
    const maybeClient = (sdk as any).RestakingClient || (sdk as any).JitoRestakingClient;
    const maybeApy = maybeClient?.apy ?? maybeClient?.stakingApy;
    if (typeof maybeApy === "number" && Number.isFinite(maybeApy)) {
      return maybeApy > 1 ? maybeApy / 100 : maybeApy;
    }
  } catch (error) {
    log(`Jito SDK APY lookup failed, using fallback path. ${(error as Error).message}`);
  }

  try {
    const response = await axios.get("https://www.jito.network/api/v1/staking/apy", { timeout: 10_000 });
    const value = Number(response.data?.apy ?? response.data?.jitoSolApy ?? response.data?.data?.apy);
    if (Number.isFinite(value)) {
      return value > 1 ? value / 100 : value;
    }
  } catch (error) {
    log(`Jito API fallback failed. ${(error as Error).message}`);
  }

  return JITO_FALLBACK_APY;
};

export const notifyDiscord = async (content: string) => {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    return;
  }

  await axios.post(process.env.DISCORD_WEBHOOK_URL, { content }, { timeout: 10_000 });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const classifyKeeperError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  if (/EmptyVault|NoYieldAvailable|InvalidAmount/i.test(message)) {
    return { message, retryable: false, skip: true };
  }

  if (
    /429|timeout|timed out|ECONNRESET|ENOTFOUND|failed to fetch|NetworkError|blockhash|Node is behind|fetch failed/i.test(
      message,
    )
  ) {
    return { message, retryable: true, skip: false };
  }

  return { message, retryable: false, skip: false };
};

export const runHarvest = async ({ dryRun = false }: { dryRun?: boolean } = {}) => {
  const provider = getProvider();
  const program = getProgram(provider);
  const { vaultPda, vault } = await fetchVaultState(program);

  const tvlSol = Number(vault.totalDeposited.toString()) / 1_000_000_000;
  if (tvlSol <= 0) {
    log("Skipping harvest because vault TVL is zero.");
    return;
  }

  const [marinadeApy, jitoApy] = await Promise.all([
    fetchMarinadeApy(provider.connection),
    fetchJitoApy(),
  ]);
  const weightedApy = (marinadeApy * vault.marinadePct + jitoApy * vault.jitoPct) / 100;
  const simulatedDailyYieldSol = tvlSol * weightedApy / 365;
  const totalLamports = Math.max(0, Math.floor(simulatedDailyYieldSol * 1_000_000_000));
  const marinadeLamports = Math.floor(totalLamports * (vault.marinadePct / 100));
  const jitoLamports = totalLamports - marinadeLamports;

  log(
    `Harvest simulation inputs | TVL: ${tvlSol.toFixed(6)} SOL | Marinade APY: ${(marinadeApy * 100).toFixed(2)}% | ` +
      `Jito APY: ${(jitoApy * 100).toFixed(2)}% | Weighted APY: ${(weightedApy * 100).toFixed(2)}% | ` +
      `Simulated harvest: ${totalLamports} lamports`,
  );

  if (totalLamports === 0) {
    log("Skipping harvest because simulated yield rounded to zero lamports.");
    return;
  }

  if (dryRun) {
    log(
      `Dry run complete | Marinade: ${marinadeLamports} lamports | Jito: ${jitoLamports} lamports | Treasury: ${vault.treasury.toBase58()}`,
    );
    return;
  }

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const signature = await program.methods
        .harvestYield(new BN(marinadeLamports), new BN(jitoLamports))
        .accounts({
          vault: vaultPda,
          authority: provider.wallet.publicKey,
          treasury: vault.treasury,
        })
        .rpc();

      const message =
        `Ozlax harvest complete.\n` +
        `TVL: ${tvlSol.toFixed(3)} SOL\n` +
        `Weighted APY: ${(weightedApy * 100).toFixed(2)}%\n` +
        `Harvest: ${(totalLamports / 1_000_000_000).toFixed(6)} SOL\n` +
        `Tx: ${signature}`;

      log(message.replace(/\n/g, " | "));
      await notifyDiscord(message);
      return;
    } catch (error) {
      const classified = classifyKeeperError(error);
      if (classified.skip) {
        log(`Skipping harvest. ${classified.message}`);
        return;
      }

      lastError = error as Error;
      log(`Harvest attempt ${attempt} failed. ${classified.message}`);
      if (classified.retryable && attempt < 3) {
        await sleep(5_000);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
};

export const main = async () => {
  const provider = getProvider();
  const program = getProgram(provider);
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], program.programId);

  log(`Keeper RPC: ${provider.connection.rpcEndpoint}`);
  log(`Keeper authority: ${provider.wallet.publicKey.toBase58()}`);
  log(`Keeper program ID: ${program.programId.toBase58()}`);
  log(`Keeper vault PDA: ${vaultPda.toBase58()}`);
  log(`Keeper harvest mode: APY-fetched daily simulation${DRY_RUN_MODE ? " (dry run)" : ""}.`);

  if (ONCE_MODE) {
    await runHarvest({ dryRun: DRY_RUN_MODE });
    log("Keeper single-run mode complete.");
    return;
  }

  cron.schedule("0 0 * * *", async () => {
    await runHarvest({ dryRun: DRY_RUN_MODE });
  });

  log("Ozlax keeper started on a 24h schedule.");
  await runHarvest({ dryRun: DRY_RUN_MODE });
};

main().catch((error) => {
  log(`Keeper exited with error. ${(error as Error).message}`);
  process.exit(1);
});

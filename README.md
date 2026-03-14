# Ozlax — Micro-Staking Yield Aggregator on Solana

![Solana](https://img.shields.io/badge/Solana-1.18.x-14F195?logo=solana&logoColor=white)
![Anchor](https://img.shields.io/badge/Anchor-0.29.0-9945FF)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-white)

## Overview

Ozlax is a production-minded MVP for a Solana micro-staking yield aggregator. Users deposit SOL into a single vault, the protocol tracks target allocation across Marinade and Jito, harvests yield periodically, and routes a fixed 10% fee on harvested yield to treasury. The protocol also stores the `OZX` governance mint address for future token-enabled governance flows.

This repository is built for devnet first. Switching to mainnet is mostly a config change in `Anchor.toml` and `.env`.

This is an MVP and should be audited before it holds real value.

## How It Works

Users deposit SOL into one program-owned vault PDA. The vault keeps cumulative accounting with `acc_yield_per_share`, a keeper calls `harvest_yield` with realized or simulated Marinade and Jito yield, and the program routes `fee_bps` from harvested yield to treasury before depositors claim or settle rewards through their own actions.

The contract never loops across all depositors on-chain. Reward distribution stays O(1) per user action.

## Architecture Notes

One program and one global vault PDA keep rent and deployment cost low. User accounting uses a reward-debt pattern adapted for SOL, and SOL stays in the vault PDA in this MVP so devnet flows and testing stay simple.

Keeper APY collection uses SDK-first lookups with API and static fallbacks because current SDK versions do not expose a stable cross-provider APY surface. The frontend reads state directly from Anchor accounts, supports Phantom, Solflare, Coinbase, and wallet-standard auto-detection, and uses toast notifications plus Helius-backed recent wallet activity when an API key is present. The dashboard now exposes a live network badge, copy-to-clipboard actions for operational values, confirmation modals before state-changing actions, a short changelog page, and a visible frontend version marker so operators can tell exactly what environment and build they are looking at.

## Tech Stack

- Solana 1.18.x
- Anchor 0.29.0
- Rust
- TypeScript
- Next.js 14
- Tailwind CSS
- Helius RPC
- Marinade SDK
- Jito Restaking SDK
- node-cron
- axios

## Project Structure

```text
programs/ozlax/src/lib.rs     Anchor program
programs/ozlax/Cargo.toml     Program crate manifest
tests/ozlax.ts                Anchor integration test
keeper/bot.ts                 24h harvest keeper
app/                          Next.js frontend
scripts/deploy-token.sh       OZX mint script
scripts/initialize-vault.ts   Vault initializer
```

## Getting Started (Local + Devnet)

### 1. Install prerequisites

- Rust via `rustup`
- Solana CLI `1.18.x`
- Anchor CLI `0.29.0`
- Node.js `>=20`

### 2. Install repo dependencies

```bash
npm install
```

### 3. Copy env values

```bash
cp .env.example .env
```

Set your Helius RPC, keeper keypair path, treasury wallet, program id, and OZX mint.

### 4. Build the program

```bash
anchor build
```

### 5. Validate the localnet workflow and run tests

```bash
bash scripts/test-full-workflow.sh
```

That script boots a fresh validator, funds the local wallet, builds and deploys the program, initializes the vault, verifies the live state, runs the keeper in `--once --dry-run` mode, and then executes the integration suite. The test suite now covers 19 end-to-end cases, including multi-user reward distribution, repeated harvest accumulation, full-withdraw edge cases, withdraw-all settlement behavior, and a three-user rapid deposit-harvest-claim stress cycle.

### 6. Start the frontend

```bash
npm run build:app
npm run dev --workspace @ozlax/app
```

### 7. Run the keeper

```bash
npm run keeper
```

You can also run a single keeper cycle with `npm run keeper -- --once`, or inspect the computed harvest without sending a transaction with `npm run keeper -- --once --dry-run`.

### 8. Mint the OZX token

```bash
bash scripts/deploy-token.sh
```

That script creates the 9-decimal OZX mint, mints the fixed one billion supply, and revokes mint authority once distribution is complete.

## Current Deployment Status

The localnet workflow is fully validated and the frontend is production-ready from a UX perspective, but the real devnet deployment is still blocked by faucet funding. The deploy wallet remains unfunded after repeated public-faucet and alternate-RPC attempts, so live devnet addresses have not been written into the repo yet.

## Deploy to Mainnet (One Config Change)

1. Change `cluster = "devnet"` to `cluster = "mainnet"` or `mainnet-beta` in `Anchor.toml`.
2. Point `.env` RPC values at mainnet Helius.
3. Update `PROGRAM_ID`, `NEXT_PUBLIC_PROGRAM_ID`, treasury, and OZX mint values.
4. Deploy the same code path with the mainnet section in `Anchor.toml`.

## Cost Estimate (Optimized for <3 SOL)

- Program deploy: typically the largest cost, still targeted under the 3 SOL ceiling with a single compact program.
- Vault PDA rent: one global account.
- User PDA rent: one compact account per depositor.
- OZX mint + ATA: small one-time SPL costs.
- No extra PDA fanout, no on-chain depositor loops, no oversized structs.

### Why devnet deploy still needs about 3 SOL

Solana program deploy cost is dominated by upgradeable loader rent, not normal transaction fees. The current `ozlax.so` footprint is about `447,776` bytes, so the temporary write buffer and final program storage both require a rent-exempt lamport balance before deploy can finish.

## Security Notes

- This MVP uses simulated or keeper-reported yield inputs during harvest.
- Real strategy settlement integration should verify realized vault-level yield before production use.
- Treasury and authority keys should be isolated from the frontend wallet.
- Mainnet should use separate wallets for deploy or upgrade authority and treasury custody, and the current real-SOL wallet should stay untouched until that split is ready.
- Audit the reward math, vault solvency assumptions, and keeper permissions before mainnet funds.

## Community

Discord: https://discord.gg/hZ4BE84qc3  
Twitter/X: https://x.com/OzlaxHQ  
Telegram: https://t.me/ozlaxfi

## License

MIT

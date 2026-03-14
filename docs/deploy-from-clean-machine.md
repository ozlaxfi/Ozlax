# Deploy from a clean machine

Use this flow on a clean Linux, WSL, or macOS machine if Windows local validator privileges or devnet faucet limits are blocking progress.

## 1. Install tooling

Install:

- Rust via `rustup`
- Solana CLI `1.18.x`
- Anchor CLI `0.29.0`
- Node.js `>=20`

Then install repo dependencies:

```bash
npm install
```

## 2. Fund a devnet wallet

Choose a dedicated devnet signer and fund it with at least the current deploy threshold plus a small buffer.

Check balance:

```bash
solana balance <DEPLOY_WALLET> --url devnet
```

## 3. Build and deploy

```bash
anchor build
anchor deploy --provider.cluster devnet
solana program show <PROGRAM_ID> --url devnet
```

Capture the deployed program ID.

## 4. Update env and repo config

Update only:

- `Anchor.toml`
- `app/utils/anchor.ts`
- `keeper/bot.ts`
- `scripts/initialize-vault.ts`
- `.env.example`

Set:

```bash
export PROGRAM_ID=<PROGRAM_ID>
export NEXT_PUBLIC_PROGRAM_ID=<PROGRAM_ID>
export NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
export HELIUS_RPC_URL=https://api.devnet.solana.com
export TREASURY_WALLET=<TREASURY_WALLET>
export OZX_MINT=<OZX_MINT>
```

## 5. Initialize the vault

```bash
npx tsx scripts/initialize-vault.ts
```

Capture:

- vault PDA
- initialize tx signature
- treasury used

## 6. Verify frontend and keeper readiness

```bash
npm run typecheck
npm run build
```

Confirm:

- dashboard loads with devnet config
- vault fallback disappears after initialization
- keeper has `PROGRAM_ID`, `HELIUS_RPC_URL`, `KEEPER_KEYPAIR_PATH`, and `DISCORD_WEBHOOK_URL` set before running

# Deploy from a clean machine

Use this flow on a clean Linux, WSL, or macOS machine if Windows local validator privileges or devnet faucet limits are blocking progress.

WSL or Linux bypasses the Windows `solana-test-validator` privilege error, so local validator and Anchor test flows should run normally there.

## 1. Install tooling

Run:

```bash
bash scripts/setup-dev-env.sh
npm install
```

If you are using WSL, run these commands inside the Linux distro, not from PowerShell.

## 2. Fund a devnet wallet

Choose a dedicated devnet signer and fund it with at least the current deploy threshold plus a small buffer.

Check balance:

```bash
solana balance <DEPLOY_WALLET> --url devnet
```

## 3. Run a local validator and local tests

```bash
solana-test-validator --reset
anchor test
```

This bypasses the Windows `solana-test-validator` privilege error because the validator is running under Linux instead of the host Windows process model.

## 4. Deploy to devnet

Export the env first:

```bash
export ANCHOR_WALLET=~/.config/solana/id.json
export NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
export HELIUS_RPC_URL=https://api.devnet.solana.com
export TREASURY_WALLET=<TREASURY_WALLET>
export OZX_MINT=<OZX_MINT>
```

Then run:

```bash
bash scripts/deploy-devnet.sh
```

This script will:

1. check wallet balance
2. verify RPC access
3. run `anchor deploy --provider.cluster devnet`
4. print the deployed program ID
5. run the vault initialization script
6. print the vault PDA and init transaction
7. verify the vault account exists

## 5. Update repo config if the devnet program ID changed

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

## 6. Verify frontend and keeper readiness

```bash
npm run verify:deploy
npm run typecheck
npm run build
```

Confirm:

- `npm run verify:deploy` prints the deployed program, vault PDA, treasury, fee, allocation, and frontend env alignment
- dashboard loads with devnet config
- vault fallback disappears after initialization
- keeper has `PROGRAM_ID`, `HELIUS_RPC_URL`, `KEEPER_KEYPAIR_PATH`, and `DISCORD_WEBHOOK_URL` set before running
- use `docs/pre-deploy-checklist.md` as the final go/no-go list before a real deploy

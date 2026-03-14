# Pre-deploy checklist

Use this right before a clean-machine deploy.

## Wallet separation

- Deploy or upgrade authority is a dedicated signer, not the treasury wallet.
- Treasury wallet is set explicitly in `TREASURY_WALLET`.
- No mainnet custody wallet is being reused for devnet testing by accident.

## Environment

- `ANCHOR_WALLET` points to the intended deploy signer.
- `NEXT_PUBLIC_RPC_URL` points at devnet.
- `HELIUS_RPC_URL` points at devnet.
- `TREASURY_WALLET` is set.
- `OZX_MINT` is set.

## Build

- `anchor build`
- `npm run typecheck`
- `npm run build`

## Deploy

```bash
bash scripts/deploy-devnet.sh
```

## Post-deploy capture

- Program ID
- Vault PDA
- Treasury wallet used
- Initialize transaction signature

## Post-deploy verification

- `solana program show <PROGRAM_ID> --url "$HELIUS_RPC_URL"`
- `solana account <VAULT_PDA> --url "$HELIUS_RPC_URL"`
- frontend reads the devnet program ID cleanly
- dashboard can load live vault state
- keeper env is ready with `PROGRAM_ID`, `HELIUS_RPC_URL`, `KEEPER_KEYPAIR_PATH`, and `DISCORD_WEBHOOK_URL`

# Post-deploy verification

Run this after a successful devnet deploy and vault initialization.

## 1. Inspect the deployed program

```bash
solana program show "$PROGRAM_ID" --url "$HELIUS_RPC_URL"
```

Confirm:

- the program account exists
- the program is executable
- the authority matches the intended deploy or upgrade signer

## 2. Inspect the vault and frontend alignment

```bash
tsx scripts/verify-deploy.ts
```

Confirm:

- `Program ID` matches the deployed program
- `Frontend Program ID` matches `PROGRAM_ID` if it is set in the shell
- `Vault PDA` exists and fetch succeeds
- `Treasury` matches `TREASURY_WALLET`
- `Fee bps` is `1000`
- allocation split is the expected Marinade or Jito target
- `Total deposited` and `Total yield` look sane for the current environment

## 3. Inspect the raw vault account if needed

```bash
solana account <VAULT_PDA> --url "$HELIUS_RPC_URL"
```

Use this if you want to confirm the account exists independently of the Anchor fetch.

## 4. Frontend checks

Start the frontend against devnet and confirm:

- the dashboard loads without crashing
- the dashboard no longer shows preview mode once the real program ID and vault are live
- wallet connect still works
- vault state, fee, allocation, and TVL are reading from chain

## 5. Before the first keeper run

Confirm:

- `PROGRAM_ID` points at the deployed devnet program
- `HELIUS_RPC_URL` points at the same devnet cluster
- `KEEPER_KEYPAIR_PATH` points at the authority signer
- `DISCORD_WEBHOOK_URL` is set if notifications are expected
- the vault has enough lamports to cover any simulated harvest transfer

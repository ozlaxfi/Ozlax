# Ozlax Devnet Deploy

This playbook assumes the deploy wallet is:

`8CcAdFp6n6wde4iXcUzaoUH7FVKHNXJM1zojSQHPPBRz`

And that the wallet already has at least `3.11996004 SOL` on devnet.

## 1. Verify devnet balance

```powershell
$env:PATH='C:\Users\ozlax\Ozlax\Ozlax;C:\Users\ozlax\.cargo\bin;C:\Users\ozlax\Ozlax\Ozlax\.tooling\solana-install\releases\1.18.26\solana-release\bin;' + $env:PATH
$env:HOME=$env:USERPROFILE

solana balance 8CcAdFp6n6wde4iXcUzaoUH7FVKHNXJM1zojSQHPPBRz --url devnet
```

## 2. Build and deploy the program

```powershell
anchor build
anchor deploy --provider.cluster devnet
```

Capture the deployed program ID from the deploy output.

## 3. Verify the deployed program

```powershell
solana program show <PROGRAM_ID> --url devnet
```

## 4. Update repo config with the real devnet program ID

Update only these files:

- `Anchor.toml`
- `app/utils/anchor.ts`
- `keeper/bot.ts`
- `scripts/initialize-vault.ts`
- `.env.example`

## 5. Initialize the vault

Set the env first:

```powershell
$env:PROGRAM_ID='<PROGRAM_ID>'
$env:NEXT_PUBLIC_RPC_URL='https://api.devnet.solana.com'
$env:HELIUS_RPC_URL='https://api.devnet.solana.com'
$env:TREASURY_WALLET='8CcAdFp6n6wde4iXcUzaoUH7FVKHNXJM1zojSQHPPBRz'
$env:OZX_MINT='8CcAdFp6n6wde4iXcUzaoUH7FVKHNXJM1zojSQHPPBRz'
```

Run:

```powershell
npx tsx scripts/initialize-vault.ts
```

Capture:

- program ID
- treasury wallet used
- derived vault PDA
- initialize transaction signature

## 6. Verify the vault account exists

```powershell
solana account <VAULT_PDA> --url devnet
```

## 7. Confirm frontend devnet wiring

Set the frontend env to the deployed devnet values, then verify:

```powershell
npm run typecheck
npm run build
```

The dashboard should still render even before deposits, yield, or harvest history exist.

# Manual Devnet Funding And Deploy

Fund this exact wallet on Solana devnet:

`8CcAdFp6n6wde4iXcUzaoUH7FVKHNXJM1zojSQHPPBRz`

The minimum balance required before deploy is:

`1.772116160 SOL`

Use the browser faucet path at `https://faucet.solana.com`, select devnet, and fund the wallet above until the balance is at least the threshold.

Verify the balance with:

```bash
solana balance 8CcAdFp6n6wde4iXcUzaoUH7FVKHNXJM1zojSQHPPBRz --url https://api.devnet.solana.com
```

Once funding has landed, run:

```bash
bash scripts/deploy-devnet-on-funded-wallet.sh
```

After a successful deploy, capture these exact outputs:

`program ID`  
`vault PDA`  
`treasury wallet`  
`initialize tx signature`

If the live deploy succeeds, update only these repo files with the real deployed values:

`Anchor.toml`  
`app/utils/anchor.ts`  
`keeper/bot.ts`  
`scripts/initialize-vault.ts`  
`.env.example`

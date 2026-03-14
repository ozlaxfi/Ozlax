# Windows validator issue

On this Windows machine, `solana-test-validator` fails before startup with:

```text
Os { code: 1314, kind: Uncategorized, message: "A required privilege is not held by the client." }
```

This is an operating-system privilege issue, not an Ozlax program issue.

## Impact

- `anchor build` still works
- frontend and TypeScript checks still work
- full localnet execution is blocked on this machine because the validator cannot start

## Recommended workaround

Run localnet or deploy flows from a clean Linux, WSL, or macOS machine where:

- Solana CLI `1.18.x` is installed
- Anchor CLI `0.29.0` is installed
- `solana-test-validator` starts normally

If you stay on Windows, use a shell/environment with the required validator privileges instead of changing the Ozlax program.

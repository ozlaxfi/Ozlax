#!/usr/bin/env bash
set -euo pipefail

# Switch this once for mainnet deployments.
NETWORK="${NETWORK:-devnet}"

echo "Using Solana cluster: ${NETWORK}"
solana config set --url "${NETWORK}" >/dev/null

echo "Creating OZX mint..."
MINT_ADDRESS="$(spl-token create-token --decimals 9 | awk '/Creating token/ {print $3}')"

echo "Creating authority ATA..."
TOKEN_ACCOUNT="$(spl-token create-account "${MINT_ADDRESS}" | awk '/Creating account/ {print $3}')"

echo "Minting 1,000,000,000 OZX..."
spl-token mint "${MINT_ADDRESS}" 1000000000 "${TOKEN_ACCOUNT}"

echo "Revoking mint authority..."
spl-token authorize "${MINT_ADDRESS}" mint --disable

echo "OZX mint: ${MINT_ADDRESS}"

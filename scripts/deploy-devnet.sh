#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

require_env() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "${value// }" ]]; then
    echo "$name must be set before running deploy-devnet.sh" >&2
    exit 1
  fi
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 is required before running deploy-devnet.sh" >&2
    exit 1
  fi
}

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "Required file not found: $1" >&2
    exit 1
  fi
}

require_env ANCHOR_WALLET
require_env NEXT_PUBLIC_RPC_URL
require_env HELIUS_RPC_URL
require_env TREASURY_WALLET

require_command solana
require_command solana-keygen
require_command anchor
require_command node
require_command npm
require_command npx

require_file "$ANCHOR_WALLET"

wallet_pubkey="$(solana-keygen pubkey "$ANCHOR_WALLET")"

echo "Verifying RPC access..."
solana cluster-version --url "$HELIUS_RPC_URL" >/dev/null
solana cluster-version --url "$NEXT_PUBLIC_RPC_URL" >/dev/null

export ANCHOR_PROVIDER_URL="$HELIUS_RPC_URL"
echo "Building program..."
anchor build

require_file "target/deploy/ozlax.so"
require_file "target/deploy/ozlax-keypair.json"

program_id="$(solana-keygen pubkey target/deploy/ozlax-keypair.json)"
artifact_size="$(stat -c%s target/deploy/ozlax.so 2>/dev/null || stat -f%z target/deploy/ozlax.so)"
loader_size=$((artifact_size + 48))
rent_lamports="$(solana rent "$loader_size" --lamports --url "$HELIUS_RPC_URL" | awk '{print $4}')"
fee_buffer_lamports=5000000
required_lamports=$((rent_lamports + fee_buffer_lamports))
balance_lamports="$(solana balance "$wallet_pubkey" --lamports --url "$HELIUS_RPC_URL" | awk '{print $1}')"

echo "Deploy wallet: $wallet_pubkey"
echo "Frontend RPC: $NEXT_PUBLIC_RPC_URL"
echo "Deploy RPC:   $HELIUS_RPC_URL"
echo "Treasury:     $TREASURY_WALLET"
echo "Program ID:   $program_id"
echo "Artifact:     ${artifact_size} bytes"
echo "Rent floor:   ${rent_lamports} lamports"
echo "Balance:      ${balance_lamports} lamports"

if (( balance_lamports < required_lamports )); then
  echo "Wallet balance is below the current deploy threshold. Need at least ${required_lamports} lamports." >&2
  exit 1
fi

echo "Deploying to devnet..."
anchor deploy --provider.cluster devnet

echo "Verifying deployed program..."
solana program show "$program_id" --url "$HELIUS_RPC_URL"

export PROGRAM_ID="$program_id"
export NEXT_PUBLIC_PROGRAM_ID="$program_id"

echo "Initializing vault..."
init_output="$(npx tsx scripts/initialize-vault.ts)"
printf '%s\n' "$init_output"

vault_pda="$(printf '%s\n' "$init_output" | awk -F': ' '/Derived vault PDA/ {print $2}' | tail -n 1)"
init_tx="$(printf '%s\n' "$init_output" | awk -F': ' '/Initialize tx/ {print $2}' | tail -n 1)"

if [[ -z "${PROGRAM_ID// }" ]]; then
  echo "PROGRAM_ID is empty after deploy." >&2
  exit 1
fi

if [[ -z "${vault_pda// }" ]]; then
  echo "Failed to capture vault PDA from initialization output." >&2
  exit 1
fi

if [[ -z "${init_tx// }" ]]; then
  echo "Failed to capture initialize transaction signature." >&2
  exit 1
fi

echo "Verifying vault account..."
solana account "$vault_pda" --url "$HELIUS_RPC_URL" >/dev/null

echo "Deploy complete:"
echo "  Program ID: $PROGRAM_ID"
echo "  Vault PDA:  $vault_pda"
echo "  Init tx:    $init_tx"

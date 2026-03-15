#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_WALLET_PATH="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"
DEPLOY_RPC="https://api.devnet.solana.com"
TREASURY_WALLET="8CcAdFp6n6wde4iXcUzaoUH7FVKHNXJM1zojSQHPPBRz"
MIN_REQUIRED_LAMPORTS=1772116160

section() {
  echo
  echo "== $1 =="
}

fail() {
  echo "Error: $1" >&2
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "$1 is required before running deploy-devnet-on-funded-wallet.sh"
  fi
}

require_file() {
  if [[ ! -f "$1" ]]; then
    fail "Required file not found: $1"
  fi
}

require_command solana
require_command solana-keygen
require_command anchor
require_command npm
require_command tsx
require_file "$DEPLOY_WALLET_PATH"

wallet_pubkey="$(solana-keygen pubkey "$DEPLOY_WALLET_PATH")"
balance_lamports="$(solana balance "$wallet_pubkey" --lamports --url "$DEPLOY_RPC" | awk '{print $1}')"

section "Preflight"
echo "Deploy wallet: $wallet_pubkey"
echo "Balance:       $balance_lamports lamports"
echo "Threshold:     $MIN_REQUIRED_LAMPORTS lamports"

if (( balance_lamports < MIN_REQUIRED_LAMPORTS )); then
  fail "Wallet balance is below the devnet deploy threshold. Fund the wallet to at least ${MIN_REQUIRED_LAMPORTS} lamports first."
fi

export ANCHOR_WALLET="$DEPLOY_WALLET_PATH"
export NEXT_PUBLIC_RPC_URL="$DEPLOY_RPC"
export HELIUS_RPC_URL="$DEPLOY_RPC"
export TREASURY_WALLET="$TREASURY_WALLET"
export OZX_MINT="$TREASURY_WALLET"

section "Build"
anchor build

section "Deploy"
deploy_output="$(bash scripts/deploy-devnet.sh)"
printf '%s\n' "$deploy_output"

program_id="$(printf '%s\n' "$deploy_output" | awk -F': ' '/Program ID/ {print $2}' | tail -n 1)"
vault_pda="$(printf '%s\n' "$deploy_output" | awk -F': ' '/Vault PDA/ {print $2}' | tail -n 1)"
init_tx="$(printf '%s\n' "$deploy_output" | awk -F': ' '/Init tx/ {print $2}' | tail -n 1)"

if [[ -z "${program_id// }" || -z "${vault_pda// }" || -z "${init_tx// }" ]]; then
  fail "Failed to capture deploy summary from deploy-devnet.sh output."
fi

section "Post-deploy verification"
verify_output="$(npm run verify:deploy)"
printf '%s\n' "$verify_output"

section "Deploy summary"
echo "  Deploy wallet: $wallet_pubkey"
echo "  Balance before deploy: $balance_lamports lamports"
echo "  Program ID:   $program_id"
echo "  Vault PDA:    $vault_pda"
echo "  Treasury:     $TREASURY_WALLET"
echo "  Init tx:      $init_tx"

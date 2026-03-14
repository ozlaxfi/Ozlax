#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PROGRAM_ID="BSaLVpWMCC6sjuyy4D1r8UHFQ2xc9LXNSeHBZqbjguyx"
LOCAL_RPC="http://localhost:8899"
ANCHOR_WALLET_PATH="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"
LEDGER_DIR="$(mktemp -d /tmp/ozlax-validator-XXXXXX)"
VALIDATOR_PID=""
CURRENT_PHASE="boot"
PASSED_PHASES=()

cleanup() {
  local exit_code=$?

  if [[ -n "$VALIDATOR_PID" ]] && kill -0 "$VALIDATOR_PID" 2>/dev/null; then
    kill "$VALIDATOR_PID" 2>/dev/null || true
    wait "$VALIDATOR_PID" 2>/dev/null || true
  fi

  rm -rf "$LEDGER_DIR"

  if [[ $exit_code -ne 0 ]]; then
    echo
    echo "Workflow failed during: ${CURRENT_PHASE}"
    if [[ ${#PASSED_PHASES[@]} -gt 0 ]]; then
      echo "Completed phases:"
      printf '  - %s\n' "${PASSED_PHASES[@]}"
    fi
  fi

  exit "$exit_code"
}

trap cleanup EXIT

phase() {
  CURRENT_PHASE="$1"
  echo
  echo "==> $CURRENT_PHASE"
}

mark_pass() {
  PASSED_PHASES+=("$CURRENT_PHASE")
  echo "PASS: $CURRENT_PHASE"
}

wait_for_validator() {
  local ready=0
  for _ in {1..30}; do
    if solana slot --url "$LOCAL_RPC" >/dev/null 2>&1; then
      ready=1
      break
    fi
    sleep 1
  done

  if [[ $ready -ne 1 ]]; then
    echo "Validator did not become ready at $LOCAL_RPC" >&2
    return 1
  fi
}

TREASURY_WALLET="$(solana-keygen pubkey "$ANCHOR_WALLET_PATH")"

phase "Start local validator"
solana-test-validator --reset --ledger "$LEDGER_DIR" >/tmp/ozlax-test-full-workflow-validator.log 2>&1 &
VALIDATOR_PID=$!
wait_for_validator
mark_pass

phase "Fund local wallet"
solana airdrop 100 --url "$LOCAL_RPC" >/tmp/ozlax-test-full-workflow-airdrop.log
mark_pass

phase "Build program"
anchor build
mark_pass

phase "Deploy program to localnet"
anchor deploy --provider.cluster localnet
mark_pass

phase "Initialize vault"
env \
  PROGRAM_ID="$PROGRAM_ID" \
  NEXT_PUBLIC_RPC_URL="$LOCAL_RPC" \
  HELIUS_RPC_URL="$LOCAL_RPC" \
  TREASURY_WALLET="$TREASURY_WALLET" \
  OZX_MINT="$TREASURY_WALLET" \
  ANCHOR_WALLET="$ANCHOR_WALLET_PATH" \
  npx tsx scripts/initialize-vault.ts
mark_pass

phase "Verify deploy state"
env \
  PROGRAM_ID="$PROGRAM_ID" \
  HELIUS_RPC_URL="$LOCAL_RPC" \
  ANCHOR_WALLET="$ANCHOR_WALLET_PATH" \
  npx tsx scripts/verify-deploy.ts
mark_pass

phase "Run keeper dry-run"
env \
  PROGRAM_ID="$PROGRAM_ID" \
  NEXT_PUBLIC_RPC_URL="$LOCAL_RPC" \
  HELIUS_RPC_URL="$LOCAL_RPC" \
  TREASURY_WALLET="$TREASURY_WALLET" \
  OZX_MINT="$TREASURY_WALLET" \
  ANCHOR_WALLET="$ANCHOR_WALLET_PATH" \
  npx ts-node keeper/bot.ts --once --dry-run
mark_pass

phase "Run Anchor integration suite"
anchor test --provider.cluster localnet --skip-local-validator
mark_pass

echo
echo "Full localnet workflow passed."
printf '  - %s\n' "${PASSED_PHASES[@]}"

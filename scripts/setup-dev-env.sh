#!/usr/bin/env bash
set -euo pipefail

SOLANA_VERSION="1.18.26"
ANCHOR_VERSION="0.29.0"
NODE_MAJOR="20"

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

run_as_root() {
  if command_exists sudo; then
    sudo "$@"
  else
    "$@"
  fi
}

ensure_path_exports() {
  export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"
}

install_rust() {
  if command_exists rustup; then
    echo "Rust already installed: $(rustup --version)"
    return
  fi

  echo "Installing Rust toolchain..."
  curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal
}

install_node() {
  if command_exists node && command_exists npm; then
    echo "Node already installed: $(node --version)"
    echo "npm already installed: $(npm --version)"
    return
  fi

  if command_exists apt-get; then
    echo "Installing Node.js ${NODE_MAJOR}.x..."
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | run_as_root bash -
    run_as_root apt-get install -y nodejs
    return
  fi

  echo "Node.js ${NODE_MAJOR}.x is required. Install it manually on this machine and rerun the script." >&2
  exit 1
}

install_solana() {
  local current_version=""
  if command_exists solana; then
    current_version="$(solana --version | awk '{print $2}')"
  fi

  if [[ "$current_version" == "$SOLANA_VERSION" ]]; then
    echo "Solana CLI already installed: $current_version"
    return
  fi

  echo "Installing Solana CLI ${SOLANA_VERSION}..."
  sh -c "$(curl -sSfL https://release.solana.com/v${SOLANA_VERSION}/install)"
}

install_anchor() {
  local current_version=""
  if command_exists anchor; then
    current_version="$(anchor --version | awk '{print $2}')"
  fi

  if [[ "$current_version" == "$ANCHOR_VERSION" ]]; then
    echo "Anchor CLI already installed: $current_version"
    return
  fi

  echo "Installing Anchor CLI ${ANCHOR_VERSION}..."
  cargo install --locked --force anchor-cli --version "$ANCHOR_VERSION"
}

install_tsx() {
  if command_exists tsx; then
    echo "tsx already installed: $(tsx --version | head -n 1)"
    return
  fi

  echo "Installing tsx globally..."
  npm install -g tsx
}

main() {
  if ! command_exists curl; then
    echo "curl is required before running this script." >&2
    exit 1
  fi

  install_rust
  ensure_path_exports

  rustup default stable >/dev/null
  rustup component add rustfmt clippy >/dev/null
  rustup target add x86_64-unknown-linux-gnu >/dev/null || true

  install_node
  install_solana
  ensure_path_exports

  if ! command_exists cargo-build-sbf; then
    echo "Solana SBF tooling is not available after Solana install." >&2
    exit 1
  fi

  install_anchor
  install_tsx

  echo "Toolchain ready:"
  echo "  Rust:    $(rustc --version)"
  echo "  Cargo:   $(cargo --version)"
  echo "  Solana:  $(solana --version)"
  echo "  Anchor:  $(anchor --version)"
  echo "  Node:    $(node --version)"
  echo "  npm:     $(npm --version)"
  echo "  tsx:     $(tsx --version | head -n 1)"
}

main "$@"

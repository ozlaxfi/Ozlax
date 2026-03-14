#!/usr/bin/env bash
set -euo pipefail

SOLANA_VERSION="1.18.26"
ANCHOR_VERSION="0.29.0"
NODE_MAJOR="20"
APT_PREREQS=(curl git build-essential pkg-config libssl-dev libudev-dev clang cmake)

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

section() {
  echo
  echo "== $1 =="
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

install_system_prereqs() {
  if ! command_exists apt-get; then
    for tool in curl git; do
      if ! command_exists "$tool"; then
        echo "$tool is required before running this script on non-apt systems." >&2
        exit 1
      fi
    done
    return
  fi

  local missing=()
  for pkg in "${APT_PREREQS[@]}"; do
    if ! dpkg -s "$pkg" >/dev/null 2>&1; then
      missing+=("$pkg")
    fi
  done

  if (( ${#missing[@]} == 0 )); then
    echo "System prerequisites already installed."
    return
  fi

  echo "Installing system prerequisites: ${missing[*]}"
  run_as_root apt-get update
  run_as_root apt-get install -y "${missing[@]}"
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
  section "System prerequisites"
  install_system_prereqs

  section "Rust"
  install_rust
  ensure_path_exports

  rustup default stable >/dev/null
  rustup component add rustfmt clippy >/dev/null
  rustup target add x86_64-unknown-linux-gnu >/dev/null || true

  section "Node"
  install_node

  section "Solana"
  install_solana
  ensure_path_exports

  if ! command_exists cargo-build-sbf; then
    echo "Solana SBF tooling is not available after Solana install." >&2
    exit 1
  fi

  section "Anchor"
  install_anchor

  section "tsx"
  install_tsx

  section "Installed versions"
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

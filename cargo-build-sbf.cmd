@echo off
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "MANIFEST_PATH="
set "OUT_DIR="
set "CARGO_FLAGS="

if /I "%~1"=="build-bpf" shift
if /I "%~1"=="build-sbf" shift

:parse
if "%~1"=="" goto run
if "%~1"=="--manifest-path" (
  set "MANIFEST_PATH=%~2"
  shift
  shift
  goto parse
)
if "%~1"=="--sbf-out-dir" (
  set "OUT_DIR=%~2"
  shift
  shift
  goto parse
)
if "%~1"=="--bpf-out-dir" (
  set "OUT_DIR=%~2"
  shift
  shift
  goto parse
)
if "%~1"=="--arch" (
  shift
  shift
  goto parse
)
if "%~1"=="--dump" (
  shift
  goto parse
)
if "%~1"=="--generate-child-script-on-failure" (
  shift
  goto parse
)
set "CARGO_FLAGS=!CARGO_FLAGS! %~1"
shift
goto parse

:run
cd /d "%ROOT%"
if not defined MANIFEST_PATH set "MANIFEST_PATH=programs\ozlax\Cargo.toml"
if not defined OUT_DIR set "OUT_DIR=target\deploy"

set "BASH_EXE=C:\Progra~1\Git\bin\bash.exe"
set "SBF_BIN=/c/Users/ozlax/Ozlax/Ozlax/.tooling/solana-install/releases/1.18.26/solana-release/bin"
set "SBF_SDK=/c/Users/ozlax/Ozlax/Ozlax/.tooling/solana-install/releases/1.18.26/solana-release/bin/sdk/sbf"
set "TARGET_SO=%ROOT%\target\sbf-solana-solana\release\ozlax.so"

"%BASH_EXE%" -lc "set -euo pipefail; export HOME=/c/Users/ozlax; export PATH=\"$HOME/.cargo/bin:%SBF_BIN%:$PATH\"; rustup toolchain link solana /c/Users/ozlax/Ozlax/Ozlax/.tooling/solana-install/releases/1.18.26/solana-release/bin/sdk/sbf/dependencies/platform-tools/rust >/dev/null 2>&1 || true; export sbf_sdk=%SBF_SDK%; source \"$sbf_sdk/env.sh\"; cargo +solana build --release --target sbf-solana-solana --manifest-path \"%MANIFEST_PATH:/=\%\"%CARGO_FLAGS%"
if errorlevel 1 exit /b %errorlevel%

if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"
copy /Y "%TARGET_SO%" "%OUT_DIR%\ozlax.so" >nul

exit /b 0

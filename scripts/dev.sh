#!/usr/bin/env bash
# Glyph dev workflow — one-command pull/build/regenerate/run.
#
# Usage:  ./scripts/dev.sh [example]
#   example defaults to "landing". Must be a directory under examples/.
#
# What it does:
#   1. git pull on the current branch
#   2. pnpm install + pnpm -r build (rebuilds the compiler + adapters)
#   3. rm -rf examples/<example>/out
#   4. glyph build into out/
#   5. npm install inside out/
#   6. npm run dev (foreground; Ctrl-C to stop)

set -euo pipefail

EXAMPLE="${1:-landing}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -d "examples/$EXAMPLE" ]]; then
  echo "✗ Unknown example: $EXAMPLE"
  echo "  Available: $(ls examples/)"
  exit 1
fi

echo "▸ Pulling latest on $(git rev-parse --abbrev-ref HEAD)..."
git pull --rebase --autostash

echo "▸ Installing workspace deps..."
pnpm install --prefer-offline

echo "▸ Building compiler..."
pnpm -r build

echo "▸ Regenerating examples/$EXAMPLE/out..."
cd "examples/$EXAMPLE"
rm -rf out
node ../../packages/cli/dist/index.js doctor
node ../../packages/cli/dist/index.js build --out ./out

echo "▸ Installing generated project deps (one-time per dep change)..."
cd out
npm install --silent

echo "▸ Starting dev server. Open http://localhost:3000"
echo "  Ctrl-C to stop."
npm run dev

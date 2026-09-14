#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "=== Update repository ==="
git pull --ff-only

echo
echo "=== Start img-prompt-gen ==="
exec python3 -m http.server 8080 --bind 0.0.0.0

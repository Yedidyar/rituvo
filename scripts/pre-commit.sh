#!/usr/bin/env sh
set -e

# Format and lint only projects affected by uncommitted (staged + unstaged) changes.
pnpm exec nx affected -t format --uncommitted --outputStyle=static

STAGED_FILES=$(git diff --name-only --cached)
if [ -n "$STAGED_FILES" ]; then
  echo "$STAGED_FILES" | xargs git add
fi

pnpm exec nx affected -t lint format:check --uncommitted --outputStyle=static --nxBail

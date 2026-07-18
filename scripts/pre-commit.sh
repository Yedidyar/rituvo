#!/usr/bin/env sh
set -e

# Format and lint only projects affected by uncommitted (staged + unstaged) changes.
pnpm exec nx affected -t format --uncommitted --outputStyle=static

# Re-stage formatted files, but skip deletions (git add fails on paths that no longer exist).
STAGED_FILES=$(git diff --name-only --cached --diff-filter=d)
if [ -n "$STAGED_FILES" ]; then
  echo "$STAGED_FILES" | xargs git add
fi

pnpm exec nx affected -t lint format:check --uncommitted --outputStyle=static --nxBail

#!/bin/bash
# Script to create PR for DB alignment and RLS tightening
# Creates branch chore/db-align-rls, commits files, pushes, and prints gh pr create command

set -e

BRANCH_NAME="chore/db-align-rls"
COMMIT_MSG="fix(db+app): migrate internal_notes -> jsonb, add idempotent RLS policies; normalize chat/messages and edge fn safety"

echo "Creating branch: $BRANCH_NAME"

# Create branch from master if not already on it
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
  git checkout -b "$BRANCH_NAME" master 2>/dev/null || git checkout "$BRANCH_NAME"
fi

echo "Adding files to commit..."

# Add new migration SQL
git add supabase/migrations/2026-01-03-rls-and-internal-notes.sql

# Add app helpers
git add src/app-fixes/chat-and-notes.ts

# Add edge function patches
git add supabase/functions/_patches/auth-signup-consumeActivationCode.ts
git add supabase/functions/_patches/nexus-ai-limits.ts

# Add automation script itself
git add scripts/create-pr.sh

# Add existing prepared files if present
git add api/edge-proxy/\[fn\].ts 2>/dev/null || true
git add api/gemini.ts 2>/dev/null || true
git add .eslintrc.cjs 2>/dev/null || true
git add .prettierrc 2>/dev/null || true
git add .github/workflows/ci.yml 2>/dev/null || true
git add content/blogPosts.ts 2>/dev/null || true
git add .gitignore 2>/dev/null || true
git add package.json 2>/dev/null || true

echo "Committing changes..."
git commit -m "$COMMIT_MSG"

echo "Pushing branch to origin..."
git push -u origin "$BRANCH_NAME"

echo ""
echo "Branch pushed successfully!"
echo ""
echo "To create the PR, run:"
echo ""
echo "gh pr create --base master --head $BRANCH_NAME --title \"fix(db): migrate internal_notes -> jsonb & tighten RLS; normalize chat/messages and edge function safety\" --body \"
- Adds a safe, non-destructive migration file to migrate \\\`tickets.internal_notes\\\` into structured JSON arrays and idempotent RLS policy creation. The user executed the migration on staging and will run the final ALTER TABLE DROP/RENAME after the code is deployed.
- Adds app helpers to normalize usage of \\\`chat_messages.message_text\\\` and to parse \\\`internal_notes\\\` robustly.
- Adds safer Edge Function snippets for atomic activation code consumption and Gemini history limiting + key check.
- Adds automation script to create the PR branch.

**Notes for reviewers:**
- Run the migration on staging and validate \\\`internal_notes_json\\\` content before performing final \\\`ALTER TABLE\\\` DROP/RENAME.
- Deploy edge functions and application code to staging first. After successful validation, perform final column swap (DROP/RENAME) in staging and then in production.
\""

echo ""
echo "Script complete!"

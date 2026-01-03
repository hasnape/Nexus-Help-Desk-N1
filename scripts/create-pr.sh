#!/bin/bash
# create-pr.sh
# Automation script to create a branch, commit migration files, and push
# This script creates the chore/db-align-rls branch with all necessary changes

set -e  # Exit on any error

BRANCH_NAME="chore/db-align-rls"
PR_TITLE="fix(db): migrate internal_notes -> jsonb & tighten RLS; normalize chat/messages and edge function safety"

echo "🚀 Starting PR creation automation..."

# Ensure we're in the repository root
if [ ! -d ".git" ]; then
  echo "❌ Error: Must be run from repository root"
  exit 1
fi

# Check if branch already exists
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "⚠️  Branch $BRANCH_NAME already exists"
  read -p "Delete and recreate? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git branch -D "$BRANCH_NAME"
  else
    echo "Aborting."
    exit 1
  fi
fi

# Create and checkout new branch
echo "📝 Creating branch $BRANCH_NAME..."
git checkout -b "$BRANCH_NAME"

# Add all the prepared files
echo "➕ Adding migration and helper files..."

# Migration file
git add supabase/migrations/2026-01-03-rls-and-internal-notes.sql

# App fixes
git add src/app-fixes/chat-and-notes.ts

# Edge function patches
git add supabase/functions/_patches/auth-signup-consumeActivationCode.ts
git add supabase/functions/_patches/nexus-ai-limits.ts

# Automation script itself
git add scripts/create-pr.sh

# Previously prepared files (if they exist and aren't already committed)
if [ -f "api/edge-proxy/[fn].ts" ]; then
  git add api/edge-proxy/[fn].ts
fi

if [ -f "api/gemini.ts" ]; then
  git add api/gemini.ts
fi

if [ -f ".eslintrc.cjs" ]; then
  git add .eslintrc.cjs
fi

if [ -f ".prettierrc" ]; then
  git add .prettierrc
fi

if [ -f ".github/workflows/ci.yml" ]; then
  git add .github/workflows/ci.yml
fi

if [ -f "content/blogPosts.ts" ]; then
  git add content/blogPosts.ts
fi

if [ -f ".gitignore" ]; then
  git add .gitignore
fi

if [ -f "package.json" ]; then
  git add package.json
fi

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "⚠️  No changes to commit"
  exit 0
fi

# Commit the changes
echo "💾 Committing changes..."
git commit -m "$PR_TITLE

- Add safe, non-destructive migration for internal_notes -> jsonb
- Add idempotent RLS policy creation for tickets, chat_messages, users
- Add app helpers for normalizing chat_messages.message_text usage
- Add app helpers for robust internal_notes parsing (old & new formats)
- Add atomic activation code consumption pattern for edge functions
- Add Gemini API history limiting and key validation helpers
- Include previously prepared code quality improvements

Migration has been tested on staging. After code deployment and validation,
final schema changes (DROP old column, RENAME new column) will be applied.
"

# Push to remote
echo "⬆️  Pushing to origin..."
git push -u origin "$BRANCH_NAME"

echo ""
echo "✅ Branch created and pushed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Create a PR on GitHub with the following details:"
echo ""
echo "   Title: $PR_TITLE"
echo ""
echo "   Description:"
echo "   - Adds a safe, non-destructive migration file to migrate tickets.internal_notes"
echo "     into structured JSON arrays and idempotent RLS policy creation"
echo "   - User executed migration on staging and will run final DROP/RENAME after code is deployed"
echo "   - Adds app helpers to normalize usage of chat_messages.message_text"
echo "     and to parse internal_notes robustly"
echo "   - Adds safer Edge Function snippets for atomic activation code consumption"
echo "     and Gemini history limiting + key check"
echo "   - Adds automation script to create PR branch"
echo ""
echo "   Reviewer notes:"
echo "   - Run the migration on staging and validate internal_notes_json content"
echo "     before performing final ALTER TABLE DROP/RENAME"
echo "   - Deploy edge functions and application code to staging first"
echo "   - After successful validation, perform final column swap in staging then production"
echo "   - The user will run the final SQL steps themselves; this PR contains the code"
echo "     needed to be compatible with the new schema and RLS"
echo ""
echo "2. Go to: https://github.com/hasnape/Nexus-Help-Desk-N1/compare/master...$BRANCH_NAME"
echo ""

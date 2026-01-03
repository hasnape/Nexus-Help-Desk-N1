#!/bin/bash
#
# Script to create a PR for database alignment and RLS improvements
# Usage: ./scripts/create-pr.sh
#

set -e

BRANCH_NAME="chore/db-align-rls"
PR_TITLE="fix(db): migrate internal_notes -> jsonb & tighten RLS; normalize chat/messages and edge function safety"
PR_BODY="## Database Migration and RLS Improvements

This PR adds non-destructive database migration and application code changes to support the new internal_notes schema and comprehensive RLS policies.

### Changes

#### Migration (supabase/migrations/2026-01-03-rls-and-internal-notes.sql)
- ✅ Creates \`internal_notes_json\` column (jsonb) without dropping the old \`internal_notes\` text column
- ✅ Migrates existing text \`internal_notes\` to JSON arrays (idempotent - only migrates if target column is empty)
  - Attempts to parse existing text as JSON
  - Wraps non-JSON text as single-note objects with timestamp and author
- ✅ Adds idempotent RLS policies for:
  - \`tickets\` table (company-scoped, manager-only delete)
  - \`chat_messages\` table (via ticket company association)
  - \`internal_notes\` table if it exists (via ticket company association)
  - \`appointment_details\` table (via ticket company association)
  - \`company_knowledge\` table (company-scoped, manager-only write)
  - \`companies\` table (users can only see their company)
  - \`users\` table (company-scoped visibility, self-update, manager admin)
  - \`workstations\` table if it exists (company-scoped, manager-only write)
- ✅ Helper functions: \`auth_user_company_id()\` and \`auth_user_is_manager()\`

#### Application Code (src/app-fixes/chat-and-notes.ts)
- ✅ \`mapTicketMessageRowToChatMessage()\` - Normalizes database rows to ChatMessage objects
  - Handles both legacy \`message\` field and new \`message_text\` field
- ✅ \`persistTicketMessages()\` - Saves chat messages using \`message_text\` column
- ✅ \`parseInternalNotes()\` - Parses internal_notes from any format to JSON array
- ✅ \`getTicketInternalNotes()\` - Gets notes, preferring \`internal_notes_json\` if available
- ✅ \`reviveTicketDates()\` - Normalizes date fields from tickets
- ✅ Helper functions for adding notes, serializing, and batch processing

#### Edge Function Patches

**supabase/functions/_patches/auth-signup-consumeActivationCode.ts**
- ✅ \`consumeActivationCode()\` - Atomic activation code consumption
  - Single UPDATE with WHERE conditions to prevent race conditions
  - Validates code existence, consumption status, and expiration in one query
- ✅ \`validateActivationCode()\` - Non-destructive code validation
- ✅ \`createActivationCode()\` - Helper for admin functions

**supabase/functions/_patches/nexus-ai-limits.ts**
- ✅ \`limitChatHistory()\` - Limits chat history to MAX_HISTORY messages
- ✅ \`smartLimitChatHistory()\` - Intelligent truncation keeping recent + sampled older messages
- ✅ \`validateGeminiApiKey()\` - Validates GEMINI_API_KEY environment variable
- ✅ \`estimateTokenCount()\` - Rough token estimation for chat history
- ✅ \`limitChatHistoryByTokens()\` - Limits history to stay within token budget
- ✅ \`validateNexusAiEnv()\` - Complete environment validation

### Migration Status

✅ **Staging**: Migration SQL executed successfully (per user report)
⏸️ **Pending**: Final column rename/drop (will be done after code deployment and testing)

### Deployment Plan

1. ✅ Merge this PR
2. 🔄 Deploy application code to staging
3. 🔄 Deploy edge functions to staging
4. 🔄 Run final SQL on staging:
   \`\`\`sql
   ALTER TABLE public.tickets DROP COLUMN internal_notes;
   ALTER TABLE public.tickets RENAME COLUMN internal_notes_json TO internal_notes;
   \`\`\`
5. 🔄 Test thoroughly in staging
6. 🔄 Repeat steps 2-5 for production

### Testing Checklist

- [ ] Tickets with existing internal_notes migrate correctly
- [ ] New tickets can be created with internal_notes as JSON
- [ ] Chat messages use \`message_text\` field correctly
- [ ] RLS policies restrict access to same-company data only
- [ ] Managers can perform admin operations, agents cannot
- [ ] Edge functions validate environment properly
- [ ] Activation codes are consumed atomically

### Notes

- Migration is **non-destructive** and **idempotent**
- RLS policies use \`auth.uid() -> users.auth_uid -> users.company_id\` mapping
- Application code handles both old and new column names during transition
- Helper functions added to \`src/app-fixes/\` for use throughout the app
- Edge function patches in \`supabase/functions/_patches/\` provide reusable utilities

### Security Improvements

- ✅ Row-level security on all major tables
- ✅ Company data isolation enforced at database level
- ✅ Atomic activation code consumption prevents race conditions
- ✅ Chat history limiting prevents token overflow/DoS
- ✅ Environment validation prevents misconfiguration

---

**Breaking Changes**: None during transition. The final column rename/drop will be coordinated after thorough testing.

**References**: Database schema alignment, RLS policy implementation, chat/notes normalization
"

echo "================================================"
echo "Creating PR for Database Alignment & RLS"
echo "================================================"
echo ""
echo "Branch: $BRANCH_NAME"
echo "Title: $PR_TITLE"
echo ""

# Check if we're on the right branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
  echo "⚠️  Not on branch $BRANCH_NAME (currently on $CURRENT_BRANCH)"
  echo "Please run: git checkout -b $BRANCH_NAME"
  exit 1
fi

# Stage all changes
echo "📦 Staging changes..."
git add .

# Show what will be committed
echo ""
echo "📋 Files to commit:"
git diff --cached --name-status
echo ""

# Commit
echo "💾 Creating commit..."
git commit -m "$PR_TITLE

- Add SQL migration for internal_notes -> jsonb with RLS policies
- Add chat/notes helper functions
- Add edge function safety patches
- Non-destructive migration, final rename pending testing
"

# Push
echo "🚀 Pushing to origin..."
git push -u origin "$BRANCH_NAME"

echo ""
echo "✅ Changes pushed to $BRANCH_NAME"
echo ""
echo "📝 Next step: Create PR manually or use GitHub CLI:"
echo ""
echo "gh pr create --title \"$PR_TITLE\" \\"
echo "  --body \"$PR_BODY\" \\"
echo "  --base master"
echo ""
echo "================================================"

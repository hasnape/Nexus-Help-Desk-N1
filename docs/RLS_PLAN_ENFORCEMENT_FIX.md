# RLS Recursion and Plan Enforcement Fix

## Problem Summary

This fix addresses critical issues causing 500 errors and user onboarding failures:

1. **RLS Recursion Error**: Previous RLS policies on `public.users` performed `SELECT ... FROM users` inside the policies themselves, causing infinite recursion loops when PostgreSQL tried to evaluate row-level security.

2. **Strict Plan Enforcement Blocking User Creation**: The `enforce_agent_cap()` trigger function raised a hard exception when a company had no plan configured, blocking user profile creation/repair during onboarding. Error: `ERROR: P0001: Plan non configuré pour la company 11111111-1111-1111-1111-111111111111`.

3. **Missing Error Handling**: The `/api/edge-proxy/nexus-ai` endpoint lacked timeout handling, rate limit detection, and proper error mapping.

## Solution Overview

### 1. SECURITY DEFINER Helper Functions (No RLS Recursion)

Created three helper functions that bypass RLS using `SECURITY DEFINER`:

- **`current_company_id()`**: Returns the company_id for the authenticated user
- **`is_company_manager_for(uuid)`**: Checks if user is a manager for a specific company
- **`is_company_manager()`**: Checks if user is a manager for any company

These functions bypass RLS when querying the `users` table, preventing recursion in policies.

### 2. Safe RLS Policies on `public.users`

Replaced unsafe policies with safe ones that use **only** the helper functions (no direct SELECT from users inside policies):

- **`auth_user_read_policy`** (SELECT): Users can read their own row and other users in their company
- **`auth_user_insert_policy`** (INSERT): Users can only insert their own auth_uid
- **`auth_user_update_policy`** (UPDATE): Users can update their own row; managers can update users in their company
- **`auth_user_delete_policy`** (DELETE): Only managers can delete users in their company

### 3. `company_plans` Table with Default Plan Support

Created a new table to store per-company plan configurations:

```sql
CREATE TABLE public.company_plans (
  company_id uuid PRIMARY KEY,
  plan_name text NOT NULL DEFAULT 'free',
  max_tickets_per_day integer DEFAULT 50,
  max_ai_calls_per_day integer DEFAULT 100,
  max_agents integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 4. Softened `enforce_agent_cap()` Trigger (SECURITY DEFINER)

Rewrote the trigger function with the following improvements:

- **SECURITY DEFINER**: Bypasses RLS when checking plans/users
- **Skip enforcement for `users` table**: Allows profile repair/creation during onboarding
- **Auto-create default plan**: If no plan exists, automatically inserts a 'free' plan with reasonable defaults (ON CONFLICT DO NOTHING)
- **Soft enforcement**: Logs NOTICE instead of raising EXCEPTION, preventing user creation from being blocked
- **Commented strict mode**: Includes commented RAISE EXCEPTION code for organizations that require strict enforcement

### 5. Enhanced Edge Proxy Error Handling

Added robust error handling to `/api/edge-proxy/[fn].ts`:

- **30-second timeout** with AbortController
- **Specific error messages** for timeouts (504), rate limits (429), authentication failures (401/403)
- **Network error detection** (ENOTFOUND, ECONNREFUSED → 503)
- **Better logging** for debugging

## Validation Steps

### In Staging Environment

1. **Deploy the migration**:
   ```sql
   -- Run the migration file in Supabase SQL editor
   \i supabase/migrations/2026-01-03-fix-users-rls-and-plan-enforcement.sql
   ```

2. **Test helper functions**:
   ```sql
   -- As an authenticated user
   SELECT current_company_id(); -- Should return your company_id
   SELECT is_company_manager(); -- Should return true/false based on role
   SELECT is_company_manager_for('<test-company-id>'); -- Should return true/false
   ```

3. **Test RLS policies (no recursion)**:
   ```sql
   -- Should work without recursion errors
   SELECT * FROM users WHERE company_id = current_company_id();
   SELECT * FROM users WHERE auth_uid = auth.uid();
   ```

4. **Test company_plans auto-creation**:
   ```sql
   -- Check existing plans
   SELECT * FROM company_plans;
   
   -- Try creating a user for a company without a plan
   -- Should auto-create a 'free' plan without blocking
   ```

5. **Test API endpoints**:
   ```bash
   # Test /api/edge-proxy/nexus-ai
   curl -X POST https://your-app.vercel.app/api/edge-proxy/nexus-ai \
     -H "Content-Type: application/json" \
     -d '{"mode":"followUp","language":"en","ticketTitle":"Test","ticketCategoryKey":"technical","assignedAiLevel":1,"chatHistory":[]}'
   ```

6. **Test user onboarding**:
   - Sign up a new user
   - Verify profile creation succeeds
   - Check that default plan was created
   - Verify no RLS recursion errors in Supabase logs

### Expected Behavior

- ✅ User profile creation/repair succeeds even without a company plan
- ✅ Default 'free' plan is auto-created when missing
- ✅ No RLS recursion errors in logs
- ✅ API endpoints return proper error codes (429, 504) instead of generic 500
- ✅ NOTICE logs indicate soft enforcement: "Skipping agent cap enforcement for users table operation"

### Monitoring

Check Supabase logs for:
- ✅ `Skipping agent cap enforcement for users table operation`
- ✅ `Auto-created default free plan for company <id>`
- ✅ `Agent cap exceeded for company <id>: current=X, max=Y. Allowing operation to proceed.`
- ❌ No more: `ERROR: P0001: Plan non configuré`
- ❌ No more: RLS recursion errors

## Re-enabling Strict Mode (Optional)

If your organization requires strict agent cap enforcement after fixing the onboarding issues:

1. Edit the `enforce_agent_cap()` function in the migration
2. Uncomment the `RAISE EXCEPTION` block:
   ```sql
   IF v_current_agent_count >= COALESCE(v_plan_record.max_agents, 1) THEN
     RAISE EXCEPTION 'Agent cap exceeded: company % has % agents, max allowed is %',
       NEW.company_id, v_current_agent_count, v_plan_record.max_agents;
   END IF;
   ```
3. Redeploy the updated function
4. Ensure all companies have valid plans configured before re-enabling

## Files Changed

- `supabase/migrations/2026-01-03-fix-users-rls-and-plan-enforcement.sql` (new)
- `api/edge-proxy/[fn].ts` (enhanced error handling)

## Safety Notes

- ✅ **Idempotent**: Safe to run multiple times (uses IF EXISTS, CREATE OR REPLACE, ON CONFLICT)
- ✅ **Non-destructive**: Does not drop or modify existing data
- ✅ **Backward compatible**: Existing code continues to work
- ✅ **Staging first**: Should be deployed to staging before production
- ✅ **Soft enforcement**: Does not block users by default (strict mode is commented)

## Rollback Plan

If issues occur:

1. Drop the new helper functions:
   ```sql
   DROP FUNCTION IF EXISTS public.current_company_id();
   DROP FUNCTION IF EXISTS public.is_company_manager_for(uuid);
   DROP FUNCTION IF EXISTS public.is_company_manager();
   ```

2. Restore previous policies (if you have backups)

3. Drop company_plans table:
   ```sql
   DROP TABLE IF EXISTS public.company_plans CASCADE;
   ```

However, the migration is designed to be safe and should not require rollback.

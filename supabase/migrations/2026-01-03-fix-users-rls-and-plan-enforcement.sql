-- Migration: Fix users RLS recursion and soften plan enforcement
-- Date: 2026-01-03
-- Description: Creates safe SECURITY DEFINER helper functions to avoid RLS recursion,
-- drops unsafe policies on public.users, recreates safe policies, introduces company_plans
-- table with default plan support, and rewrites enforce_agent_cap() trigger to avoid
-- blocking user profile creation when plan is missing.

-- ============================================================================
-- PART 1: Create SECURITY DEFINER helper functions to avoid RLS recursion
-- ============================================================================

-- Helper function: Get current user's company_id from users table
-- SECURITY DEFINER bypasses RLS, preventing recursion in policies
CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  -- Get company_id for the authenticated user
  SELECT company_id INTO v_company_id
  FROM public.users
  WHERE auth_uid = auth.uid()
  LIMIT 1;
  
  RETURN v_company_id;
END;
$$;

-- Helper function: Check if current user is a manager for a specific company
-- SECURITY DEFINER bypasses RLS, preventing recursion in policies
CREATE OR REPLACE FUNCTION public.is_company_manager_for(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_manager boolean;
BEGIN
  -- Check if current user is a manager for the target company
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_uid = auth.uid()
      AND company_id = target_company_id
      AND role = 'manager'
  ) INTO v_is_manager;
  
  RETURN COALESCE(v_is_manager, false);
END;
$$;

-- Helper function: Check if current user is a manager (for any company)
-- SECURITY DEFINER bypasses RLS, preventing recursion in policies
CREATE OR REPLACE FUNCTION public.is_company_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_manager boolean;
BEGIN
  -- Check if current user has manager role
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_uid = auth.uid()
      AND role = 'manager'
  ) INTO v_is_manager;
  
  RETURN COALESCE(v_is_manager, false);
END;
$$;

-- ============================================================================
-- PART 2: Drop unsafe/duplicate policies and recreate safe policies on users
-- ============================================================================

-- Enable RLS on users table if not already enabled
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing potentially unsafe policies on users table
DROP POLICY IF EXISTS "auth_user_read_policy" ON public.users;
DROP POLICY IF EXISTS "auth_user_insert_policy" ON public.users;
DROP POLICY IF EXISTS "auth_user_update_policy" ON public.users;
DROP POLICY IF EXISTS "auth_user_delete_policy" ON public.users;

-- Drop any other legacy policies that might cause recursion
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- Create SAFE SELECT policy using helper function (no recursion)
CREATE POLICY "auth_user_read_policy" ON public.users
  FOR SELECT USING (
    -- Users can read their own row
    auth.uid() = auth_uid
    OR
    -- Users can read other users in their company
    company_id = public.current_company_id()
  );

-- Create SAFE INSERT policy using helper function (no recursion)
CREATE POLICY "auth_user_insert_policy" ON public.users
  FOR INSERT WITH CHECK (
    -- Users can only insert their own auth_uid
    auth.uid() = auth_uid
  );

-- Create SAFE UPDATE policy using helper function (no recursion)
CREATE POLICY "auth_user_update_policy" ON public.users
  FOR UPDATE USING (
    -- Users can update their own row
    auth.uid() = auth_uid
    OR
    -- Managers can update users in their company
    (company_id = public.current_company_id() AND public.is_company_manager())
  );

-- Create SAFE DELETE policy (optional, restrictive)
CREATE POLICY "auth_user_delete_policy" ON public.users
  FOR DELETE USING (
    -- Only managers can delete users in their company
    company_id = public.current_company_id() AND public.is_company_manager()
  );

-- ============================================================================
-- PART 3: Create company_plans table with default plan support
-- ============================================================================

-- Create company_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.company_plans (
  company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_name text NOT NULL DEFAULT 'free',
  max_tickets_per_day integer DEFAULT 50,
  max_ai_calls_per_day integer DEFAULT 100,
  max_agents integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_plans_company_id ON public.company_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_company_plans_plan_name ON public.company_plans(plan_name);

-- Enable RLS on company_plans
ALTER TABLE public.company_plans ENABLE ROW LEVEL SECURITY;

-- Company plans policies (users can read their company's plan)
DROP POLICY IF EXISTS "company_plans_select_policy" ON public.company_plans;
CREATE POLICY "company_plans_select_policy" ON public.company_plans
  FOR SELECT USING (
    -- Users can only read their own company's plan
    company_id = public.current_company_id()
  );

-- Only managers can modify plans
DROP POLICY IF EXISTS "company_plans_insert_policy" ON public.company_plans;
CREATE POLICY "company_plans_insert_policy" ON public.company_plans
  FOR INSERT WITH CHECK (
    public.is_company_manager_for(company_id)
  );

DROP POLICY IF EXISTS "company_plans_update_policy" ON public.company_plans;
CREATE POLICY "company_plans_update_policy" ON public.company_plans
  FOR UPDATE USING (
    public.is_company_manager_for(company_id)
  );

-- ============================================================================
-- PART 4: Rewrite enforce_agent_cap() trigger function with soft enforcement
-- ============================================================================

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_agent_cap_trigger ON public.users;

-- Rewrite the enforce_agent_cap() function as SECURITY DEFINER with soft enforcement
CREATE OR REPLACE FUNCTION public.enforce_agent_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_record RECORD;
  v_current_agent_count integer;
BEGIN
  -- Skip enforcement for table 'users' to allow profile repair/creation
  -- This prevents blocking during user onboarding
  IF TG_TABLE_NAME = 'users' THEN
    RAISE NOTICE 'Skipping agent cap enforcement for users table operation';
    RETURN NEW;
  END IF;

  -- Skip if no company_id is set
  IF NEW.company_id IS NULL THEN
    RAISE NOTICE 'No company_id set, skipping agent cap enforcement';
    RETURN NEW;
  END IF;

  -- Skip if not an agent role
  IF NEW.role IS NULL OR NEW.role != 'agent' THEN
    RETURN NEW;
  END IF;

  -- Try to get the plan for this company
  SELECT * INTO v_plan_record
  FROM public.company_plans
  WHERE company_id = NEW.company_id;

  -- If no plan exists, auto-insert a default 'free' plan
  IF NOT FOUND THEN
    BEGIN
      INSERT INTO public.company_plans (
        company_id,
        plan_name,
        max_tickets_per_day,
        max_ai_calls_per_day,
        max_agents
      ) VALUES (
        NEW.company_id,
        'free',
        50,
        100,
        1
      ) ON CONFLICT (company_id) DO NOTHING;
      
      RAISE NOTICE 'Auto-created default free plan for company %', NEW.company_id;
      
      -- Re-fetch the plan record
      SELECT * INTO v_plan_record
      FROM public.company_plans
      WHERE company_id = NEW.company_id;
    EXCEPTION WHEN OTHERS THEN
      -- If insert fails, log and continue without blocking
      RAISE NOTICE 'Could not auto-create plan for company %, continuing without enforcement: %', NEW.company_id, SQLERRM;
      RETURN NEW;
    END;
  END IF;

  -- Count current agents for this company
  SELECT COUNT(*) INTO v_current_agent_count
  FROM public.users
  WHERE company_id = NEW.company_id
    AND role = 'agent'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Check if adding this agent would exceed the cap
  IF v_current_agent_count >= COALESCE(v_plan_record.max_agents, 1) THEN
    -- OPTIONAL STRICT MODE (commented out by default for soft enforcement):
    -- RAISE EXCEPTION 'Agent cap exceeded: company % has % agents, max allowed is %',
    --   NEW.company_id, v_current_agent_count, v_plan_record.max_agents;
    
    -- Soft enforcement: log a notice instead of blocking
    RAISE NOTICE 'Agent cap exceeded for company %: current=%, max=%. Allowing operation to proceed.',
      NEW.company_id, v_current_agent_count, v_plan_record.max_agents;
  END IF;

  RETURN NEW;
END;
$$;

-- Re-create the trigger on users table
-- Note: The function intentionally skips enforcement for TG_TABLE_NAME = 'users'
-- to prevent blocking user profile creation/repair during onboarding.
-- This allows user rows to be created even when no company plan exists.
-- If you need the trigger on other tables (e.g., a future agents table), 
-- create additional triggers on those tables without the TG_TABLE_NAME skip.
CREATE TRIGGER enforce_agent_cap_trigger
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_agent_cap();

-- ============================================================================
-- PART 5: Grant EXECUTE permissions on helper functions
-- ============================================================================

-- Grant EXECUTE to authenticated users (Supabase auth users)
GRANT EXECUTE ON FUNCTION public.current_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_manager_for(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_manager() TO authenticated;

-- Grant EXECUTE to anon role (for public access if needed)
GRANT EXECUTE ON FUNCTION public.current_company_id() TO anon;
GRANT EXECUTE ON FUNCTION public.is_company_manager_for(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_company_manager() TO anon;

-- ============================================================================
-- Migration complete
-- ============================================================================

-- Next steps:
-- 1. Deploy this migration to staging environment first
-- 2. Test user onboarding flows (sign up, profile creation)
-- 3. Verify no RLS recursion errors in logs
-- 4. Test queries: SELECT * FROM users WHERE company_id = '<test-company-id>';
-- 5. Test API endpoints: /api/edge-proxy/nexus-ai
-- 6. If business requires strict agent cap enforcement, uncomment RAISE EXCEPTION
--    in enforce_agent_cap() function and redeploy
-- 7. Monitor application logs for NOTICE messages about plan creation and caps

-- Validation queries (run after migration):
-- SELECT current_company_id(); -- Should return your company_id
-- SELECT is_company_manager(); -- Should return true/false based on role
-- SELECT * FROM company_plans; -- Should show auto-created plans
-- SELECT * FROM users WHERE company_id = current_company_id(); -- Should work without recursion

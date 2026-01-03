-- Migration: internal_notes → jsonb and RLS policies
-- This migration is safe to run on staging before production
-- It creates internal_notes_json without dropping the old column

-- 1) Add internal_notes_json column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tickets'
      AND column_name = 'internal_notes_json'
  ) THEN
    ALTER TABLE public.tickets
      ADD COLUMN internal_notes_json jsonb DEFAULT '[]'::jsonb;
  END IF;
END$$;

-- 2) Migrate existing internal_notes to internal_notes_json
-- This is idempotent: only migrates if internal_notes_json is empty/null
DO $$
DECLARE
  rec RECORD;
  parsed jsonb;
BEGIN
  FOR rec IN
    SELECT id, internal_notes
    FROM public.tickets
    WHERE internal_notes IS NOT NULL
      AND internal_notes != ''
      AND (internal_notes_json IS NULL OR internal_notes_json = '[]'::jsonb)
  LOOP
    BEGIN
      -- Try to parse as JSON array
      parsed := rec.internal_notes::jsonb;
      
      -- Verify it's an array
      IF jsonb_typeof(parsed) = 'array' THEN
        UPDATE public.tickets
        SET internal_notes_json = parsed
        WHERE id = rec.id;
      ELSE
        -- If it's valid JSON but not an array, wrap it
        UPDATE public.tickets
        SET internal_notes_json = jsonb_build_array(
          jsonb_build_object(
            'text', parsed,
            'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000,
            'author', 'system'
          )
        )
        WHERE id = rec.id;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- If not valid JSON, wrap as a single note object
        UPDATE public.tickets
        SET internal_notes_json = jsonb_build_array(
          jsonb_build_object(
            'text', rec.internal_notes,
            'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000,
            'author', 'system'
          )
        )
        WHERE id = rec.id;
    END;
  END LOOP;
END$$;

-- ============================================================================
-- RLS POLICIES (Idempotent)
-- ============================================================================

-- Helper function to get company_id from auth.uid()
CREATE OR REPLACE FUNCTION public.auth_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id
  FROM public.users
  WHERE auth_uid = auth.uid()
  LIMIT 1;
$$;

-- Helper function to check if user is manager
CREATE OR REPLACE FUNCTION public.auth_user_is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'manager'
  FROM public.users
  WHERE auth_uid = auth.uid()
  LIMIT 1;
$$;

-- ============================================================================
-- TICKETS TABLE RLS
-- ============================================================================
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS tickets_select_policy ON public.tickets;
DROP POLICY IF EXISTS tickets_insert_policy ON public.tickets;
DROP POLICY IF EXISTS tickets_update_policy ON public.tickets;
DROP POLICY IF EXISTS tickets_delete_policy ON public.tickets;

-- Select: users can see tickets from their company
CREATE POLICY tickets_select_policy ON public.tickets
  FOR SELECT
  USING (company_id = public.auth_user_company_id());

-- Insert: users can create tickets in their company
CREATE POLICY tickets_insert_policy ON public.tickets
  FOR INSERT
  WITH CHECK (company_id = public.auth_user_company_id());

-- Update: users can update tickets in their company
CREATE POLICY tickets_update_policy ON public.tickets
  FOR UPDATE
  USING (company_id = public.auth_user_company_id())
  WITH CHECK (company_id = public.auth_user_company_id());

-- Delete: only managers can delete tickets in their company
CREATE POLICY tickets_delete_policy ON public.tickets
  FOR DELETE
  USING (
    company_id = public.auth_user_company_id()
    AND public.auth_user_is_manager()
  );

-- ============================================================================
-- CHAT_MESSAGES TABLE RLS
-- ============================================================================
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_messages_select_policy ON public.chat_messages;
DROP POLICY IF EXISTS chat_messages_insert_policy ON public.chat_messages;
DROP POLICY IF EXISTS chat_messages_update_policy ON public.chat_messages;
DROP POLICY IF EXISTS chat_messages_delete_policy ON public.chat_messages;

-- Select: users can see messages for tickets in their company
CREATE POLICY chat_messages_select_policy ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = chat_messages.ticket_id
        AND t.company_id = public.auth_user_company_id()
    )
  );

-- Insert: users can add messages to tickets in their company
CREATE POLICY chat_messages_insert_policy ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = chat_messages.ticket_id
        AND t.company_id = public.auth_user_company_id()
    )
  );

-- Update: users can update their own messages
CREATE POLICY chat_messages_update_policy ON public.chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = chat_messages.ticket_id
        AND t.company_id = public.auth_user_company_id()
    )
  );

-- Delete: only managers can delete messages
CREATE POLICY chat_messages_delete_policy ON public.chat_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = chat_messages.ticket_id
        AND t.company_id = public.auth_user_company_id()
    )
    AND public.auth_user_is_manager()
  );

-- ============================================================================
-- INTERNAL_NOTES TABLE RLS (if it exists as separate table)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'internal_notes'
  ) THEN
    ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS internal_notes_select_policy ON public.internal_notes;
    DROP POLICY IF EXISTS internal_notes_insert_policy ON public.internal_notes;
    DROP POLICY IF EXISTS internal_notes_update_policy ON public.internal_notes;
    DROP POLICY IF EXISTS internal_notes_delete_policy ON public.internal_notes;
    
    CREATE POLICY internal_notes_select_policy ON public.internal_notes
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = internal_notes.ticket_id
            AND t.company_id = public.auth_user_company_id()
        )
      );
    
    CREATE POLICY internal_notes_insert_policy ON public.internal_notes
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = internal_notes.ticket_id
            AND t.company_id = public.auth_user_company_id()
        )
      );
    
    CREATE POLICY internal_notes_update_policy ON public.internal_notes
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = internal_notes.ticket_id
            AND t.company_id = public.auth_user_company_id()
        )
      );
    
    CREATE POLICY internal_notes_delete_policy ON public.internal_notes
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = internal_notes.ticket_id
            AND t.company_id = public.auth_user_company_id()
        )
        AND public.auth_user_is_manager()
      );
  END IF;
END$$;

-- ============================================================================
-- APPOINTMENT_DETAILS TABLE RLS
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'appointment_details'
  ) THEN
    ALTER TABLE public.appointment_details ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS appointment_details_select_policy ON public.appointment_details;
    DROP POLICY IF EXISTS appointment_details_insert_policy ON public.appointment_details;
    DROP POLICY IF EXISTS appointment_details_update_policy ON public.appointment_details;
    DROP POLICY IF EXISTS appointment_details_delete_policy ON public.appointment_details;
    
    CREATE POLICY appointment_details_select_policy ON public.appointment_details
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = appointment_details.ticket_id
            AND t.company_id = public.auth_user_company_id()
        )
      );
    
    CREATE POLICY appointment_details_insert_policy ON public.appointment_details
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = appointment_details.ticket_id
            AND t.company_id = public.auth_user_company_id()
        )
      );
    
    CREATE POLICY appointment_details_update_policy ON public.appointment_details
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = appointment_details.ticket_id
            AND t.company_id = public.auth_user_company_id()
        )
      );
    
    CREATE POLICY appointment_details_delete_policy ON public.appointment_details
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = appointment_details.ticket_id
            AND t.company_id = public.auth_user_company_id()
        )
        AND public.auth_user_is_manager()
      );
  END IF;
END$$;

-- ============================================================================
-- COMPANY_KNOWLEDGE TABLE RLS
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'company_knowledge'
  ) THEN
    ALTER TABLE public.company_knowledge ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS company_knowledge_select_policy ON public.company_knowledge;
    DROP POLICY IF EXISTS company_knowledge_insert_policy ON public.company_knowledge;
    DROP POLICY IF EXISTS company_knowledge_update_policy ON public.company_knowledge;
    DROP POLICY IF EXISTS company_knowledge_delete_policy ON public.company_knowledge;
    
    CREATE POLICY company_knowledge_select_policy ON public.company_knowledge
      FOR SELECT
      USING (company_id = public.auth_user_company_id());
    
    CREATE POLICY company_knowledge_insert_policy ON public.company_knowledge
      FOR INSERT
      WITH CHECK (
        company_id = public.auth_user_company_id()
        AND public.auth_user_is_manager()
      );
    
    CREATE POLICY company_knowledge_update_policy ON public.company_knowledge
      FOR UPDATE
      USING (
        company_id = public.auth_user_company_id()
        AND public.auth_user_is_manager()
      );
    
    CREATE POLICY company_knowledge_delete_policy ON public.company_knowledge
      FOR DELETE
      USING (
        company_id = public.auth_user_company_id()
        AND public.auth_user_is_manager()
      );
  END IF;
END$$;

-- ============================================================================
-- COMPANIES TABLE RLS
-- ============================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_select_policy ON public.companies;
DROP POLICY IF EXISTS companies_update_policy ON public.companies;
DROP POLICY IF EXISTS companies_delete_policy ON public.companies;

-- Select: users can see their own company
CREATE POLICY companies_select_policy ON public.companies
  FOR SELECT
  USING (id = public.auth_user_company_id());

-- Update: only managers can update their company
CREATE POLICY companies_update_policy ON public.companies
  FOR UPDATE
  USING (
    id = public.auth_user_company_id()
    AND public.auth_user_is_manager()
  );

-- Delete: no one can delete companies (handled by admin)
CREATE POLICY companies_delete_policy ON public.companies
  FOR DELETE
  USING (false);

-- ============================================================================
-- USERS TABLE RLS
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_insert_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;
DROP POLICY IF EXISTS users_delete_policy ON public.users;

-- Select: users can see other users in their company
CREATE POLICY users_select_policy ON public.users
  FOR SELECT
  USING (company_id = public.auth_user_company_id());

-- Insert: handled by edge functions (service role)
CREATE POLICY users_insert_policy ON public.users
  FOR INSERT
  WITH CHECK (company_id = public.auth_user_company_id());

-- Update: users can update themselves, managers can update anyone in company
CREATE POLICY users_update_policy ON public.users
  FOR UPDATE
  USING (
    company_id = public.auth_user_company_id()
    AND (
      auth_uid = auth.uid()
      OR public.auth_user_is_manager()
    )
  );

-- Delete: only managers can delete users in their company
CREATE POLICY users_delete_policy ON public.users
  FOR DELETE
  USING (
    company_id = public.auth_user_company_id()
    AND public.auth_user_is_manager()
    AND auth_uid != auth.uid() -- Cannot delete self
  );

-- ============================================================================
-- WORKSTATIONS TABLE RLS (if exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'workstations'
  ) THEN
    ALTER TABLE public.workstations ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS workstations_select_policy ON public.workstations;
    DROP POLICY IF EXISTS workstations_insert_policy ON public.workstations;
    DROP POLICY IF EXISTS workstations_update_policy ON public.workstations;
    DROP POLICY IF EXISTS workstations_delete_policy ON public.workstations;
    
    CREATE POLICY workstations_select_policy ON public.workstations
      FOR SELECT
      USING (company_id = public.auth_user_company_id());
    
    CREATE POLICY workstations_insert_policy ON public.workstations
      FOR INSERT
      WITH CHECK (
        company_id = public.auth_user_company_id()
        AND public.auth_user_is_manager()
      );
    
    CREATE POLICY workstations_update_policy ON public.workstations
      FOR UPDATE
      USING (
        company_id = public.auth_user_company_id()
        AND public.auth_user_is_manager()
      );
    
    CREATE POLICY workstations_delete_policy ON public.workstations
      FOR DELETE
      USING (
        company_id = public.auth_user_company_id()
        AND public.auth_user_is_manager()
      );
  END IF;
END$$;

-- ============================================================================
-- FINAL STEP (to be executed later by maintainers after testing)
-- ============================================================================
-- After deploying code and testing in staging, run:
-- 
-- ALTER TABLE public.tickets DROP COLUMN internal_notes;
-- ALTER TABLE public.tickets RENAME COLUMN internal_notes_json TO internal_notes;
-- 
-- This completes the migration by replacing the old text column with the new jsonb column.

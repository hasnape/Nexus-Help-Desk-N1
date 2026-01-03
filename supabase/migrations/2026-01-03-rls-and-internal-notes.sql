-- Migration: Add internal_notes_json and migrate data safely
-- This migration adds a new JSONB column for internal notes and migrates existing data
-- Also includes idempotent RLS policy creation for key tables

-- Step 1: Add internal_notes_json column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tickets'
    AND column_name = 'internal_notes_json'
  ) THEN
    ALTER TABLE public.tickets ADD COLUMN internal_notes_json JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added internal_notes_json column';
  ELSE
    RAISE NOTICE 'internal_notes_json column already exists';
  END IF;
END$$;

-- Step 2: Safely migrate existing internal_notes data to JSON arrays
-- This migration is idempotent and safe to run multiple times
DO $$
DECLARE
  rec RECORD;
  notes_array JSONB;
BEGIN
  -- Only migrate if internal_notes column exists and internal_notes_json is empty
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tickets'
    AND column_name = 'internal_notes'
  ) THEN
    FOR rec IN
      SELECT id, internal_notes
      FROM public.tickets
      WHERE internal_notes IS NOT NULL
      AND (internal_notes_json IS NULL OR internal_notes_json = '[]'::jsonb)
    LOOP
      BEGIN
        -- Try to parse as JSON array
        IF jsonb_typeof(rec.internal_notes::jsonb) = 'array' THEN
          notes_array := rec.internal_notes::jsonb;
        ELSE
          -- Wrap non-array in array
          notes_array := jsonb_build_array(rec.internal_notes::jsonb);
        END IF;

        -- Update the internal_notes_json column
        UPDATE public.tickets
        SET internal_notes_json = notes_array
        WHERE id = rec.id;

      EXCEPTION
        WHEN OTHERS THEN
          -- If parsing fails, create a simple array with note_text field
          notes_array := jsonb_build_array(
            jsonb_build_object(
              'note_text', COALESCE(rec.internal_notes::text, ''),
              'created_at', NOW()
            )
          );
          UPDATE public.tickets
          SET internal_notes_json = notes_array
          WHERE id = rec.id;
      END;
    END LOOP;
    RAISE NOTICE 'Migration of internal_notes to internal_notes_json completed';
  END IF;
END$$;

-- Step 3: Idempotent RLS policy creation for tickets table
-- Drop existing policies if they exist, then create new ones

-- Enable RLS on tickets table if not already enabled
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tickets
DROP POLICY IF EXISTS tickets_select_own ON public.tickets;
CREATE POLICY tickets_select_own ON public.tickets
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM public.users WHERE id = tickets.user_id
    )
  );

-- Policy: Agents and managers can view tickets in their company
DROP POLICY IF EXISTS tickets_select_company ON public.tickets;
CREATE POLICY tickets_select_company ON public.tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_uid = auth.uid()
      AND users.company_id = tickets.company_id
      AND users.role IN ('agent', 'manager')
    )
  );

-- Policy: Users can insert their own tickets
DROP POLICY IF EXISTS tickets_insert_own ON public.tickets;
CREATE POLICY tickets_insert_own ON public.tickets
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT auth_uid FROM public.users WHERE id = tickets.user_id
    )
  );

-- Policy: Agents and managers can update tickets in their company
DROP POLICY IF EXISTS tickets_update_company ON public.tickets;
CREATE POLICY tickets_update_company ON public.tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_uid = auth.uid()
      AND users.company_id = tickets.company_id
      AND users.role IN ('agent', 'manager')
    )
  );

-- Step 4: Idempotent RLS policies for chat_messages table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages for their own tickets
DROP POLICY IF EXISTS chat_messages_select_own ON public.chat_messages;
CREATE POLICY chat_messages_select_own ON public.chat_messages
  FOR SELECT
  USING (
    ticket_id IN (
      SELECT t.id FROM public.tickets t
      INNER JOIN public.users u ON u.id = t.user_id
      WHERE u.auth_uid = auth.uid()
    )
  );

-- Policy: Agents and managers can view messages for tickets in their company
DROP POLICY IF EXISTS chat_messages_select_company ON public.chat_messages;
CREATE POLICY chat_messages_select_company ON public.chat_messages
  FOR SELECT
  USING (
    ticket_id IN (
      SELECT t.id FROM public.tickets t
      INNER JOIN public.users u ON u.auth_uid = auth.uid()
      WHERE t.company_id = u.company_id
      AND u.role IN ('agent', 'manager')
    )
  );

-- Policy: Users and agents can insert messages
DROP POLICY IF EXISTS chat_messages_insert ON public.chat_messages;
CREATE POLICY chat_messages_insert ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT t.id FROM public.tickets t
      INNER JOIN public.users u ON u.auth_uid = auth.uid()
      WHERE (u.id = t.user_id OR (t.company_id = u.company_id AND u.role IN ('agent', 'manager')))
    )
  );

-- Step 5: Idempotent RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (auth_uid = auth.uid());

-- Policy: Managers can view users in their company
DROP POLICY IF EXISTS users_select_company ON public.users;
CREATE POLICY users_select_company ON public.users
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users
      WHERE auth_uid = auth.uid()
      AND role = 'manager'
    )
  );

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (auth_uid = auth.uid());

-- Policy: Managers can update users in their company
DROP POLICY IF EXISTS users_update_company ON public.users;
CREATE POLICY users_update_company ON public.users
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.users
      WHERE auth_uid = auth.uid()
      AND role = 'manager'
    )
  );

-- Migration complete
-- NOTE: After deploying code that uses internal_notes_json, run:
-- ALTER TABLE public.tickets DROP COLUMN internal_notes;
-- ALTER TABLE public.tickets RENAME COLUMN internal_notes_json TO internal_notes;

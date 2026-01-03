-- Migration: Add internal_notes_json column and migrate data, plus idempotent RLS policies
-- Date: 2026-01-03
-- Description: Non-destructive migration that adds internal_notes_json jsonb column,
-- migrates existing internal_notes values, and creates/updates RLS policies for key tables

-- Part 1: Add internal_notes_json column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name = 'internal_notes_json'
  ) THEN
    ALTER TABLE tickets ADD COLUMN internal_notes_json jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Part 2: Migrate existing internal_notes to internal_notes_json
-- Attempts JSON parse, otherwise wraps as single note with timestamp
DO $$
DECLARE
  rec RECORD;
  parsed_json jsonb;
  wrapped_note jsonb;
BEGIN
  FOR rec IN 
    SELECT id, internal_notes 
    FROM tickets 
    WHERE internal_notes IS NOT NULL 
      AND internal_notes != '' 
      AND (internal_notes_json IS NULL OR internal_notes_json = '[]'::jsonb)
  LOOP
    BEGIN
      -- Try to parse as JSON array
      parsed_json := rec.internal_notes::jsonb;
      
      -- Validate it's an array
      IF jsonb_typeof(parsed_json) = 'array' THEN
        UPDATE tickets 
        SET internal_notes_json = parsed_json 
        WHERE id = rec.id;
      ELSE
        -- Wrap non-array JSON as single note
        wrapped_note := jsonb_build_array(
          jsonb_build_object(
            'text', rec.internal_notes,
            'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000,
            'author', 'system'
          )
        );
        UPDATE tickets 
        SET internal_notes_json = wrapped_note 
        WHERE id = rec.id;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If parse fails, wrap as plain text note
      wrapped_note := jsonb_build_array(
        jsonb_build_object(
          'text', rec.internal_notes,
          'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000,
          'author', 'system'
        )
      );
      UPDATE tickets 
      SET internal_notes_json = wrapped_note 
      WHERE id = rec.id;
    END;
  END LOOP;
END $$;

-- Part 3: Create idempotent RLS policies for key tables

-- Enable RLS on tables if not already enabled
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS company_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS company_ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ticket_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS faqs ENABLE ROW LEVEL SECURITY;

-- chat_messages policies
DROP POLICY IF EXISTS "chat_messages_select_policy" ON chat_messages;
CREATE POLICY "chat_messages_select_policy" ON chat_messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;
CREATE POLICY "chat_messages_insert_policy" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "chat_messages_update_policy" ON chat_messages;
CREATE POLICY "chat_messages_update_policy" ON chat_messages
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- tickets policies
DROP POLICY IF EXISTS "tickets_select_policy" ON tickets;
CREATE POLICY "tickets_select_policy" ON tickets
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "tickets_insert_policy" ON tickets;
CREATE POLICY "tickets_insert_policy" ON tickets
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "tickets_update_policy" ON tickets;
CREATE POLICY "tickets_update_policy" ON tickets
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- internal_notes policies
DROP POLICY IF EXISTS "internal_notes_select_policy" ON internal_notes;
CREATE POLICY "internal_notes_select_policy" ON internal_notes
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "internal_notes_insert_policy" ON internal_notes;
CREATE POLICY "internal_notes_insert_policy" ON internal_notes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "internal_notes_update_policy" ON internal_notes;
CREATE POLICY "internal_notes_update_policy" ON internal_notes
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- appointment_details policies
DROP POLICY IF EXISTS "appointment_details_select_policy" ON appointment_details;
CREATE POLICY "appointment_details_select_policy" ON appointment_details
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "appointment_details_insert_policy" ON appointment_details;
CREATE POLICY "appointment_details_insert_policy" ON appointment_details
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "appointment_details_update_policy" ON appointment_details;
CREATE POLICY "appointment_details_update_policy" ON appointment_details
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- company_knowledge policies
DROP POLICY IF EXISTS "company_knowledge_select_policy" ON company_knowledge;
CREATE POLICY "company_knowledge_select_policy" ON company_knowledge
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "company_knowledge_insert_policy" ON company_knowledge;
CREATE POLICY "company_knowledge_insert_policy" ON company_knowledge
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "company_knowledge_update_policy" ON company_knowledge;
CREATE POLICY "company_knowledge_update_policy" ON company_knowledge
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- companies policies
DROP POLICY IF EXISTS "companies_select_policy" ON companies;
CREATE POLICY "companies_select_policy" ON companies
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "companies_insert_policy" ON companies;
CREATE POLICY "companies_insert_policy" ON companies
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "companies_update_policy" ON companies;
CREATE POLICY "companies_update_policy" ON companies
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- company_settings policies
DROP POLICY IF EXISTS "company_settings_select_policy" ON company_settings;
CREATE POLICY "company_settings_select_policy" ON company_settings
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "company_settings_insert_policy" ON company_settings;
CREATE POLICY "company_settings_insert_policy" ON company_settings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "company_settings_update_policy" ON company_settings;
CREATE POLICY "company_settings_update_policy" ON company_settings
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- company_ai_settings policies
DROP POLICY IF EXISTS "company_ai_settings_select_policy" ON company_ai_settings;
CREATE POLICY "company_ai_settings_select_policy" ON company_ai_settings
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "company_ai_settings_insert_policy" ON company_ai_settings;
CREATE POLICY "company_ai_settings_insert_policy" ON company_ai_settings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "company_ai_settings_update_policy" ON company_ai_settings;
CREATE POLICY "company_ai_settings_update_policy" ON company_ai_settings
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- crm_companies policies
DROP POLICY IF EXISTS "crm_companies_select_policy" ON crm_companies;
CREATE POLICY "crm_companies_select_policy" ON crm_companies
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "crm_companies_insert_policy" ON crm_companies;
CREATE POLICY "crm_companies_insert_policy" ON crm_companies
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "crm_companies_update_policy" ON crm_companies;
CREATE POLICY "crm_companies_update_policy" ON crm_companies
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- ticket_audit policies
DROP POLICY IF EXISTS "ticket_audit_select_policy" ON ticket_audit;
CREATE POLICY "ticket_audit_select_policy" ON ticket_audit
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "ticket_audit_insert_policy" ON ticket_audit;
CREATE POLICY "ticket_audit_insert_policy" ON ticket_audit
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- faqs policies
DROP POLICY IF EXISTS "faqs_select_policy" ON faqs;
CREATE POLICY "faqs_select_policy" ON faqs
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "faqs_insert_policy" ON faqs;
CREATE POLICY "faqs_insert_policy" ON faqs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "faqs_update_policy" ON faqs;
CREATE POLICY "faqs_update_policy" ON faqs
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "faqs_delete_policy" ON faqs;
CREATE POLICY "faqs_delete_policy" ON faqs
  FOR DELETE USING (
    auth.uid() IS NOT NULL
  );

-- Migration complete
-- Next steps (after code deployment):
-- 1. Validate internal_notes_json content in staging
-- 2. Deploy application code that uses internal_notes_json
-- 3. After validation, run: ALTER TABLE tickets DROP COLUMN internal_notes;
-- 4. Then run: ALTER TABLE tickets RENAME COLUMN internal_notes_json TO internal_notes;



import { createClient } from '@supabase/supabase-js';

/*
  ================================================================================================
  ===                FULL SUPABASE DATABASE SETUP SCRIPT (TEXT-BASED COMPANY ID)               ===
  ================================================================================================
  
  INSTRUCTIONS:
  1. Go to your Supabase project's SQL Editor.
  2. Copy and paste the ENTIRE script below.
  3. Click "Run" to set up or update your database schema and security policies.
  
  This script is the single source of truth for the database structure. It's designed to be
  runnable multiple times. It will create tables if they don't exist and update functions
  and policies to the correct versions.

-- 1. ENABLE EXTENSIONS (If not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SETUP COMPANIES TABLE
-- The name must be unique. The plan determines feature access.
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  plan text NOT NULL DEFAULT 'freemium',
  subscription_id text
);
COMMENT ON TABLE public.companies IS 'Stores company accounts. Name must be unique. Plan determines features.';

-- 3. CREATE users TABLE
-- company_id is TEXT to store the company name directly.
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  language_preference text NOT NULL DEFAULT 'en',
  created_at timestamp with time zone DEFAULT now(),
  company_id text, -- This now stores the company NAME, not a UUID.
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);
COMMENT ON TABLE public.users IS 'Stores public user data. company_id is the company name (TEXT).';

-- Migration script to ensure users.company_id is TEXT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='company_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='users_company_id_fkey' AND table_name='users') THEN
        ALTER TABLE public.users DROP CONSTRAINT users_company_id_fkey;
    END IF;
    ALTER TABLE public.users ALTER COLUMN company_id TYPE text;
  ELSE
    ALTER TABLE public.users ADD COLUMN company_id text;
  END IF;
END $$;


-- 4. CREATE tickets TABLE
-- Added company_id for easier querying and RLS
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id text, -- DENORMALIZED for performance and RLS
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  assigned_ai_level smallint,
  assigned_agent_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  workstation_id text,
  chat_history jsonb,
  internal_notes jsonb,
  current_appointment jsonb
);
COMMENT ON TABLE public.tickets IS 'Stores all support tickets and their associated data.';

-- 5. FUNCTION TO SYNC AUTH SIGNUPS TO public.users (No changes needed)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, language_preference, role, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data ->> 'language_preference', 'en'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user'),
    (NEW.raw_user_meta_data ->> 'company_id')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.handle_new_user IS 'Trigger function to copy new user data, including company_id (TEXT).';

-- 6. TRIGGER for user sync
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. HELPER FUNCTIONS FOR RLS (No changes needed)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS text LANGUAGE sql SECURITY DEFINER AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$;

-- 8. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES FOR `companies` TABLE
DROP POLICY IF EXISTS "Allow public insert for new company creation" ON public.companies;
DROP POLICY IF EXISTS "Allow users to view their own company" ON public.companies;
DROP POLICY IF EXISTS "Allow managers to update their own company" ON public.companies;
DROP POLICY IF EXISTS "Allow all users to view companies" ON public.companies;

CREATE POLICY "Allow public insert for new company creation" ON public.companies
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow all users to view companies" ON public.companies
  FOR SELECT
  USING (true);

CREATE POLICY "Allow managers to update their own company" ON public.companies
  FOR UPDATE USING (
    public.get_my_role() = 'manager' AND name = public.get_my_company_id()
  );


-- 10. RLS POLICIES FOR `users` TABLE
DROP POLICY IF EXISTS "Allow users to see others in their own company" ON public.users;
CREATE POLICY "Allow users to see others in their own company" ON public.users
  FOR SELECT USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "Allow individual user to update their own profile" ON public.users;
CREATE POLICY "Allow individual user to update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow managers to update user profiles in their company" ON public.users;
CREATE POLICY "Allow managers to update user profiles in their company" ON public.users
  FOR UPDATE USING (
    public.get_my_role() = 'manager' AND company_id = public.get_my_company_id()
  );

-- 11. RLS POLICIES FOR `tickets` TABLE (Updated for new company_id column)
DROP POLICY IF EXISTS "Company Isolation Policy for Tickets" ON public.tickets;
CREATE POLICY "Company Isolation Policy for Tickets" ON public.tickets
  FOR ALL
  USING (company_id = public.get_my_company_id())
  WITH CHECK (company_id = public.get_my_company_id());


-- 12. RPC FUNCTION TO SECURELY DELETE A USER (MANAGER ONLY) (No changes needed)
CREATE OR REPLACE FUNCTION public.delete_user_by_manager(user_id_to_delete uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  caller_company_id text;
  target_company_id text;
BEGIN
  IF (SELECT public.get_my_role()) != 'manager' THEN
    RAISE EXCEPTION 'Permission denied: Only managers can delete users.';
  END IF;

  caller_company_id := public.get_my_company_id();
  target_company_id := (
    SELECT company_id FROM public.users WHERE id = user_id_to_delete
  );

  IF caller_company_id IS NULL
     OR target_company_id IS NULL
     OR caller_company_id != target_company_id THEN
    RAISE EXCEPTION 'Permission denied: Cannot delete users outside your own company.';
  END IF;

  DELETE FROM auth.users WHERE id = user_id_to_delete;
END;
$$;
COMMENT ON FUNCTION public.delete_user_by_manager IS 'Allows a manager to securely delete a user within their own company.';

*/

const supabaseUrl = 'https://qzglblfqemzsktlkohoj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Z2xibGZxZW16c2t0bGtvaG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDA2NjQsImV4cCI6MjA2NjYxNjY2NH0.ePBpJaikUuq5MhrvoBtOEho9Mni4CBY5IeswfFY1DoU';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConnected = true;
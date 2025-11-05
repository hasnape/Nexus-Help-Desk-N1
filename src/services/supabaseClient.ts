import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

declare global { var __supabase__: SupabaseClient | undefined; }
// évite les doublons en HMR
export const supabase =
  globalThis.__supabase__ ??
  (globalThis.__supabase__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // storageKey: 'nsh-auth', // optionnel
    },
    global: {
      headers: { 'X-Client-Info': 'nsh-web' },
    },
  }));

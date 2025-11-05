// src/services/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // On fail fast pour éviter des bugs silencieux en prod
  throw new Error('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// Anti-duplication en dev (HMR Vite) : une seule instance partagée
declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined;
}

export const supabase =
  globalThis.__supabase__ ??
  (globalThis.__supabase__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Optionnel: décommente si tu veux un storageKey dédié
      // storageKey: 'nsh-auth',
    },
    global: {
      headers: {
        'X-Client-Info': 'nsh-web',
      },
    },
  }));

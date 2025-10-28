import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants (Vercel / .env.local).');
}

// TEMP debug to verify env injection (REMOVE after validation)
console.log('URL', import.meta.env.VITE_SUPABASE_URL);
console.log('ANON starts with eyJ?', (import.meta.env.VITE_SUPABASE_ANON_KEY || '').startsWith('eyJ'));

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

import { supabase } from './supabaseClient';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  opts?: { fullName?: string; role?: 'user'|'agent'|'manager'; companyName?: string; lang?: 'fr'|'en'|'ar' }
) {
  const { fullName, role, companyName, lang } = opts || {};
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        language_preference: lang,
        company_name: companyName, // DB trigger maps to users.company_id (UUID)
      },
    },
  });
  if (error) throw error;
  return data.user;
}

export async function signUpViaAuthFunction(payload: {
  email: string;
  password: string;
  companyName: string;
  fullName?: string;
  lang?: 'fr' | 'en' | 'ar';
  role?: 'manager' | 'agent' | 'user';
  plan?: 'freemium' | 'standard' | 'pro';
  secretCode?: string;
}) {
  const { email, password, companyName, fullName, lang, role, plan, secretCode } = payload;

  const body = {
    email,
    password,
    full_name: fullName,
    company_name: companyName,
    language_preference: lang,
    role,
    plan,
    secret_code: secretCode,
  };

  const { data, error, status, statusText } = await supabase.functions.invoke('auth-signup', {
    method: 'POST',
    body,
  });

  const resolvedStatus = typeof status === 'number' ? status : 520;
  const payloadBody = error ?? data ?? null;
  const ok = resolvedStatus >= 200 && resolvedStatus < 300;

  return { ok, status: resolvedStatus, statusText, body: payloadBody };
}

export async function signOut() {
  await supabase.auth.signOut();
}

/** Ensure a row exists in public.users for current auth user. */
export async function ensureUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const { data, error } = await supabase.rpc('ensure_user_profile', {
    p_email: user.email,
    p_full_name: (user.user_metadata as any)?.full_name ?? null,
  });
  if (error) console.warn('ensure_user_profile error:', error.message);
  return (data as string) ?? null;
}

export async function sendResetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://www.nexussupporthub.eu/#/reset-password',
  });

  if (error) {
    console.error('resetPassword error', error);
    throw error;
  }

  return data;
}


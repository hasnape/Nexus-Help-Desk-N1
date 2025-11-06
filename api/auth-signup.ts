import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

import { prepareCors } from './_cors';

type Role = 'manager' | 'agent' | 'user';
type PlanKey = 'freemium' | 'standard' | 'pro';

type ManagerActivationRow = {
  id: string;
  company_name: string | null;
  consumed: boolean | null;
  expires_at: string | null;
};

const SUPABASE_URL =
  process.env.PROJECT_URL ??
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  '';

const SERVICE_KEY =
  process.env.NSH_SERVICE_ROLE_KEY ??
  process.env.SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  '';

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const SUPPORTED_LANGUAGES = new Set(['fr', 'en', 'ar']);
const DEFAULT_TIMEZONE = 'Europe/Paris';

function parseBody(req: VercelRequest) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
  return body as Record<string, unknown>;
}

function normalizeCompanyName(input: unknown) {
  if (typeof input !== 'string') {
    return { normalized: '', lower: '' };
  }
  const normalized = input.trim().replace(/\s+/g, ' ');
  return { normalized, lower: normalized.toLowerCase() };
}

async function findCompanyByLowerName(name: string) {
  const { data, error } = await admin
    .from('companies')
    .select('id, name')
    .ilike('name', name)
    .limit(10);

  if (error) {
    throw error;
  }

  return (data ?? []).find((row) => (row.name ?? '').trim().toLowerCase() === name.toLowerCase()) ?? null;
}

async function resolvePlanId(planKey: PlanKey): Promise<string | number | null> {
  const { data, error } = await admin
    .from('plans')
    .select('id')
    .eq('name', planKey)
    .single();
  if (error || !data?.id) {
    return null;
  }
  return data.id as string | number;
}

async function countManagers(companyId: string | number): Promise<number> {
  const { count, error } = await admin
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('role', 'manager');

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function validateActivationCode(secretCode: string, companyLower: string) {
  const { data, error } = await admin
    .from('manager_activation_codes')
    .select('id, company_name, consumed, expires_at')
    .eq('code', secretCode)
    .limit(1);

  if (error || !data || data.length === 0) {
    return { ok: false as const, error: 'invalid_activation_code' };
  }

  const row = data[0] as ManagerActivationRow;
  if (row.consumed) {
    return { ok: false as const, error: 'invalid_activation_code' };
  }

  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false as const, error: 'invalid_activation_code' };
  }

  if ((row.company_name ?? '').toLowerCase() !== companyLower) {
    return { ok: false as const, error: 'invalid_activation_code' };
  }

  return { ok: true as const, row };
}

async function consumeActivationCode(id: string, authUid: string) {
  await admin
    .from('manager_activation_codes')
    .update({
      consumed: true,
      consumed_by: authUid,
      consumed_at: new Date().toISOString(),
    })
    .eq('id', id);
}

function respondError(res: VercelResponse, code: string, status: number) {
  res.status(status).json({ ok: false, error: code });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { finished } = prepareCors(req, res);
  if (finished) {
    return;
  }

  if (req.method !== 'POST') {
    respondError(res, 'method_not_allowed', 405);
    return;
  }

  const payload = parseBody(req);

  const emailRaw = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  const fullName = typeof payload.full_name === 'string'
    ? payload.full_name.trim()
    : typeof payload.fullName === 'string'
      ? payload.fullName.trim()
      : '';
  const roleRaw = typeof payload.role === 'string' ? payload.role.toLowerCase() : '';
  const languageRaw = typeof payload.language === 'string'
    ? payload.language.toLowerCase()
    : typeof payload.language_preference === 'string'
      ? payload.language_preference.toLowerCase()
      : 'fr';
  const { normalized: companyName, lower: companyLower } = normalizeCompanyName(
    payload.company_name ?? payload.companyName,
  );
  const planRaw = typeof payload.plan === 'string' ? payload.plan.toLowerCase() : '';
  const secretCode = typeof payload.secretCode === 'string'
    ? payload.secretCode.trim()
    : typeof payload.secret_code === 'string'
      ? payload.secret_code.trim()
      : '';

  if (!emailRaw || !password || !fullName || !roleRaw || !companyName) {
    respondError(res, 'missing_fields', 400);
    return;
  }

  if (password.length < 8) {
    respondError(res, 'weak_password', 400);
    return;
  }

  if (roleRaw !== 'manager' && roleRaw !== 'agent' && roleRaw !== 'user') {
    respondError(res, 'invalid_role', 400);
    return;
  }

  const language = SUPPORTED_LANGUAGES.has(languageRaw) ? languageRaw : 'fr';
  const role = roleRaw as Role;

  try {
    if (role === 'manager') {
      const planKey: PlanKey = planRaw === 'standard' || planRaw === 'pro' ? (planRaw as PlanKey) : 'freemium';
      const existingCompany = await findCompanyByLowerName(companyLower);

      if (existingCompany) {
        const managerCount = await countManagers(existingCompany.id);
        if (managerCount > 0) {
          respondError(res, 'company_conflict', 409);
          return;
        }

        const { data: authUser, error: authError } = await admin.auth.admin.createUser({
          email: emailRaw,
          password,
          email_confirm: true,
          user_metadata: { role: 'manager', language_preference: language },
        });

        if (authError || !authUser?.user) {
          respondError(res, 'user_create_failed', 500);
          return;
        }

        const authUid = authUser.user.id;
        const { error: profileError } = await admin.from('users').insert({
          auth_uid: authUid,
          email: emailRaw,
          full_name: fullName,
          role: 'manager',
          language_preference: language,
          company_id: existingCompany.id,
        });

        if (profileError) {
          await admin.auth.admin.deleteUser(authUid).catch(() => undefined);
          respondError(res, 'profile_insert_failed', 500);
          return;
        }

        res.status(200).json({ ok: true, company_id: existingCompany.id, user_id: authUid, mode: 'manager_existing' });
        return;
      }

      if (planKey !== 'freemium' && !secretCode) {
        respondError(res, 'activation_required', 400);
        return;
      }

      let activationRow: ManagerActivationRow | null = null;
      if (planKey !== 'freemium') {
        const activation = await validateActivationCode(secretCode, companyLower);
        if (!activation.ok) {
          respondError(res, activation.error, 400);
          return;
        }
        activationRow = activation.row;
      }

      const planId = await resolvePlanId(planKey);
      if (!planId) {
        respondError(res, 'plan_not_found', 400);
        return;
      }

      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email: emailRaw,
        password,
        email_confirm: true,
        user_metadata: { role: 'manager', language_preference: language },
      });

      if (authError || !authUser?.user) {
        respondError(res, 'user_create_failed', 500);
        return;
      }

      const authUid = authUser.user.id;

      const { data: companyRow, error: companyError } = await admin
        .from('companies')
        .insert({ name: companyName, plan_id: planId })
        .select('id')
        .single();

      if (companyError || !companyRow?.id) {
        await admin.auth.admin.deleteUser(authUid).catch(() => undefined);
        respondError(res, 'company_create_failed', 500);
        return;
      }

      const companyId = companyRow.id as string | number;

      const settings = await admin
        .from('company_settings')
        .insert({ company_id: companyId, timezone: DEFAULT_TIMEZONE, plan_tier: planKey });

      if (settings.error) {
        await admin.from('companies').delete().eq('id', companyId).catch(() => undefined);
        await admin.auth.admin.deleteUser(authUid).catch(() => undefined);
        respondError(res, 'settings_insert_failed', 500);
        return;
      }

      const { error: profileError } = await admin.from('users').insert({
        auth_uid: authUid,
        email: emailRaw,
        full_name: fullName,
        role: 'manager',
        language_preference: language,
        company_id: companyId,
      });

      if (profileError) {
        await admin.from('company_settings').delete().eq('company_id', companyId).catch(() => undefined);
        await admin.from('companies').delete().eq('id', companyId).catch(() => undefined);
        await admin.auth.admin.deleteUser(authUid).catch(() => undefined);
        respondError(res, 'profile_insert_failed', 500);
        return;
      }

      if (activationRow) {
        await consumeActivationCode(activationRow.id, authUid).catch(() => undefined);
      }

      res.status(200).json({ ok: true, company_id: companyId, user_id: authUid, mode: 'manager_new' });
      return;
    }

    const company = await findCompanyByLowerName(companyLower);
    if (!company?.id) {
      respondError(res, 'company_missing', 404);
      return;
    }

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: emailRaw,
      password,
      email_confirm: true,
      user_metadata: { role, language_preference: language },
    });

    if (authError || !authUser?.user) {
      respondError(res, 'user_create_failed', 500);
      return;
    }

    const authUid = authUser.user.id;
    const { error: profileError } = await admin.from('users').insert({
      auth_uid: authUid,
      email: emailRaw,
      full_name: fullName,
      role,
      language_preference: language,
      company_id: company.id,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(authUid).catch(() => undefined);
      respondError(res, 'profile_insert_failed', 500);
      return;
    }

    res.status(200).json({ ok: true, company_id: company.id, user_id: authUid, mode: 'member' });
  } catch (error) {
    console.error('auth-signup fallback error', error);
    respondError(res, 'unexpected_error', 500);
  }
}

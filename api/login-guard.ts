import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

import { prepareCors } from './_cors';

const SUPABASE_URL =
  process.env.PROJECT_URL ??
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  '';

const SUPABASE_ANON_KEY =
  process.env.ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type GuardReason = 'company_mismatch' | 'company_not_found' | 'unknown_email' | 'invalid_login' | 'unknown';

type GuardPayload = {
  ok?: boolean | null;
  allowed?: boolean | null;
  reason?: GuardReason | null;
};

function parseBody(req: VercelRequest): { email: string; company: string } {
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  return { email, company };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { finished } = prepareCors(req, res);
  if (finished) {
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  const { email, company } = parseBody(req);
  if (!email || !company) {
    res.status(400).json({ ok: false, error: 'missing_fields' });
    return;
  }

  try {
    const { data, error } = await supabase.rpc<GuardPayload>('prelogin_check_company', {
      p_email: email,
      p_company_name: company,
    });

    if (error) {
      res.status(500).json({ ok: false, error: 'rpc_failed' });
      return;
    }

    if (!data?.allowed) {
      res.status(403).json({ ok: false, reason: data?.reason ?? 'forbidden' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'unexpected_error' });
  }
}

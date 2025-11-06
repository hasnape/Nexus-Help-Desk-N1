import type { VercelRequest, VercelResponse } from '@vercel/node';

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

const ALLOW_HEADERS = 'authorization, apikey, content-type, x-client-info';

function applyCors(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string | undefined) ?? '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', ALLOW_HEADERS);
  res.setHeader('Vary', 'Origin');
}

function parseBody(req: VercelRequest): Record<string, unknown> {
  if (typeof req.body === 'string') {
    if (!req.body) return {};
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return (req.body as Record<string, unknown> | undefined) ?? {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const fnParam = req.query.fn;
  const functionName = Array.isArray(fnParam) ? fnParam[0] : fnParam;
  if (!functionName) {
    res.status(400).json({ error: 'missing_function' });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(500).json({ error: 'missing_supabase_configuration' });
    return;
  }

  const payload = parseBody(req);

  try {
    const targetUrl = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/${functionName}`;
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        authorization: req.headers.authorization ?? `Bearer ${SUPABASE_ANON_KEY}`,
        'x-client-info': 'nsh-edge-proxy',
      },
      body: JSON.stringify(payload ?? {}),
    });

    const text = await response.text();
    const status = response.status;
    let parsed: any = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }

    res.setHeader('Cache-Control', 'no-store');

    if (parsed !== null) {
      res.status(status).json(parsed);
    } else {
      res.status(status).end();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'fetch_failed';
    res.status(502).json({ error: message, details: { message } });
  }
}

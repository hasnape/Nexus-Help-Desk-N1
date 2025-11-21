import type { VercelRequest, VercelResponse } from '@vercel/node';

const PROJECT_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const RAW_ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS || process.env.SUPABASE_ALLOWED_ORIGINS || '';

const allowedOrigins = RAW_ALLOWED_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function getCorsOrigin(req: VercelRequest): string | undefined {
  const reqOrigin = (req.headers.origin || req.headers.referer) as string | undefined;
  if (!reqOrigin) return undefined;
  if (allowedOrigins.length === 0) return reqOrigin;
  if (allowedOrigins.includes(reqOrigin)) return reqOrigin;
  return undefined;
}

function setCorsHeaders(res: VercelResponse, origin?: string) {
  if (!origin) return;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'authorization, apikey, content-type, x-client-info',
  );
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
}

function getFunctionName(req: VercelRequest): string | undefined {
  const q = req.query.fn;
  if (typeof q === 'string' && q.trim().length > 0) {
    return q.trim();
  }

  const url = req.url || '';
  const path = url.split('?')[0];
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (last && last !== 'edge-proxy') {
    return last;
  }
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsOrigin = getCorsOrigin(req);

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, corsOrigin);
    res.status(204).end();
    return;
  }

  const fn = getFunctionName(req);

  if (!fn) {
    setCorsHeaders(res, corsOrigin);
    res.status(400).json({ error: 'missing_edge_function_name' });
    return;
  }

  if (!PROJECT_URL) {
    console.error('edge-proxy: missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL');
    setCorsHeaders(res, corsOrigin);
    res.status(500).json({ error: 'missing_supabase_url' });
    return;
  }

  const targetUrl = `${PROJECT_URL.replace(/\/+$/, '')}/functions/v1/${fn}`;

  // Build outgoing headers (drop transport/compression headers)
  const outgoingHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;
    const lower = key.toLowerCase();
    if (
      lower === 'host' ||
      lower === 'content-length' ||
      lower === 'content-encoding' ||
      lower === 'transfer-encoding' ||
      lower === 'connection' ||
      lower === 'keep-alive'
    ) {
      continue;
    }
    outgoingHeaders[key] = Array.isArray(value) ? String(value[0]) : String(value);
  }

  if (corsOrigin) {
    // Propagate Origin to Supabase for its own CORS/origin checks
    outgoingHeaders['origin'] = corsOrigin;
  }

  const method = req.method || 'POST';
  const needsBody = !['GET', 'HEAD'].includes(method.toUpperCase());

  let body: string | undefined;
  if (needsBody && req.body != null) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  try {
    const supabaseResponse = await fetch(targetUrl, {
      method,
      headers: outgoingHeaders,
      body: needsBody ? (body as any) : undefined,
    });

    const text = await supabaseResponse.text();

    // Apply our CORS headers
    setCorsHeaders(res, corsOrigin);

    // Only forward safe headers
    const contentType = supabaseResponse.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Forward the exact status (2xx/4xx/5xx) from Supabase
    res.status(supabaseResponse.status).send(text);
  } catch (error) {
    console.error('edge-proxy: network or internal error', error);
    setCorsHeaders(res, corsOrigin);
    res.status(502).json({ error: 'edge_proxy_network_error' });
  }
}

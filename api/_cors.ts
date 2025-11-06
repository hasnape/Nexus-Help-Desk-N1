import type { VercelRequest, VercelResponse } from '@vercel/node';

type CorsHeaders = Record<string, string>;

const STATIC_ALLOWED_ORIGINS = [
  'https://www.nexussupporthub.eu',
  'https://nexus-help-desk-n1.vercel.app',
  'http://localhost:5173',
];

function parseEnvList(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

const mergedOrigins = new Set<string>([
  ...STATIC_ALLOWED_ORIGINS,
  ...parseEnvList(process.env.ALLOWED_ORIGINS),
  ...parseEnvList(process.env.SUPABASE_ALLOWED_ORIGINS),
]);

function buildCorsHeaders(origin: string | null | undefined): CorsHeaders | null {
  if (!origin) {
    return { Vary: 'Origin' };
  }

  if (!mergedOrigins.has(origin)) {
    return null;
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  } satisfies CorsHeaders;
}

export function prepareCors(
  req: VercelRequest,
  res: VercelResponse,
): { finished: boolean; cors: CorsHeaders } {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  const cors = buildCorsHeaders(origin ?? null);

  if (req.method === 'OPTIONS') {
    const headers = cors ?? { Vary: 'Origin' };
    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
    res.status(204).end();
    return { finished: true, cors: headers };
  }

  if (origin && !cors) {
    res.setHeader('Vary', 'Origin');
    res.status(403).json({ error: 'forbidden' });
    return { finished: true, cors: { Vary: 'Origin' } };
  }

  const headers = cors ?? { Vary: 'Origin' };
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  return { finished: false, cors: headers };
}

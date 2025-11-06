// supabase/functions/_shared/cors.ts
export function getAllowedOrigins(env: Record<string,string|undefined>) {
  const raw = (env.ALLOWED_ORIGINS || env.SUPABASE_ALLOWED_ORIGINS || '').trim();
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// IMPORTANT: inclure 'apikey' (sinon le preflight bloque)
const ALLOW_HEADERS = 'authorization, apikey, content-type, x-client-info';

export function corsHeaders(origin: string | null, allowed: string[]) {
  const resolved = origin && allowed.includes(origin) ? origin : (allowed[0] || '*');
  return {
    'Access-Control-Allow-Origin': resolved,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': ALLOW_HEADERS,
    'Vary': 'Origin'
  };
}

export function handleOptions(req: Request, env: Record<string,string|undefined>) {
  const origin = req.headers.get('origin');
  const allowed = getAllowedOrigins(env);
  const isAllowed = !!origin && allowed.includes(origin);
  const headers = corsHeaders(origin, allowed);
  return new Response(null, { status: isAllowed ? 204 : 403, headers });
}

export function guardOriginOr403(req: Request, env: Record<string,string|undefined>) {
  const origin = req.headers.get('origin');
  const allowed = getAllowedOrigins(env);
  if (!origin || !allowed.includes(origin)) {
    const headers = corsHeaders(origin, allowed);
    return new Response(JSON.stringify({ error: 'ORIGIN_NOT_ALLOWED' }), { status: 403, headers });
  }
  return null; // ok
}

// Helper uniforme pour répondre JSON en ajoutant systématiquement CORS
export async function json(
  req: Request,
  env: Record<string,string|undefined>,
  body: unknown,
  status = 200,
  extraHeaders: Record<string,string> = {}
) {
  const origin = req.headers.get('origin');
  const headers = { 'Content-Type': 'application/json', ...corsHeaders(origin, getAllowedOrigins(env)), ...extraHeaders };
  return new Response(JSON.stringify(body), { status, headers });
}

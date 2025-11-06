// supabase/functions/_shared/cors.ts
export function getAllowedOrigins(env: Record<string, string | undefined>) {
  // Compat : on supporte ALLOWED_ORIGINS et l’ancienne SUPABASE_ALLOWED_ORIGINS
  const raw =
    env.ALLOWED_ORIGINS ||
    env.SUPABASE_ALLOWED_ORIGINS || // fallback legacy
    '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function corsHeaders(origin: string, allowed: string[]) {
  const resolved = allowed.includes(origin) ? origin : allowed[0] || '*';
  return {
    'Access-Control-Allow-Origin': resolved,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    // IMPORTANT : apikey requis côté Supabase, x-client-info requis par supabase-js
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Vary': 'Origin',
  };
}

export function handleOptions(req: Request, env: Record<string, string | undefined>) {
  const origin = req.headers.get('origin') ?? '';
  const allowed = getAllowedOrigins(env);
  const isAllowed = allowed.includes(origin);
  const headers = corsHeaders(isAllowed ? origin : origin, allowed);
  const status = isAllowed ? 204 : 403;
  return new Response(null, { status, headers });
}

export function guardOriginOr403(req: Request, env: Record<string, string | undefined>) {
  const origin = req.headers.get('origin') ?? '';
  const allowed = getAllowedOrigins(env);
  if (!allowed.includes(origin)) {
    const headers = corsHeaders(origin, allowed);
    return new Response(JSON.stringify({ error: 'ORIGIN_NOT_ALLOWED' }), { status: 403, headers });
  }
  // ok => appelant utilisera origin+allowed pour fixer les headers de la réponse finale
  return null as Response | null;
}

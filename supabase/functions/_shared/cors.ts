<<<<<<< HEAD
const parseOrigins = (value: string | undefined | null): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

const ALLOWED_ORIGINS = new Set([
  ...parseOrigins(Deno.env.get("STATIC_ALLOWED_ORIGINS")),
  ...parseOrigins(Deno.env.get("ALLOWED_ORIGINS")),
  ...parseOrigins(Deno.env.get("SUPABASE_ALLOWED_ORIGINS")),
]);

const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) {
    return ALLOWED_ORIGINS.size === 0;
  }
  if (ALLOWED_ORIGINS.size === 0) {
    return true;
  }
  return ALLOWED_ORIGINS.has(origin);
};

const getAllowOrigin = (origin: string | null): string => {
  if (origin && isOriginAllowed(origin)) {
    return origin;
  }
  if (ALLOWED_ORIGINS.size > 0) {
    return ALLOWED_ORIGINS.values().next().value as string;
  }
  return "*";
};

export const buildCorsHeaders = (origin: string | null): Record<string, string> => ({
  "Access-Control-Allow-Origin": getAllowOrigin(origin),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

export const handleCors = (req: Request): { headers: HeadersInit; origin: string | null } | Response => {
  const origin = req.headers.get("Origin") || req.headers.get("origin");
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildCorsHeaders(origin) });
  }
  if (!isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ ok: false, reason: "origin_not_allowed" }), {
      status: 403,
      headers: {
        ...buildCorsHeaders(origin),
        "Content-Type": "application/json",
      },
    });
  }
  return { headers: buildCorsHeaders(origin), origin };
};
=======
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
>>>>>>> origin/master

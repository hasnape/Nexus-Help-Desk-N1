// @ts-nocheck
// CORS helpers partagés pour toutes les Edge Functions Supabase

const STATIC_ALLOWED_ORIGINS = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
  "http://localhost:5173",
];

function parseEnvOrigins(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

// Compatibilité ALLOWED_ORIGINS et SUPABASE_ALLOWED_ORIGINS
const RUNTIME_ORIGINS = [
  ...parseEnvOrigins(Deno.env.get("ALLOWED_ORIGINS")),
  ...parseEnvOrigins(Deno.env.get("SUPABASE_ALLOWED_ORIGINS")),
];

const ALLOWED_ORIGINS = new Set<string>([
  ...STATIC_ALLOWED_ORIGINS,
  ...RUNTIME_ORIGINS,
]);

function buildCorsHeaders(origin: string | null): Record<string, string> {
  // Pas d'Origin (appel serveur → serveur) : on met juste Vary
  if (!origin) {
    return { Vary: "Origin" };
  }

  // Origin non autorisée → on ne donne pas d'Access-Control-Allow-Origin
  if (!ALLOWED_ORIGINS.has(origin)) {
    return { Vary: "Origin" };
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

/** Répond au préflight CORS (OPTIONS). Retourne null si ce n'est pas une OPTIONS. */
export function handleOptions(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;

  const origin = req.headers.get("Origin");
  const headers = buildCorsHeaders(origin);

  return new Response(null, {
    status: 204,
    headers,
  });
}

/**
 * Vérifie l'origine.
 * - Si Origin non autorisée → Response 403
 * - Sinon → renvoie les headers CORS (Record<string,string>)
 */
export function guardOriginOr403(
  req: Request,
): Response | Record<string, string> {
  const origin = req.headers.get("Origin");
  const headers = buildCorsHeaders(origin);

  // Origin présente mais pas dans la whitelist → 403
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return new Response("Forbidden", {
      status: 403,
      headers: { Vary: "Origin" },
    });
  }

  return headers;
}

/**
 * Helper JSON qui ajoute automatiquement les headers CORS fournis.
 */
export function json(
  body: unknown,
  statusOrInit?: number | ResponseInit,
  corsHeaders?: Record<string, string>,
): Response {
  let status = 200;
  let baseHeaders: HeadersInit = {};

  if (typeof statusOrInit === "number") {
    status = statusOrInit;
  } else if (typeof statusOrInit === "object" && statusOrInit !== null) {
    status = statusOrInit.status ?? 200;
    baseHeaders = statusOrInit.headers ?? {};
  }

  const headers: HeadersInit = {
    "content-type": "application/json; charset=utf-8",
    ...baseHeaders,
    ...(corsHeaders ?? {}),
  };

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

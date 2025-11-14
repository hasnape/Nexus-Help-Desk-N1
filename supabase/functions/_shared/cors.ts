// supabase/functions/_shared/cors.ts
// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

// Origines "de base" toujours autorisées
const STATIC_ALLOWED_ORIGINS = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
  "http://localhost:5173",
];

// Récupère une liste d'origines depuis une variable d'env (CSV)
function parseEnvOrigins(key: string): string[] {
  return (Deno.env.get(key) ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

// Compatibilité ALLOWED_ORIGINS + SUPABASE_ALLOWED_ORIGINS
const dynamicOrigins = [
  ...parseEnvOrigins("ALLOWED_ORIGINS"),
  ...parseEnvOrigins("SUPABASE_ALLOWED_ORIGINS"),
];

const ALLOWED_ORIGINS = new Set<string>([
  ...STATIC_ALLOWED_ORIGINS,
  ...dynamicOrigins,
]);

function buildCorsHeaders(origin: string | null): Record<string, string> | null {
  // Requête sans Origin (ex: server-to-server) → pas vraiment du CORS
  if (!origin) {
    return { Vary: "Origin" };
  }

  // Origin fournie mais non autorisée
  if (!ALLOWED_ORIGINS.has(origin)) {
    return null;
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

/**
 * Vérifie l'Origin :
 * - si non autorisée → Response 403
 * - sinon → retourne les headers CORS à utiliser dans la réponse
 */
export function guardOriginOr403(
  req: Request,
): Response | Record<string, string> {
  const origin = req.headers.get("Origin");
  const cors = buildCorsHeaders(origin);

  if (origin && !cors) {
    // Origin explicite mais interdite
    return new Response("Forbidden", {
      status: 403,
      headers: { Vary: "Origin" },
    });
  }

  // Pas d'origin (server-to-server) OU origin autorisée
  return cors ?? { Vary: "Origin" };
}

/**
 * Gère les requêtes OPTIONS (pré-vol CORS).
 * - Si ce n'est pas un OPTIONS → retourne null
 * - Si c'est un OPTIONS → retourne une Response 204 avec les bons headers CORS
 */
export function handleOptions(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;

  const guard = guardOriginOr403(req);
  if (guard instanceof Response) {
    // Origin interdite → on renvoie directement la 403
    return guard;
  }

  // Pré-vol accepté
  return new Response("ok", {
    status: 204,
    headers: guard,
  });
}

/**
 * Helper JSON qui ajoute automatiquement les headers CORS fournis.
 */
export function json(
  body: unknown,
  status = 200,
  cors: Record<string, string> = { Vary: "Origin" },
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...cors,
    },
  });
}

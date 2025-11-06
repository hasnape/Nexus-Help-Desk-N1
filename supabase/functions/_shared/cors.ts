// deno-lint-ignore-file no-explicit-any
const STATIC_ALLOWED_ORIGINS = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
  "http://localhost:5173",
];

function parseEnvList(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

const mergedOrigins = new Set<string>([
  ...STATIC_ALLOWED_ORIGINS,
  ...parseEnvList(Deno.env.get("ALLOWED_ORIGINS")),
  ...parseEnvList(Deno.env.get("SUPABASE_ALLOWED_ORIGINS")),
]);

export type CorsHeaders = Record<string, string>;

export function corsHeaders(origin: string | null): CorsHeaders | null {
  if (!origin) {
    return { Vary: "Origin" };
  }
  if (!mergedOrigins.has(origin)) {
    return null;
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  } satisfies CorsHeaders;
}

export function handleCors(req: Request): { cors: CorsHeaders; response: Response | null } {
  const origin = req.headers.get("Origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    const headers = cors ?? { Vary: "Origin" };
    return { cors: headers, response: new Response("ok", { status: 204, headers }) };
  }

  if (origin && !cors) {
    return { cors: { Vary: "Origin" }, response: new Response("Forbidden", { status: 403, headers: { Vary: "Origin" } }) };
  }

  return { cors: cors ?? { Vary: "Origin" }, response: null };
}

export function json(body: unknown, status = 200, cors: CorsHeaders = { Vary: "Origin" }): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json; charset=utf-8" },
  });
}

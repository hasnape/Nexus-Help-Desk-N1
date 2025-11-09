const STATIC_ALLOWED = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
  "http://localhost:5173",
];

function parseEnv(name: string) {
  return (Deno.env.get(name) ?? "").split(",").map(s=>s.trim()).filter(Boolean);
}

const ALLOWED = new Set<string>([...STATIC_ALLOWED, ...parseEnv("ALLOWED_ORIGINS")]);

export function corsHeaders(origin: string) {
  if (!origin || !ALLOWED.has(origin)) return { Vary: "Origin" } as Record<string,string>;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function handleOptions(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  return new Response("ok", { status: 204, headers: corsHeaders(origin) });
}

export function guardOriginOr403(req: Request): { cors: Record<string,string> } | Response {
  const origin = req.headers.get("Origin") ?? "";
  const cors = corsHeaders(origin);
  if (!("Access-Control-Allow-Origin" in cors)) {
    return new Response("Forbidden", { status: 403, headers: { Vary: "Origin" } });
  }
  return { cors };
}

export function json(body: unknown, status = 200, cors: Record<string,string> = { Vary: "Origin" }) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json; charset=utf-8" },
  });
}

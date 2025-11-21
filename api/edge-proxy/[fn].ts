// api/edge-proxy/[fn].ts
// Proxy générique Vercel → Supabase Edge Functions
// Ex : /api/edge-proxy/nexus-ai → https://...functions.supabase.co/functions/v1/nexus-ai

export const config = {
  runtime: "edge", // Edge Runtime
};

function jsonError(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function makeAllowedOrigins() {
  const staticOrigins = [
    "https://www.nexussupporthub.eu",
    "https://nexus-help-desk-n1.vercel.app",
    "http://localhost:5173",
  ];
  const dynamic =
    process.env.ALLOWED_ORIGINS || process.env.SUPABASE_ALLOWED_ORIGINS || "";
  const extra = dynamic
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return new Set([...staticOrigins, ...extra]);
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const allowedOrigins = makeAllowedOrigins();
  const incomingOrigin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    const cors = incomingOrigin && allowedOrigins.has(incomingOrigin)
      ? { "Access-Control-Allow-Origin": incomingOrigin, Vary: "Origin" }
      : { Vary: "Origin" };
    return new Response(null, {
      status: 204,
      headers: {
        ...cors,
        "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
      },
    });
  }

  // Récupère le nom de la function :
  // /api/edge-proxy/nexus-ai → "nexus-ai"
  const segments = url.pathname.split("/");
  const fn = segments[segments.length - 1] || segments[segments.length - 2];

  if (!fn) {
    return jsonError("Missing function name in URL.", 400);
  }

  const baseFromEnv =
    process.env.SUPABASE_FUNCTIONS_URL ||
    (process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.replace(/\/$/, "")}/functions/v1` : "");

  if (!baseFromEnv) {
    return jsonError(
      "SUPABASE_FUNCTIONS_URL is not configured in Vercel environment.",
      500
    );
  }

  const functionsBase = baseFromEnv.replace(/\/$/, "");
  const targetUrl = `${functionsBase}/${fn}`;

  const forwardHeaders = new Headers(req.headers);
  if (incomingOrigin) {
    forwardHeaders.set("origin", incomingOrigin);
  } else {
    forwardHeaders.delete("origin");
  }

  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (!forwardHeaders.has("authorization") && !anonKey) {
    return jsonError(
      "Missing Authorization header and no anon key configured on the proxy.",
      500,
    );
  }

  if (anonKey && !forwardHeaders.has("apikey")) {
    forwardHeaders.set("apikey", anonKey);
  }
  if (anonKey && !forwardHeaders.has("authorization")) {
    forwardHeaders.set("authorization", `Bearer ${anonKey}`);
  }

  const method = req.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await req.text();

  try {
    const supabaseResponse = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
    });

    const respHeaders = new Headers(supabaseResponse.headers);
    const corsOrigin =
      incomingOrigin && allowedOrigins.has(incomingOrigin)
        ? incomingOrigin
        : undefined;

    if (!respHeaders.has("Access-Control-Allow-Origin") && corsOrigin) {
      respHeaders.set("Access-Control-Allow-Origin", corsOrigin);
      respHeaders.set("Vary", "Origin");
    }

    return new Response(supabaseResponse.body, {
      status: supabaseResponse.status,
      headers: respHeaders,
    });
  } catch (err: any) {
    console.error("Edge proxy error for fn:", fn, err);
    return jsonError(
      `Edge proxy error while calling Supabase function "${fn}".`,
      502
    );
  }
}

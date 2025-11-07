import {
  createAllowedOriginSet,
  isOriginAllowed,
  resolveAllowOrigin,
} from "./originUtils.ts";

const ALLOWED_ORIGINS = createAllowedOriginSet(
  Deno.env.get("STATIC_ALLOWED_ORIGINS"),
  Deno.env.get("ALLOWED_ORIGINS"),
  Deno.env.get("SUPABASE_ALLOWED_ORIGINS")
);

export const buildCorsHeaders = (origin: string | null): Record<string, string> => ({
  "Access-Control-Allow-Origin": resolveAllowOrigin(origin, ALLOWED_ORIGINS),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

export const handleCors = (req: Request): { headers: HeadersInit; origin: string | null } | Response => {
  const origin = req.headers.get("Origin") || req.headers.get("origin");
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildCorsHeaders(origin) });
  }
  if (!isOriginAllowed(origin, ALLOWED_ORIGINS)) {
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

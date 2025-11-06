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

import type { VercelRequest, VercelResponse } from "@vercel/node";

const parseOrigins = (value?: string | string[] | null): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => entry.split(","))
      .map((origin) => origin.trim())
      .filter(Boolean);
  }
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const buildAllowedOrigins = (): Set<string> => {
  return new Set([
    ...parseOrigins(process.env.STATIC_ALLOWED_ORIGINS),
    ...parseOrigins(process.env.ALLOWED_ORIGINS),
    ...parseOrigins(process.env.SUPABASE_ALLOWED_ORIGINS),
  ]);
};

const allowedOrigins = buildAllowedOrigins();

export const isOriginAllowed = (origin?: string | null): boolean => {
  if (!origin) {
    return allowedOrigins.size === 0;
  }
  if (allowedOrigins.size === 0) {
    return true;
  }
  return allowedOrigins.has(origin);
};

const resolveAllowOrigin = (origin?: string | null): string => {
  if (origin && isOriginAllowed(origin)) {
    return origin;
  }
  if (allowedOrigins.size > 0) {
    return Array.from(allowedOrigins)[0];
  }
  return "*";
};

export const applyCors = (req: VercelRequest, res: VercelResponse): boolean => {
  const origin = (req.headers["origin"] as string | undefined) ?? null;
  res.setHeader("Access-Control-Allow-Origin", resolveAllowOrigin(origin));
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  if (!isOriginAllowed(origin)) {
    res.status(403).json({ ok: false, reason: "origin_not_allowed" });
    return true;
  }

  return false;
};

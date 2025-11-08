import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createAllowedOriginSet,
  isOriginAllowed as isOriginAllowedInternal,
  resolveAllowOrigin as resolveAllowOriginInternal,
} from "../supabase/functions/_shared/originUtils";

export const allowedOrigins = createAllowedOriginSet(
  process.env.STATIC_ALLOWED_ORIGINS,
  process.env.ALLOWED_ORIGINS,
  process.env.SUPABASE_ALLOWED_ORIGINS
);

export const isOriginAllowed = (origin?: string | null): boolean =>
  isOriginAllowedInternal(origin, allowedOrigins);

export const resolveAllowOrigin = (origin?: string | null): string =>
  resolveAllowOriginInternal(origin, allowedOrigins);

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

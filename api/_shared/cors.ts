// api/_shared/cors.ts
import { filterBlockedOrigins, isOriginBlocked } from "../../shared/blockedOrigins";

export function getAllowedOrigins() {
  const raw = (process.env.ALLOWED_ORIGINS || process.env.SUPABASE_ALLOWED_ORIGINS || '').trim();
  return filterBlockedOrigins(raw.split(',').map(s => s.trim()).filter(Boolean));
}

const ALLOW_HEADERS = 'authorization, apikey, content-type, x-client-info';

export function corsHeaders(origin: string | null) {
  const allowed = getAllowedOrigins();
  const safeOrigin = origin && !isOriginBlocked(origin) ? origin : null;
  const resolved = safeOrigin && allowed.includes(safeOrigin) ? safeOrigin : (allowed[0] || '*');
  return {
    'Access-Control-Allow-Origin': resolved,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': ALLOW_HEADERS,
    'Vary': 'Origin'
  };
}

export function preflight(req: Request) {
  const origin = req.headers.get('origin');
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

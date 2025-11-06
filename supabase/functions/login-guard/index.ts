// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  handleOptions,
  guardOriginOr403,
  getAllowedOrigins,
  corsHeaders,
} from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

function jsonResponse(body: unknown, status: number, baseHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" },
  });
}

serve(async (req) => {
  const env = Deno.env.toObject();
  if (req.method === "OPTIONS") return handleOptions(req, env);
  const block = guardOriginOr403(req, env);
  if (block) return block;
  const origin = req.headers.get("origin") ?? "";
  const allowed = getAllowedOrigins(env);
  const baseHeaders = corsHeaders(origin, allowed);

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405, baseHeaders);
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const email = String(body?.email ?? "").trim();
  const company = String(body?.company ?? "").trim();

  if (!email || !company) {
    return jsonResponse({ ok: false, error: "missing_fields" }, 400, baseHeaders);
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await supabase.rpc("prelogin_check_company", {
    p_email: email,
    p_company_name: company,
  });

  if (error) {
    return jsonResponse({ ok: false, error: "rpc_failed" }, 500, baseHeaders);
  }

  if (!data?.allowed) {
    return jsonResponse({ ok: false, reason: data?.reason ?? "forbidden" }, 403, baseHeaders);
  }

  return jsonResponse({ ok: true }, 200, baseHeaders);
});

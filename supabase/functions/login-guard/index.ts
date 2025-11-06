// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { handleOptions, guardOriginOr403, json } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  const env = Deno.env.toObject();
  if (req.method === "OPTIONS") return handleOptions(req, env);
  const block = guardOriginOr403(req, env);
  if (block) return block;

  if (req.method !== "POST") {
    return json(req, env, { ok: false, error: "method_not_allowed" }, 405);
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
    return json(req, env, { ok: false, error: "missing_fields" }, 400);
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await supabase.rpc("prelogin_check_company", {
    p_email: email,
    p_company_name: company,
  });

  if (error) {
    return json(req, env, { ok: false, error: "rpc_failed" }, 500);
  }

  if (!data?.allowed) {
    return json(req, env, { ok: false, reason: data?.reason ?? "forbidden" }, 403);
  }

  return json(req, env, { ok: true });
});

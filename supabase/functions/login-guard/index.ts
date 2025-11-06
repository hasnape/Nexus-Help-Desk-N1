// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { handleCors, json } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  const { cors, response } = handleCors(req);
  if (response) {
    return response;
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405, cors);
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
    return json({ ok: false, error: "missing_fields" }, 400, cors);
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await supabase.rpc("prelogin_check_company", {
    p_email: email,
    p_company_name: company,
  });

  if (error) {
    return json({ ok: false, error: "rpc_failed" }, 500, cors);
  }

  if (!data?.allowed) {
    return json({ ok: false, reason: data?.reason ?? "forbidden" }, 403, cors);
  }

  return json({ ok: true }, 200, cors);
});

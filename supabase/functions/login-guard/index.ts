// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STATIC_ALLOWED_ORIGINS = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
  "http://localhost:5173",
];

const additionalOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

const ALLOWED_ORIGINS = new Set<string>([...STATIC_ALLOWED_ORIGINS, ...additionalOrigins]);

function corsHeaders(origin: string | null) {
  if (!origin) return { Vary: "Origin" } as Record<string, string>;
  if (!ALLOWED_ORIGINS.has(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  } as Record<string, string>;
}

function json(body: unknown, status = 200, cors: Record<string, string> = { Vary: "Origin" }) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json; charset=utf-8" },
  });
}

const SUPABASE_URL = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 204, headers: cors ?? { Vary: "Origin" } });
  }

  if (origin && !cors) {
    return new Response("Forbidden", { status: 403, headers: { Vary: "Origin" } });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405, cors ?? { Vary: "Origin" });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const email = String(body?.email ?? "").trim();
  const company = String(body?.company ?? "").trim();

  if (!email || !company) {
    return json({ ok: false, error: "missing_fields" }, 400, cors ?? { Vary: "Origin" });
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await supabase.rpc("prelogin_check_company", {
    p_email: email,
    p_company_name: company,
  });

  if (error) {
    return json({ ok: false, error: error.message ?? "rpc_failed" }, 500, cors ?? { Vary: "Origin" });
  }

  if (!data?.allowed) {
    return json({ ok: false, reason: data?.reason ?? "forbidden" }, 403, cors ?? { Vary: "Origin" });
  }

  return json({ ok: true }, 200, cors ?? { Vary: "Origin" });
});

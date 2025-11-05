// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS
const STATIC_ALLOWED_ORIGINS = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
  "http://localhost:5173",
] as const;

const additionalOrigins = (
  Deno.env.get("ALLOWED_ORIGINS") ??
  Deno.env.get("SUPABASE_ALLOWED_ORIGINS") ??
  ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED = new Set<string>([...STATIC_ALLOWED_ORIGINS, ...additionalOrigins]);

function cors(origin: string | null) {
  if (!origin || !ALLOWED.has(origin)) return { headers: { Vary: "Origin" }, ok: false } as const;
  return {
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    },
    ok: true,
  } as const;
}

function json(body: unknown, status = 200, headers: Record<string, string> = { Vary: "Origin" }) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "content-type": "application/json; charset=utf-8" } });
}

// Env
const SUPABASE_URL = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const c = cors(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers: c.ok ? c.headers : { Vary: "Origin" } });
  if (!c.ok) return new Response("Forbidden", { status: 403, headers: { Vary: "Origin" } });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, c.headers);

  let body: any = {};
  try { body = await req.json(); } catch {}

  // Deux modes possibles :
  // - PRELOGIN (par défaut si email+company fournis) : RPC `prelogin_check_company`
  // - SESSION  (si pas d'email/company)           : vérifie JWT + profil/role/société
  const isPrelogin = !!(body?.email && body?.company);
  if (isPrelogin) {
    const supabase = createClient(SUPABASE_URL, ANON_KEY); // RPC avec GRANT anon
    const { data, error } = await supabase.rpc("prelogin_check_company", {
      p_email: String(body.email),
      p_company_name: String(body.company),
    });
    if (error) return json({ ok: false, error: error.message }, 500, c.headers);
    if (!data?.allowed) return json({ ok: false, reason: data?.reason ?? "forbidden" }, 403, c.headers);
    return json({ ok: true, mode: "prelogin" }, 200, c.headers);
  }

  // SESSION mode
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: authData, error: authErr } = await userClient.auth.getUser();
  if (authErr || !authData?.user) return json({ ok: false, error: "unauthorized" }, 401, c.headers);

  const requireRoleRaw = body.require_role as string | string[] | undefined;
  const requireCompany = Boolean(body.require_company);
  const requireEmailConfirmed = Boolean(body.require_email_confirmed);

  if (requireEmailConfirmed && !authData.user.email_confirmed_at) {
    return json({ ok: false, error: "email_not_confirmed" }, 403, c.headers);
  }

  const { data: me, error: meErr } = await admin
    .from("users")
    .select("auth_uid, email, role, company_id, full_name")
    .eq("auth_uid", authData.user.id)
    .single();

  if (meErr || !me) return json({ ok: false, error: "profile_not_found" }, 404, c.headers);

  const validRoles = new Set(["manager", "agent", "user"]);
  if (!validRoles.has(String(me.role))) {
    return json({ ok: false, error: "invalid_profile_role" }, 403, c.headers);
  }

  if (requireRoleRaw) {
    const required = Array.isArray(requireRoleRaw)
      ? requireRoleRaw.map((r) => String(r).toLowerCase())
      : [String(requireRoleRaw).toLowerCase()];
    const okRole = required.some((r) => validRoles.has(r) && r === me.role);
    if (!okRole) return json({ ok: false, error: "forbidden_role" }, 403, c.headers);
  }

  if (requireCompany && !me.company_id) {
    return json({ ok: false, error: "no_company" }, 403, c.headers);
  }

  return json(
    { ok: true, mode: "session", user: { auth_uid: me.auth_uid, email: me.email, role: me.role, company_id: me.company_id, full_name: me.full_name } },
    200,
    c.headers,
  );
});

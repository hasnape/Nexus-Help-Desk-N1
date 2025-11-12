// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set<string>([
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
]);

function corsHeaders(origin: string) {
  if (!ALLOWED_ORIGINS.has(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status = 200, origin?: string) {
  const base = origin ? corsHeaders(origin) ?? {} : {};
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...base, "content-type": "application/json; charset=utf-8" },
  });
}

serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";
  const cors = corsHeaders(origin);
  if (!cors) return new Response("Forbidden", { status: 403 });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceKey);

  // 1) Caller must be authenticated
  const { data: authData, error: authErr } = await userClient.auth.getUser();
  if (authErr || !authData?.user) return json({ error: "unauthorized" }, 401, origin);

  // 2) Caller must be manager and have a company_id
  const { data: meRow, error: meErr } = await admin
    .from("users")
    .select("id, role, company_id")
    .eq("auth_uid", authData.user.id)
    .single();
  if (meErr || !meRow) return json({ error: "profile_not_found" }, 403, origin);
  if (meRow.role !== "manager") return json({ error: "forbidden" }, 403, origin);

  // 3) Parse body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const mode = (body.mode === "create" ? "create" : "invite") as "invite" | "create";
  const email = String(body.email || "").trim().toLowerCase();
  const full_name = String(body.full_name || "").trim();
  const role = String(body.role || "");
  const language_preference = ["fr", "en", "ar"].includes(body.language_preference)
    ? body.language_preference
    : "fr";

  if (!email || !full_name || !role) return json({ error: "missing_fields" }, 400, origin);
  if (!["agent", "user"].includes(role)) return json({ error: "invalid_role" }, 400, origin);

  // 4) Agent cap if role=agent
  if (role === "agent") {
    const { data: comp, error: cErr } = await admin
      .from("companies")
      .select("plan_id")
      .eq("id", meRow.company_id)
      .single();
    if (cErr || !comp) return json({ error: "company_not_found" }, 400, origin);

    const { data: plan, error: pErr } = await admin
      .from("plans")
      .select("max_agents")
      .eq("id", comp.plan_id)
      .single();
    if (pErr || !plan) return json({ error: "plan_not_found" }, 400, origin);

    const { count: agentCount, error: cntErr } = await admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("company_id", meRow.company_id)
      .eq("role", "agent");
    if (cntErr) return json({ error: "count_failed" }, 500, origin);

    const maxAgents = plan.max_agents ?? 0;
    if ((agentCount ?? 0) >= maxAgents) {
      return json({ error: "agent_limit_reached", details: { agentCount, maxAgents } }, 409, origin);
    }
  }

  if (mode === "invite") {
    const fallbackRedirectOrigin =
      Deno.env.get("FRONTEND_URL") ?? "https://www.nexussupporthub.eu";
    const redirectOrigin = origin || fallbackRedirectOrigin;
    const redirectTo = new URL("/#/login", redirectOrigin).toString();

    const { data: invite, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { company_id: meRow.company_id, role, language_preference },
      redirectTo,
    });
    if (invErr || !invite?.user) return json({ error: "invite_failed", details: invErr?.message }, 500, origin);

    const auth_uid = invite.user.id;
    const { error: insErr } = await admin.from("users").insert({
      auth_uid,
      email,
      full_name,
      role,
      language_preference,
      company_id: meRow.company_id,
    });
    if (insErr) return json({ error: "profile_insert_failed", details: insErr.message }, 409, origin);

    return json({ ok: true, mode, user_id: auth_uid }, 200, origin);
  }

  const password = String(body.password || "");
  const password_confirm = String(body.password_confirm || "");
  if (password.length < 8) return json({ error: "weak_password" }, 400, origin);
  if (password !== password_confirm) return json({ error: "password_mismatch" }, 400, origin);

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { company_id: meRow.company_id, role, language_preference },
  });
  if (createErr || !created?.user) return json({ error: "create_failed", details: createErr?.message }, 500, origin);

  const auth_uid = created.user.id;
  const { error: insErr } = await admin.from("users").insert({
    auth_uid,
    email,
    full_name,
    role,
    language_preference,
    company_id: meRow.company_id,
  });
  if (insErr) return json({ error: "profile_insert_failed", details: insErr.message }, 409, origin);

  return json({ ok: true, mode, user_id: auth_uid }, 200, origin);
});

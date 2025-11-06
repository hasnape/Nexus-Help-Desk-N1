// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { handleCors, json } from "../_shared/cors.ts";

serve(async (req) => {
  const { cors, response } = handleCors(req);
  if (response) {
    return response;
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, cors);
  }

  // Secrets (sans préfixe) + fallback
  const supabaseUrl = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey =
    Deno.env.get("NSH_SERVICE_ROLE_KEY") ??
    Deno.env.get("SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "https://www.nexussupporthub.eu";

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceKey);

  // Vérif appel authentifié
  const { data: authData, error: authErr } = await userClient.auth.getUser();
  if (authErr || !authData?.user) return json({ error: "unauthorized" }, 401, cors);

  // Vérifier que le caller est manager et rattaché à une société
  const { data: meRow, error: meErr } = await admin
    .from("users")
    .select("id, role, company_id")
    .eq("auth_uid", authData.user.id)
    .single();

  if (meErr || !meRow) return json({ error: "profile_not_found" }, 403, cors);
  if (meRow.role !== "manager") return json({ error: "forbidden" }, 403, cors);
  if (!meRow.company_id) return json({ error: "no_company" }, 400, cors);

  // Parsing body
  let body: any = {};
  try {
    body = await req.json();
  } catch { /* ignore */ }

  const mode = (body.mode === "create" ? "create" : "invite") as "invite" | "create";
  const email = String(body.email || "").trim().toLowerCase();
  const full_name = String(body.full_name || "").trim();
  const roleRaw = String(body.role || "").toLowerCase();
  const role = ["agent", "user"].includes(roleRaw) ? roleRaw : "user";
  const language_preference =
    ["fr", "en", "ar"].includes(String(body.language_preference || "").toLowerCase())
      ? String(body.language_preference).toLowerCase()
      : "fr";

  if (!email || !full_name) return json({ error: "missing_fields" }, 400, cors);
  if (!["agent", "user"].includes(role)) return json({ error: "invalid_role" }, 400, cors);

  // Quota agents
  if (role === "agent") {
    const { data: comp, error: cErr } = await admin
      .from("companies")
      .select("plan_id")
      .eq("id", meRow.company_id)
      .single();
    if (cErr || !comp) return json({ error: "company_not_found" }, 400, cors);

    const { data: plan, error: pErr } = await admin
      .from("plans")
      .select("max_agents")
      .eq("id", comp.plan_id)
      .single();
    if (pErr || !plan) return json({ error: "plan_not_found" }, 400, cors);

    const { count: agentCount, error: cntErr } = await admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("company_id", meRow.company_id)
      .eq("role", "agent");
    if (cntErr) return json({ error: "count_failed" }, 500, cors);

    const maxAgents = plan.max_agents ?? 0;
    if ((agentCount ?? 0) >= maxAgents) {
      return json({ error: "agent_limit_reached", details: { agentCount, maxAgents } }, 409, cors);
    }
  }

  if (mode === "invite") {
    const { data: invite, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { company_id: meRow.company_id, role, language_preference },
      redirectTo: `${FRONTEND_URL}/#/login`,
    });
    if (invErr || !invite?.user) return json({ error: "invite_failed", details: invErr?.message }, 500, cors);

    const auth_uid = invite.user.id;
    const { error: upErr } = await admin.from("users").upsert(
      { auth_uid, email, full_name, role, language_preference, company_id: meRow.company_id },
      { onConflict: "auth_uid" },
    );
    if (upErr) return json({ error: "profile_upsert_failed", details: upErr.message }, 409, cors);

    return json({ ok: true, mode, user_id: auth_uid }, 200, cors);
  }

  // Mode création : vérification mot de passe
  const password = String(body.password || "");
  const password_confirm = String(body.password_confirm || "");
  if (password.length < 8) return json({ error: "weak_password" }, 400, cors);
  if (password !== password_confirm) return json({ error: "password_mismatch" }, 400, cors);

  // Créer utilisateur avec mot de passe
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { company_id: meRow.company_id, role, language_preference },
  });
  if (createErr || !created?.user) return json({ error: "create_failed", details: createErr?.message }, 500, cors);

  const auth_uid = created.user.id;
  const { error: upErr } = await admin.from("users").upsert(
    { auth_uid, email, full_name, role, language_preference, company_id: meRow.company_id },
    { onConflict: "auth_uid" },
  );
  if (upErr) return json({ error: "profile_upsert_failed", details: upErr.message }, 409, cors);

  return json({ ok: true, mode, user_id: auth_uid }, 200, cors);
});

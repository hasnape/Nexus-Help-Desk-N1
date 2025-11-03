// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: authData, error: authErr } = await userClient.auth.getUser();
  if (authErr || !authData?.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });

  // Caller must be a manager
  const { data: meRow, error: meErr } = await admin
    .from("users")
    .select("id, role, company_id")
    .eq("auth_uid", authData.user.id)
    .single();
  if (meErr || !meRow) return new Response(JSON.stringify({ error: "profile_not_found" }), { status: 403 });
  if (meRow.role !== "manager") return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const full_name = String(body.full_name || "").trim();
  const role = String(body.role || "");
  const language_preference = ["fr", "en", "ar"].includes(body.language_preference) ? body.language_preference : "fr";

  if (!email || !full_name || !role) {
    return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400 });
  }
  if (!["agent", "user"].includes(role)) {
    return new Response(JSON.stringify({ error: "invalid_role" }), { status: 400 });
  }

  // Enforce agent cap if creating an agent
  if (role === "agent") {
    const { data: comp, error: cErr } = await admin
      .from("companies")
      .select("plan_id")
      .eq("id", meRow.company_id)
      .single();
    if (cErr || !comp) return new Response(JSON.stringify({ error: "company_not_found" }), { status: 400 });

    const { data: plan, error: pErr } = await admin
      .from("plans")
      .select("max_agents")
      .eq("id", comp.plan_id)
      .single();
    if (pErr || !plan) return new Response(JSON.stringify({ error: "plan_not_found" }), { status: 400 });

    const { count: agentCount, error: cntErr } = await admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("company_id", meRow.company_id)
      .eq("role", "agent");
    if (cntErr) return new Response(JSON.stringify({ error: "count_failed" }), { status: 500 });

    const maxAgents = plan.max_agents ?? 0;
    if ((agentCount ?? 0) >= maxAgents) {
      return new Response(JSON.stringify({ error: "agent_limit_reached", details: { agentCount, maxAgents } }), { status: 409 });
    }
  }

  // Send invitation (user sets password via email)
  const { data: invite, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { company_id: meRow.company_id, role },
    redirectTo: `${new URL(req.url).origin}/#/login`,
  });
  if (invErr || !invite?.user) {
    return new Response(JSON.stringify({ error: "invite_failed", details: invErr?.message }), { status: 500 });
  }

  const auth_uid = invite.user.id;
  // Insert profile
  const { error: insErr } = await admin.from("users").insert({
    auth_uid,
    email,
    full_name,
    role,
    language_preference,
    company_id: meRow.company_id,
  });
  if (insErr) {
    // Likely unique violation on email
    return new Response(JSON.stringify({ error: "profile_insert_failed", details: insErr.message }), { status: 409 });
  }

  return new Response(JSON.stringify({ ok: true, user_id: auth_uid }), { headers: { "content-type": "application/json" } });
});

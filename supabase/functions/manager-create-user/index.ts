// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleOptions, guardOriginOr403, json } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  // 1) Pré-vol CORS
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  // 2) Vérifier l'origine + récupérer les headers CORS
  const guardResult = guardOriginOr403(req);
  if (guardResult instanceof Response) {
    // Origin non autorisée → 403 déjà prêt
    return guardResult;
  }
  const cors = guardResult as Record<string, string>;



  // 3) Méthode HTTP
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, cors);
  }

  try {
    // 4) Secrets (sans préfixe) + fallbacks
    const supabaseUrl =
      Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL");
    const anonKey =
      Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey =
      Deno.env.get("NSH_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const FRONTEND_URL =
      Deno.env.get("FRONTEND_URL") ?? "https://www.nexussupporthub.eu";

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.error("manager-create-user: missing env vars", {
        supabaseUrl: !!supabaseUrl,
        anonKey: !!anonKey,
        serviceKey: !!serviceKey,
      });
      return json({ error: "env_not_configured" }, 500, cors);
    }

    // 5) Clients Supabase
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    // 6) Vérif appel authentifié
    const { data: authData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !authData?.user) {
      console.error("manager-create-user: unauthorized", authErr);
      return json({ error: "unauthorized" }, 401, cors);
    }

    // 7) Vérifier que le caller est manager et rattaché à une société
    const { data: meRow, error: meErr } = await admin
      .from("users")
      .select("id, role, company_id")
      .eq("auth_uid", authData.user.id)
      .single();

    if (meErr || !meRow) {
      console.error("manager-create-user: profile_not_found", meErr);
      return json({ error: "profile_not_found" }, 403, cors);
    }
    if (meRow.role !== "manager") {
      return json({ error: "forbidden" }, 403, cors);
    }
    if (!meRow.company_id) {
      return json({ error: "no_company" }, 400, cors);
    }

    // 8) Parsing body
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // body reste {}
    }

    const mode = (body.mode === "create" ? "create" : "invite") as
      | "invite"
      | "create";
    const email = String(body.email || "").trim().toLowerCase();
    const full_name = String(body.full_name || "").trim();
    const roleRaw = String(body.role || "").toLowerCase();
    const role = ["agent", "user"].includes(roleRaw) ? roleRaw : "user";
    const language_preference =
      ["fr", "en", "ar"].includes(
        String(body.language_preference || "").toLowerCase(),
      )
        ? String(body.language_preference).toLowerCase()
        : "fr";

    if (!email || !full_name) {
      return json({ error: "missing_fields" }, 400, cors);
    }
    if (!["agent", "user"].includes(role)) {
      return json({ error: "invalid_role" }, 400, cors);
    }

    // 9) Quota agents (selon plan de la company)
    if (role === "agent") {
      const { data: comp, error: cErr } = await admin
        .from("companies")
        .select("plan_id")
        .eq("id", meRow.company_id)
        .single();
      if (cErr || !comp) {
        console.error("manager-create-user: company_not_found", cErr);
        return json({ error: "company_not_found" }, 400, cors);
      }

      const { data: plan, error: pErr } = await admin
        .from("plans")
        .select("max_agents")
        .eq("id", comp.plan_id)
        .single();
      if (pErr || !plan) {
        console.error("manager-create-user: plan_not_found", pErr);
        return json({ error: "plan_not_found" }, 400, cors);
      }

      const { count: agentCount, error: cntErr } = await admin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("company_id", meRow.company_id)
        .eq("role", "agent");

      if (cntErr) {
        console.error("manager-create-user: count_failed", cntErr);
        return json({ error: "count_failed" }, 500, cors);
      }

      const maxAgents = plan.max_agents ?? 0;
      if ((agentCount ?? 0) >= maxAgents) {
        return json(
          { error: "agent_limit_reached", details: { agentCount, maxAgents } },
          409,
          cors,
        );
      }
    }

    // 10) Mode INVITE : envoi d'une invitation par email
    if (mode === "invite") {
      const { data: invite, error: invErr } =
        await admin.auth.admin.inviteUserByEmail(email, {
          data: {
            company_id: meRow.company_id,
            role,
            language_preference,
          },
          redirectTo: `${FRONTEND_URL}/#/login`,
        });

      if (invErr || !invite?.user) {
        console.error("manager-create-user: invite_failed", invErr);
        return json(
          { error: "invite_failed", details: invErr?.message },
          500,
          cors,
        );
      }

      const auth_uid = invite.user.id;

      const { error: upErr } = await admin.from("users").upsert(
        {
          auth_uid,
          email,
          full_name,
          role,
          language_preference,
          company_id: meRow.company_id,
        },
        { onConflict: "auth_uid" },
      );

      if (upErr) {
        console.error("manager-create-user: profile_upsert_failed", upErr);
        return json(
          { error: "profile_upsert_failed", details: upErr.message },
          409,
          cors,
        );
      }

      return json({ ok: true, mode, user_id: auth_uid }, 200, cors);
    }

    // 11) Mode CREATE : création directe avec mot de passe
    const password = String(body.password || "");
    const password_confirm = String(body.password_confirm || "");

    if (password.length < 8) {
      return json({ error: "weak_password" }, 400, cors);
    }
    if (password !== password_confirm) {
      return json({ error: "password_mismatch" }, 400, cors);
    }

    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          company_id: meRow.company_id,
          role,
          language_preference,
        },
      });

    if (createErr || !created?.user) {
      console.error("manager-create-user: create_failed", createErr);
      return json(
        { error: "create_failed", details: createErr?.message },
        500,
        cors,
      );
    }

    const auth_uid = created.user.id;

    const { error: upErr } = await admin.from("users").upsert(
      {
        auth_uid,
        email,
        full_name,
        role,
        language_preference,
        company_id: meRow.company_id,
      },
      { onConflict: "auth_uid" },
    );

    if (upErr) {
      console.error("manager-create-user: profile_upsert_failed", upErr);
      return json(
        { error: "profile_upsert_failed", details: upErr.message },
        409,
        cors,
      );
    }

    return json({ ok: true, mode, user_id: auth_uid }, 200, cors);
  } catch (e) {
    console.error("manager-create-user: unexpected_error", e);
    return json(
      {
        error: "internal_error",
        message: e instanceof Error ? e.message : String(e),
      },
      500,
      cors,
    );
  }
});

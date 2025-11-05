// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STATIC_ALLOWED_ORIGINS = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
];

const extraOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const ALLOWED_ORIGINS = new Set<string>(
  [...STATIC_ALLOWED_ORIGINS, ...extraOrigins]
    .map((origin) => origin.replace(/\/$/, "").toLowerCase())
);

function corsHeaders(origin: string | null) {
  if (!origin) return { Vary: "Origin" };
  const normalizedOrigin = origin.replace(/\/$/, "").toLowerCase();
  if (!ALLOWED_ORIGINS.has(normalizedOrigin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
function json(body: unknown, status = 200, headers: Record<string,string> = { Vary: "Origin" }) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "content-type": "application/json; charset=utf-8" } });
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const cors = corsHeaders(origin);
  if (origin && !cors) return new Response("Forbidden", { status: 403, headers: { Vary: "Origin" } });
  if (req.method === "OPTIONS") {
    const headers = cors ?? { Vary: "Origin" };
    return new Response("", { status: 200, headers });
  }
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors ?? { Vary: "Origin" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY")!; // <— NOTE: pas de préfixe SUPABASE_ dans la UI

  const admin = createClient(supabaseUrl, serviceKey);

  let body: any = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const {
    email, fullName, password, role,
    companyName, language = "fr",
    plan,         // "freemium" | "standard" | "pro"  (si manager)
    secretCode,   // requis si plan = standard/pro
  } = body ?? {};

  // Validations génériques
  if (!email || !fullName || !password || !role || !companyName) {
    return json({ error: "missing_fields" }, 400, cors ?? { Vary: "Origin" });
  }
  if (String(password).length < 6) {
    return json({ error: "weak_password" }, 400, cors ?? { Vary: "Origin" });
  }
  const safeLang = ["fr","en","ar"].includes(language) ? language : "fr";
  const lowerCompany = String(companyName).trim().toLowerCase();

  // Helpers
  async function getCompanyByNameInsensitive(nameLower: string) {
    const { data, error } = await admin
      .from("companies")
      .select("id, name, plan_id")
      .limit(1)
      .ilike("name", nameLower); // case-insensitive exact-ish
    if (error) return { error };
    // Comme ilike "abc" matchera "abc", mais pour exact insensitive, on filtre:
    const row = (data ?? []).find(r => (r.name ?? "").toLowerCase() === nameLower) || null;
    return { data: row };
  }

  async function ensurePlanId(planKey: "freemium" | "standard" | "pro") {
    const { data, error } = await admin.from("plans").select("id,name").eq("name", planKey).single();
    if (error || !data?.id) return null;
    return data.id as number;
  }

  // Branches par rôle
  if (role === "manager") {
    const planKey = plan === "standard" || plan === "pro" ? plan : "freemium";
    const { data: existing } = await getCompanyByNameInsensitive(lowerCompany);
    if (planKey === "freemium") {
      // Interdit d'écraser une société existante
      if (existing) return json({ error: "company_name_taken" }, 409, cors ?? { Vary: "Origin" });

      const planId = await ensurePlanId("freemium");
      if (!planId) return json({ error: "plan_not_found" }, 400, cors ?? { Vary: "Origin" });

      // 1) Crée auth user (email confirmé ici, à adapter)
      const { data: auth, error: aErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { role: "manager", language_preference: safeLang }
      });
      if (aErr || !auth?.user) return json({ error: "auth_create_failed", details: aErr?.message }, 500, cors ?? { Vary: "Origin" });

      const auth_uid = auth.user.id;

      // 2) Crée la société
      const { data: comp, error: cErr } = await admin
        .from("companies")
        .insert({ name: companyName, plan_id: planId })
        .select("id")
        .single();
      if (cErr || !comp?.id) return json({ error: "company_create_failed", details: cErr?.message }, 500, cors ?? { Vary: "Origin" });

      // 3) Insère le profil manager
      const { error: uErr } = await admin.from("users").insert({
        auth_uid, email, full_name: fullName, role: "manager",
        language_preference: safeLang, company_id: comp.id
      });
      if (uErr) return json({ error: "profile_insert_failed", details: uErr.message }, 500, cors ?? { Vary: "Origin" });

      return json({ ok: true, user_id: auth_uid, company_id: comp.id, mode: "manager_freemium" }, 200, cors ?? { Vary: "Origin" });
    }

    // plan = standard/pro : exiger un secretCode valide
    if (!secretCode) return json({ error: "activation_required" }, 400, cors ?? { Vary: "Origin" });

    // code valide, non expiré/non consommé, et company_name correspond
    const { data: mc, error: mErr } = await admin
      .from("manager_activation_codes")
      .select("id, company_name, consumed, expires_at")
      .eq("code", secretCode)
      .limit(1);
    if (mErr || !mc || mc.length === 0) return json({ error: "invalid_activation_code" }, 400, cors ?? { Vary: "Origin" });
    const codeRow = mc[0];
    if (codeRow.consumed) return json({ error: "activation_already_used" }, 400, cors ?? { Vary: "Origin" });
    if (codeRow.expires_at && new Date(codeRow.expires_at).getTime() < Date.now()) {
      return json({ error: "activation_expired" }, 400, cors ?? { Vary: "Origin" });
    }
    if ((codeRow.company_name ?? "").toLowerCase() !== lowerCompany) {
      return json({ error: "activation_company_mismatch" }, 400, cors ?? { Vary: "Origin" });
    }

    // Société ne doit pas déjà exister
    if (existing) return json({ error: "company_name_taken" }, 409, cors ?? { Vary: "Origin" });

    const planId = await ensurePlanId(planKey);
    if (!planId) return json({ error: "plan_not_found" }, 400, cors ?? { Vary: "Origin" });

    // 1) Crée user auth
    const { data: auth, error: aErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { role: "manager", language_preference: safeLang }
    });
    if (aErr || !auth?.user) return json({ error: "auth_create_failed", details: aErr?.message }, 500, cors ?? { Vary: "Origin" });
    const auth_uid = auth.user.id;

    // 2) Crée la société
    const { data: comp, error: cErr } = await admin
      .from("companies")
      .insert({ name: companyName, plan_id: planId })
      .select("id")
      .single();
    if (cErr || !comp?.id) return json({ error: "company_create_failed", details: cErr?.message }, 500, cors ?? { Vary: "Origin" });

    // 3) Insère le profil
    const { error: uErr } = await admin.from("users").insert({
      auth_uid, email, full_name: fullName, role: "manager",
      language_preference: safeLang, company_id: comp.id
    });
    if (uErr) return json({ error: "profile_insert_failed", details: uErr.message }, 500, cors ?? { Vary: "Origin" });

    // 4) Consomme le code
    await admin.from("manager_activation_codes").update({
      consumed: true, consumed_by: auth_uid, consumed_at: new Date().toISOString()
    }).eq("id", codeRow.id);

    return json({ ok: true, user_id: auth_uid, company_id: comp.id, mode: "manager_paid" }, 200, cors ?? { Vary: "Origin" });
  }

  // Rôles non-manager (agent/user) : doivent rejoindre une société existante
  if (!["agent", "user"].includes(role)) {
    return json({ error: "invalid_role" }, 400, cors ?? { Vary: "Origin" });
  }
  const { data: compRow } = await getCompanyByNameInsensitive(lowerCompany);
  if (!compRow?.id) return json({ error: "company_not_found" }, 404, cors ?? { Vary: "Origin" });

  const { data: auth, error: aErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { role, language_preference: safeLang }
  });
  if (aErr || !auth?.user) return json({ error: "auth_create_failed", details: aErr?.message }, 500, cors ?? { Vary: "Origin" });

  const { error: uErr } = await admin.from("users").insert({
    auth_uid: auth.user.id,
    email, full_name: fullName, role,
    language_preference: safeLang, company_id: compRow.id
  });
  if (uErr) return json({ error: "profile_insert_failed", details: uErr.message }, 500, cors ?? { Vary: "Origin" });

  return json({ ok: true, user_id: auth.user.id, company_id: compRow.id, mode: "member" }, 200, cors ?? { Vary: "Origin" });
});

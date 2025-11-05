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
const SERVICE_KEY =
  Deno.env.get("NSH_SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

type PlanKey = "freemium" | "standard" | "pro";

type Role = "manager" | "agent" | "user";

type ManagerActivationRow = {
  id: string;
  company_name: string | null;
  consumed: boolean | null;
  expires_at: string | null;
};

const SUPPORTED_LANGUAGES = new Set(["fr", "en", "ar"]);

const DEFAULT_TIMEZONE = "Europe/Paris";

function normalizeCompanyName(input: string | null | undefined) {
  if (!input) return { original: "", normalized: "", lower: "" };
  const trimmed = input.trim().replace(/\s+/g, " ");
  return { original: input, normalized: trimmed, lower: trimmed.toLowerCase() };
}

async function findCompanyByLowerName(nameNormalized: string, lowerName: string) {
  const { data, error } = await admin
    .from("companies")
    .select("id, name")
    .ilike("name", nameNormalized)
    .limit(10);

  if (error) throw error;
  const row = (data ?? []).find((item) => (item.name ?? "").trim().toLowerCase() === lowerName) ?? null;
  return row;
}

async function resolvePlanId(planKey: PlanKey): Promise<string | number | null> {
  const { data, error } = await admin
    .from("plans")
    .select("id")
    .eq("name", planKey)
    .single();
  if (error || !data?.id) return null;
  return data.id as string | number;
}

async function validateActivationCode(secretCode: string, companyLower: string) {
  const { data, error } = await admin
    .from("manager_activation_codes")
    .select("id, company_name, consumed, expires_at")
    .eq("code", secretCode)
    .limit(1);

  if (error || !data || data.length === 0) {
    return { ok: false as const, error: "invalid_activation_code" };
  }

  const row = data[0] as ManagerActivationRow;
  if (row.consumed) return { ok: false as const, error: "invalid_activation_code" };
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false as const, error: "invalid_activation_code" };
  }
  if ((row.company_name ?? "").toLowerCase() !== companyLower) {
    return { ok: false as const, error: "invalid_activation_code" };
  }

  return { ok: true as const, row };
}

async function consumeActivationCode(id: string, authUid: string) {
  await admin
    .from("manager_activation_codes")
    .update({
      consumed: true,
      consumed_by: authUid,
      consumed_at: new Date().toISOString(),
    })
    .eq("id", id);
}

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
    return json({ error: "method_not_allowed" }, 405, cors ?? { Vary: "Origin" });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  const email = String(payload?.email ?? "").trim().toLowerCase();
  const password = String(payload?.password ?? "");
  const fullName = String(payload?.full_name ?? payload?.fullName ?? "").trim();
  const role = String(payload?.role ?? "").toLowerCase() as Role;
  const languageRaw = String(payload?.language_preference ?? payload?.language ?? "fr").toLowerCase();
  const companyInput = String(payload?.company_name ?? payload?.companyName ?? "");
  const planRaw = String(payload?.plan ?? "").toLowerCase();
  const secretCode = String(payload?.secretCode ?? payload?.secret_code ?? "").trim();

  if (!email || !password || !fullName || !role || !companyInput) {
    return json({ error: "missing_fields" }, 400, cors ?? { Vary: "Origin" });
  }

  if (password.length < 8) {
    return json({ error: "weak_password" }, 400, cors ?? { Vary: "Origin" });
  }

  const language = SUPPORTED_LANGUAGES.has(languageRaw) ? languageRaw : "fr";
  const { normalized: companyName, lower: companyLower } = normalizeCompanyName(companyInput);

  if (!companyName) {
    return json({ error: "missing_fields" }, 400, cors ?? { Vary: "Origin" });
  }

  if (!["manager", "agent", "user"].includes(role)) {
    return json({ error: "invalid_role" }, 400, cors ?? { Vary: "Origin" });
  }

  try {
    if (role === "manager") {
      const planKey: PlanKey = planRaw === "standard" || planRaw === "pro" ? (planRaw as PlanKey) : "freemium";
      const existing = await findCompanyByLowerName(companyName, companyLower);
      if (existing) {
        return json({ error: "company_name_taken" }, 409, cors ?? { Vary: "Origin" });
      }

      if ((planKey === "standard" || planKey === "pro") && !secretCode) {
        return json({ error: "invalid_activation_code" }, 400, cors ?? { Vary: "Origin" });
      }

      let activationRow: ManagerActivationRow | null = null;
      if (planKey === "standard" || planKey === "pro") {
        const activation = await validateActivationCode(secretCode, companyLower);
        if (!activation.ok) {
          return json({ error: activation.error }, 400, cors ?? { Vary: "Origin" });
        }
        activationRow = activation.row;
      }

      const planId = await resolvePlanId(planKey);
      if (!planId) {
        return json({ error: "plan_not_found" }, 400, cors ?? { Vary: "Origin" });
      }

      const { data: auth, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "manager", language_preference: language },
      });
      if (authError || !auth?.user) {
        return json({ error: "create_failed", details: authError?.message }, 500, cors ?? { Vary: "Origin" });
      }

      const authUid = auth.user.id;

      const { data: company, error: companyError } = await admin
        .from("companies")
        .insert({ name: companyName, plan_id: planId })
        .select("id")
        .single();
      if (companyError || !company?.id) {
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return json({ error: "create_failed", details: companyError?.message }, 500, cors ?? { Vary: "Origin" });
      }

      const companyId = company.id as string;

      const settingsResult = await admin
        .from("company_settings")
        .insert({ company_id: companyId, timezone: DEFAULT_TIMEZONE, plan_tier: planKey });
      if (settingsResult.error) {
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        await admin.from("companies").delete().eq("id", companyId).catch(() => {});
        return json({ error: "create_failed", details: settingsResult.error.message }, 500, cors ?? { Vary: "Origin" });
      }

      const { error: profileError } = await admin.from("users").insert({
        auth_uid: authUid,
        email,
        full_name: fullName,
        role: "manager",
        language_preference: language,
        company_id: companyId,
      });
      if (profileError) {
        await admin.from("company_settings").delete().eq("company_id", companyId).catch(() => {});
        await admin.from("companies").delete().eq("id", companyId).catch(() => {});
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return json({ error: "profile_insert_failed", details: profileError.message }, 500, cors ?? { Vary: "Origin" });
      }

      if (activationRow) {
        await consumeActivationCode(activationRow.id, authUid).catch(() => {});
      }

      return json({ ok: true, company_id: companyId, user_id: authUid }, 200, cors ?? { Vary: "Origin" });
    }

    const company = await findCompanyByLowerName(companyName, companyLower);
    if (!company?.id) {
      return json({ error: "company_not_found" }, 400, cors ?? { Vary: "Origin" });
    }

    const { data: auth, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, language_preference: language },
    });
    if (authError || !auth?.user) {
      return json({ error: "create_failed", details: authError?.message }, 500, cors ?? { Vary: "Origin" });
    }

    const { error: profileError } = await admin.from("users").insert({
      auth_uid: auth.user.id,
      email,
      full_name: fullName,
      role,
      language_preference: language,
      company_id: company.id,
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(auth.user.id).catch(() => {});
      return json({ error: "profile_insert_failed", details: profileError.message }, 500, cors ?? { Vary: "Origin" });
    }

    return json({ ok: true, company_id: company.id, user_id: auth.user.id }, 200, cors ?? { Vary: "Origin" });
  } catch (error) {
    console.error("auth-signup unexpected error", error);
    return json({ error: "create_failed" }, 500, cors ?? { Vary: "Origin" });
  }
});

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { handleCors, json } from "../_shared/cors.ts";

type Role = "manager" | "agent" | "user";
type PlanKey = "freemium" | "standard" | "pro";

interface CompanyRow {
  id: string | number;
  name?: string | null;
}

interface ManagerActivationRow {
  id: string;
  company_name: string | null;
  consumed: boolean | null;
  expires_at: string | null;
}

const SUPABASE_URL = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY =
  Deno.env.get("NSH_SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const SUPPORTED_LANGUAGES = new Set(["fr", "en", "ar"]);
const DEFAULT_TIMEZONE = "Europe/Paris";

function normalizeCompanyName(input: string | null | undefined) {
  if (!input) {
    return { normalized: "", lower: "" };
  }
  const normalized = input.trim().replace(/\s+/g, " ");
  return { normalized, lower: normalized.toLowerCase() };
}

async function findCompanyByLowerName(name: string): Promise<CompanyRow | null> {
  const { data, error } = await admin
    .from("companies")
    .select("id, name")
    .ilike("name", name)
    .limit(10);

  if (error) {
    throw error;
  }

  return (data ?? []).find((row) => (row.name ?? "").trim().toLowerCase() === name.toLowerCase()) ?? null;
}

async function resolvePlanId(planKey: PlanKey): Promise<string | number | null> {
  const { data, error } = await admin
    .from("plans")
    .select("id")
    .eq("name", planKey)
    .single();
  if (error || !data?.id) {
    return null;
  }
  return data.id as string | number;
}

async function countManagers(companyId: string | number): Promise<number> {
  const { count, error } = await admin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("role", "manager");

  if (error) {
    throw error;
  }

  return count ?? 0;
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
  if (row.consumed) {
    return { ok: false as const, error: "invalid_activation_code" };
  }

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

function respondError(code: string, status: number, cors: Record<string, string>) {
  return json({ ok: false, error: code }, status, cors);
}

serve(async (req) => {
  const { cors, response } = handleCors(req);
  if (response) {
    return response;
  }

  if (req.method !== "POST") {
    return respondError("method_not_allowed", 405, cors);
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  const email = String(payload?.email ?? "").trim().toLowerCase();
  const password = String(payload?.password ?? "");
  const fullName = String(payload?.full_name ?? payload?.fullName ?? "").trim();
  const role = String(payload?.role ?? "").toLowerCase() as Role;
  const languageRaw = String(payload?.language ?? payload?.language_preference ?? "fr").toLowerCase();
  const companyInput = String(payload?.companyName ?? payload?.company_name ?? "");
  const planRaw = String(payload?.plan ?? "").toLowerCase();
  const secretCode = String(payload?.secretCode ?? payload?.secret_code ?? "").trim();

  if (!email || !password || !fullName || !role || !companyInput) {
    return respondError("missing_fields", 400, cors);
  }

  if (password.length < 8) {
    return respondError("weak_password", 400, cors);
  }

  if (role !== "manager" && role !== "agent" && role !== "user") {
    return respondError("invalid_role", 400, cors);
  }

  const language = SUPPORTED_LANGUAGES.has(languageRaw) ? languageRaw : "fr";
  const { normalized: companyName, lower: companyLower } = normalizeCompanyName(companyInput);

  if (!companyName) {
    return respondError("missing_fields", 400, cors);
  }

  try {
    if (role === "manager") {
      const planKey: PlanKey = planRaw === "standard" || planRaw === "pro" ? (planRaw as PlanKey) : "freemium";
      const existingCompany = await findCompanyByLowerName(companyLower);

      if (existingCompany) {
        const managerCount = await countManagers(existingCompany.id);
        if (managerCount > 0) {
          return respondError("company_conflict", 409, cors);
        }

        const { data: authUser, error: authError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: "manager", language_preference: language },
        });

        if (authError || !authUser?.user) {
          return respondError("user_create_failed", 500, cors);
        }

        const authUid = authUser.user.id;
        const { error: profileError } = await admin.from("users").insert({
          auth_uid: authUid,
          email,
          full_name: fullName,
          role: "manager",
          language_preference: language,
          company_id: existingCompany.id,
        });

        if (profileError) {
          await admin.auth.admin.deleteUser(authUid).catch(() => {});
          return respondError("profile_insert_failed", 500, cors);
        }

        return json(
          { ok: true, company_id: existingCompany.id, user_id: authUid, mode: "manager_existing" },
          200,
          cors,
        );
      }

      if (planKey !== "freemium" && !secretCode) {
        return respondError("activation_required", 400, cors);
      }

      let activationRow: ManagerActivationRow | null = null;
      if (planKey !== "freemium") {
        const activation = await validateActivationCode(secretCode, companyLower);
        if (!activation.ok) {
          return respondError(activation.error, 400, cors);
        }
        activationRow = activation.row;
      }

      const planId = await resolvePlanId(planKey);
      if (!planId) {
        return respondError("plan_not_found", 400, cors);
      }

      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "manager", language_preference: language },
      });

      if (authError || !authUser?.user) {
        return respondError("user_create_failed", 500, cors);
      }

      const authUid = authUser.user.id;

      const { data: companyRow, error: companyError } = await admin
        .from("companies")
        .insert({ name: companyName, plan_id: planId })
        .select("id")
        .single();

      if (companyError || !companyRow?.id) {
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return respondError("company_create_failed", 500, cors);
      }

      const companyId = companyRow.id as string | number;

      const settings = await admin
        .from("company_settings")
        .insert({ company_id: companyId, timezone: DEFAULT_TIMEZONE, plan_tier: planKey });

      if (settings.error) {
        await admin.from("companies").delete().eq("id", companyId).catch(() => {});
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return respondError("settings_insert_failed", 500, cors);
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
        return respondError("profile_insert_failed", 500, cors);
      }

      if (activationRow) {
        await consumeActivationCode(activationRow.id, authUid).catch(() => {});
      }

      return json({ ok: true, company_id: companyId, user_id: authUid, mode: "manager_new" }, 200, cors);
    }

    const company = await findCompanyByLowerName(companyLower);
    if (!company?.id) {
      return respondError("company_missing", 404, cors);
    }

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, language_preference: language },
    });

    if (authError || !authUser?.user) {
      return respondError("user_create_failed", 500, cors);
    }

    const authUid = authUser.user.id;
    const { error: profileError } = await admin.from("users").insert({
      auth_uid: authUid,
      email,
      full_name: fullName,
      role,
      language_preference: language,
      company_id: company.id,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(authUid).catch(() => {});
      return respondError("profile_insert_failed", 500, cors);
    }

    return json({ ok: true, company_id: company.id, user_id: authUid, mode: "member" }, 200, cors);
  } catch (error) {
    console.error("auth-signup unexpected error", error);
    return respondError("unexpected_error", 500, cors);
  }
});

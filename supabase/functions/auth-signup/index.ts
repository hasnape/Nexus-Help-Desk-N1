<<<<<<< HEAD
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors } from "../_shared/cors.ts";

type SignupPayload = {
  email?: string;
  password?: string;
  full_name?: string;
  role?: string;
  companyName?: string;
  language?: string;
  plan?: string;
  secretCode?: string;
};

type ErrorResponse = {
  ok: false;
  code: string;
  message?: string;
};

type SuccessResponse = {
  ok: true;
  userId: string;
  companyId: string;
};

const respond = (headers: HeadersInit, status: number, body: ErrorResponse | SuccessResponse) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  throw new Error("Missing Supabase configuration for auth-signup function.");
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  global: { fetch },
  auth: { persistSession: false },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  global: { fetch },
  auth: { persistSession: false },
});

const normalizeCompanyName = (name: string): string => name.trim();

serve(async (req: Request) => {
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

  if (req.method !== "POST") {
    return respond(headers, 405, { ok: false, code: "method_not_allowed" });
  }

  let payload: SignupPayload;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("auth-signup: invalid JSON payload", error);
    return respond(headers, 400, { ok: false, code: "invalid_json", message: "Invalid JSON payload" });
  }

  const email = payload.email?.trim();
  const password = payload.password;
  const fullName = payload.full_name?.trim();
  const role = payload.role?.trim();
  const companyNameRaw = payload.companyName?.trim();
  const language = payload.language?.trim() || "en";
  const plan = payload.plan?.trim();

  if (!email || !password || !fullName || !role || !companyNameRaw) {
    return respond(headers, 400, { ok: false, code: "missing_fields" });
  }

  if (!["manager", "agent", "user"].includes(role)) {
    return respond(headers, 400, { ok: false, code: "invalid_role" });
  }

  const companyName = normalizeCompanyName(companyNameRaw);

  try {
    if (role === "manager") {
      const { data: existingCompany, error: companyLookupError } = await adminClient
        .from("companies")
        .select("id, name")
        .ilike("name", companyName)
        .maybeSingle();

      if (companyLookupError) {
        console.error("auth-signup: company lookup failed", companyLookupError);
        return respond(headers, 500, { ok: false, code: "company_lookup_failed", message: companyLookupError.message });
      }

      if (!existingCompany) {
        const { data: createdCompany, error: companyInsertError } = await adminClient
          .from("companies")
          .insert({ name: companyName, plan_name: plan ?? null })
          .select("id, name")
          .single();

        if (companyInsertError || !createdCompany) {
          console.error("auth-signup: failed to create company", companyInsertError);
          return respond(headers, 500, { ok: false, code: "company_create_failed", message: companyInsertError?.message });
        }

        const { data: userCreation, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: {
            full_name: fullName,
            role,
            company_id: createdCompany.name,
            language_preference: language,
          },
        });

        if (createError || !userCreation.user) {
          console.error("auth-signup: createUser failed", createError);
          return respond(headers, 500, { ok: false, code: "user_create_failed", message: createError?.message });
        }

        const { error: profileInsertError } = await adminClient.from("users").insert({
          id: userCreation.user.id,
          email,
          full_name: fullName,
          role,
          company_id: createdCompany.name,
          language_preference: language,
        });

        if (profileInsertError) {
          console.error("auth-signup: profile insert failed", profileInsertError);
          return respond(headers, 500, { ok: false, code: "profile_insert_failed", message: profileInsertError.message });
        }

        return respond(headers, 200, { ok: true, userId: userCreation.user.id, companyId: createdCompany.id });
      }

      const { count: managerCount, error: managerLookupError } = await adminClient
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("company_id", existingCompany.name)
        .eq("role", "manager");

      if (managerLookupError) {
        console.error("auth-signup: manager lookup failed", managerLookupError);
        return respond(headers, 500, { ok: false, code: "manager_lookup_failed", message: managerLookupError.message });
      }

      if (typeof managerCount === "number" && managerCount > 0) {
        return respond(headers, 409, { ok: false, code: "company_conflict", message: "Manager already exists" });
      }

      const { data: userCreation, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          full_name: fullName,
          role,
          company_id: existingCompany.name,
          language_preference: language,
        },
      });

      if (createError || !userCreation.user) {
        console.error("auth-signup: createUser failed", createError);
        return respond(headers, 500, { ok: false, code: "user_create_failed", message: createError?.message });
      }

      const { error: profileInsertError } = await adminClient.from("users").insert({
        id: userCreation.user.id,
        email,
        full_name: fullName,
        role,
        company_id: existingCompany.name,
        language_preference: language,
      });

      if (profileInsertError) {
        console.error("auth-signup: profile insert failed", profileInsertError);
        return respond(headers, 500, { ok: false, code: "profile_insert_failed", message: profileInsertError.message });
      }

      return respond(headers, 200, { ok: true, userId: userCreation.user.id, companyId: existingCompany.id });
    }

    const { data: company, error: companyFetchError } = await anonClient
      .from("companies")
      .select("id, name")
      .ilike("name", companyName)
      .maybeSingle();

    if (companyFetchError) {
      console.error("auth-signup: company fetch failed", companyFetchError);
      return respond(headers, 500, { ok: false, code: "company_lookup_failed", message: companyFetchError.message });
    }

    if (!company) {
      return respond(headers, 404, { ok: false, code: "company_missing", message: "Company not found" });
    }

    const { data: userCreation, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        role,
        company_id: company.name,
        language_preference: language,
      },
    });

    if (createError || !userCreation.user) {
      console.error("auth-signup: createUser failed", createError);
      return respond(headers, 500, { ok: false, code: "user_create_failed", message: createError?.message });
    }

    const { error: profileInsertError } = await adminClient.from("users").insert({
      id: userCreation.user.id,
      email,
      full_name: fullName,
      role,
      company_id: company.name,
      language_preference: language,
    });

    if (profileInsertError) {
      console.error("auth-signup: profile insert failed", profileInsertError);
      return respond(headers, 500, { ok: false, code: "profile_insert_failed", message: profileInsertError.message });
    }

    return respond(headers, 200, { ok: true, userId: userCreation.user.id, companyId: company.id });
  } catch (error) {
    console.error("auth-signup: unexpected error", error);
    return respond(headers, 500, { ok: false, code: "unknown_error", message: String(error) });
=======
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { handleOptions, guardOriginOr403, json } from "../_shared/cors.ts";

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

function respondError(req: Request, env: Record<string, string | undefined>, code: string, status: number) {
  return json(req, env, { ok: false, error: code }, status);
}

serve(async (req) => {
  const env = Deno.env.toObject();
  if (req.method === "OPTIONS") return handleOptions(req, env);
  const block = guardOriginOr403(req, env);
  if (block) return block;

  if (req.method !== "POST") {
    return respondError(req, env, "method_not_allowed", 405);
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
    return respondError(req, env, "missing_fields", 400);
  }

  if (password.length < 8) {
    return respondError(req, env, "weak_password", 400);
  }

  if (role !== "manager" && role !== "agent" && role !== "user") {
    return respondError(req, env, "invalid_role", 400);
  }

  const language = SUPPORTED_LANGUAGES.has(languageRaw) ? languageRaw : "fr";
  const { normalized: companyName, lower: companyLower } = normalizeCompanyName(companyInput);

  if (!companyName) {
    return respondError(req, env, "missing_fields", 400);
  }

  try {
    if (role === "manager") {
      const planKey: PlanKey = planRaw === "standard" || planRaw === "pro" ? (planRaw as PlanKey) : "freemium";
      const existingCompany = await findCompanyByLowerName(companyLower);

      if (existingCompany) {
        const managerCount = await countManagers(existingCompany.id);
        if (managerCount > 0) {
          return respondError(req, env, "company_conflict", 409);
        }

        const { data: authUser, error: authError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: "manager", language_preference: language },
        });

        if (authError || !authUser?.user) {
          return respondError(req, env, "user_create_failed", 500);
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
          return respondError(req, env, "profile_insert_failed", 500);
        }

        return json(req, env, {
          ok: true,
          company_id: existingCompany.id,
          user_id: authUid,
          mode: "manager_existing",
        });
      }

      if (planKey !== "freemium" && !secretCode) {
        return respondError(req, env, "activation_required", 400);
      }

      let activationRow: ManagerActivationRow | null = null;
      if (planKey !== "freemium") {
        const activation = await validateActivationCode(secretCode, companyLower);
        if (!activation.ok) {
          return respondError(req, env, activation.error, 400);
        }
        activationRow = activation.row;
      }

      const planId = await resolvePlanId(planKey);
      if (!planId) {
        return respondError(req, env, "plan_not_found", 400);
      }

      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "manager", language_preference: language },
      });

      if (authError || !authUser?.user) {
        return respondError(req, env, "user_create_failed", 500);
      }

      const authUid = authUser.user.id;

      const { data: companyRow, error: companyError } = await admin
        .from("companies")
        .insert({ name: companyName, plan_id: planId })
        .select("id")
        .single();

      if (companyError || !companyRow?.id) {
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return respondError(req, env, "company_create_failed", 500);
      }

      const companyId = companyRow.id as string | number;

      const settings = await admin
        .from("company_settings")
        .insert({ company_id: companyId, timezone: DEFAULT_TIMEZONE, plan_tier: planKey });

      if (settings.error) {
        await admin.from("companies").delete().eq("id", companyId).catch(() => {});
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return respondError(req, env, "settings_insert_failed", 500);
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
        return respondError(req, env, "profile_insert_failed", 500);
      }

      if (activationRow) {
        await consumeActivationCode(activationRow.id, authUid).catch(() => {});
      }

      return json(req, env, {
        ok: true,
        company_id: companyId,
        user_id: authUid,
        mode: "manager_new",
      });
    }

    const company = await findCompanyByLowerName(companyLower);
    if (!company?.id) {
      return respondError(req, env, "company_missing", 404);
    }

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, language_preference: language },
    });

    if (authError || !authUser?.user) {
      return respondError(req, env, "user_create_failed", 500);
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
      return respondError(req, env, "profile_insert_failed", 500);
    }

    return json(req, env, { ok: true, company_id: company.id, user_id: authUid, mode: "member" });
  } catch (error) {
    console.error("auth-signup unexpected error", error);
    return respondError(req, env, "unexpected_error", 500);
>>>>>>> origin/master
  }
});

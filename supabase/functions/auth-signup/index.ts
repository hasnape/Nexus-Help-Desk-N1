// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STATIC_ALLOWED_ORIGINS = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
  "http://localhost:5173",
];

const additionalOrigins = (
  Deno.env.get("ALLOWED_ORIGINS") ??
  Deno.env.get("SUPABASE_ALLOWED_ORIGINS") ??
  ""
)
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

const ALLOWED_ORIGINS = new Set<string>([
  ...STATIC_ALLOWED_ORIGINS,
  ...additionalOrigins,
]);

function makeCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin) {
    // Appel serveur → serveur : pas d'Origin, on renvoie juste Vary
    return { Vary: "Origin" };
  }

  if (!ALLOWED_ORIGINS.has(origin)) {
    // Origin non autorisée → pas d'ACAO
    return { Vary: "Origin" };
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

function json(
  body: unknown,
  status = 200,
  cors: Record<string, string> = { Vary: "Origin" },
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...cors,
    },
  });
}

function validationError(
  reason: string,
  message: string,
  cors: Record<string, string>,
  details?: Record<string, unknown>,
  status = 400,
) {
  return json(
    {
      ok: false,
      error: "validation_error",
      reason,
      message,
      ...(details ? { details } : {}),
    },
    status,
    cors,
  );
}

function conflictError(
  reason: string,
  message: string,
  cors: Record<string, string>,
  details?: Record<string, unknown>,
) {
  return json(
    {
      ok: false,
      error: "conflict",
      reason,
      message,
      ...(details ? { details } : {}),
    },
    409,
    cors,
  );
}

function internalError(
  reason: string,
  cors: Record<string, string>,
  message = "An unexpected error occurred while creating the account.",
  details?: Record<string, unknown>,
) {
  return json(
    {
      ok: false,
      error: "internal_error",
      reason,
      message,
      ...(details ? { details } : {}),
    },
    500,
    cors,
  );
}

type PlanKey = "freemium" | "standard" | "pro";
type Role = "manager" | "agent" | "user";

type ManagerActivationRow = {
  id: string;
  company_name: string | null;
  consumed: boolean | null;
  expires_at: string | null;
};

const DEFAULT_TIMEZONE = "Europe/Paris";
const SUPPORTED_LANGUAGES = new Set(["fr", "en", "ar"]);
const SUCCESS_MESSAGE =
  "Account created. Please check your email to confirm your address.";

function normalizeCompanyName(input: string | null | undefined) {
  if (!input) return { original: "", normalized: "", lower: "" };
  const trimmed = input.trim().replace(/\s+/g, " ");
  return { original: input, normalized: trimmed, lower: trimmed.toLowerCase() };
}

function mapAuthSignUpError(error: any) {
  const message = String(error?.message ?? "").toLowerCase();
  const status = typeof error?.status === "number" ? error.status : undefined;

  if (
    message.includes("registered") ||
    message.includes("already exists") ||
    error?.code === "email_exists"
  ) {
    return {
      status: 409,
      body: {
        ok: false,
        error: "conflict",
        reason: "email_in_use",
        message: "An account with this email already exists.",
      },
    } as const;
  }

  if (status && status >= 400 && status < 500) {
    return {
      status,
      body: {
        ok: false,
        error: "validation_error",
        reason: error?.code ?? "auth_error",
        message: error?.message ?? "Unable to sign up with these credentials.",
      },
    } as const;
  }

  return {
    status: 500,
    body: {
      ok: false,
      error: "internal_error",
      reason: "auth_sign_up_failed",
      message: "An unexpected error occurred while creating the account.",
      details: error?.message ? { message: error.message } : undefined,
    },
  } as const;
}

function mapDbConflict(error: any, conflictError: string, message: string) {
  const code = String(error?.code ?? "").toUpperCase();
  if (code === "23505") {
    return {
      status: 409,
      body: {
        ok: false,
        error: "conflict",
        reason: conflictError,
        message,
      },
    } as const;
  }
  return null;
}

function successResponse(
  cors: Record<string, string>,
  {
    companyId,
    userId,
    email,
    requiresEmailConfirmation,
  }: {
    companyId: string;
    userId: string;
    email: string;
    requiresEmailConfirmation: boolean;
  },
) {
  return json(
    {
      ok: true,
      company_id: companyId,
      user_id: userId,
      email,
      requires_email_confirmation: requiresEmailConfirmation,
      message: SUCCESS_MESSAGE,
    },
    201,
    cors,
  );
}

serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const cors = makeCorsHeaders(origin);
  try {
    // 1) Préflight CORS
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // 2) Origin non autorisée
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return validationError(
        "origin_not_allowed",
        "Origin is not allowed.",
        cors,
        undefined,
        403,
      );
    }

    // 3) Méthode autorisée ?
    if (req.method !== "POST") {
      return validationError(
        "method_not_allowed",
        "Method not allowed.",
        cors,
        undefined,
        405,
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return validationError(
        "missing_authorization",
        "Missing authorization header.",
        cors,
        undefined,
        401,
      );
    }

    // 4) Parsing body
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const email = String(payload?.email ?? "").trim().toLowerCase();
    const password = String(payload?.password ?? "");
    const fullName = String(payload?.full_name ?? payload?.fullName ?? "").trim();
    const role = String(payload?.role ?? "").toLowerCase() as Role;
    const languageRaw = String(
      payload?.language_preference ?? payload?.language ?? "fr",
    ).toLowerCase();
    const companyInput = String(
      payload?.company_name ?? payload?.companyName ?? "",
    );
    const planRaw = String(payload?.plan ?? "").toLowerCase();
    const secretCode = String(
      payload?.secretCode ?? payload?.secret_code ?? "",
    ).trim();

    // 👉 nouveau flag pour distinguer public vs dashboard
    const createdByManagerRaw =
      payload?.created_by_manager ?? payload?.createdByManager ?? false;
    const createdByManager =
      createdByManagerRaw === true ||
      createdByManagerRaw === "true" ||
      createdByManagerRaw === 1 ||
      createdByManagerRaw === "1";

    if (!email || !password || !fullName || !role || !companyInput) {
      return validationError(
        "missing_fields",
        "Required fields are missing.",
        cors,
      );
    }

    if (password.length < 8) {
      return validationError(
        "weak_password",
        "Password must contain at least 8 characters.",
        cors,
      );
    }

    const language = SUPPORTED_LANGUAGES.has(languageRaw) ? languageRaw : "fr";
    const { normalized: companyName, lower: companyLower } =
      normalizeCompanyName(companyInput);

    if (!companyName) {
      return validationError("missing_fields", "Company name is required.", cors);
    }

    if (!["manager", "agent", "user"].includes(role)) {
      return validationError("invalid_role", "Invalid role.", cors);
    }

    // 5) Env + clients Supabase
    const supabaseUrl =
      Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL");
    const serviceKey =
      Deno.env.get("NSH_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey =
      Deno.env.get("NSH_ANON_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("ANON_KEY");

    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error("auth-signup: missing env vars", {
        supabaseUrl: !!supabaseUrl,
        serviceKey: !!serviceKey,
        anonKey: !!anonKey,
      });
      return internalError("env_not_configured", cors);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const publicClient = createClient(supabaseUrl, anonKey);
    const siteUrl =
      Deno.env.get("SITE_URL") ?? origin ?? "https://www.nexussupporthub.eu";

  const findCompanyByLowerName = async (
    nameNormalized: string,
    lowerName: string,
  ) => {
    const { data, error } = await admin
      .from("companies")
      .select("id, name")
      .ilike("name", nameNormalized)
      .limit(10);

    if (error) throw error;
    const row =
      (data ?? []).find(
        (item: any) =>
          (item.name ?? "").trim().toLowerCase() === lowerName,
      ) ?? null;
    return row;
  };

  const resolvePlanId = async (planKey: PlanKey) => {
    const { data, error } = await admin
      .from("plans")
      .select("id")
      .eq("name", planKey)
      .single();
    if (error || !data?.id) return null;
    return data.id as string | number;
  };

  const validateActivationCode = async (
    secret: string,
    companyLowerName: string,
  ) => {
    const { data, error } = await admin
      .from("manager_activation_codes")
      .select("id, company_name, consumed, expires_at")
      .eq("code", secret)
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
    if ((row.company_name ?? "").toLowerCase() !== companyLowerName) {
      return { ok: false as const, error: "invalid_activation_code" };
    }

    return { ok: true as const, row };
  };

  const consumeActivationCode = async (id: string, authUid: string) => {
    await admin
      .from("manager_activation_codes")
      .update({
        consumed: true,
        consumed_by: authUid,
        consumed_at: new Date().toISOString(),
      })
      .eq("id", id);
  };

  try {
    // --- BRANCHE MANAGER : self-signup public → email à confirmer ---
    if (role === "manager") {
      const planKey: PlanKey =
        planRaw === "standard" || planRaw === "pro"
          ? (planRaw as PlanKey)
          : "freemium";

      const existing = await findCompanyByLowerName(companyName, companyLower);
      if (existing) {
        return conflictError(
          "company_in_use",
          "A company with this name already exists.",
          cors,
        );
      }

      let activationRow: ManagerActivationRow | null = null;

      if (planKey === "standard" || planKey === "pro") {
        if (!secretCode) {
          return validationError(
            "invalid_activation_code",
            "An activation code is required for this plan.",
            cors,
          );
        }

        const activation = await validateActivationCode(
          secretCode,
          companyLower,
        );
        if (!activation.ok) {
          return validationError(
            activation.error,
            "The provided activation code is invalid.",
            cors,
          );
        }
        activationRow = activation.row;
      }

      const planId = await resolvePlanId(planKey);
      if (!planId) {
        return validationError(
          "plan_not_found",
          "Selected plan could not be found.",
          cors,
        );
      }

      // Manager = toujours self-signup → email à confirmer
      const { data: signUpData, error: signUpError } =
        await publicClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
            data: {
              role: "manager",
              language_preference: language,
            },
          },
        });

      if (signUpError || !signUpData?.user) {
        console.error("auth-signup: signUp (manager) failed", signUpError);
        const mapped = mapAuthSignUpError(signUpError);
        return json(mapped.body, mapped.status, cors);
      }

      const authUid = signUpData.user.id;

      const { data: company, error: companyError } = await admin
        .from("companies")
        .insert({ name: companyName, plan_id: planId })
        .select("id")
        .single();

      if (companyError || !company?.id) {
        console.error("auth-signup: create company failed", companyError);
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        const conflict = mapDbConflict(
          companyError,
          "company_in_use",
          "A company with this name already exists.",
        );
        if (conflict) return json(conflict.body, conflict.status, cors);
        return internalError("company_create_failed", cors);
      }

      const companyId = company.id as string;

      const settingsResult = await admin.from("company_settings").insert({
        company_id: companyId,
        timezone: DEFAULT_TIMEZONE,
        plan_tier: planKey,
      });

      if (settingsResult.error) {
        console.error(
          "auth-signup: create company_settings failed",
          settingsResult.error,
        );
        await admin.from("companies").delete().eq("id", companyId).catch(() => {});
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return internalError("company_settings_failed", cors, undefined, {
          message: settingsResult.error.message,
        });
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
        console.error("auth-signup: insert manager profile failed", profileError);
        await admin.from("company_settings")
          .delete()
          .eq("company_id", companyId)
          .catch(() => {});
        await admin.from("companies").delete().eq("id", companyId).catch(() => {});
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        const conflict = mapDbConflict(
          profileError,
          "profile_exists",
          "A profile already exists for this account.",
        );
        if (conflict) return json(conflict.body, conflict.status, cors);
        return internalError("profile_insert_failed", cors);
      }

      if (activationRow) {
        await consumeActivationCode(activationRow.id, authUid).catch(() => {});
      }

      return successResponse(cors, {
        companyId,
        userId: authUid,
        email,
        requiresEmailConfirmation: true,
      });
    }

    // --- BRANCHE AGENT / USER ---
    const company = await findCompanyByLowerName(companyName, companyLower);
    if (!company?.id) {
      return validationError(
        "company_not_found",
        "Company not found.",
        cors,
      );
    }

    // 🔀 Logique selon l'origine :
    // - createdByManager = true → créé depuis le dashboard → pas de confirmation
    // - sinon → self-signup public → email à confirmer
    if (createdByManager) {
      // Créé par un manager dans le dashboard → compte confirmé directement
      const { data: auth, error: authError } = await admin.auth.admin
        .createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            role,
            language_preference: language,
          },
        });

      if (authError || !auth?.user) {
        console.error("auth-signup: createUser (agent/user) failed", authError);
        const mapped = mapAuthSignUpError(authError);
        return json(mapped.body, mapped.status, cors);
      }

      const authUid = auth.user.id;

      const { error: profileError } = await admin.from("users").insert({
        auth_uid: authUid,
        email,
        full_name: fullName,
        role,
        language_preference: language,
        company_id: company.id,
      });

      if (profileError) {
        console.error(
          "auth-signup: insert profile (agent/user, dashboard) failed",
          profileError,
        );
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        const conflict = mapDbConflict(
          profileError,
          "profile_exists",
          "A profile already exists for this account.",
        );
        if (conflict) return json(conflict.body, conflict.status, cors);
        return internalError("profile_insert_failed", cors);
      }

      return successResponse(cors, {
        companyId: company.id,
        userId: authUid,
        email,
        requiresEmailConfirmation: false,
      });
    } else {
      // Self-signup public d'un agent/user → email de confirmation requis
      const { data: signUpData, error: signUpError } =
        await publicClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
            data: {
              role,
              language_preference: language,
            },
          },
        });

      if (signUpError || !signUpData?.user) {
        console.error("auth-signup: signUp (agent/user, public) failed", signUpError);
        const mapped = mapAuthSignUpError(signUpError);
        return json(mapped.body, mapped.status, cors);
      }

      const authUid = signUpData.user.id;

      const { error: profileError } = await admin.from("users").insert({
        auth_uid: authUid,
        email,
        full_name: fullName,
        role,
        language_preference: language,
        company_id: company.id,
      });

      if (profileError) {
        console.error(
          "auth-signup: insert profile (agent/user, public) failed",
          profileError,
        );
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        const conflict = mapDbConflict(
          profileError,
          "profile_exists",
          "A profile already exists for this account.",
        );
        if (conflict) return json(conflict.body, conflict.status, cors);
        return internalError("profile_insert_failed", cors);
      }

      return successResponse(cors, {
        companyId: company.id,
        userId: authUid,
        email,
        requiresEmailConfirmation: true,
      });
    }
  } catch (e) {
    console.error("auth-signup unexpected error", e);
    return internalError("unexpected_exception", cors);
  }
});

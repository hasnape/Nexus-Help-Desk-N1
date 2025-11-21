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
    return { status: 409, body: { error: "email_already_registered" } } as const;
  }

  if (status && status >= 400 && status < 500) {
    return {
      status,
      body: { error: error?.code ?? "auth_error", message: error?.message },
    } as const;
  }

  return {
    status: 500,
    body: { error: "create_failed", details: error?.message },
  } as const;
}

function mapDbConflict(error: any, conflictError: string) {
  const code = String(error?.code ?? "").toUpperCase();
  if (code === "23505") {
    return { status: 409, body: { error: conflictError } } as const;
  }
  return null;
}

serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const cors = makeCorsHeaders(origin);

  // 1) Préflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // 2) Origin non autorisée
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return new Response("Forbidden", {
      status: 403,
      headers: { Vary: "Origin" },
    });
  }

  // 3) Méthode autorisée ?
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, cors);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return json(
      { code: 401, message: "Missing authorization header" },
      401,
      cors,
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
    return json({ error: "missing_fields" }, 400, cors);
  }

  if (password.length < 8) {
    return json({ error: "weak_password" }, 400, cors);
  }

  const language = SUPPORTED_LANGUAGES.has(languageRaw) ? languageRaw : "fr";
  const { normalized: companyName, lower: companyLower } =
    normalizeCompanyName(companyInput);

  if (!companyName) {
    return json({ error: "missing_fields" }, 400, cors);
  }

  if (!["manager", "agent", "user"].includes(role)) {
    return json({ error: "invalid_role" }, 400, cors);
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
    return json({ error: "env_not_configured" }, 500, cors);
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
        return json({ error: "company_name_taken" }, 409, cors);
      }

      let activationRow: ManagerActivationRow | null = null;

      if (planKey === "standard" || planKey === "pro") {
        if (!secretCode) {
          return json({ error: "invalid_activation_code" }, 400, cors);
        }

        const activation = await validateActivationCode(
          secretCode,
          companyLower,
        );
        if (!activation.ok) {
          return json({ error: activation.error }, 400, cors);
        }
        activationRow = activation.row;
      }

      const planId = await resolvePlanId(planKey);
      if (!planId) {
        return json({ error: "plan_not_found" }, 400, cors);
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
        const conflict = mapDbConflict(companyError, "company_name_taken");
        if (conflict) return json(conflict.body, conflict.status, cors);
        return json({ error: "create_failed" }, 500, cors);
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
        return json(
          { error: "create_failed", details: settingsResult.error.message },
          500,
          cors,
        );
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
        const conflict = mapDbConflict(profileError, "profile_exists");
        if (conflict) return json(conflict.body, conflict.status, cors);
        return json({ error: "profile_insert_failed" }, 500, cors);
      }

      if (activationRow) {
        await consumeActivationCode(activationRow.id, authUid).catch(() => {});
      }

      return json(
        {
          ok: true,
          company_id: companyId,
          user_id: authUid,
          requires_email_confirmation: true,
        },
        200,
        cors,
      );
    }

    // --- BRANCHE AGENT / USER ---
    const company = await findCompanyByLowerName(companyName, companyLower);
    if (!company?.id) {
      return json({ error: "company_not_found" }, 400, cors);
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
        const conflict = mapDbConflict(profileError, "profile_exists");
        if (conflict) return json(conflict.body, conflict.status, cors);
        return json({ error: "profile_insert_failed" }, 500, cors);
      }

      return json(
        {
          ok: true,
          company_id: company.id,
          user_id: authUid,
          requires_email_confirmation: false,
        },
        200,
        cors,
      );
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
        const conflict = mapDbConflict(profileError, "profile_exists");
        if (conflict) return json(conflict.body, conflict.status, cors);
        return json({ error: "profile_insert_failed" }, 500, cors);
      }

      return json(
        {
          ok: true,
          company_id: company.id,
          user_id: authUid,
          requires_email_confirmation: true,
        },
        200,
        cors,
      );
    }
  } catch (e) {
    console.error("auth-signup unexpected error", e);
    return json(
      {
        code: 500,
        message: "AUTH_SIGNUP_INTERNAL_ERROR",
        details: e instanceof Error ? e.message : String(e),
      },
      500,
      cors,
    );
  }
});

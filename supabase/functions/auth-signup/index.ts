// supabase/functions/auth-signup/index.ts
// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  guardOriginOr403,
  handleOptions,
  json,
} from "../_shared/cors.ts";

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

// Mapping des erreurs Supabase / Postgres → status HTTP
function supabaseStatus(error: any, fallback = 500) {
  const code = String(error?.code ?? "");

  // Contrainte unique (ex: email déjà utilisé, company name unique, etc.)
  if (code === "23505") return 409;

  // Contrainte de clé étrangère
  if (code === "23503") return 400;

  // Si Supabase a déjà mis un status explicite
  if (typeof error?.status === "number") return error.status;

  return fallback;
}

function normalizeCompanyName(input: string | null | undefined) {
  if (!input) return { original: "", normalized: "", lower: "" };
  const trimmed = input.trim().replace(/\s+/g, " ");
  return { original: input, normalized: trimmed, lower: trimmed.toLowerCase() };
}

serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");

  // 1) Préflight CORS
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  // 2) Vérification / headers CORS
  const cors = guardOriginOr403(req);
  if (cors instanceof Response) return cors;

  // 3) Méthode autorisée ?
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, cors);
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

  // Flag pour distinguer signup public vs création par un manager
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
    Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("NSH_SERVICE_ROLE_KEY") ??
    Deno.env.get("SERVICE_ROLE_KEY");
  const anonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("NSH_ANON_KEY") ??
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
        return json(
          { error: "create_failed", details: signUpError?.message },
          supabaseStatus(signUpError, 400),
          cors,
        );
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
        return json(
          { error: "create_failed", details: companyError?.message },
          supabaseStatus(companyError, 500),
          cors,
        );
      }

      const companyId = company.id as string;

      // company_settings idempotent (upsert) + fallback si plan_tier n'existe plus
      let settingsResult = await admin
        .from("company_settings")
        .upsert(
          {
            company_id: companyId,
            timezone: DEFAULT_TIMEZONE,
            plan_tier: planKey,
          },
          { onConflict: "company_id" },
        );

      if (settingsResult.error?.code === "42703") {
        console.warn(
          "auth-signup: plan_tier column missing, retrying company_settings without it",
        );
        settingsResult = await admin
          .from("company_settings")
          .upsert(
            {
              company_id: companyId,
              timezone: DEFAULT_TIMEZONE,
            },
            { onConflict: "company_id" },
          );
      }

      if (settingsResult.error) {
        console.error(
          "auth-signup: create company_settings failed",
          settingsResult.error,
        );
        await admin.from("companies").delete().eq("id", companyId).catch(() => {});
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return json(
          { error: "create_failed", details: settingsResult.error.message },
          supabaseStatus(settingsResult.error, 500),
          cors,
        );
      }

      const { error: profileError } = await admin
        .from("users")
        .upsert(
          {
            auth_uid: authUid,
            email,
            full_name: fullName,
            role: "manager",
            language_preference: language,
            company_id: companyId,
          },
          { onConflict: "auth_uid" },
        );

      if (profileError) {
        console.error(
          "auth-signup: insert manager profile failed",
          profileError,
        );
        await admin.from("company_settings")
          .delete()
          .eq("company_id", companyId)
          .catch(() => {});
        await admin.from("companies").delete().eq("id", companyId).catch(() => {});
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return json(
          { error: "profile_insert_failed", details: profileError.message },
          supabaseStatus(profileError, 500),
          cors,
        );
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
        return json(
          { error: "create_failed", details: authError?.message },
          supabaseStatus(authError, 400),
          cors,
        );
      }

      const authUid = auth.user.id;

      const { error: profileError } = await admin
        .from("users")
        .upsert(
          {
            auth_uid: authUid,
            email,
            full_name: fullName,
            role,
            language_preference: language,
            company_id: company.id,
          },
          { onConflict: "auth_uid" },
        );

      if (profileError) {
        console.error(
          "auth-signup: insert profile (agent/user, dashboard) failed",
          profileError,
        );
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return json(
          { error: "profile_insert_failed", details: profileError.message },
          supabaseStatus(profileError, 500),
          cors,
        );
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
        console.error(
          "auth-signup: signUp (agent/user, public) failed",
          signUpError,
        );
        return json(
          { error: "create_failed", details: signUpError?.message },
          supabaseStatus(signUpError, 400),
          cors,
        );
      }

      const authUid = signUpData.user.id;

      const { error: profileError } = await admin
        .from("users")
        .upsert(
          {
            auth_uid: authUid,
            email,
            full_name: fullName,
            role,
            language_preference: language,
            company_id: company.id,
          },
          { onConflict: "auth_uid" },
        );

      if (profileError) {
        console.error(
          "auth-signup: insert profile (agent/user, public) failed",
          profileError,
        );
        await admin.auth.admin.deleteUser(authUid).catch(() => {});
        return json(
          { error: "profile_insert_failed", details: profileError.message },
          supabaseStatus(profileError, 500),
          cors,
        );
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
  } catch (e: any) {
    console.error("auth-signup unexpected error", e);
    return json(
      {
        error: "create_failed",
        details: String(e?.message ?? e),
      },
      500,
      cors,
    );
  }
});

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
  }
});

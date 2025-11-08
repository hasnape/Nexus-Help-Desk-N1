import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { applyCors } from "./_cors";

type SignupBody = {
  email?: string;
  password?: string;
  full_name?: string;
  role?: string;
  companyName?: string;
  language?: string;
  plan?: string;
  secretCode?: string;
};

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  throw new Error("Missing Supabase configuration for auth-signup API route.");
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

const respond = (res: VercelResponse, status: number, body: Record<string, unknown>) => {
  res.status(status).json(body);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    respond(res, 405, { ok: false, code: "method_not_allowed" });
    return;
  }

  const body: SignupBody = req.body ?? {};
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const companyNameRaw = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const language = typeof body.language === "string" ? body.language.trim() : "en";
  const plan = typeof body.plan === "string" ? body.plan.trim() : undefined;

  if (!email || !password || !fullName || !role || !companyNameRaw) {
    respond(res, 400, { ok: false, code: "missing_fields" });
    return;
  }

  if (!["manager", "agent", "user"].includes(role)) {
    respond(res, 400, { ok: false, code: "invalid_role" });
    return;
  }

  const companyName = companyNameRaw;

  try {
    if (role === "manager") {
      const { data: existingCompany, error: companyLookupError } = await adminClient
        .from("companies")
        .select("id, name")
        .ilike("name", companyName)
        .maybeSingle();

      if (companyLookupError) {
        respond(res, 500, { ok: false, code: "company_lookup_failed", message: companyLookupError.message });
        return;
      }

      if (!existingCompany) {
        const { data: createdCompany, error: companyInsertError } = await adminClient
          .from("companies")
          .insert({ name: companyName, plan_name: plan ?? null })
          .select("id, name")
          .single();

        if (companyInsertError || !createdCompany) {
          respond(res, 500, { ok: false, code: "company_create_failed", message: companyInsertError?.message });
          return;
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

        if (createError || !userCreation?.user) {
          respond(res, 500, { ok: false, code: "user_create_failed", message: createError?.message });
          return;
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
          respond(res, 500, { ok: false, code: "profile_insert_failed", message: profileInsertError.message });
          return;
        }

        respond(res, 200, { ok: true, userId: userCreation.user.id, companyId: createdCompany.id });
        return;
      }

      const { count: managerCount, error: managerLookupError } = await adminClient
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("company_id", existingCompany.name)
        .eq("role", "manager");

      if (managerLookupError) {
        respond(res, 500, { ok: false, code: "manager_lookup_failed", message: managerLookupError.message });
        return;
      }

      if (typeof managerCount === "number" && managerCount > 0) {
        respond(res, 409, { ok: false, code: "company_conflict", message: "Manager already exists" });
        return;
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

      if (createError || !userCreation?.user) {
        respond(res, 500, { ok: false, code: "user_create_failed", message: createError?.message });
        return;
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
        respond(res, 500, { ok: false, code: "profile_insert_failed", message: profileInsertError.message });
        return;
      }

      respond(res, 200, { ok: true, userId: userCreation.user.id, companyId: existingCompany.id });
      return;
    }

    const { data: company, error: companyFetchError } = await anonClient
      .from("companies")
      .select("id, name")
      .ilike("name", companyName)
      .maybeSingle();

    if (companyFetchError) {
      respond(res, 500, { ok: false, code: "company_lookup_failed", message: companyFetchError.message });
      return;
    }

    if (!company) {
      respond(res, 404, { ok: false, code: "company_missing", message: "Company not found" });
      return;
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

    if (createError || !userCreation?.user) {
      respond(res, 500, { ok: false, code: "user_create_failed", message: createError?.message });
      return;
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
      respond(res, 500, { ok: false, code: "profile_insert_failed", message: profileInsertError.message });
      return;
    }

    respond(res, 200, { ok: true, userId: userCreation.user.id, companyId: company.id });
  } catch (error) {
    respond(res, 500, { ok: false, code: "unknown_error", message: error instanceof Error ? error.message : String(error) });
  }
}

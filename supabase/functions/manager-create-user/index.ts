import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors } from "../_shared/cors.ts";

type CreateUserPayload = {
  mode?: "invite" | "create";
  email?: string;
  full_name?: string;
  role?: string;
  language?: string;
  password?: string;
};

type ErrorBody = {
  ok: false;
  code: string;
  message?: string;
  details?: Record<string, unknown>;
};

type SuccessBody = {
  ok: true;
  userId: string;
  mode: "invite" | "create";
};

const respond = (headers: HeadersInit, status: number, body: ErrorBody | SuccessBody) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  throw new Error("Missing Supabase configuration for manager-create-user function.");
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  global: { fetch },
  auth: { persistSession: false },
});

const authClient = createClient(SUPABASE_URL, ANON_KEY, {
  global: { fetch },
  auth: { persistSession: false },
});

serve(async (req: Request) => {
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

  if (req.method !== "POST") {
    return respond(headers, 405, { ok: false, code: "method_not_allowed" });
  }

  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader) {
    return respond(headers, 401, { ok: false, code: "missing_auth" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return respond(headers, 401, { ok: false, code: "missing_auth" });
  }

  const { data: authUser, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authUser?.user) {
    return respond(headers, 401, { ok: false, code: "invalid_token", message: authError?.message });
  }

  const { data: managerProfile, error: profileError } = await adminClient
    .from("users")
    .select("id, role, company_id")
    .eq("id", authUser.user.id)
    .single();

  if (profileError || !managerProfile) {
    return respond(headers, 403, { ok: false, code: "profile_missing", message: profileError?.message });
  }

  if (managerProfile.role !== "manager") {
    return respond(headers, 403, { ok: false, code: "forbidden", message: "Only managers can create users" });
  }

  let payload: CreateUserPayload;
  try {
    payload = await req.json();
  } catch (error) {
    return respond(headers, 400, { ok: false, code: "invalid_json", message: "Invalid JSON body" });
  }

  const mode = payload.mode ?? "invite";
  const email = payload.email?.trim();
  const fullName = payload.full_name?.trim();
  const role = payload.role?.trim();
  const language = payload.language?.trim() || "en";

  if (!email || !fullName || !role) {
    return respond(headers, 400, { ok: false, code: "missing_fields" });
  }

  if (!["agent", "user"].includes(role)) {
    return respond(headers, 400, { ok: false, code: "invalid_role" });
  }

  const { data: companyRecord, error: companyError } = await adminClient
    .from("companies")
    .select("id, name, plan_id, plans(max_agents)")
    .eq("name", managerProfile.company_id)
    .single();

  if (companyError || !companyRecord) {
    return respond(headers, 500, { ok: false, code: "company_lookup_failed", message: companyError?.message });
  }

  const planInfo = Array.isArray(companyRecord.plans) ? companyRecord.plans[0] : companyRecord.plans;
  const maxAgents = planInfo?.max_agents ?? null;
  if (role === "agent" && typeof maxAgents === "number") {
    const { count: agentCount, error: agentCountError } = await adminClient
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("company_id", managerProfile.company_id)
      .eq("role", "agent");

    if (agentCountError) {
      return respond(headers, 500, { ok: false, code: "agent_count_failed", message: agentCountError.message });
    }

    if (typeof agentCount === "number" && agentCount >= maxAgents) {
      return respond(headers, 409, {
        ok: false,
        code: "agent_limit_reached",
        details: { agentCount, maxAgents },
      });
    }
  }

  try {
    if (mode === "invite") {
      const { data: inviteResult, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          role,
          company_id: managerProfile.company_id,
          language_preference: language,
        },
      });

      if (inviteError || !inviteResult?.user) {
        return respond(headers, 500, { ok: false, code: "invite_failed", message: inviteError?.message });
      }

      const { error: profileInsertError } = await adminClient.from("users").insert({
        id: inviteResult.user.id,
        email,
        full_name: fullName,
        role,
        company_id: managerProfile.company_id,
        language_preference: language,
      });

      if (profileInsertError) {
        return respond(headers, 500, { ok: false, code: "profile_insert_failed", message: profileInsertError.message });
      }

      return respond(headers, 200, { ok: true, userId: inviteResult.user.id, mode: "invite" });
    }

    if (!payload.password) {
      return respond(headers, 400, { ok: false, code: "missing_fields", message: "Password required for create mode" });
    }

    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: payload.password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        role,
        company_id: managerProfile.company_id,
        language_preference: language,
      },
    });

    if (createError || !createdUser?.user) {
      return respond(headers, 500, { ok: false, code: "create_failed", message: createError?.message });
    }

    const { error: profileInsertError } = await adminClient.from("users").insert({
      id: createdUser.user.id,
      email,
      full_name: fullName,
      role,
      company_id: managerProfile.company_id,
      language_preference: language,
    });

    if (profileInsertError) {
      return respond(headers, 500, { ok: false, code: "profile_insert_failed", message: profileInsertError.message });
    }

    return respond(headers, 200, { ok: true, userId: createdUser.user.id, mode: "create" });
  } catch (error) {
    console.error("manager-create-user: unexpected error", error);
    return respond(headers, 500, { ok: false, code: "unknown_error", message: "An unexpected error occurred" });
  }
});

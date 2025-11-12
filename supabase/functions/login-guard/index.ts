import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase configuration for login-guard function.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: fetch },
  auth: { persistSession: false },
});

type GuardPayload = {
  email?: string;
  company?: string;
};

type GuardResponse = {
  ok: boolean;
  reason?: string;
  message?: string;
};

const badRequest = (headers: HeadersInit, message: string): Response =>
  new Response(JSON.stringify({ ok: false, reason: "bad_request", message }), {
    status: 400,
    headers: { ...headers, "Content-Type": "application/json" },
  });

serve(async (req: Request) => {
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, reason: "method_not_allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  let payload: GuardPayload;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("login-guard: invalid JSON payload", error);
    return badRequest(headers, "Invalid JSON payload");
  }

  const email = payload.email?.trim();
  const company = payload.company?.trim();

  if (!email || !company) {
    return badRequest(headers, "Missing email or company");
  }

  const { data, error } = await supabase.rpc("prelogin_check_company", {
    email,
    company,
  });

  if (error) {
    console.error("login-guard: RPC error", error);
    return new Response(JSON.stringify({ ok: false, reason: "rpc_failed", message: error.message }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  let response: GuardResponse;
  if (typeof data === "boolean") {
    response = data ? { ok: true } : { ok: false, reason: "not_allowed" };
  } else if (data && typeof data === "object" && "ok" in data) {
    response = data as GuardResponse;
  } else {
    response = { ok: true };
  }

  if (response.ok) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: false, reason: response.reason ?? "not_allowed", message: response.message }), {
    status: 403,
    headers: { ...headers, "Content-Type": "application/json" },
  });
});

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { email, company } = await req.json().catch(() => ({}));
  if (!email || !company) {
    return new Response(JSON.stringify({ ok: false, error: "missing_params" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")! // suffit car RPC a GRANT pour anon
  );

  const { data, error } = await supabase.rpc("prelogin_check_company", {
    p_email: email,
    p_company_name: company,
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  if (!data?.allowed) {
    return new Response(
      JSON.stringify({ ok: false, reason: data?.reason ?? "forbidden" }),
      { status: 403, headers: { "content-type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});

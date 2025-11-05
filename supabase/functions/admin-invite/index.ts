// Deno (Supabase Edge Functions)
// Endpoint: https://<PROJECT>.supabase.co/functions/v1/admin-invite
// Purpose: inviter/créer un utilisateur côté Admin (service-role),
//          en normalisant role + langue pour que le trigger bdd passe toujours.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// CORS util
function cors(res: Response) {
  const h = new Headers(res.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  h.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  return new Response(res.body, { status: res.status, headers: h });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return cors(new Response(null, { status: 204 }));

  try {
    // (Optionnel) Vérifier que l'appelant est connecté (jeton utilisateur manager)
    const auth = req.headers.get("authorization") ?? "";
    if (!auth.toLowerCase().startsWith("bearer ")) {
      return cors(new Response(JSON.stringify({ ok: false, error: "missing bearer token" }), { status: 401 }));
    }

    const { email, role, company_name, language_preference = "en" } = await req.json();

    if (!email) {
      return cors(new Response(JSON.stringify({ ok: false, error: "email is required" }), { status: 400 }));
    }

    const roleKey = ["manager", "agent", "user"].includes(String(role || "").toLowerCase())
      ? String(role).toLowerCase()
      : "user";

    const langKey = ["en", "fr", "ar"].includes(String(language_preference || "").toLowerCase())
      ? String(language_preference).toLowerCase()
      : "en";

    // Création directe (email confirmé pour accélérer les tests ; adaptez selon votre politique)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        role: roleKey,
        company_name: company_name ?? null,
        language_preference: langKey,
      },
    });

    if (error) throw error;

    return cors(new Response(JSON.stringify({ ok: true, user_id: data.user?.id }), { status: 200 }));
  } catch (e) {
    return cors(new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 400 }));
  }
});

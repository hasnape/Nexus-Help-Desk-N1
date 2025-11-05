// deno-lint-ignore-file no-explicit-any
// Invite/Créer un user côté Admin (service-role) avec normalisation & CORS
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS standardisé
const STATIC_ALLOWED_ORIGINS = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
  "http://localhost:5173",
] as const;

const additional = (
  Deno.env.get("ALLOWED_ORIGINS") ??
  Deno.env.get("SUPABASE_ALLOWED_ORIGINS") ??
  ""
).split(",").map((s) => s.trim()).filter(Boolean);

const ALLOWED = new Set<string>([...STATIC_ALLOWED_ORIGINS, ...additional]);
function corsHeaders(origin: string | null) {
  if (!origin || !ALLOWED.has(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    Vary: "Origin",
  } as Record<string, string>;
}
function json(body: unknown, status = 200, headers: Record<string, string> = { Vary: "Origin" }) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "content-type": "application/json; charset=utf-8" } });
}

// Env (sans préfixe + fallback)
const SUPABASE_URL = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "https://www.nexussupporthub.eu";

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const cors = corsHeaders(origin);
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers: cors ?? { Vary: "Origin" } });
  if (!cors) return new Response("Forbidden", { status: 403, headers: { Vary: "Origin" } });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, cors);

  try {
    // Vérifier le bearer & rôle manager
    const auth = req.headers.get("authorization") ?? "";
    if (!auth.toLowerCase().startsWith("bearer ")) {
      return json({ ok: false, error: "missing_bearer" }, 401, cors);
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: authData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !authData?.user) return json({ ok: false, error: "unauthorized" }, 401, cors);

    const { data: me, error: meErr } = await admin
      .from("users")
      .select("role, company_id")
      .eq("auth_uid", authData.user.id)
      .single();

    if (meErr || !me) return json({ ok: false, error: "profile_not_found" }, 403, cors);
    if (me.role !== "manager") return json({ ok: false, error: "forbidden" }, 403, cors);

    // Payload
    const { email, role, company_name, language_preference = "en" } = await req.json();

    if (!email) return json({ ok: false, error: "email_required" }, 400, cors);

    const roleKey = ["manager", "agent", "user"].includes(String(role || "").toLowerCase())
      ? String(role).toLowerCase()
      : "user";

    const langKey = ["en", "fr", "ar"].includes(String(language_preference || "").toLowerCase())
      ? String(language_preference).toLowerCase()
      : "en";

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Création directe (email confirmé) — pour invitation avec lien de login use inviteUserByEmail
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        role: roleKey,
        company_name: company_name ?? null,
        language_preference: langKey,
      },
    });
    if (error) return json({ ok: false, error: error.message }, 400, cors);

    // Upsert profil
    const auth_uid = data.user?.id;
    if (auth_uid) {
      const { error: upErr } = await admin.from("users").upsert(
        {
          auth_uid,
          email,
          full_name: email.split("@")[0], // si tu veux, remplace par un champ body.full_name
          role: roleKey,
          language_preference: langKey,
          company_id: me.company_id ?? null,
        },
        { onConflict: "auth_uid" }
      );
      if (upErr) return json({ ok: false, error: upErr.message }, 409, cors);
    }

    return json({ ok: true, user_id: auth_uid, redirect_hint: `${FRONTEND_URL}/#/login` }, 200, cors);
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 400, cors!);
  }
});

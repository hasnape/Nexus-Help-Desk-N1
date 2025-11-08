import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { applyCors } from "./_cors";

type GuardBody = {
  email?: string;
  company?: string;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration for login-guard API route.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, reason: "method_not_allowed" });
    return;
  }

  const body: GuardBody = req.body ?? {};
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";

  if (!email || !company) {
    res.status(400).json({ ok: false, reason: "bad_request", message: "Missing email or company" });
    return;
  }

  const { data, error } = await supabase.rpc("prelogin_check_company", {
    email,
    company,
  });

  if (error) {
    res.status(500).json({ ok: false, reason: "rpc_failed", message: error.message });
    return;
  }

  if (typeof data === "boolean") {
    if (data) {
      res.status(200).json({ ok: true });
    } else {
      res.status(403).json({ ok: false, reason: "not_allowed" });
    }
    return;
  }

  if (data && typeof data === "object" && "ok" in data) {
    if ((data as { ok: boolean }).ok) {
      res.status(200).json({ ok: true });
    } else {
      const reason = (data as { reason?: string; message?: string }).reason ?? "not_allowed";
      const message = (data as { message?: string }).message;
      res.status(403).json({ ok: false, reason, message });
    }
    return;
  }

  res.status(200).json({ ok: true });
}

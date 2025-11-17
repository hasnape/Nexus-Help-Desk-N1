// api/edge-proxy/[fn].ts
// Proxy Vercel -> Supabase Edge Functions
// Exemple :
//   /api/edge-proxy/nexus-ai         -> Supabase function "nexus-ai"
//   /api/edge-proxy/auth-signup      -> Supabase function "auth-signup"
//   /api/edge-proxy/login-guard      -> Supabase function "login-guard"
//
// Rôle :
//  - propage l'Origin du navigateur vers Supabase (pour guardOriginOr403 + CORS)
//  - N'expose aucune clé côté navigateur (toutes les clés sont sur Vercel)

import type { VercelRequest, VercelResponse } from "@vercel/node";

// URL Supabase (ex: https://iqvshiebmusybtzbijrg.supabase.co)
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";

// Base URL des Edge Functions Supabase
// Si tu ne définis pas SUPABASE_FUNCTIONS_URL, on la dérive de SUPABASE_URL
//  https://xxxx.supabase.co -> https://xxxx.functions.supabase.co
const SUPABASE_FUNCTIONS_URL =
  process.env.SUPABASE_FUNCTIONS_URL ||
  (SUPABASE_URL
    ? SUPABASE_URL.replace("https://", "https://").replace(
        ".supabase.co",
        ".functions.supabase.co"
      )
    : "");

// Clé Anon utilisée SERVER-SIDE pour appeler les Supabase Functions
// (jamais renvoyée au navigateur)
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_FUNCTIONS_URL) {
  console.warn(
    "[edge-proxy] Missing SUPABASE_FUNCTIONS_URL or SUPABASE_URL env var."
  );
}

if (!SUPABASE_ANON_KEY) {
  console.warn(
    "[edge-proxy] Missing SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY) env var."
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!SUPABASE_FUNCTIONS_URL || !SUPABASE_ANON_KEY) {
      res
        .status(500)
        .json({ error: "Edge proxy misconfigured on server (env vars)." });
      return;
    }

    // /api/edge-proxy/[fn]  =>  fn = "nexus-ai", "auth-signup", etc.
    const { fn } = req.query;
    const fnName = Array.isArray(fn) ? fn[0] : fn;

    if (!fnName) {
      res.status(400).json({ error: "Missing function name in route param." });
      return;
    }

    // On garde les query params de la requête originale
    const originalUrl = req.url || "";
    const queryIndex = originalUrl.indexOf("?");
    const search = queryIndex >= 0 ? originalUrl.substring(queryIndex) : "";

    const targetUrl = `${SUPABASE_FUNCTIONS_URL}/functions/v1/${fnName}${search}`;

    // --------- Construction des headers à forward vers Supabase ---------
    const headers: Record<string, string> = {};

    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      const lowerKey = key.toLowerCase();

      // On évite d'écraser host / content-length
      if (lowerKey === "host" || lowerKey === "content-length") continue;

      headers[lowerKey] = Array.isArray(value) ? value.join(", ") : value;
    }

    // 🔁 Propage l'Origin du navigateur (clé pour tes CORS côté Supabase)
    const origin = req.headers.origin;
    if (typeof origin === "string") {
      headers["origin"] = origin;
    }

    // Auth obligatoire pour appeler la Supabase Function
    headers["apikey"] = SUPABASE_ANON_KEY;
    headers["authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;

    // Content-Type par défaut pour les requêtes avec body
    if (
      !headers["content-type"] &&
      req.method &&
      !["GET", "HEAD"].includes(req.method)
    ) {
      headers["content-type"] = "application/json";
    }

    // --------- Body ---------
    let body: BodyInit | undefined = undefined;
    if (req.method && !["GET", "HEAD"].includes(req.method)) {
      if (typeof req.body === "string") {
        body = req.body;
      } else if (req.body != null) {
        body = JSON.stringify(req.body);
      }
    }

    // --------- Appel à la Supabase Edge Function ---------
    const supaResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const supaBody = await supaResponse.arrayBuffer();

    // Renvoie le status + headers de Supabase tels quels
    res.status(supaResponse.status);
    supaResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Petit header de debug
    res.setHeader("x-nexus-edge-proxy", "1");

    res.send(Buffer.from(supaBody));
  } catch (err: any) {
    console.error("[edge-proxy] Error forwarding to Supabase function:", err);
    res.status(500).json({
      error: "Edge proxy error while calling Supabase function.",
    });
  }
}

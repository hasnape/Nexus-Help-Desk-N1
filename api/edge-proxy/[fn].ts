// api/edge-proxy/[fn].ts
// Proxy côté Vercel -> Supabase Edge Functions
// - Route /api/edge-proxy/nexus-ai -> https://<project>.functions.supabase.co/functions/v1/nexus-ai
// - Propage l'en-tête Origin du navigateur vers Supabase (pour les CORS / guardOriginOr403).
// - N'expose aucune clé dans le front : toutes les clés restent côté serveur Vercel.

import type { VercelRequest, VercelResponse } from "@vercel/node";

// On récupère l'URL Supabase.
// On tolère SUPABASE_URL ou VITE_SUPABASE_URL (au cas où tu n'as mis que celle-ci dans Vercel).
const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";

// Base URL des Edge Functions Supabase.
// Ex: https://iqvshiebmusybtzbijrg.supabase.co
//  -> https://iqvshiebmusybtzbijrg.functions.supabase.co
const SUPABASE_FUNCTIONS_BASE =
  process.env.SUPABASE_FUNCTIONS_URL ||
  (SUPABASE_URL
    ? SUPABASE_URL.replace("https://", "https://").replace(
        ".supabase.co",
        ".functions.supabase.co"
      )
    : "");

// Clé Anon pour invoquer la function (obligatoire côté serveur, mais jamais renvoyée au client)
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_FUNCTIONS_BASE) {
  throw new Error(
    "Missing SUPABASE_FUNCTIONS_URL or SUPABASE_URL env var for edge-proxy."
  );
}
if (!SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY) env var for edge-proxy."
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { fn } = req.query;
    const fnName = Array.isArray(fn) ? fn[0] : fn;

    if (!fnName) {
      res.status(400).json({ error: "Missing function name in route param." });
      return;
    }

    // On reconstruit l'URL cible Supabase en gardant les query params
    // /api/edge-proxy/nexus-ai?foo=bar -> /functions/v1/nexus-ai?foo=bar
    const originalUrl = req.url || "";
    const queryIndex = originalUrl.indexOf("?");
    const search = queryIndex >= 0 ? originalUrl.substring(queryIndex) : "";
    const targetUrl = `${SUPABASE_FUNCTIONS_BASE}/functions/v1/${fnName}${search}`;

    // ---- Headers à forward vers Supabase ----
    const headers: Record<string, string> = {};

    // On propage les headers utiles (sauf host, content-length, etc.)
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      const lowerKey = key.toLowerCase();
      if (lowerKey === "host" || lowerKey === "content-length") continue;

      if (Array.isArray(value)) {
        headers[lowerKey] = value.join(", ");
      } else {
        headers[lowerKey] = value;
      }
    }

    // On force l'Origin à celui du navigateur (clé pour guardOriginOr403 côté Supabase)
    const origin = req.headers.origin;
    if (origin && typeof origin === "string") {
      headers["origin"] = origin;
    }

    // Auth pour appeler la Supabase Edge Function (exigé en production)
    headers["apikey"] = SUPABASE_ANON_KEY;
    headers["authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;

    // On s'assure d'avoir un content-type cohérent si on envoie du JSON
    if (!headers["content-type"] && req.method !== "GET" && req.method !== "HEAD") {
      headers["content-type"] = "application/json";
    }

    // Body
    let body: BodyInit | undefined = undefined;
    if (req.method && !["GET", "HEAD"].includes(req.method)) {
      // Sur Vercel Node, req.body est déjà parsé (object) si JSON.
      // On le re-stringify proprement pour Supabase.
      if (typeof req.body === "string") {
        body = req.body;
      } else if (req.body != null) {
        body = JSON.stringify(req.body);
      }
    }

    // ---- Appel à la Supabase Edge Function ----
    const supaResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // On lit le body de la réponse Supabase
    const supaBody = await supaResponse.arrayBuffer();

    // On renvoie le status + headers de Supabase tels quels,
    // pour conserver les en-têtes CORS (_shared/cors.ts).
    res.status(supaResponse.status);
    supaResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Petit header de debug facultatif
    res.setHeader("x-nexus-edge-proxy", "1");

    res.send(Buffer.from(supaBody));
  } catch (err: any) {
    console.error("[edge-proxy] Error forwarding to Supabase function:", err);
    res
      .status(500)
      .json({ error: "Edge proxy error while calling Supabase function." });
  }
}

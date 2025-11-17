// api/edge-proxy/[fn].ts
// Proxy générique Vercel → Supabase Edge Functions
// Ex : /api/edge-proxy/nexus-ai → https://...functions.supabase.co/functions/v1/nexus-ai

export const config = {
  runtime: "edge", // Edge Runtime
};

function jsonError(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Récupère le nom de la function :
  // /api/edge-proxy/nexus-ai → "nexus-ai"
  const segments = url.pathname.split("/");
  const fn = segments[segments.length - 1] || segments[segments.length - 2];

  if (!fn) {
    return jsonError("Missing function name in URL.", 400);
  }

  // Base des Edge Functions Supabase
  // Exemple attendu :
  // https://iqvshiebmusybtzbijrg.functions.supabase.co/functions/v1
  const baseFromEnv = process.env.SUPABASE_FUNCTIONS_URL;

  if (!baseFromEnv) {
    return jsonError(
      "SUPABASE_FUNCTIONS_URL is not configured in Vercel environment.",
      500
    );
  }

  const functionsBase = baseFromEnv.replace(/\/$/, ""); // enlève "/" final si présent
  const targetUrl = `${functionsBase}/${fn}`;

  // On propage les headers + Origin
  const incomingOrigin = req.headers.get("origin") || undefined;
  const forwardHeaders = new Headers(req.headers);

  if (incomingOrigin) {
    forwardHeaders.set("origin", incomingOrigin);
  } else {
    forwardHeaders.delete("origin");
  }

  // Ajout de la clé anon côté serveur (non visible dans le front)
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (anonKey) {
    forwardHeaders.set("apikey", anonKey);
    if (!forwardHeaders.has("authorization")) {
      forwardHeaders.set("authorization", `Bearer ${anonKey}`);
    }
  }

  const method = req.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : req.body ?? null;

  try {
    const supabaseResponse = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
    });

    const respHeaders = new Headers(supabaseResponse.headers);

    // Si la fonction a déjà mis les bons headers CORS, on les garde.
    // Sinon, on met au moins Origin + Vary pour être propre.
    if (!respHeaders.has("Access-Control-Allow-Origin") && incomingOrigin) {
      respHeaders.set("Access-Control-Allow-Origin", incomingOrigin);
      respHeaders.set("Vary", "Origin");
    }

    return new Response(supabaseResponse.body, {
      status: supabaseResponse.status,
      headers: respHeaders,
    });
  } catch (err: any) {
    console.error("Edge proxy error for fn:", fn, err);
    return jsonError(
      `Edge proxy error while calling Supabase function "${fn}".`,
      502
    );
  }
}

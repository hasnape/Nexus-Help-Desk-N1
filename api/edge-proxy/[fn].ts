// api/edge-proxy/[fn].ts
// Hardened proxy: Vercel Edge → Supabase Edge Functions

export const config = {
  runtime: "edge",
};

// Function name validation: alphanumeric, dash, underscore, max 64 characters
const VALID_FUNCTION_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

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

  // Extract function name from URL path
  // e.g., /api/edge-proxy/nexus-ai → "nexus-ai"
  const segments = url.pathname.split("/");
  const fn = segments[segments.length - 1] || segments[segments.length - 2];

  if (!fn) {
    return jsonError("Missing function name in URL.", 400);
  }

  // Validate function name: only allow alphanumeric, dash, underscore, max length 64
  if (!VALID_FUNCTION_NAME_PATTERN.test(fn)) {
    console.error(`Invalid function name attempted: ${fn}`);
    return jsonError("Invalid function name format.", 400);
  }

  // Get and validate Supabase Functions URL
  const baseFromEnv = process.env.SUPABASE_FUNCTIONS_URL;
  if (!baseFromEnv) {
    console.error("SUPABASE_FUNCTIONS_URL is not configured");
    return jsonError(
      "SUPABASE_FUNCTIONS_URL is not configured in environment.",
      500
    );
  }

  // Enforce hostname ends with 'functions.supabase.co'
  let parsedBase: URL;
  try {
    parsedBase = new URL(baseFromEnv);
  } catch {
    console.error("SUPABASE_FUNCTIONS_URL is not a valid URL");
    return jsonError("Invalid SUPABASE_FUNCTIONS_URL configuration.", 500);
  }

  if (!parsedBase.hostname.endsWith("functions.supabase.co")) {
    console.error(
      `SUPABASE_FUNCTIONS_URL hostname does not end with 'functions.supabase.co': ${parsedBase.hostname}`
    );
    return jsonError("Invalid SUPABASE_FUNCTIONS_URL hostname.", 500);
  }

  // Optional: enforce allowlist from environment
  const allowlistEnv = process.env.SUPABASE_ALLOWED_FUNCTIONS;
  if (allowlistEnv) {
    const allowedFunctions = allowlistEnv.split(",").map((f) => f.trim());
    if (!allowedFunctions.includes(fn)) {
      console.error(`Function not in allowlist: ${fn}`);
      return jsonError(`Function "${fn}" is not allowed.`, 403);
    }
  }

  // Build target URL
  const functionsBase = baseFromEnv.replace(/\/$/, "");
  const targetUrl = `${functionsBase}/${fn}`;

  // Forward only safe headers
  const forwardHeaders = new Headers();
  const safeHeaders = [
    "content-type",
    "accept",
    "accept-language",
    "user-agent",
    "origin",
  ];

  safeHeaders.forEach((header) => {
    const value = req.headers.get(header);
    if (value) {
      forwardHeaders.set(header, value);
    }
  });

  // Always inject server-side SUPABASE_ANON_KEY
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (anonKey) {
    forwardHeaders.set("apikey", anonKey);
    forwardHeaders.set("authorization", `Bearer ${anonKey}`);
  } else {
    console.error("SUPABASE_ANON_KEY not configured");
    return jsonError("Server configuration error: missing API key.", 500);
  }

  // Handle request body
  const method = req.method.toUpperCase();
  let body: ArrayBuffer | null = null;

  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.arrayBuffer();
    } catch (err) {
      console.error("Failed to read request body:", err);
      return jsonError("Failed to read request body.", 400);
    }
  }

  // Forward request to Supabase Edge Function
  try {
    const supabaseResponse = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body: body || undefined,
    });

    const respHeaders = new Headers(supabaseResponse.headers);

    // Set CORS headers if origin is present
    const incomingOrigin = req.headers.get("origin");
    if (incomingOrigin) {
      respHeaders.set("Access-Control-Allow-Origin", incomingOrigin);
      respHeaders.set("Vary", "Origin");
    }

    // Handle preflight OPTIONS requests
    if (method === "OPTIONS") {
      respHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      respHeaders.set(
        "Access-Control-Allow-Headers",
        "content-type, apikey, authorization"
      );
    }

    return new Response(supabaseResponse.body, {
      status: supabaseResponse.status,
      headers: respHeaders,
    });
  } catch (err) {
    console.error("Edge proxy error for function:", fn, err);
    return jsonError(
      `Edge proxy error while calling Supabase function "${fn}".`,
      502
    );
  }
}

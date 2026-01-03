// api/edge-proxy/[fn].ts
// Hardened proxy: Vercel → Supabase Edge Functions
// Validates function names, enforces proper URL format, forwards safe headers only

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

// Validate function name: only letters, numbers, dash, underscore
function isValidFunctionName(fn: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(fn);
}

// Validate that the URL is a proper Supabase functions URL
function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith(".functions.supabase.co");
  } catch {
    return false;
  }
}

// Check if function is in allowlist (if configured)
function isFunctionAllowed(fn: string): boolean {
  const allowlist = process.env.SUPABASE_ALLOWED_FUNCTIONS;
  if (!allowlist) return true; // No allowlist = all allowed
  
  const allowed = allowlist.split(",").map(f => f.trim());
  return allowed.includes(fn);
}

// Forward only safe headers
function buildSafeHeaders(req: Request): Headers {
  const safeHeaders = new Headers();
  
  // Safe headers to forward
  const allowedHeaders = [
    "content-type",
    "accept",
    "accept-language",
    "user-agent",
  ];
  
  for (const header of allowedHeaders) {
    const value = req.headers.get(header);
    if (value) {
      safeHeaders.set(header, value);
    }
  }
  
  // Always inject server-side Supabase key
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (anonKey) {
    safeHeaders.set("apikey", anonKey);
    safeHeaders.set("authorization", `Bearer ${anonKey}`);
  }
  
  return safeHeaders;
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Extract function name from URL path
  const segments = url.pathname.split("/").filter(s => s);
  const fn = segments[segments.length - 1];

  if (!fn) {
    return jsonError("Missing function name in URL.", 400);
  }

  // Validate function name
  if (!isValidFunctionName(fn)) {
    console.error("Invalid function name attempted:", fn);
    return jsonError("Invalid function name. Only letters, numbers, dash and underscore allowed.", 400);
  }

  // Check allowlist
  if (!isFunctionAllowed(fn)) {
    console.error("Function not in allowlist:", fn);
    return jsonError("Function not allowed.", 403);
  }

  // Validate SUPABASE_FUNCTIONS_URL exists
  const baseFromEnv = process.env.SUPABASE_FUNCTIONS_URL;
  if (!baseFromEnv) {
    console.error("SUPABASE_FUNCTIONS_URL not configured");
    return jsonError(
      "Server configuration error: SUPABASE_FUNCTIONS_URL missing.",
      500
    );
  }

  // Validate URL format and hostname
  if (!isValidSupabaseUrl(baseFromEnv)) {
    console.error("Invalid SUPABASE_FUNCTIONS_URL:", baseFromEnv);
    return jsonError(
      "Server configuration error: Invalid SUPABASE_FUNCTIONS_URL format.",
      500
    );
  }

  const functionsBase = baseFromEnv.replace(/\/$/, "");
  const targetUrl = `${functionsBase}/${fn}`;

  // Build safe headers
  const forwardHeaders = buildSafeHeaders(req);
  
  // Handle origin for CORS
  const incomingOrigin = req.headers.get("origin");
  if (incomingOrigin) {
    forwardHeaders.set("origin", incomingOrigin);
  }

  // Read body as arrayBuffer for non-GET/HEAD methods
  const method = req.method.toUpperCase();
  let body: ArrayBuffer | null = null;
  
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.arrayBuffer();
    } catch (err: any) {
      console.error("Failed to read request body:", err);
      return jsonError("Failed to read request body.", 400);
    }
  }

  try {
    const supabaseResponse = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
    });

    const respHeaders = new Headers(supabaseResponse.headers);

    // Set CORS headers if origin is present
    if (incomingOrigin) {
      respHeaders.set("Access-Control-Allow-Origin", incomingOrigin);
      respHeaders.set("Vary", "Origin");
    }

    return new Response(supabaseResponse.body, {
      status: supabaseResponse.status,
      headers: respHeaders,
    });
  } catch (err: any) {
    console.error("Edge proxy error for function:", fn, "Error:", err.message || err);
    return jsonError(
      `Failed to call Supabase function "${fn}". Please try again later.`,
      502
    );
  }
}

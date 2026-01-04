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
    console.error(
      "[edge-proxy] CRITICAL: SUPABASE_FUNCTIONS_URL is not configured. " +
      "This must be set in the deployment environment variables."
    );
    return jsonError(
      "Server configuration error: SUPABASE_FUNCTIONS_URL is not configured. Please contact support.",
      500
    );
  }

  // Enforce hostname ends with 'functions.supabase.co'
  let parsedBase: URL;
  try {
    parsedBase = new URL(baseFromEnv);
  } catch (parseError) {
    console.error(
      `[edge-proxy] CRITICAL: SUPABASE_FUNCTIONS_URL is not a valid URL: ${baseFromEnv}`,
      parseError
    );
    return jsonError(
      "Server configuration error: Invalid SUPABASE_FUNCTIONS_URL. Please contact support.",
      500
    );
  }

  if (!parsedBase.hostname.endsWith("functions.supabase.co")) {
    console.error(
      `[edge-proxy] CRITICAL: SUPABASE_FUNCTIONS_URL hostname does not end with 'functions.supabase.co': ${parsedBase.hostname}`
    );
    return jsonError(
      "Server configuration error: Invalid SUPABASE_FUNCTIONS_URL hostname. Please contact support.",
      500
    );
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

  if (!anonKey) {
    console.error(
      "[edge-proxy] CRITICAL: SUPABASE_ANON_KEY not configured. " +
      "This must be set in the deployment environment variables."
    );
    return jsonError(
      "Server configuration error: Missing API key. Please contact support.",
      500
    );
  }

  forwardHeaders.set("apikey", anonKey);
  forwardHeaders.set("authorization", `Bearer ${anonKey}`);

  // Handle request body
  const method = req.method.toUpperCase();
  let body: ArrayBuffer | null = null;

  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.arrayBuffer();
    } catch (err) {
      console.error("[edge-proxy] Failed to read request body:", err);
      return jsonError("Failed to read request body.", 400);
    }
  }

  // Forward request to Supabase Edge Function with timeout and error handling
  try {
    // Set timeout for Supabase function call (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log(`[edge-proxy] Forwarding request to: ${targetUrl}`);

    const supabaseResponse = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body: body || undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(
      `[edge-proxy] Received response from ${fn}: HTTP ${supabaseResponse.status}`
    );

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

    // Handle specific HTTP error statuses with better messages
    if (!supabaseResponse.ok) {
      const status = supabaseResponse.status;
      
      // Try to get error details from response body
      let errorBody: any = null;
      try {
        const responseText = await supabaseResponse.text();
        if (responseText) {
          errorBody = JSON.parse(responseText);
        }
      } catch {
        // Ignore parse errors
      }

      if (status === 429) {
        console.error(`[edge-proxy] Rate limit exceeded for function ${fn}`);
        return jsonError(
          "Rate limit exceeded. Please try again later.",
          429
        );
      } else if (status === 401 || status === 403) {
        const errorDetails = errorBody?.message || errorBody?.error || "";
        console.error(
          `[edge-proxy] Authentication/authorization error for function ${fn}: ${errorDetails}`
        );
        return jsonError(
          "Authentication failed. Please check your credentials.",
          status
        );
      } else if (status >= 500) {
        const errorDetails = errorBody?.message || errorBody?.error || "";
        console.error(
          `[edge-proxy] Supabase function ${fn} returned server error ${status}: ${errorDetails}`
        );
        // Return the actual error from the backend
        return new Response(JSON.stringify(errorBody || { error: "Internal server error" }), {
          status,
          headers: respHeaders,
        });
      }

      // For other error statuses, return the response as-is
      return new Response(JSON.stringify(errorBody || { error: "Request failed" }), {
        status,
        headers: respHeaders,
      });
    }

    return new Response(supabaseResponse.body, {
      status: supabaseResponse.status,
      headers: respHeaders,
    });
  } catch (err: unknown) {
    // Handle timeout errors
    if (err instanceof Error && err.name === "AbortError") {
      console.error(`[edge-proxy] Timeout calling Supabase function ${fn}`);
      return jsonError(
        `Request timeout while calling function "${fn}". The AI service is taking too long to respond. Please try again.`,
        504
      );
    }

    // Handle network errors
    console.error("[edge-proxy] Network error for function:", fn, err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    
    // Check for specific error types
    if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("ECONNREFUSED")) {
      console.error(
        `[edge-proxy] Cannot reach Supabase function ${fn}. DNS or connection error.`
      );
      return jsonError(
        `Cannot reach Supabase function "${fn}". Service may be unavailable. Please try again later.`,
        503
      );
    }

    console.error(
      `[edge-proxy] Unexpected error calling Supabase function ${fn}:`,
      errorMessage
    );
    return jsonError(
      `Unexpected error while calling function "${fn}". Please try again later.`,
      502
    );
  }
}

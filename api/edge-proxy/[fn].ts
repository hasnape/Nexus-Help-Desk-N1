// api/edge-proxy/[fn].ts
// Hardened proxy: Vercel Edge → Supabase Edge Functions

export const config = {
  runtime: "edge",
};

// Function name validation: alphanumeric, dash, underscore, max 64 characters
const VALID_FUNCTION_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

function jsonError(
  message: string,
  status = 500,
  extraHeaders?: HeadersInit
): Response {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers,
  });
}

function resolveFunctionsBaseUrl(): string | null {
  const baseFromEnv = process.env.SUPABASE_FUNCTIONS_URL;
  if (baseFromEnv) {
    return baseFromEnv.replace(/\/$/, "");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(supabaseUrl);
    const hostParts = parsed.hostname.split(".");
    const ref = hostParts[0];
    if (!ref) {
      return null;
    }
    return `https://${ref}.functions.supabase.co/functions/v1`;
  } catch (err) {
    console.error("[edge-proxy] Invalid SUPABASE_URL:", supabaseUrl, err);
    return null;
  }
}

function withCorsHeaders(req: Request, headers?: HeadersInit): Headers {
  const corsHeaders = new Headers(headers);
  corsHeaders.set(
    "Access-Control-Allow-Origin",
    req.headers.get("origin") || "https://www.nexussupporthub.eu"
  );
  corsHeaders.set("Vary", "Origin");
  return corsHeaders;
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

  const functionsBase = resolveFunctionsBaseUrl();
  if (!functionsBase) {
    console.error(
      "[edge-proxy] CRITICAL: SUPABASE_FUNCTIONS_URL or SUPABASE_URL must be configured."
    );
    return jsonError(
      "Server configuration error: Missing Supabase functions URL. Please contact support.",
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
  const targetUrl = `${functionsBase}/${fn}`;

  // Forward only safe headers
  const forwardHeaders = new Headers();
  const safeHeaders = [
    "content-type",
    "accept",
    "accept-language",
    "origin",
    "authorization",
    "apikey",
    "x-client-info",
  ];

  safeHeaders.forEach((header) => {
    const value = req.headers.get(header);
    if (value) {
      forwardHeaders.set(header, value);
    }
  });

  // Always inject server-side SUPABASE_ANON_KEY when missing
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

  if (!forwardHeaders.get("apikey")) {
    forwardHeaders.set("apikey", anonKey);
  }
  if (!forwardHeaders.get("authorization")) {
    forwardHeaders.set("authorization", `Bearer ${anonKey}`);
  }

  const method = req.method.toUpperCase();
  if (method === "OPTIONS") {
    const preflightHeaders = withCorsHeaders(req, {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "content-type, apikey, authorization, x-client-info, accept, accept-language",
    });
    return new Response(null, { status: 204, headers: preflightHeaders });
  }

  // Handle request body
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

    const respHeaders = withCorsHeaders(req, supabaseResponse.headers);

    // Handle specific HTTP error statuses with better messages
    if (!supabaseResponse.ok) {
      const status = supabaseResponse.status;
      const responseText = await supabaseResponse.text();
      const trimmed = responseText?.trim();
      const errorSnippet = trimmed ? trimmed.slice(0, 400) : "";

      console.error(
        `[edge-proxy] Upstream error ${status} for ${fn}: ${errorSnippet}`
      );

      if (status === 429) {
        const retryAfter = supabaseResponse.headers.get("retry-after");
        if (retryAfter) {
          respHeaders.set("retry-after", retryAfter);
        }
      }

      const contentType =
        supabaseResponse.headers.get("content-type") ||
        "application/json; charset=utf-8";
      respHeaders.set("content-type", contentType);

      if (trimmed) {
        return new Response(trimmed, {
          status,
          headers: respHeaders,
        });
      }

      return new Response(
        JSON.stringify({
          error: "upstream_error",
          message: "Upstream service returned an empty error response.",
        }),
        {
          status,
          headers: respHeaders,
        }
      );
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

import type { VercelRequest, VercelResponse } from "@vercel/node";

const STATIC_ALLOWED_ORIGINS = [
  "https://www.nexussupporthub.eu",
  "https://nexus-help-desk-n1.vercel.app",
  "http://localhost:5173",
];

function parseEnvOrigins(value?: string) {
  return (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function makeAllowedOrigins() {
  const dynamicOrigins = [
    ...parseEnvOrigins(process.env.ALLOWED_ORIGINS),
    ...parseEnvOrigins(process.env.SUPABASE_ALLOWED_ORIGINS),
  ];
  return new Set([...STATIC_ALLOWED_ORIGINS, ...dynamicOrigins]);
}

function normalizeProjectUrl(): string | null {
  const candidates = [
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
  ].filter(Boolean) as string[];

  if (candidates.length === 0) return null;

  return candidates[0].replace(/\/$/, "");
}

function applyCors(
  res: VercelResponse,
  origin: string | undefined,
  allowedOrigins: Set<string>,
) {
  if (!origin) {
    res.setHeader("Vary", "Origin");
    return;
  }

  if (!allowedOrigins.has(origin)) {
    res.setHeader("Vary", "Origin");
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "authorization, apikey, content-type, x-client-info",
  );
  res.setHeader("Vary", "Origin");
}

function sendJsonError(res: VercelResponse, message: string, status = 500) {
  res.status(status).json({ error: message });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { fn } = req.query;
  const functionName = Array.isArray(fn) ? fn[0] : fn;

  if (!functionName) {
    return sendJsonError(res, "Missing function name in URL.", 400);
  }

  const projectUrl = normalizeProjectUrl();
  if (!projectUrl) {
    return sendJsonError(res, "SUPABASE_URL is not configured.");
  }

  const allowedOrigins = makeAllowedOrigins();
  const incomingOrigin = req.headers.origin as string | undefined;

  if (req.method === "OPTIONS") {
    applyCors(res, incomingOrigin, allowedOrigins);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    return res.status(204).end();
  }

  const targetUrl = `${projectUrl}/functions/v1/${functionName}`;

  const outgoingHeaders: Record<string, string> = {};
  Object.entries(req.headers).forEach(([key, value]) => {
    if (key === "host" || key === "content-length") return;
    if (typeof value === "undefined") return;
    outgoingHeaders[key] = Array.isArray(value) ? value.join(",") : String(value);
  });

  if (incomingOrigin) {
    outgoingHeaders["origin"] = incomingOrigin;
  } else {
    delete outgoingHeaders["origin"];
  }

  const method = (req.method || "GET").toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : JSON.stringify(req.body);

  try {
    const supabaseResponse = await fetch(targetUrl, {
      method,
      headers: outgoingHeaders,
      body,
    });

    const responseBuffer = await supabaseResponse.arrayBuffer();
    const responseHeaders: Record<string, string> = {};
    supabaseResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    res.status(supabaseResponse.status);
    Object.entries(responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    applyCors(res, incomingOrigin, allowedOrigins);
    return res.send(Buffer.from(responseBuffer));
  } catch (err) {
    console.error("Edge proxy error for fn:", functionName, err);
    applyCors(res, incomingOrigin, allowedOrigins);
    return sendJsonError(
      res,
      `Edge proxy error while calling Supabase function "${functionName}".`,
      502,
    );
  }
}

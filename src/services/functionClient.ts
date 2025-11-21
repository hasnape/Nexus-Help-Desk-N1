import { supabase } from "./supabaseClient";

function safeStringify(input: any): string {
  if (input === undefined) return "";
  if (typeof input === "string") return input;
  try {
    return JSON.stringify(input);
  } catch (e) {
    console.warn("functionClient: unable to stringify body", e);
    return "";
  }
}

export function buildHeaders(initHeaders?: HeadersInit, accessToken?: string): Headers {
  const headers = new Headers(initHeaders ?? {});
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const token =
    accessToken || headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (anonKey && !headers.has("apikey")) {
    headers.set("apikey", anonKey);
  }
  if (token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${token}`);
  } else if (anonKey && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${anonKey}`);
  }

  return headers;
}

export async function callEdgeWithFallback(
  fn: string,
  init: (RequestInit & { json?: any; accessToken?: string }) | undefined = {},
): Promise<Response> {
  const { json, accessToken, ...rest } = init;
  const headers = buildHeaders(init.headers, accessToken);
  const { headers: _ignored, ...restInit } = rest;

  const requestInit: RequestInit = {
    method: restInit.method ?? "POST",
    body: json !== undefined ? safeStringify(json) : restInit.body,
    ...restInit,
    headers,
  };

  const edgeUrl = `/api/edge-proxy/${fn}`;
  let edgeError: unknown = null;

  try {
    const edgeResponse = await fetch(edgeUrl, requestInit);

    if (edgeResponse.status >= 500) {
      throw { kind: "edge_call_failed", response: edgeResponse } as const;
    }

    return edgeResponse;
  } catch (error) {
    edgeError = error;
  }

  const headersObject: Record<string, string> = {};
  headers.forEach((value, key) => {
    headersObject[key] = value;
  });

  const invokeBody =
    json !== undefined
      ? json
      : (() => {
          if (typeof requestInit.body === "string") {
            try {
              return JSON.parse(requestInit.body);
            } catch {
              return requestInit.body;
            }
          }
          return requestInit.body as any;
        })();

  try {
    const { data, error, status, statusText } = await supabase.functions.invoke(fn, {
      method: requestInit.method as any,
      body: invokeBody,
      headers: headersObject,
    });

    const responseStatus = typeof status === "number" ? status : 520;
    const payload = error ?? data ?? null;

    return new Response(JSON.stringify(payload ?? {}), {
      status: responseStatus,
      statusText,
      headers: { "content-type": "application/json" },
    });
  } catch (fallbackError) {
    if (edgeError) throw edgeError instanceof Error ? edgeError : new Error(String(edgeError));
    throw fallbackError instanceof Error
      ? fallbackError
      : new Error(typeof fallbackError === "string" ? fallbackError : "functions_invoke_failed");
  }
}

export async function getAccessToken(): Promise<string | undefined> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? undefined;
  } catch (error) {
    console.warn("functionClient: unable to read session", error);
    return undefined;
  }
}

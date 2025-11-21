import { supabase } from "./supabaseClient";

const DEFAULT_FUNCTIONS_BASE = (() => {
  const fromEnv = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) return `${supabaseUrl.replace(/\/$/, "")}/functions/v1`;
  return "";
})();

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

  if (!DEFAULT_FUNCTIONS_BASE) {
    if (edgeError) throw edgeError instanceof Error ? edgeError : new Error(String(edgeError));
    throw new Error("Missing Supabase functions base URL");
  }

  const fallbackUrl = `${DEFAULT_FUNCTIONS_BASE}/${fn}`;
  return fetch(fallbackUrl, requestInit);
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

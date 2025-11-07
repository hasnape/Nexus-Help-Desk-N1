const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;
  if (error instanceof TypeError) return true;
  const message = typeof error === "string" ? error : (error as { message?: string })?.message;
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("failed to fetch") ||
    normalized.includes("networkerror") ||
    normalized.includes("network error") ||
    normalized.includes("fetch failed")
  );
};

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const buildHeaders = (headers?: HeadersInit): Headers => {
  const merged = new Headers(headers || {});
  if (!merged.has("Content-Type")) {
    merged.set("Content-Type", "application/json");
  }
  if (supabaseAnonKey) {
    if (!merged.has("apikey")) {
      merged.set("apikey", supabaseAnonKey);
    }
    if (!merged.has("Authorization")) {
      merged.set("Authorization", `Bearer ${supabaseAnonKey}`);
    }
  }
  return merged;
};

const getFunctionsBaseUrl = (): string | null => {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return null;
  try {
    const url = new URL(base);
    const hostParts = url.host.split(".");
    const supabaseIndex = hostParts.findIndex((part) => part === "supabase");
    if (supabaseIndex === -1) {
      return null;
    }
    hostParts.splice(supabaseIndex, 1, "functions", "supabase");
    const functionsHost = hostParts.join(".");
    return `${url.protocol}//${functionsHost}`;
  } catch (error) {
    console.warn("Unable to derive Supabase Functions URL", error);
    return null;
  }
};

export type EdgeCallResult = {
  response: Response;
  isFallback: boolean;
};

export const callEdgeWithFallback = async (
  functionName: string,
  payload: unknown,
  init: RequestInit = {}
): Promise<EdgeCallResult> => {
  const headers = buildHeaders(init.headers);
  const requestInit: RequestInit = {
    method: init.method ?? "POST",
    headers,
    body: JSON.stringify(payload),
    ...init,
  };

  const functionsBase = getFunctionsBaseUrl();
  if (functionsBase) {
    const edgeUrl = `${functionsBase.replace(/\/$/, "")}/${functionName}`;
    try {
      const response = await fetch(edgeUrl, requestInit);
      return { response, isFallback: false };
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }
    }
  }

  const fallbackUrl = `/api/${functionName}`;
  const fallbackResponse = await fetch(fallbackUrl, requestInit);
  return { response: fallbackResponse, isFallback: true };
};

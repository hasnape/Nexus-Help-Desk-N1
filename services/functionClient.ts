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
  const requestInit: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
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

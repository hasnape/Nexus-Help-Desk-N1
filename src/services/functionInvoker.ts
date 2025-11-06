import { supabase } from './supabaseClient';

export interface InvokeError {
  status: number | null;
  message?: string;
  context?: any;
  raw?: unknown;
  isNetworkError?: boolean;
}

export interface InvokeResult<T> {
  data: T | null;
  error: InvokeError | null;
}

const NETWORK_ERROR_HINTS = [
  'failed to fetch',
  'networkerror',
  'network error',
  'fetch failed',
  'preflight',
  'cors',
];

function isLikelyNetworkError(error: unknown): boolean {
  if (!error) {
    return true;
  }

  const anyError = error as { status?: unknown; context?: unknown; message?: unknown };
  if (typeof anyError.status === 'number') {
    return false;
  }
  if (anyError.context !== undefined && anyError.context !== null) {
    return false;
  }

  const message = typeof anyError.message === 'string' ? anyError.message.toLowerCase() : '';
  if (!message) {
    return true;
  }

  return NETWORK_ERROR_HINTS.some((hint) => message.includes(hint));
}

function parseSupabaseError(error: any): InvokeError {
  const status = typeof error?.context?.status === 'number'
    ? (error.context.status as number)
    : typeof error?.status === 'number'
      ? (error.status as number)
      : null;

  const message = typeof error?.message === 'string' ? error.message : undefined;

  return {
    status,
    message,
    context: error?.context,
    raw: error,
    isNetworkError: isLikelyNetworkError(error),
  };
}

async function fallbackFetch<T>(path: string, payload: unknown): Promise<InvokeResult<T>> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload ?? {}),
    });

    const text = await response.text();
    const parsed = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;

    if (!response.ok) {
      return {
        data: null,
        error: {
          status: response.status,
          message: typeof parsed?.error === 'string' ? parsed.error : response.statusText,
          context: parsed ?? undefined,
          isNetworkError: false,
        },
      };
    }

    return { data: (parsed as T) ?? null, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : undefined;
    return {
      data: null,
      error: {
        status: null,
        message,
        raw: error,
        isNetworkError: true,
      },
    };
  }
}

export async function invokeWithFallback<T>(
  functionName: string,
  payload: unknown,
  fallbackPath: string,
): Promise<InvokeResult<T>> {
  try {
    const { data, error } = await supabase.functions.invoke<T>(functionName, { body: payload });

    if (!error) {
      return { data: data ?? null, error: null };
    }

    const parsedError = parseSupabaseError(error);
    if (parsedError.isNetworkError) {
      return fallbackFetch<T>(fallbackPath, payload);
    }

    return { data: data ?? null, error: parsedError };
  } catch (error) {
    const fallback = await fallbackFetch<T>(fallbackPath, payload);
    if (fallback.error) {
      fallback.error.raw = error;
    }
    return fallback;
  }
}

import { supabase } from '@/services/supabaseClient';

export interface InvokeWithFallbackError {
  message: string;
  context?: Record<string, unknown>;
}

export type InvokeWithFallbackResult<T> = {
  data?: T;
  error?: InvokeWithFallbackError;
};

const NETWORK_ERROR_HINTS = [
  'failed to fetch',
  'networkerror',
  'network error',
  'fetch failed',
  'cors',
  'preflight',
  'blocked by client',
];

const normalizeErrorMessage = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
};

const shouldFallback = (error: InvokeWithFallbackError): boolean => {
  const status = typeof error.context?.status === 'number' ? error.context.status : undefined;
  if (typeof status === 'number' && status >= 500) {
    return true;
  }

  const code = typeof error.context?.code === 'string' ? error.context.code.toLowerCase() : '';
  const message = error.message.toLowerCase();
  if (NETWORK_ERROR_HINTS.some((hint) => message.includes(hint))) {
    return true;
  }
  if (code && NETWORK_ERROR_HINTS.some((hint) => code.includes(hint))) {
    return true;
  }
  if (error.context?.aborted === true) {
    return true;
  }
  return false;
};

const normalizeSupabaseError = (raw: any): InvokeWithFallbackError => {
  const status = typeof raw?.context?.status === 'number'
    ? raw.context.status
    : typeof raw?.status === 'number'
      ? raw.status
      : undefined;
  const code = typeof raw?.context?.error === 'string'
    ? raw.context.error
    : typeof raw?.context?.code === 'string'
      ? raw.context.code
      : typeof raw?.name === 'string'
        ? raw.name
        : undefined;

  const message = normalizeErrorMessage(raw?.message, code ?? 'request_failed');

  const context: Record<string, unknown> = {};
  if (status !== undefined) context.status = status;
  if (code !== undefined) context.code = code;
  if (raw?.context && typeof raw.context === 'object') {
    Object.assign(context, raw.context);
  }
  if (raw?.name && typeof raw.name === 'string') {
    context.name = raw.name;
  }
  return { message, context };
};

const invokeViaProxy = async <T>(
  fnName: string,
  body: any,
  signal?: AbortSignal
): Promise<InvokeWithFallbackResult<T>> => {
  try {
    const response = await fetch(`/api/edge-proxy/${fnName}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
      signal,
      credentials: 'same-origin',
    });

    const text = await response.text();
    let parsed: any = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }

    if (!response.ok) {
      const message = normalizeErrorMessage(parsed?.error ?? parsed?.message, response.statusText || 'proxy_error');
      return {
        error: {
          message,
          context: {
            status: response.status,
            body: parsed ?? text ?? null,
            code: typeof parsed?.error === 'string' ? parsed.error : undefined,
          },
        },
      };
    }

    return { data: (parsed as T) ?? undefined };
  } catch (error) {
    const message = error instanceof Error ? normalizeErrorMessage(error.message, 'network_error') : 'network_error';
    return {
      error: {
        message,
        context: {
          cause: error instanceof Error ? { name: error.name, message: error.message } : error ?? null,
          aborted: error instanceof DOMException && error.name === 'AbortError',
        },
      },
    };
  }
};

const normalizeCaughtError = (error: unknown): InvokeWithFallbackError => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { message: 'aborted', context: { aborted: true } };
  }
  if (error instanceof Error) {
    return { message: normalizeErrorMessage(error.message, 'request_failed'), context: { name: error.name } };
  }
  return { message: 'request_failed', context: { value: error } };
};

export async function invokeWithFallback<T>(
  fnName: string,
  body?: any,
  signal?: AbortSignal
): Promise<InvokeWithFallbackResult<T>> {
  try {
    const invokeOptions: { body?: any } & Record<string, unknown> = {};
    if (body !== undefined) {
      invokeOptions.body = body;
    }
    if (signal) {
      invokeOptions.signal = signal;
    }

    const { data, error } = await supabase.functions.invoke<T>(fnName, invokeOptions as any);

    if (!error) {
      return { data: data ?? undefined };
    }

    const normalized = normalizeSupabaseError(error);
    if (shouldFallback(normalized)) {
      return invokeViaProxy<T>(fnName, body, signal);
    }

    return { data: data ?? undefined, error: normalized };
  } catch (error) {
    const normalized = normalizeCaughtError(error);
    if (shouldFallback(normalized)) {
      return invokeViaProxy<T>(fnName, body, signal);
    }
    return { error: normalized };
  }
}

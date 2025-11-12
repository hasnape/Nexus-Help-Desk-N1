const STATIC_BLOCKED_ORIGINS = ["infragrid.v.network"] as const;

const normalizeHost = (host: string): string | null => {
  const trimmed = host.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
};

const extractHost = (origin: string): string | null => {
  const trimmed = origin.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    return normalizeHost(url.host);
  } catch (_error) {
    const withoutProtocol = trimmed.replace(/^[a-zA-Z]+:\/\//, "");
    const hostOnly = withoutProtocol.split("/")[0];
    return normalizeHost(hostOnly);
  }
};

const getProcessEnvValue = (key: string): string | undefined => {
  if (typeof process === "undefined" || typeof process.env !== "object") {
    return undefined;
  }
  const value = (process.env as Record<string, string | undefined>)[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
};

const getDenoEnvValue = (key: string): string | undefined => {
  const deno = (globalThis as {
    Deno?: { env?: { get?: (input: string) => string | undefined } };
  }).Deno;
  const env = deno?.env;
  const getter = env?.get;
  if (!getter) {
    return undefined;
  }
  try {
    const value = getter.call(env, key);
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
  } catch (_error) {
    return undefined;
  }
};

const readEnvValue = (key: string): string | undefined => {
  return getProcessEnvValue(key) ?? getDenoEnvValue(key);
};

const ENV_BLOCK_LIST_KEYS = [
  "BLOCKED_ORIGINS",
  "SUPABASE_BLOCKED_ORIGINS",
  "NEXT_PUBLIC_BLOCKED_ORIGINS",
] as const;

const collectBlockedHostCandidates = (): string[] => {
  const values: string[] = [];
  for (const key of ENV_BLOCK_LIST_KEYS) {
    const value = readEnvValue(key);
    if (value) {
      values.push(value);
    }
  }
  return values;
};

const splitCandidates = (candidates: Iterable<string>): string[] => {
  const result: string[] = [];
  for (const candidate of candidates) {
    const parts = candidate.split(",");
    for (const part of parts) {
      const normalized = part.trim();
      if (normalized) {
        result.push(normalized);
      }
    }
  }
  return result;
};

const collectBlockedHosts = (): string[] => {
  const hosts = new Set<string>();
  const push = (value: string) => {
    const host = extractHost(value);
    if (host) {
      hosts.add(host);
    }
  };

  for (const origin of STATIC_BLOCKED_ORIGINS) {
    push(origin);
  }

  for (const candidate of splitCandidates(collectBlockedHostCandidates())) {
    push(candidate);
  }

  return Array.from(hosts);
};

type BlockedCache = {
  signature: string;
  set: Set<string>;
};

let cache: BlockedCache | null = null;

const getBlockedHostSet = (): Set<string> => {
  const hosts = collectBlockedHosts();
  const signature = hosts.slice().sort().join(",");
  if (!cache || cache.signature !== signature) {
    cache = { signature, set: new Set(hosts) };
  }
  return cache.set;
};

export const listBlockedOrigins = (): string[] => {
  return Array.from(getBlockedHostSet()).sort();
};

export const isOriginBlocked = (origin: string | null | undefined): boolean => {
  if (!origin) {
    return false;
  }

  const host = extractHost(origin);
  if (!host) {
    return false;
  }

  return getBlockedHostSet().has(host);
};

export const filterBlockedOrigins = <T extends string>(origins: Iterable<T>): T[] => {
  const blocked = getBlockedHostSet();
  const result: T[] = [];
  for (const origin of origins) {
    const host = extractHost(origin);
    if (host && blocked.has(host)) {
      continue;
    }
    result.push(origin);
  }
  return result;
};

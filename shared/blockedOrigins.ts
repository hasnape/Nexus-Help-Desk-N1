const BLOCKED_HOSTS = new Set<string>(["infragrid.v.network"]);

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

export const isOriginBlocked = (origin: string | null | undefined): boolean => {
  if (!origin) {
    return false;
  }

  const host = extractHost(origin);
  if (!host) {
    return false;
  }

  return BLOCKED_HOSTS.has(host);
};

export const filterBlockedOrigins = <T extends string>(origins: Iterable<T>): T[] => {
  const result: T[] = [];
  for (const origin of origins) {
    if (!isOriginBlocked(origin)) {
      result.push(origin);
    }
  }
  return result;
};

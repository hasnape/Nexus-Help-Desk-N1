export type OriginInput = string | string[] | null | undefined;

export const parseOrigins = (value: OriginInput): string[] => {
  if (!value) return [];
  const sources = Array.isArray(value) ? value : [value];
  return sources
    .flatMap((entry) => entry.split(","))
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const createAllowedOriginSet = (...values: OriginInput[]): Set<string> => {
  const allowed = new Set<string>();
  values.forEach((value) => {
    for (const origin of parseOrigins(value)) {
      allowed.add(origin);
    }
  });
  return allowed;
};

export const isOriginAllowed = (
  origin: string | null | undefined,
  allowed: Set<string>
): boolean => {
  if (!origin) {
    return allowed.size === 0;
  }
  if (allowed.size === 0) {
    return true;
  }
  return allowed.has(origin);
};

export const resolveAllowOrigin = (
  origin: string | null | undefined,
  allowed: Set<string>
): string => {
  if (origin && isOriginAllowed(origin, allowed)) {
    return origin;
  }
  const first = allowed.values().next().value as string | undefined;
  return first ?? "*";
};

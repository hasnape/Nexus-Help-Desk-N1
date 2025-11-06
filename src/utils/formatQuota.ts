export type Quota = {
  used: number;
  limit: number | null;
  unlimited: boolean;
  timezone: string | null;
};

export type NormalizedQuota = {
  used: number;
  limit: number | null;
  remaining: number | null;
  unlimited: boolean;
  timezone: string;
  percent: number | null;
  remainingLabel: string;
  limitLabel: string;
};

export function formatQuota(q: Quota, locale: string = 'fr-FR'): NormalizedQuota {
  const tz = q.timezone || 'Europe/Paris';
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  if (q.unlimited || q.limit == null) {
    return {
      used: Math.max(0, q.used ?? 0),
      limit: null,
      remaining: null,
      unlimited: true,
      timezone: tz,
      percent: null,
      remainingLabel: '∞',
      limitLabel: '∞',
    };
  }

  const limit = Math.max(0, q.limit);
  const used = Math.max(0, q.used ?? 0);
  const remaining = Math.max(0, limit - used);
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return {
    used,
    limit,
    remaining,
    unlimited: false,
    timezone: tz,
    percent,
    remainingLabel: nf.format(remaining),
    limitLabel: nf.format(limit),
  };
}

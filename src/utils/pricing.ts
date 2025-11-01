import type { TFunction } from "i18next";

export type PricingPlanKey = "freemium" | "standard" | "pro";

export interface PricingPlan {
  name: string;
  price: string;
  yearly?: string;
  features: string[];
  cta: string;
}

export type PricingPlans = Record<PricingPlanKey, PricingPlan>;

type RawPlan = {
  name?: unknown;
  price?: unknown;
  yearly?: unknown;
  features?: unknown;
  cta?: unknown;
};

const fallbackPlans: PricingPlans = {
  freemium: {
    name: "Freemium (sandbox)",
    price: "Free",
    features: [
      "1 agent",
      "50 tickets/month",
      "7-day read-only history",
      "Basic AI replies",
      "No scheduling",
      "No export",
      "Upgrade nudge at 80%",
      "Creation blocked at 100%",
    ],
    cta: "Request a demo",
  },
  standard: {
    name: "Standard",
    price: "€19/mo",
    yearly: "or €190/year",
    features: [
      "5 agents",
      "500 tickets/month",
      "6-month history",
      "Full AI + auto categorization",
      "Internal notes",
      "CSV export",
      "Simple scheduling (no reminders)",
      "Standard SLA",
      "Manager activation code included",
    ],
    cta: "Request a demo",
  },
  pro: {
    name: "Pro",
    price: "€39/mo",
    yearly: "or €390/year",
    features: [
      "10 agents",
      "1000 tickets/month",
      "24-month history",
      "Voice commands",
      "Multilingual FR/EN",
      "Scheduling with reminders",
      "Advanced reports",
      "Webhooks",
      "Priority SLA",
    ],
    cta: "Request a demo",
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickString = (candidates: unknown[], fallback: string): string => {
  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return fallback;
};

const pickOptionalString = (
  candidates: unknown[],
  fallback?: string
): string | undefined => {
  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  if (typeof fallback === "string") {
    const trimmedFallback = fallback.trim();
    if (trimmedFallback.length > 0) {
      return trimmedFallback;
    }
  }

  return undefined;
};

const collectLegacyFeatures = (
  t: TFunction,
  planKey: PricingPlanKey
): string[] => {
  const features: string[] = [];

  for (let index = 1; index <= 12; index += 1) {
    const translation = t(`pricing.${planKey}.feature${index}`, { defaultValue: "" });
    if (typeof translation === "string") {
      const cleaned = translation.trim();
      if (cleaned.length > 0) {
        features.push(cleaned);
      }
    }
  }

  return features;
};

const resolvePlan = (
  t: TFunction,
  rawPlans: unknown,
  planKey: PricingPlanKey
): PricingPlan => {
  const rawPlan = isRecord(rawPlans) ? rawPlans[planKey] : undefined;
  const candidate: RawPlan = isRecord(rawPlan) ? (rawPlan as RawPlan) : {};
  const fallbackPlan = fallbackPlans[planKey];

  const name = pickString(
    [
      candidate.name,
      t(`pricing.plans.${planKey}.name`, { defaultValue: "" }),
      t(`pricing.${planKey}.name`, { defaultValue: "" }),
    ],
    fallbackPlan.name
  );

  const price = pickString(
    [
      candidate.price,
      t(`pricing.plans.${planKey}.price`, { defaultValue: "" }),
      t(`pricing.${planKey}.price`, { defaultValue: "" }),
    ],
    fallbackPlan.price
  );

  const yearly = pickOptionalString(
    [
      candidate.yearly,
      t(`pricing.plans.${planKey}.yearly`, { defaultValue: "" }),
      t(`pricing.${planKey}.yearly`, { defaultValue: "" }),
    ],
    fallbackPlan.yearly
  );

  const planFeaturesCandidate = candidate.features;
  let features: string[] = [];

  if (Array.isArray(planFeaturesCandidate)) {
    features = planFeaturesCandidate
      .filter((feature): feature is string => typeof feature === "string" && feature.trim().length > 0)
      .map((feature) => feature.trim());
  }

  if (features.length === 0) {
    const legacyFeatures = collectLegacyFeatures(t, planKey);
    features = legacyFeatures.length > 0 ? legacyFeatures : fallbackPlan.features;
  }

  const defaultCta = pickString(
    [
      t(`pricing.plans.${planKey}.cta`, { defaultValue: "" }),
      t(`pricing.${planKey}.cta`, { defaultValue: "" }),
      t("pricing.ctaDemo", { defaultValue: fallbackPlan.cta }),
    ],
    fallbackPlan.cta
  );

  const cta = pickString([candidate.cta, defaultCta], fallbackPlan.cta);

  return {
    name,
    price,
    yearly,
    features,
    cta,
  };
};

export const getPricingPlans = (t: TFunction): PricingPlans => {
  const rawPlans = t("pricing.plans", { returnObjects: true });

  return {
    freemium: resolvePlan(t, rawPlans, "freemium"),
    standard: resolvePlan(t, rawPlans, "standard"),
    pro: resolvePlan(t, rawPlans, "pro"),
  };
};

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../contexts/LanguageContext";

type Plan = {
  name: string;
  price: string;
  yearly?: string;
  features: string[];
  cta: string;
};

type Plans = {
  freemium: Plan;
  standard: Plan;
  pro: Plan;
};

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">{children}</span>
);

const Card: React.FC<{ plan: Plan; badgeText?: string; onClick: () => void }> = ({
  plan,
  badgeText,
  onClick,
}) => {
  return (
    <div className="rounded-2xl shadow p-6 border bg-white/70 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        {badgeText ? <Badge>{badgeText}</Badge> : null}
      </div>

      <div className="mt-2 text-2xl font-bold">{plan.price}</div>
      {plan.yearly ? <div className="text-sm opacity-70">{plan.yearly}</div> : null}

      <ul className="mt-4 space-y-2 text-sm">
        {plan.features.map((feature) => (
          <li key={`${plan.name}-${feature}`}>• {feature}</li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-6 w-full border rounded-lg py-2 hover:bg-black hover:text-white transition"
        onClick={onClick}
        aria-label={plan.cta}
        title={plan.cta}
      >
        {plan.cta}
      </button>
    </div>
  );
};

const planFeatureKeys: Record<keyof Plans, readonly string[]> = {
  freemium: [
    "pricing.freemium.feature1",
    "pricing.freemium.feature2",
    "pricing.freemium.feature3",
    "pricing.freemium.feature4",
  ],
  standard: [
    "pricing.standard.feature1",
    "pricing.standard.feature2",
    "pricing.standard.feature3",
    "pricing.standard.feature4",
  ],
  pro: [
    "pricing.pro.feature1",
    "pricing.pro.feature2",
    "pricing.pro.feature3",
    "pricing.pro.feature4",
  ],
};

const planYearlyKeys: Partial<Record<keyof Plans, string>> = {
  freemium: "pricing.freemium.yearly",
  standard: "pricing.standard.yearly",
  pro: "pricing.pro.yearly",
};

const PricingSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const resolveTranslation = (key: string, fallbackKey?: string): string => {
    const value = t(key);
    if (value !== key && value.trim().length > 0) {
      return value;
    }

    if (!fallbackKey) {
      return "";
    }

    const fallbackValue = t(fallbackKey);
    return fallbackValue !== fallbackKey ? fallbackValue : "";
  };

  const resolveOptionalTranslation = (key: string | undefined): string | undefined => {
    if (!key) {
      return undefined;
    }
    const value = resolveTranslation(key);
    return value.length > 0 ? value : undefined;
  };

  const plans = useMemo<Plans>(() => {
    const buildPlan = (planKey: keyof Plans): Plan => {
      const yearly = resolveOptionalTranslation(planYearlyKeys[planKey]);
      const features = planFeatureKeys[planKey]
        .map((featureKey) => resolveTranslation(featureKey))
        .filter((feature): feature is string => feature.length > 0);

      return {
        name: resolveTranslation(`pricing.${planKey}.name`),
        price: resolveTranslation(`pricing.${planKey}.price`),
        yearly,
        features,
        cta: resolveTranslation(`pricing.${planKey}.cta`, "pricing.button.signUp"),
      };
    };

    return {
      freemium: buildPlan("freemium"),
      standard: buildPlan("standard"),
      pro: buildPlan("pro"),
    };
  }, [t]);

  const title = resolveTranslation("pricing.title");
  const disclaimer = resolveTranslation("pricing.disclaimer");
  const popular = resolveTranslation("pricing.badges.popular", "pricing.popular");

  const goSignup = () => navigate("/signup");

  return (
    <section id="pricing" className="container mx-auto py-12">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="opacity-70 mb-8">{disclaimer}</p>

      <div className="grid md:grid-cols-3 gap-6">
        <Card plan={plans.freemium} onClick={goSignup} />
        <Card plan={plans.standard} badgeText={popular} onClick={goSignup} />
        <Card plan={plans.pro} onClick={goSignup} />
      </div>
    </section>
  );
};

export default PricingSection;

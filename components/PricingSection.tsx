import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "./FormElements";

const PLAN_KEYS = ["freemium", "standard", "pro"] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

type NormalizedPlan = {
  key: PlanKey;
  name: string;
  price: string;
  yearly?: string;
  features: string[];
  cta: string;
  highlighted: boolean;
};

const normalizeFeatures = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string");
  }
  if (typeof raw === "string") {
    return [raw];
  }
  return [];
};

const PricingSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const plans: NormalizedPlan[] = PLAN_KEYS.map((key) => {
    const features = normalizeFeatures(t(`pricing.plans.${key}.features`, { returnObjects: true }));
    const yearly = t(`pricing.plans.${key}.yearly`, { defaultValue: "" });
    return {
      key,
      name: t(`pricing.plans.${key}.name`),
      price: t(`pricing.plans.${key}.price`),
      yearly: yearly.trim().length > 0 ? yearly : undefined,
      features,
      cta: t(`pricing.plans.${key}.cta`),
      highlighted: key === "standard",
    };
  });

  return (
    <section id="pricing" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:mt-4">
            {t("pricing.disclaimer")}
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.key}
              className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-lg ${
                plan.highlighted ? "border-primary shadow-md" : "border-slate-200"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    {t("pricing.plans.standard.badge", { defaultValue: "Popular" })}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-slate-900">{plan.price}</p>
                {plan.yearly && (
                  <p className="text-sm text-slate-500">{plan.yearly}</p>
                )}
              </div>

              <ul className="flex-1 space-y-3 text-sm text-slate-700">
                {plan.features.map((feature, index) => (
                  <li key={`${plan.key}-feature-${index}`} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.highlighted ? "primary" : "outline"}
                  onClick={() => navigate("/signup", { state: { plan: plan.key } })}
                >
                  {plan.cta}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

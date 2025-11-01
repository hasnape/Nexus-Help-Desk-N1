import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { getPricingPlans, type PricingPlan, type PricingPlans } from "@/utils/pricing";

type CardProps = {
  plan: PricingPlan;
  badgeText?: string;
  onClick: () => void;
};

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">{children}</span>
);

const Card: React.FC<CardProps> = ({ plan, badgeText, onClick }) => (
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

const PricingSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const plans: PricingPlans = getPricingPlans(t);
  const title = t("pricing.title");
  const disclaimer = t("pricing.disclaimer");
  const popular = t("pricing.badges.popular");
  const goDemo = () => navigate("/demo");

  return (
    <section id="pricing" className="container mx-auto py-12">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="opacity-70 mb-8">{disclaimer}</p>
      <div className="grid md:grid-cols-3 gap-6">
        <Card plan={plans.freemium} onClick={goDemo} />
        <Card plan={plans.standard} badgeText={popular} onClick={goDemo} />
        <Card plan={plans.pro} onClick={goDemo} />
      </div>
    </section>
  );
};

export default PricingSection;

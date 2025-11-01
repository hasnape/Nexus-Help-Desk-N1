import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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

const defaultPlans: Plans = {
  freemium: {
    name: "",
    price: "",
    features: [],
    cta: "",
  },
  standard: {
    name: "",
    price: "",
    features: [],
    cta: "",
  },
  pro: {
    name: "",
    price: "",
    features: [],
    cta: "",
  },
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

const PricingSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const plans = t<Plans>("pricing.plans", {
    returnObjects: true,
    defaultValue: defaultPlans,
  });
  const title = t("pricing.title");
  const disclaimer = t("pricing.disclaimer");
  const popular = t("pricing.badges.popular");

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

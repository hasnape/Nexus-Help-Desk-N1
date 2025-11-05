import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { getPricingPlans, type PricingPlan, type PricingPlans, type PricingPlanKey } from "@/utils/pricing";

type CardProps = {
  plan: PricingPlan;
  badgeText?: string;
  onDemo: () => void;
  demoLabel: string;
  buyLabel: string;
  buyHref?: string;
  onBuy?: () => void;
};

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-slate-900 text-white">
    {children}
  </span>
);

const Card: React.FC<CardProps> = ({ plan, badgeText, onDemo, demoLabel, buyLabel, buyHref, onBuy }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full text-slate-900">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        <p className="mt-2 text-2xl font-bold">{plan.price}</p>
        {plan.yearly ? <p className="text-sm text-slate-600">{plan.yearly}</p> : null}
      </div>
      {badgeText ? <Badge>{badgeText}</Badge> : null}
    </div>
    <ul className="mt-6 space-y-2 text-sm text-slate-700 flex-1">
      {plan.features.map((feature) => (
        <li key={`${plan.name}-${feature}`} className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 rounded-full bg-slate-500" aria-hidden="true" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <div className="mt-6 flex flex-col gap-3">
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 px-5 py-2.5 font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
        onClick={onDemo}
        aria-label={`${demoLabel} - ${plan.name}`}
        title={demoLabel}
      >
        <span>{demoLabel}</span>
        <svg
          className="h-4 w-4"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3.75 8h8.5m0 0L9.5 5.25M12.25 8 9.5 10.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {buyHref ? (
        <a
          href={buyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white shadow-md shadow-slate-900/15 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
          aria-label={`${buyLabel} - ${plan.name}`}
          title={buyLabel}
        >
          <span>{buyLabel}</span>
        </a>
      ) : (
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white shadow-md shadow-slate-900/15 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
          onClick={onBuy}
          aria-label={`${buyLabel} - ${plan.name}`}
          title={buyLabel}
        >
          <span>{buyLabel}</span>
        </button>
      )}
    </div>
  </div>
);

const PricingSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const plans: PricingPlans = getPricingPlans(t);
  const title = t("pricing.title");
  const disclaimer = t("pricing.disclaimer");
  const popular = t("pricing.badges.popular");
  const demoLabel = t("pricing.ctaDemo");
  const buyLabel = t("pricing.ctaSubscribe", {
    defaultValue: t("signupPlans.subscribeDefault", { defaultValue: "Souscrire maintenant" }),
  });
  const goDemo = () => navigate("/demo");
  const goFreemium = () => navigate("/signup?plan=freemium");

  const subscribeLinks: Record<Exclude<PricingPlanKey, "freemium">, string> = {
    standard: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0E515487AE797135CNBTRYKA",
    pro: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-7HP75881LB3608938NBTBGUA",
  };

  return (
    <section id="pricing" className="bg-slate-100 py-16 text-slate-900">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="mt-2 text-base text-slate-700">{disclaimer}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            plan={plans.freemium}
            onDemo={goDemo}
            demoLabel={demoLabel}
            buyLabel={buyLabel}
            onBuy={goFreemium}
          />
          <Card
            plan={plans.standard}
            badgeText={popular}
            onDemo={goDemo}
            demoLabel={demoLabel}
            buyLabel={buyLabel}
            buyHref={subscribeLinks.standard}
          />
          <Card
            plan={plans.pro}
            onDemo={goDemo}
            demoLabel={demoLabel}
            buyLabel={buyLabel}
            buyHref={subscribeLinks.pro}
          />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

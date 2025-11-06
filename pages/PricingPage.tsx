import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { useLanguage } from "@/contexts/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import { getPricingPlans, type PricingPlanKey } from "@/utils/pricing";

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const { t: legacyTranslate } = useLanguage();
  const { user } = useApp();
  const location = useLocation();

  const plans = getPricingPlans(t);
  const popularBadge = t("pricing.badges.popular");
  const ctaDemo = t("pricing.ctaDemo");
  const ctaBuyNow = t("pricing.buy_now", {
    defaultValue: t("signupPlans.subscribeDefault", { defaultValue: "Souscrire maintenant" }),
  });
  const ctaActivate = t("pricing.activate_now", {
    defaultValue: t("signupPlans.freemium.modal.buttons.subscribe", { defaultValue: "Activer maintenant" }),
  });

  const backLinkDestination = user ? "/dashboard" : "/landing";

  const orderedPlans: Array<{ key: PricingPlanKey; isPopular: boolean }> = [
    { key: "freemium", isPopular: false },
    { key: "standard", isPopular: true },
    { key: "pro", isPopular: false },
  ];

  const subscribeLinks: Record<PricingPlanKey, string> = {
    freemium: "/signup?plan=freemium",
    standard: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0E515487AE797135CNBTRYKA",
    pro: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-7HP75881LB3608938NBTBGUA",
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to={backLinkDestination}
          state={{ from: location }}
          className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
        >
          <ArrowLeftIcon className="w-5 h-5 me-2" />
          {legacyTranslate("pricing.backToApp", { default: "Retour à l’application" })}
        </Link>
      </div>

      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-3">{t("pricing.title")}</h1>
        <p className="text-lg text-slate-600">{t("pricing.disclaimer")}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {orderedPlans.map(({ key, isPopular }) => {
          const plan = plans[key];
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-white/80 shadow-sm backdrop-blur-sm p-8 flex flex-col ${
                isPopular ? "border-blue-600 shadow-lg" : "border-slate-200"
              }`}
            >
              {isPopular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                  {popularBadge}
                </span>
              ) : null}

              <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold text-slate-900">{plan.name}</h2>
                <div className="mt-3 text-3xl font-bold text-slate-900">{plan.price}</div>
                {plan.yearly ? <div className="text-sm text-slate-500">{plan.yearly}</div> : null}
              </div>

              <ul className="space-y-3 text-sm text-slate-700 flex-1">
                {plan.features.map((feature) => (
                  <li key={`${plan.name}-${feature}`} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                  aria-label={`${ctaDemo} - ${plan.name}`}
                >
                  {ctaDemo}
                </Link>
                {key === "freemium" ? (
                  <Link
                    to={subscribeLinks.freemium}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-dark"
                    aria-label={`${ctaActivate} - ${plan.name}`}
                  >
                    {ctaActivate}
                  </Link>
                ) : (
                  <a
                    href={subscribeLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-dark"
                    aria-label={`${ctaBuyNow} - ${plan.name}`}
                  >
                    {ctaBuyNow}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-slate-500">
        <p>{legacyTranslate("pricing.additionalNote", { default: "Tout hébergé sur Supabase (RLS). Aucun stockage local." })}</p>
      </div>
    </div>
  );
};

export default PricingPage;

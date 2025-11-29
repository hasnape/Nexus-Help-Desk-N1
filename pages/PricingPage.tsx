import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import Layout from "../components/Layout";
import { useApp } from "../App";
import { getPricingPlans, type PricingPlanKey } from "@/utils/pricing";
import { useLanguage } from "../contexts/LanguageContext";

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
  const backLinkText = t("pricing.backToApp", {
    defaultValue: legacyTranslate("pricing.backToApp", { defaultValue: "Back" }),
  });

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
    <Layout>
      <main className="min-h-[calc(100vh-5rem)] bg-slate-50 py-8 lg:py-12">
        <div className="mx-auto max-w-6xl px-4 space-y-8">
          <div>
            <Link
              to={backLinkDestination}
              state={{ from: location }}
              className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
            >
              <ArrowLeftIcon className="w-5 h-5 me-2" />
              {backLinkText}
            </Link>
          </div>

          <header className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("pricing.badge")}</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t("pricing.title")}</h1>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">{t("pricing.disclaimer")}</p>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            {orderedPlans.map(({ key, isPopular }) => {
              const plan = plans[key];
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border bg-white shadow-sm p-6 flex flex-col ${
                    isPopular ? "border-indigo-600 shadow-lg" : "border-slate-200"
                  }`}
                >
                  {isPopular ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                      {popularBadge}
                    </span>
                  ) : null}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{plan.badge}</p>
                    <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                    <p className="text-sm text-slate-600">{plan.description}</p>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-500">{plan.period}</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6 space-y-2">
                    <a
                      href={subscribeLinks[key]}
                      className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 ${
                        isPopular
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {key === "freemium" ? ctaActivate : ctaBuyNow}
                    </a>
                    {key !== "freemium" && (
                      <Link
                        to="/contact"
                        className="block text-center text-sm font-semibold text-primary hover:text-primary-dark"
                      >
                        {ctaDemo}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-slate-700">{t("pricing.additionalNote")}</p>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default PricingPage;

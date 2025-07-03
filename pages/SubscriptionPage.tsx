import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useApp } from "../App";
import PayPalButton from "../components/PayPalButton";
import { UserRole } from "../types";
import { Link, useLocation } from "react-router-dom";
import FreemiumPlanIcon from "../components/plan_images/FreemiumPlanIcon";
import StandardPlanIcon from "../components/plan_images/StandardPlanIcon";
import ProPlanIcon from "../components/plan_images/ProPlanIcon";

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

const CheckIcon = () => (
  <img
    alt="Nexus Support Hub Logo"
    className="w-5 h-5 rounded-full object-cover"
    src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
  />
);

const PlanIcon: React.FC<{ planNameKey: string }> = ({ planNameKey }) => {
  switch (planNameKey) {
    case "pricing.standard.name":
      return <StandardPlanIcon className="w-12 h-12 text-primary" />;
    case "pricing.pro.name":
      return <ProPlanIcon className="w-12 h-12 text-amber-500" />;
    case "pricing.freemium.name":
    default:
      return <FreemiumPlanIcon className="w-12 h-12 text-slate-400" />;
  }
};

const SubscriptionPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useApp();
  const location = useLocation();

  // In a real app, this would come from the user's profile or subscription status in the DB.
  // For this demo, we assume all non-managers are on Freemium.
  const currentUserPlan = user?.role === UserRole.MANAGER ? "Pro" : "Freemium";
  const currentUserPlanKey = `pricing.${currentUserPlan.toLowerCase()}.name`;

  const plans = [
    {
      nameKey: "pricing.standard.name",
      priceKey: "pricing.standard.price",
      descKey: "pricing.standard.desc",
      features: [
        "pricing.standard.feature1",
        "pricing.standard.feature2",
        "pricing.standard.feature3",
        "pricing.standard.feature4",
      ],
      paypalPlanId: "P-3TE12345AB678901CDE2FGHI",
    },
    {
      nameKey: "pricing.pro.name",
      priceKey: "pricing.pro.price",
      descKey: "pricing.pro.desc",
      features: [
        "pricing.pro.feature1",
        "pricing.pro.feature2",
        "pricing.pro.feature3",
        "pricing.pro.feature4",
      ],
      paypalPlanId: "P-9JI87654LK3210FEDCBA",
    },
  ];

  const backLinkDestination =
    user?.role === UserRole.AGENT
      ? "/agent/dashboard"
      : user?.role === UserRole.MANAGER
      ? "/manager/dashboard"
      : "/dashboard";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          to={backLinkDestination}
          state={{ from: location }}
          className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
        >
          <ArrowLeftIcon className="w-5 h-5 me-2" />
          {t("subscription.backToDashboard", { default: "Back to Dashboard" })}
        </Link>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800">
          {t("subscription.pageTitle", { default: "Manage Your Subscription" })}
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          {t("subscription.pageSubtitle", {
            default: "Choose the plan that's right for your team.",
          })}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-slate-700">
          {t("subscription.currentPlan.title", {
            default: "Your Current Plan",
          })}
        </h2>
        <div className="flex items-center gap-4 mt-2">
          <PlanIcon planNameKey={currentUserPlanKey} />
          <div className="text-start">
            <p className="text-3xl font-bold text-primary">
              {t(currentUserPlanKey)}
            </p>
            {currentUserPlan === "Freemium" && (
              <p className="text-slate-500 mt-1">
                {t("subscription.currentPlan.freemiumDesc", {
                  default: "You are currently on the free plan.",
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={t(plan.nameKey)}
            className={`border rounded-xl p-8 flex flex-col shadow-lg text-center ${
              currentUserPlan === t(plan.nameKey, { default: plan.nameKey })
                ? "bg-slate-50"
                : "bg-white"
            }`}
          >
            <div className="mx-auto mb-4">
              <PlanIcon planNameKey={plan.nameKey} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">
              {t(plan.nameKey)}
            </h3>
            <p className="mt-2 text-slate-500 flex-grow">{t(plan.descKey)}</p>
            <div className="mt-6">
              <span className="text-4xl font-bold">{t(plan.priceKey)}</span>
              <span className="text-slate-500 ms-1">
                {t("pricing.perAgentPerMonth")}
              </span>
            </div>
            <ul className="mt-8 space-y-4 text-start flex-grow">
              {plan.features.map((featureKey) => (
                <li key={featureKey} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckIcon />
                  </div>
                  <span className="ms-3 text-slate-600">{t(featureKey)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {t(currentUserPlanKey) === t(plan.nameKey) ? (
                <div className="text-center py-3 px-4 bg-green-100 text-green-700 font-semibold rounded-md">
                  {t("subscription.currentPlan.label", {
                    default: "Current Plan",
                  })}
                </div>
              ) : (
                <PayPalButton planId={plan.paypalPlanId} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8 text-xs text-slate-500">
        <p>
          {t("subscription.disclaimer.title", {
            default: "Subscriptions are managed by PayPal.",
          })}
        </p>
        <p>
          {t("subscription.disclaimer.text", {
            default: "You can cancel anytime from your PayPal account.",
          })}
        </p>
      </div>
      
    </div>
  );
};

export default SubscriptionPage;

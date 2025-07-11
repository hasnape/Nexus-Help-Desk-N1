import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../App";
import { UserRole } from "../types";
import { Link, useLocation } from "react-router-dom";
import FreemiumPlanIcon from "../components/plan_images/FreemiumPlanIcon";
import StandardPlanIcon from "../components/plan_images/StandardPlanIcon";
import ProPlanIcon from "../components/plan_images/ProPlanIcon";
import LoadingSpinner from "../components/LoadingSpinner";

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

const PlanIcon: React.FC<{ planName: string }> = ({ planName }) => {
  switch (planName) {
    case "standard":
      return (
        <StandardPlanIcon className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
      );
    case "pro":
      return (
        <ProPlanIcon className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500" />
      );
    case "freemium":
    default:
      return (
        <FreemiumPlanIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
      );
  }
};

const SubscriptionPageContent: React.FC = () => {
  const { t } = useTranslation(["subscription", "pricing", "common"]);
  const { user, company } = useApp();
  const location = useLocation();

  const currentUserPlan = company?.plan || "freemium";
  const backLinkDestination =
    user?.role === UserRole.MANAGER ? "/manager/dashboard" : "/dashboard";

  const getPlanPricing = (plan: string) => {
    switch (plan) {
      case "freemium":
        return {
          price: t("pricing.freemium.price"),
          description: t("pricing.freemium.description"),
        };
      case "standard":
        return {
          price: t("pricing.standard.price"),
          description: t("pricing.standard.priceDescription"),
        };
      case "pro":
        return {
          price: t("pricing.pro.price"),
          description: t("pricing.pro.priceDescription"),
        };
      default:
        return {
          price: t("pricing.freemium.price"),
          description: t("pricing.freemium.description"),
        };
    }
  };

  const getPlanFeatures = (plan: string) => {
    const features = [];
    const featureCount = 6; // Maximum number of features to try

    for (let i = 1; i <= featureCount; i++) {
      const featureKey = `pricing.${plan}.feature${i}`;
      const feature = t(featureKey);
      if (feature && feature !== featureKey) {
        features.push(feature);
      }
    }

    return features;
  };

  const planPricing = getPlanPricing(currentUserPlan);
  const planFeatures = getPlanFeatures(currentUserPlan);

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl sm:max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <Link
            to={backLinkDestination}
            state={{ from: location }}
            className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 me-2" />
            {t("subscription.backToDashboard")}
          </Link>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg sm:shadow-xl">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
              {t("subscription.pageTitle")}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto mt-2">
              {t("subscription.pageSubtitle")}
            </p>
          </div>

          {/* Current Plan */}
          <div className="my-6 sm:my-8 py-4 sm:py-6 bg-slate-50 border border-slate-200 rounded-lg">
            <h2 className="text-base sm:text-lg font-semibold text-slate-700 text-center mb-4">
              {t("subscription.currentPlan.title")}
            </h2>
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <PlanIcon planName={currentUserPlan} />
              <div className="text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary capitalize">
                  {t(`pricing.${currentUserPlan}.name`)}
                </p>
                <div className="mt-1">
                  <p className="text-lg sm:text-xl font-semibold text-green-600">
                    {planPricing.price}
                  </p>
                  {planPricing.description && (
                    <p className="text-xs sm:text-sm text-gray-500">
                      {planPricing.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Plan Features */}
            <div className="mt-4 sm:mt-6 max-w-md mx-auto">
              <h3 className="text-sm sm:text-base font-semibold text-slate-600 text-center mb-3">
                {t("subscription.currentPlan.featuresIncluded")}
              </h3>
              <div className="space-y-2">
                {planFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-xs sm:text-sm text-slate-600"
                  >
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Section for Upgrade */}
          <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-200 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">
                {t("subscription.upgrade.needMoreFeatures")}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4">
                {t("subscription.upgrade.contactForUpgrade")}
              </p>
              <Link
                to="/contact"
                className="inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-700 transition-colors"
              >
                {t("common.actions.contactUs")}
              </Link>
            </div>
          </div>

          {/* Link to Promotional Page */}
          <div className="mt-4 sm:mt-6 text-center">
            <Link
              to="/promotional"
              className="text-sm sm:text-base text-primary hover:text-primary-dark font-medium hover:underline"
            >
              {t("subscription.viewPromotionalOffers")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SubscriptionPageContent />
    </Suspense>
  );
};

export default SubscriptionPage;

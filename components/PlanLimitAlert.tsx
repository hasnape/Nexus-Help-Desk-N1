import React, { Suspense } from "react";
// import supprimé
import { usePlan } from "../contexts/PlanContext";
import { Link } from "react-router-dom";

interface PlanLimitAlertProps {
  feature?: keyof import("../contexts/PlanContext").PlanLimits;
  message?: string;
  type?: "warning" | "error" | "info";
  showUpgradeButton?: boolean;
  className?: string;
}

const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.517-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

const PlanLimitAlert: React.FC<PlanLimitAlertProps> = ({
  feature,
  message,
  type = "warning",
  showUpgradeButton = true,
  className = "",
}) => {
  // Traductions supprimées, tout est statique en français
  const { currentPlan } = usePlan();

  const getUpgradeMessage = (
    feature?: keyof import("../contexts/PlanContext").PlanLimits
  ): string => {
    if (message) return message;
    if (!feature)
      return "Veuillez mettre à niveau votre abonnement pour débloquer cette fonctionnalité.";
    return "Veuillez mettre à niveau votre abonnement pour débloquer cette fonctionnalité.";
  };

  const getAlertStyle = () => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-amber-50 border-amber-200 text-amber-800";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "error":
        return "text-red-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-amber-500";
    }
  };

  return (
    <Suspense fallback={null}>
      <div className={`rounded-md border p-4 ${getAlertStyle()} ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className={`h-5 w-5 ${getIconColor()}`} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">
              {"Limite d'abonnement atteinte"}
            </h3>
            <div className="mt-2 text-sm">
              <p>{getUpgradeMessage(feature)}</p>
              {currentPlan && (
                <p className="mt-1">
                  {`Abonnement actuel : ${
                    currentPlan === "freemium"
                      ? "Freemium"
                      : currentPlan === "standard"
                      ? "Standard"
                      : currentPlan === "pro"
                      ? "Pro"
                      : currentPlan
                  }`}
                </p>
              )}
            </div>
            {showUpgradeButton && (
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Link
                    to="/subscribe"
                    className="rounded-md px-2 py-1.5 text-sm font-medium hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-amber-100 text-amber-800 hover:bg-amber-200 focus:ring-amber-600"
                  >
                    {"Mettre à niveau"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default PlanLimitAlert;

import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePlan } from "../contexts/PlanContext";
import { Link } from "react-router-dom";

interface PlanLimitAlertProps {
  feature?: keyof import("../contexts/PlanContext").PlanLimits;
  customMessage?: string;
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
  customMessage,
  showUpgradeButton = true,
  className = "",
}) => {
  const { t } = useLanguage();
  const { currentPlan } = usePlan();

  // Fonction pour obtenir le message d'upgrade basé sur la feature
  const getUpgradeMessage = (feature?: keyof import("../contexts/PlanContext").PlanLimits): string => {
    if (!feature) return t("upgradeGeneral", { default: "Upgrade to a higher plan to unlock this feature." });
    
    switch (feature) {
      case "maxAgents":
        return t("upgradeForAgents", { default: "Upgrade to Standard plan to add more agents." });
      case "maxTicketsPerMonth":
      case "hasUnlimitedTickets":
        return t("upgradeForTickets", { default: "Upgrade to Standard plan for unlimited tickets." });
      case "hasAdvancedTicketManagement":
        return t("upgradeForAdvanced", { default: "Upgrade to Standard plan for advanced ticket management." });
      case "hasVoiceFeatures":
        return t("upgradeForVoice", { default: "Upgrade to Pro plan for voice features." });
      case "hasAppointmentScheduling":
        return t("upgradeForAppointments", { default: "Upgrade to Pro plan for appointment scheduling." });
      case "hasDetailedReports":
        return t("upgradeForReports", { default: "Upgrade to Pro plan for detailed reports." });
      case "hasPrioritySupport":
        return t("upgradeForSupport", { default: "Upgrade to Standard plan for priority support." });
      case "hasInternalNotes":
        return t("upgradeForNotes", { default: "Upgrade to Standard plan for internal notes." });
      case "hasTicketAssignment":
        return t("upgradeForAssignment", { default: "Upgrade to Standard plan for ticket assignment." });
      case "aiLevel":
        return t("upgradeForAI", { default: "Upgrade to Standard plan for advanced AI." });
      default:
        return t("upgradeGeneral", { default: "Upgrade to a higher plan to unlock this feature." });
    }
  };

  const message = customMessage || (feature ? getUpgradeMessage(feature) : "");

  if (!message) return null;

  return (
    <div
      className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start">
        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 mb-1">
            {t("limitReached", { default: "Plan limit reached" })}
          </h3>
          <p className="text-sm text-amber-700 mb-3">{message}</p>

          {showUpgradeButton && (
            <div className="flex items-center space-x-3">
              <Link
                to="/subscription"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
              >
                {t("upgradeNow", { default: "Upgrade Now" })}
              </Link>
              <span className="text-xs text-amber-600">
                {t("currentPlan", { default: "Current plan" })}:{" "}
                {currentPlan}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanLimitAlert;

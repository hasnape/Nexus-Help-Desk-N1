import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePlan } from "../contexts/PlanContext";
import { Link } from "react-router-dom";

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: keyof import("../contexts/PlanContext").PlanLimits;
  title?: string;
  message?: string;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

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

const PlanLimitModal: React.FC<PlanLimitModalProps> = ({
  isOpen,
  onClose,
  feature,
  title,
  message,
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

  if (!isOpen) return null;

  const modalTitle =
    title ||
    t("limitReached", { default: "Plan limit reached" });
  const modalMessage = message || (feature ? getUpgradeMessage(feature) : "");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {modalTitle}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{modalMessage}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {t("currentPlan", { default: "Current plan" })}:{" "}
                  <span className="font-medium capitalize">{currentPlan}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Link
              to="/subscription"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {t("upgradeButton", { default: "View Plans" })}
            </Link>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {t("dismissButton", { default: "Later" })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanLimitModal;

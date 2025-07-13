import React from "react";
// import supprimé
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
  // Traductions supprimées, tout est statique en français
  const { currentPlan } = usePlan();

  if (!isOpen) return null;

  const getFeatureTitle = () => {
    if (title) return title;
    if (feature) {
      return "Fonctionnalité limitée";
    }
    return "Limite du plan atteinte";
  };

  const getFeatureMessage = () => {
    if (message) return message;
    if (feature) {
      return "Vous avez atteint la limite pour cette fonctionnalité avec votre abonnement actuel.";
    }
    return "Vous avez atteint une limite de votre plan. Pour débloquer cette fonctionnalité, veuillez mettre à niveau votre abonnement.";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                {getFeatureTitle()}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">{getFeatureMessage()}</p>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                {"Votre abonnement actuel"}
              </p>
              <p className="text-lg font-semibold text-primary capitalize">
                {currentPlan === "freemium"
                  ? "Freemium"
                  : currentPlan === "standard"
                  ? "Standard"
                  : currentPlan === "pro"
                  ? "Pro"
                  : currentPlan}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {"Annuler"}
            </button>
            <Link
              to="/subscription"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-center"
            >
              {"Mettre à niveau"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanLimitModal;

import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePlan } from "../contexts/PlanContext";
import { useApp } from "../App";
import { Link } from "react-router-dom";

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
  </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
  </svg>
);

interface PlanUsageWidgetProps {
  className?: string;
}

const PlanUsageWidget: React.FC<PlanUsageWidgetProps> = ({
  className = "",
}) => {
  const { t } = useLanguage();
  const { currentPlan, planLimits } = usePlan();
  const { tickets, getAllUsers } = useApp();

  // Calculer l'utilisation actuelle
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const ticketsThisMonth = tickets.filter(
    (ticket) => ticket.created_at >= startOfMonth
  ).length;

  const agents = getAllUsers().filter(
    (user) => user.role === "agent" || user.role === "manager"
  );
  const agentCount = agents.length;

  const getUsageColor = (current: number, max: number) => {
    if (max === Infinity) return "text-green-600";
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-amber-600";
    return "text-green-600";
  };

  const getProgressBarColor = (current: number, max: number) => {
    if (max === Infinity) return "bg-green-500";
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-primary" />
          {t("planUsage.title", { default: "Utilisation du plan" })}
        </h3>
        <span className="text-sm font-medium px-2 py-1 bg-primary/10 text-primary rounded-md capitalize">
          {currentPlan}
        </span>
      </div>

      <div className="space-y-4">
        {/* Utilisation des tickets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t("planUsage.tickets", { default: "Tickets ce mois" })}
            </span>
            <span
              className={`text-sm font-semibold ${getUsageColor(
                ticketsThisMonth,
                planLimits.maxTicketsPerMonth
              )}`}
            >
              {planLimits.hasUnlimitedTickets
                ? `${ticketsThisMonth} / ∞`
                : `${ticketsThisMonth} / ${planLimits.maxTicketsPerMonth}`}
            </span>
          </div>
          {!planLimits.hasUnlimitedTickets && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressBarColor(
                  ticketsThisMonth,
                  planLimits.maxTicketsPerMonth
                )}`}
                style={{
                  width: `${Math.min(
                    (ticketsThisMonth / planLimits.maxTicketsPerMonth) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Utilisation des agents */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <UsersIcon className="w-4 h-4 mr-1" />
              {t("planUsage.agents", { default: "Agents actifs" })}
            </span>
            <span
              className={`text-sm font-semibold ${getUsageColor(
                agentCount,
                planLimits.maxAgents
              )}`}
            >
              {planLimits.maxAgents === Infinity
                ? `${agentCount} / ∞`
                : `${agentCount} / ${planLimits.maxAgents}`}
            </span>
          </div>
          {planLimits.maxAgents !== Infinity && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressBarColor(
                  agentCount,
                  planLimits.maxAgents
                )}`}
                style={{
                  width: `${Math.min(
                    (agentCount / planLimits.maxAgents) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Fonctionnalités disponibles */}
        <div className="pt-2 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {t("planUsage.features", { default: "Fonctionnalités" })}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div
              className={`flex items-center ${
                planLimits.hasVoiceFeatures ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  planLimits.hasVoiceFeatures ? "bg-green-500" : "bg-gray-300"
                }`}
              ></span>
              {t("planUsage.voice", { default: "Fonctions vocales" })}
            </div>
            <div
              className={`flex items-center ${
                planLimits.hasAppointmentScheduling
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  planLimits.hasAppointmentScheduling
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              ></span>
              {t("planUsage.appointments", { default: "Rendez-vous" })}
            </div>
            <div
              className={`flex items-center ${
                planLimits.hasDetailedReports
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  planLimits.hasDetailedReports ? "bg-green-500" : "bg-gray-300"
                }`}
              ></span>
              {t("planUsage.reports", { default: "Rapports détaillés" })}
            </div>
            <div
              className={`flex items-center ${
                planLimits.hasInternalNotes ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  planLimits.hasInternalNotes ? "bg-green-500" : "bg-gray-300"
                }`}
              ></span>
              {t("planUsage.notes", { default: "Notes internes" })}
            </div>
          </div>
        </div>

        {/* Bouton d'upgrade si nécessaire */}
        {(ticketsThisMonth >= planLimits.maxTicketsPerMonth * 0.8 ||
          agentCount >= planLimits.maxAgents * 0.8 ||
          currentPlan === "freemium") && (
          <div className="pt-3 border-t border-gray-200">
            <Link
              to="/subscription"
              className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              {currentPlan === "freemium"
                ? t("planUsage.upgrade", { default: "Passer au plan Standard" })
                : t("planUsage.upgradePro", { default: "Passer au plan Pro" })}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanUsageWidget;

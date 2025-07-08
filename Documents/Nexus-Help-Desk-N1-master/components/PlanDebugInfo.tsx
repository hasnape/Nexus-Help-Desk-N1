import React from "react";
import { usePlan } from "../contexts/PlanContext";
import { useApp } from "../App";

interface PlanDebugInfoProps {
  show?: boolean;
}

const PlanDebugInfo: React.FC<PlanDebugInfoProps> = ({ show = false }) => {
  const { currentPlan, planLimits, canCreateTicket, canAddAgent } = usePlan();
  const { tickets, getAllUsers } = useApp();

  if (!show) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const ticketsThisMonth = tickets.filter(
    (ticket) => ticket.created_at >= startOfMonth
  ).length;
  const agentCount = getAllUsers().filter(
    (user) => user.role === "agent" || user.role === "manager"
  ).length;

  const ticketCheck = canCreateTicket();
  const agentCheck = canAddAgent();

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold text-yellow-400 mb-2">🔧 Debug Plan Limits</h4>
      <div className="space-y-1">
        <div>
          <strong>Plan actuel:</strong> {currentPlan}
        </div>
        <div>
          <strong>Agents:</strong> {agentCount} /{" "}
          {planLimits.maxAgents === Infinity ? "∞" : planLimits.maxAgents}
        </div>
        <div>
          <strong>Tickets ce mois:</strong> {ticketsThisMonth} /{" "}
          {planLimits.hasUnlimitedTickets ? "∞" : planLimits.maxTicketsPerMonth}
        </div>
        <div>
          <strong>Peut créer ticket:</strong>{" "}
          <span className={ticketCheck ? "text-green-400" : "text-red-400"}>
            {ticketCheck ? "OUI" : "NON"}
          </span>
        </div>
        <div>
          <strong>Peut ajouter agent:</strong>{" "}
          <span className={agentCheck ? "text-green-400" : "text-red-400"}>
            {agentCheck ? "OUI" : "NON"}
          </span>
        </div>
        <div>
          <strong>Fonctions vocales:</strong>{" "}
          <span className={planLimits.hasVoiceFeatures ? "text-green-400" : "text-red-400"}>
            {planLimits.hasVoiceFeatures ? "OUI" : "NON"}
          </span>
        </div>
        <div>
          <strong>Rendez-vous:</strong>{" "}
          <span className={planLimits.hasAppointmentScheduling ? "text-green-400" : "text-red-400"}>
            {planLimits.hasAppointmentScheduling ? "OUI" : "NON"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanDebugInfo;

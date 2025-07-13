import React from "react";
import { Link } from "react-router-dom";
import { Ticket, TicketStatus, TicketPriority } from "../types";
import { useApp } from "../App";

interface TicketCardProps {
  ticket: Ticket;
  showAssigneeInfo?: boolean;
  showClientInfo?: boolean;
}

const statusColors: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: "bg-blue-100 text-blue-800",
  [TicketStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [TicketStatus.RESOLVED]: "bg-green-100 text-green-800",
  [TicketStatus.CLOSED]: "bg-slate-100 text-slate-800",
};

const priorityColors: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: "text-green-600",
  [TicketPriority.MEDIUM]: "text-yellow-600",
  [TicketPriority.HIGH]: "text-red-600",
  [TicketPriority.URGENT]: "text-red-800",
};

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  showAssigneeInfo = true,
  showClientInfo = true,
}) => {
  const { getAllUsers } = useApp();

  const creator = getAllUsers().find((u) => u.id === ticket.user_id);
  const assignee = ticket.assigned_agent_id
    ? getAllUsers().find((u) => u.id === ticket.assigned_agent_id)
    : null;

  const creatorName = creator ? creator.full_name : "Non assigné";
  const assigneeName = assignee ? assignee.full_name : "Non assigné";

  const getLastMessage = () => {
    if (ticket.chat_messages && ticket.chat_messages.length > 0) {
      return ticket.chat_messages[ticket.chat_messages.length - 1].message;
    }
    return ticket.detailed_description || "Aucun message";
  };

  // Traduction statique française
  const statusLabels: Record<TicketStatus, string> = {
    [TicketStatus.OPEN]: "Ouvert",
    [TicketStatus.IN_PROGRESS]: "En cours",
    [TicketStatus.RESOLVED]: "Résolu",
    [TicketStatus.CLOSED]: "Fermé",
  };
  const priorityLabels: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: "Basse",
    [TicketPriority.MEDIUM]: "Moyenne",
    [TicketPriority.HIGH]: "Haute",
    [TicketPriority.URGENT]: "Urgente",
  };

  return (
    <Link
      to={`/ticket/${ticket.id}`}
      className="block hover:shadow-xl transition-shadow duration-200"
      aria-label="Voir le détail du ticket"
    >
      <div
        className="bg-surface shadow-lg rounded-lg p-6 h-full flex flex-col justify-between"
        aria-label="Carte du ticket"
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <h3
              className="text-xl font-semibold text-primary truncate"
              title={ticket.title}
              aria-label="Titre du ticket"
            >
              {ticket.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                statusColors[ticket.status]
              }`}
              aria-label="Statut du ticket"
            >
              {statusLabels[ticket.status]}
            </span>
          </div>

          {/* Catégorie */}
          <p
            className="text-sm text-textSecondary mb-1"
            aria-label="Catégorie du ticket"
          >
            {ticket.category}
          </p>

          {/* Priorité */}
          <p
            className={`text-sm font-medium ${
              priorityColors[ticket.priority]
            } mb-3`}
            aria-label="Priorité du ticket"
          >
            Priorité : {priorityLabels[ticket.priority]}
          </p>

          {/* Aperçu dernier message */}
          <p
            className="text-sm text-textSecondary line-clamp-2 mb-3"
            aria-label="Dernier message"
          >
            {getLastMessage()}
          </p>

          {/* Poste de travail */}
          {ticket.workstation_id && (
            <p
              className="text-xs text-slate-500 mb-2"
              aria-label="Poste de travail"
            >
              Poste : {ticket.workstation_id}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="text-xs text-slate-500 mt-auto pt-2 border-t border-slate-200"
          aria-label="Informations du ticket"
        >
          {showClientInfo && (
            <p className="mb-1" aria-label="Créateur du ticket">
              Créé par : {creatorName}
            </p>
          )}

          {showAssigneeInfo && ticket.assigned_agent_id && (
            <p className="mb-1" aria-label="Agent assigné">
              Assigné à : {assigneeName}
            </p>
          )}

          <p aria-label="Date de création">
            Créé le : {new Date(ticket.updated_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TicketCard;

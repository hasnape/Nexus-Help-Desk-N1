import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Ticket, TicketStatus, TicketPriority } from "../types";
// ...existing code...
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
  const { t, i18n } = useTranslation(["common", "enums", "components"]);
  const { getAllUsers } = useApp();

  const creator = getAllUsers().find((u) => u.id === ticket.user_id);
  const assignee = ticket.assigned_agent_id
    ? getAllUsers().find((u) => u.id === ticket.assigned_agent_id)
    : null;

  const creatorName = creator ? creator.full_name : t("ticketCard.unassigned");
  const assigneeName = assignee
    ? assignee.full_name
    : t("ticketCard.unassigned");

  const getLastMessage = () => {
    if (ticket.chat_messages && ticket.chat_messages.length > 0) {
      return ticket.chat_messages[ticket.chat_messages.length - 1].message;
    }
    return ticket.detailed_description || t("ticketCard.noMessages");
  };

  return (
    <Suspense
      fallback={
        <div
          className="bg-surface shadow-lg rounded-lg p-6 h-48 animate-pulse"
          aria-label={t("ticketCard.loading", "Chargement du ticket...")}
        />
      }
    >
      <Link
        to={`/ticket/${ticket.id}`}
        className="block hover:shadow-xl transition-shadow duration-200"
        aria-label={t("ticketCard.linkAria", "Voir le détail du ticket")}
      >
        <div
          className="bg-surface shadow-lg rounded-lg p-6 h-full flex flex-col justify-between"
          aria-label={t("ticketCard.cardAria", "Carte du ticket")}
        >
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <h3
                className="text-xl font-semibold text-primary truncate"
                title={ticket.title}
                aria-label={t("ticketCard.titleAria", "Titre du ticket")}
              >
                {ticket.title}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  statusColors[ticket.status]
                }`}
                aria-label={t("ticketCard.statusAria", "Statut du ticket")}
              >
                {t(`ticketStatus.${ticket.status}`, { ns: "enums" })}
              </span>
            </div>

            {/* Category */}
            <p
              className="text-sm text-textSecondary mb-1"
              aria-label={t("ticketCard.categoryAria", "Catégorie du ticket")}
            >
              {t(`ticketCategory.${ticket.category}`, { ns: "enums" })}
            </p>

            {/* Priority */}
            <p
              className={`text-sm font-medium ${
                priorityColors[ticket.priority]
              } mb-3`}
              aria-label={t("ticketCard.priorityAria", "Priorité du ticket")}
            >
              {t("ticketCard.priorityLabel", {
                priority: t(`ticketPriority.${ticket.priority}`, {
                  ns: "enums",
                }),
              })}
            </p>

            {/* Last Message Preview */}
            <p
              className="text-sm text-textSecondary line-clamp-2 mb-3"
              aria-label={t("ticketCard.lastMessageAria", "Dernier message")}
            >
              {getLastMessage()}
            </p>

            {/* Workstation ID */}
            {ticket.workstation_id && (
              <p
                className="text-xs text-slate-500 mb-2"
                aria-label={t("ticketCard.workstationAria", "Poste de travail")}
              >
                {t("ticketCard.workstationLabel", "Poste")}:{" "}
                {ticket.workstation_id}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className="text-xs text-slate-500 mt-auto pt-2 border-t border-slate-200"
            aria-label={t("ticketCard.footerAria", "Informations du ticket")}
          >
            {showClientInfo && (
              <p
                className="mb-1"
                aria-label={t("ticketCard.createdByAria", "Créateur du ticket")}
              >
                {t("ticketCard.createdBy", { name: creatorName })}
              </p>
            )}

            {showAssigneeInfo && ticket.assigned_agent_id && (
              <p
                className="mb-1"
                aria-label={t("ticketCard.assignedToAria", "Agent assigné")}
              >
                {t("ticketCard.assignedTo", { agent: assigneeName })}
              </p>
            )}

            <p aria-label={t("ticketCard.createdOnAria", "Date de création")}>
              {t("ticketCard.createdOn", {
                date: new Date(ticket.updated_at).toLocaleDateString(
                  i18n.language
                ),
              })}
            </p>
          </div>
        </div>
      </Link>
    </Suspense>
  );
};

export default TicketCard;

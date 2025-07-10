import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Ticket, TicketStatus, TicketPriority } from "../types";
import { TICKET_STATUS_KEYS, TICKET_PRIORITY_KEYS } from "../constants";
import { useApp } from "../App";

interface TicketCardProps {
  ticket: Ticket;
  showAssigneeInfo?: boolean;
  showClientInfo?: boolean;
}

const statusColors: Record<TicketStatus, string> = {
  [TICKET_STATUS_KEYS.OPEN]: "bg-blue-100 text-blue-800",
  [TICKET_STATUS_KEYS.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [TICKET_STATUS_KEYS.RESOLVED]: "bg-green-100 text-green-800",
  [TICKET_STATUS_KEYS.CLOSED]: "bg-slate-100 text-slate-800",
};

const priorityColors: Record<TicketPriority, string> = {
  [TICKET_PRIORITY_KEYS.LOW]: "text-green-600",
  [TICKET_PRIORITY_KEYS.MEDIUM]: "text-yellow-600",
  [TICKET_PRIORITY_KEYS.HIGH]: "text-red-600",
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
    if (ticket.chat_history.length > 0) {
      return ticket.chat_history[ticket.chat_history.length - 1].text;
    }
    return ticket.description || t("ticketCard.noMessages");
  };

  return (
    <Suspense
      fallback={
        <div className="bg-surface shadow-lg rounded-lg p-6 h-48 animate-pulse" />
      }
    >
      <Link
        to={`/ticket/${ticket.id}`}
        className="block hover:shadow-xl transition-shadow duration-200"
      >
        <div className="bg-surface shadow-lg rounded-lg p-6 h-full flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <h3
                className="text-xl font-semibold text-primary truncate"
                title={ticket.title}
              >
                {ticket.title}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  statusColors[ticket.status]
                }`}
              >
                {t(`ticketStatus.${ticket.status}`, { ns: "enums" })}
              </span>
            </div>

            {/* Category */}
            <p className="text-sm text-textSecondary mb-1">
              {t(`ticketCategory.${ticket.category}`, { ns: "enums" })}
            </p>

            {/* Priority */}
            <p
              className={`text-sm font-medium ${
                priorityColors[ticket.priority]
              } mb-3`}
            >
              {t("ticketCard.priorityLabel", {
                priority: t(`ticketPriority.${ticket.priority}`, {
                  ns: "enums",
                }),
              })}
            </p>

            {/* Last Message Preview */}
            <p className="text-sm text-textSecondary line-clamp-2 mb-3">
              {getLastMessage()}
            </p>

            {/* Workstation ID */}
            {ticket.workstation_id && (
              <p className="text-xs text-slate-500 mb-2">
                Poste: {ticket.workstation_id}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="text-xs text-slate-500 mt-auto pt-2 border-t border-slate-200">
            {showClientInfo && (
              <p className="mb-1">
                {t("ticketCard.createdBy", { name: creatorName })}
              </p>
            )}

            {showAssigneeInfo && ticket.assigned_agent_id && (
              <p className="mb-1">
                {t("ticketCard.assignedTo", { agent: assigneeName })}
              </p>
            )}

            <p>
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

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, TicketStatus, TicketPriority } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { TICKET_STATUS_KEYS, TICKET_PRIORITY_KEYS } from "../constants";
import { useApp } from "../App";
import { Button } from "../components/FormElements";

interface TicketCardProps {
  ticket: Ticket;
  generateSummary?: (ticketId: string) => Promise<void>;
  generatingSummary?: string | null;
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

const getAssignedSummary = (ticket: Ticket): string | null => {
  // ✅ PRIORITÉ 1: tickets.summary (DB colonne)
  if (ticket.summary && typeof ticket.summary === "string" && ticket.summary.trim()) {
    return ticket.summary;
  }

  // ✅ PRIORITÉ 2: metadata.assignedsummary (ancien)
  const metadataSummary = (ticket as any)?.metadata?.assignedsummary;
  if (metadataSummary && typeof metadataSummary === "string" && metadataSummary.trim()) {
    return metadataSummary;
  }

  // ✅ PRIORITÉ 3: details.assignedsummary (ancien)
  const detailsSummary = (ticket as any)?.details?.assignedsummary;
  if (detailsSummary && typeof detailsSummary === "string" && detailsSummary.trim()) {
    return detailsSummary;
  }

  // ✅ PRIORITÉ 4: chat_history system_summary (ancien)
  if (ticket.chat_history && Array.isArray(ticket.chat_history)) {
    const systemMessage = ticket.chat_history.find(
      (msg) => msg.sender === "system_summary"
    );
    if (systemMessage && systemMessage.text) {
      return systemMessage.text;
    }
  }

  return null;
};

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.34 1.061l1.36 2.754a1 1 0 01-.293 1.398c-.246.294-.628.294-.874 0l-2.8-2.034a1 1 0 00-1.182 0l-2.8 2.034a1 1 0 01-.874 0 1 1 0 01-.293-1.398l1.36-2.754a1 1 0 00-.34-1.061l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  generateSummary,
  generatingSummary,
}) => {
  const { t, getBCP47Locale } = useLanguage();
  const { getAllUsers } = useApp();

  const creator = getAllUsers().find((u) => u.id === ticket.user_id);
  const creatorName = creator ? creator.full_name : t("agentDashboard.notApplicableShort", { default: "N/A" });

  const summary = getAssignedSummary(ticket);
  const [isExpanded, setIsExpanded] = useState(false);
  const isGenerating = generatingSummary === ticket.id;

  const handleGenerateSummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!generateSummary || isGenerating) return;
    try {
      await generateSummary(ticket.id);
    } catch (err: any) {
      console.error("Summary error:", err);
      alert("❌ Erreur génération résumé IA");
    }
  };

  return (
    <div className="block hover:shadow-xl transition-shadow duration-200">
      <div className="bg-surface shadow-lg rounded-lg p-6 h-full flex flex-col justify-between">
        <div>
          <Link to={`/ticket/${ticket.id}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-primary truncate" title={ticket.title}>
                {ticket.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status]}`}>
                {t(`ticketStatus.${ticket.status}`)}
              </span>
            </div>
          </Link>

          <p className="text-sm text-textSecondary mb-1">
            {t("ticketCard.categoryLabel", { category: t(ticket.category) })}
          </p>

          <p className={`text-sm font-medium ${priorityColors[ticket.priority]} mb-3`}>
            {t("ticketCard.priorityLabel", {
              priority: t(`ticketPriority.${ticket.priority}`),
            })}
          </p>

          <p className="text-sm text-textSecondary line-clamp-2 mb-3">
            {ticket.chat_history?.length > 0
              ? ticket.chat_history[ticket.chat_history.length - 1]?.text
              : ticket.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 flex-1">
              {summary ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded((prev) => !prev);
                  }}
                  className="text-xs text-indigo-600 hover:underline flex items-center space-x-1"
                  disabled={isGenerating}
                >
                  <span>{isExpanded ? "Masquer le résumé" : "Développer le résumé"}</span>
                  <span className="text-xs">▼</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500">Pas encore de résumé IA</span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              className="h-8 w-8 p-1 ml-2 hover:bg-primary hover:text-primary-foreground border border-slate-200"
              title={isGenerating ? "Génération en cours..." : "Générer résumé IA"}
              disabled={!generateSummary || isGenerating}
            >
              {isGenerating ? <LoadingSpinner /> : <SparklesIcon />}
            </Button>
          </div>

          {summary && isExpanded && (
            <div className="mt-2 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
              <p className="text-xs font-semibold text-indigo-900 mb-1">Résumé IA du ticket</p>
              <p className="text-xs text-indigo-800 whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
                {summary}
              </p>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 mt-4 pt-2 border-t border-slate-200">
          <p>{t("ticketCard.createdByLabel", { user: creatorName })}</p>
          <p>
            {t("ticketCard.lastUpdatedLabel", {
              date: new Date(ticket.updated_at).toLocaleString(getBCP47Locale()),
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
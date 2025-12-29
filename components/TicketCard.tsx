import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TICKET_STATUS_KEYS, TICKET_PRIORITY_KEYS } from '../constants';
import { useApp } from '../App';

interface TicketCardProps {
  ticket: Ticket;
}

const statusColors: Record<TicketStatus, string> = {
  [TICKET_STATUS_KEYS.OPEN]: 'bg-blue-100 text-blue-800',
  [TICKET_STATUS_KEYS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TICKET_STATUS_KEYS.RESOLVED]: 'bg-green-100 text-green-800',
  [TICKET_STATUS_KEYS.CLOSED]: 'bg-slate-100 text-slate-800',
};

const priorityColors: Record<TicketPriority, string> = {
  [TICKET_PRIORITY_KEYS.LOW]: 'text-green-600',
  [TICKET_PRIORITY_KEYS.MEDIUM]: 'text-yellow-600',
  [TICKET_PRIORITY_KEYS.HIGH]: 'text-red-600',
};

// ✅ Récupération du résumé assigné (même logique que sur AgentDashboardPage)
const getAssignedSummary = (ticket: Ticket): string | null => {
  // 1. metadata.assignedsummary
  const metadataSummary = (ticket as any)?.metadata?.assignedsummary;
  if (
    metadataSummary &&
    typeof metadataSummary === 'string' &&
    metadataSummary.trim()
  ) {
    return metadataSummary;
  }

  // 2. details.assignedsummary (fallback)
  const detailsSummary = (ticket as any)?.details?.assignedsummary;
  if (
    detailsSummary &&
    typeof detailsSummary === 'string' &&
    detailsSummary.trim()
  ) {
    return detailsSummary;
  }

  // 3. chat_history: message "system_summary"
  if (ticket.chat_history && Array.isArray(ticket.chat_history)) {
    const systemMessage = ticket.chat_history.find(
      (msg) => msg.sender === 'system_summary'
    );
    if (systemMessage && systemMessage.text) {
      return systemMessage.text;
    }
  }

  return null;
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const { t, getBCP47Locale } = useLanguage();
  const { getAllUsers } = useApp();

  const creator = getAllUsers().find((u) => u.id === ticket.user_id);
  const creatorName = creator
    ? creator.full_name
    : t('agentDashboard.notApplicableShort', { default: 'N/A' });

  const summary = getAssignedSummary(ticket);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="block hover:shadow-xl transition-shadow duration-200">
      <div className="bg-surface shadow-lg rounded-lg p-6 h-full flex flex-col justify-between">
        <div>
          {/* 🔗 Titre cliquable */}
          <Link to={`/ticket/${ticket.id}`}>
            <div className="flex justify-between items-start mb-2">
              <h3
                className="text-xl font-semibold text-primary truncate"
                title={ticket.title}
              >
                {ticket.title}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status]}`}
              >
                {t(`ticketStatus.${ticket.status}`)}
              </span>
            </div>
          </Link>

          <p className="text-sm text-textSecondary mb-1">
            {t('ticketCard.categoryLabel', { category: t(ticket.category) })}
          </p>

          <p
            className={`text-sm font-medium ${priorityColors[ticket.priority]} mb-3`}
          >
            {t('ticketCard.priorityLabel', {
              priority: t(`ticketPriority.${ticket.priority}`),
            })}
          </p>

          {/* 📝 Dernier message / description */}
          <p className="text-sm text-textSecondary line-clamp-2 mb-3">
            {ticket.chat_history.length > 0
              ? ticket.chat_history[ticket.chat_history.length - 1].text
              : ticket.description}
          </p>

          {/* 🔽 Bouton Développer */}
          {summary && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-xs text-indigo-600 hover:underline mb-2"
            >
              {isExpanded ? 'Masquer le résumé' : 'Développer le résumé'}
            </button>
          )}

          {/* 📋 Résumé complet */}
          {summary && isExpanded && (
            <div className="mt-2 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
              <p className="text-xs font-semibold text-indigo-900 mb-1">
                📋 Résumé du ticket
              </p>
              <p className="text-xs text-indigo-800 whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}
        </div>

        {/* ℹ️ Footer */}
        <div className="text-xs text-slate-500 mt-4 pt-2 border-t border-slate-200">
          <p>{t('ticketCard.createdByLabel', { user: creatorName })}</p>
          <p>
            {t('ticketCard.lastUpdatedLabel', {
              date: new Date(ticket.updated_at).toLocaleString(getBCP47Locale()),
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;

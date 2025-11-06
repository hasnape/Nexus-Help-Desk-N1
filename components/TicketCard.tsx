
import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, TicketStatus, TicketPriority } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { TICKET_STATUS_KEYS, TICKET_PRIORITY_KEYS } from '../constants';
import { useApp } from '@/contexts/AppContext';

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

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const { t, getBCP47Locale } = useLanguage();
  const { getAllUsers } = useApp();

  const creator = getAllUsers().find(u => u.id === ticket.user_id);
  const creatorName = creator ? creator.full_name : t('agentDashboard.notApplicableShort', { default: 'N/A'});

  return (
    <Link to={`/ticket/${ticket.id}`} className="block hover:shadow-xl transition-shadow duration-200">
      <div className="bg-surface shadow-lg rounded-lg p-6 h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-primary truncate" title={ticket.title}>{ticket.title}</h3>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status]}`}
            >
              {t(`ticketStatus.${ticket.status}`)}
            </span>
          </div>
          <p className="text-sm text-textSecondary mb-1">{t('ticketCard.categoryLabel', { category: t(ticket.category) })}</p>
          <p className={`text-sm font-medium ${priorityColors[ticket.priority]} mb-3`}>
            {t('ticketCard.priorityLabel', { priority: t(`ticketPriority.${ticket.priority}`) })}
          </p>
          <p className="text-sm text-textSecondary line-clamp-2 mb-3">
            {ticket.chat_history.length > 0 ? ticket.chat_history[ticket.chat_history.length-1].text : ticket.description}
          </p>
        </div>
        <div className="text-xs text-slate-500 mt-auto pt-2 border-t border-slate-200">
          <p>{t('ticketCard.createdByLabel', { user: creatorName })}</p>
          <p>{t('ticketCard.lastUpdatedLabel', { date: new Date(ticket.updated_at).toLocaleString(getBCP47Locale()) })}</p>
        </div>
      </div>
    </Link>
  );
};

export default TicketCard;

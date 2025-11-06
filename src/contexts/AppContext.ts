import { createContext, useContext } from 'react';

import type {
  AppointmentDetails,
  ChatMessage,
  Locale as AppLocale,
  Ticket,
  TicketStatus,
  User,
  UserRole,
} from '@/types';

export interface AppContextType {
  user: User | null;
  login: (email: string, password: string, companyName: string) => Promise<string | true>;
  logout: () => Promise<void>;
  signUp: (
    email: string,
    fullName: string,
    password: string,
    options: {
      lang: AppLocale;
      role: UserRole;
      companyName: string;
      secretCode?: string;
      plan?: 'freemium' | 'standard' | 'pro';
    }
  ) => Promise<string | true>;
  tickets: Ticket[];
  addTicket: (
    ticketData: Omit<
      Ticket,
      'id' | 'created_at' | 'updated_at' | 'user_id' | 'assigned_agent_id' | 'internal_notes' | 'current_appointment' | 'assigned_ai_level' | 'chat_history'
    >,
    initialChatHistory: ChatMessage[]
  ) => Promise<Ticket | null>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  addChatMessage: (ticketId: string, userMessageText: string, onAiMessageAdded?: (aiMessage: ChatMessage) => void) => Promise<void>;
  sendAgentMessage: (ticketId: string, agentMessageText: string) => Promise<void>;
  isLoading: boolean;
  isLoadingAi: boolean;
  getTicketById: (ticketId: string) => Ticket | undefined;
  isAutoReadEnabled: boolean;
  toggleAutoRead: () => void;
  assignTicket: (ticketId: string, agentId: string | null) => Promise<void>;
  agentTakeTicket: (ticketId: string) => Promise<void>;
  getAgents: () => User[];
  getAllUsers: () => User[];
  proposeOrUpdateAppointment: (
    ticketId: string,
    details: Omit<AppointmentDetails, 'proposedBy' | 'id' | 'history'>,
    proposedBy: 'agent' | 'user',
    newStatus: AppointmentDetails['status']
  ) => Promise<void>;
  restoreAppointment: (
    appointment: {
      id: string;
      ticket_id: string;
      proposed_by: 'agent' | 'user';
      status:
        | 'pending_user_approval'
        | 'pending_agent_approval'
        | 'confirmed'
        | 'cancelled_by_user'
        | 'cancelled_by_agent'
        | 'rescheduled_by_user'
        | 'rescheduled_by_agent';
      proposed_date: string;
      proposed_time: string;
      location_or_method: string;
    },
    ticketId: string
  ) => Promise<boolean>;
  deleteAppointment: (appointmentId: string, ticketId: string) => Promise<boolean>;
  deleteTicket: (ticketId: string) => Promise<void>;
  updateUserRole: (userIdToUpdate: string, newRole: UserRole) => Promise<boolean>;
  deleteUserById: (userId: string) => Promise<void>;
  newlyCreatedCompanyName: string | null;
  setNewlyCreatedCompanyName: (name: string | null) => void;
  updateCompanyName: (newName: string) => Promise<boolean>;
  consentGiven: boolean;
  giveConsent: () => void;
  quotaUsagePercent: number | null;
  refreshQuotaUsage: (companyId?: string | null) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};


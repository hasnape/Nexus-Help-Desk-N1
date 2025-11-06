import type { Locale } from '@/contexts/LanguageContext';

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress', // pas d’espace pour faciliter les clés i18n
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  MANAGER = 'manager',
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'agent' | 'system_summary';
  text: string;
  timestamp: Date;
  agentId?: string;
}

export interface InternalNote {
  id: string;
  agentId: string;
  text: string;
  timestamp: Date;
}

export interface AppointmentDetails {
  proposedBy: 'agent' | 'user';
  proposedDate: string; // YYYY-MM-DD
  proposedTime: string; // HH:MM
  locationOrMethod: string;
  status:
    | 'pending_user_approval'
    | 'pending_agent_approval'
    | 'confirmed'
    | 'cancelled_by_user'
    | 'cancelled_by_agent'
    | 'rescheduled_by_user'
    | 'rescheduled_by_agent';
  notes?: string;
  history?: AppointmentDetails[];
  id: string;
}

export interface Ticket {
  id: string;                 // uuid
  user_id: string;            // uuid (FK users.id)
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;

  // Supabase renvoie souvent des strings -> on accepte string | Date
  created_at: string | Date;
  updated_at: string | Date;

  chat_history: ChatMessage[];
  assigned_ai_level: 1 | 2;
  assigned_agent_id?: string | null;
  workstation_id?: string | null;
  internal_notes?: InternalNote[];
  current_appointment?: AppointmentDetails;
}

export interface User {
  id: string;                     // uuid
  email: string;
  full_name: string;
  role: UserRole;
  language_preference: Locale;

  // Aligné avec le schéma: FK vers companies.id (uuid)
  company_id: string | null;

  // Colonne dénormalisée optionnelle si tu l’as ajoutée
  company_name?: string | null;
}

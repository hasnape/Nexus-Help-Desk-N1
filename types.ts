

export type Plan = 'freemium' | 'standard' | 'pro';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  MANAGER = 'manager',
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'agent' | 'system_summary';
  message: string;
  timestamp: string | Date;
  agentId?: string;
}

export interface InternalNote {
  id: string;
  agentId: string; // UUID of the agent who wrote the note
  text: string;
  timestamp: Date;
}

export interface AppointmentDetails {
  date: string;
  time: string;
  location_method: string;
  proposed_by: string;
  proposed_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  company_id: string;
  title: string;
  detailed_description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string | Date;
  updated_at: string | Date;
  chat_messages: ChatMessage[];
  assigned_ai_level: 1 | 2;
  assigned_agent_id?: string;
  workstation_id?: string;
  internal_notes?: InternalNote[];
  appointment_details?: AppointmentDetails;
}

export interface User {
  id: string; // uuid
  email: string;
  full_name: string;
  role: UserRole;
  language_preference: Locale;
  company_id: string; // Stores the company name (text)
}

export interface Company {
  id: string; // uuid
  name: string;
  created_at: Date;
  plan: Plan;
  subscription_id?: string;
}

// Ensure Locale is defined or imported if it's from LanguageContext
// For simplicity, assuming Locale is 'en' | 'fr' | 'ar' as typically defined in LanguageContext
export type Locale = 'en' | 'fr' | 'ar';
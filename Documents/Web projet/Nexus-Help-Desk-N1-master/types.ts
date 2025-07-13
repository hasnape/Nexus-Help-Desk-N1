

export type Plan = 'freemium' | 'standard' | 'pro';

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress', // Changed to avoid space for easier key construction
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
  sender: 'user' | 'ai' | 'agent' | 'system_summary'; // Added 'system_summary'
  text: string;
  timestamp: Date;
  agentId?: string; // UUID of the agent if sender is 'agent'
}

export interface InternalNote {
  id: string;
  agentId: string; // UUID of the agent who wrote the note
  text: string;
  timestamp: Date;
}

export interface AppointmentDetails {
  proposedBy: 'agent' | 'user';
  proposedDate: string; // YYYY-MM-DD
  proposedTime: string; // HH:MM
  locationOrMethod: string; // e.g., "On-site at your desk", "Remote session", "Equipment pickup at IT office"
  status: 'pending_user_approval' | 'pending_agent_approval' | 'confirmed' | 'cancelled_by_user' | 'cancelled_by_agent' | 'rescheduled_by_user' | 'rescheduled_by_agent';
  notes?: string;
  history?: AppointmentDetails[]; // Optional: To track negotiation history if needed directly on object
  id: string; // Unique ID for each appointment proposal/instance
}

export interface Ticket {
  id: string; // uuid
  user_id: string; // uuid, Foreign Key to users.id
  company_id: string; // Stores the company name (text) for easier RLS and querying
  title: string;
  description: string;
  category: string; 
  priority: TicketPriority;
  status: TicketStatus;
  created_at: Date;
  updated_at: Date;
  chat_history: ChatMessage[];
  assigned_ai_level: 1 | 2;
  assigned_agent_id?: string; // UUID of the agent assigned to this ticket
  workstation_id?: string;   // "Poste" or Workstation ID
  internal_notes?: InternalNote[]; // Notes visible only to agents/managers
  current_appointment?: AppointmentDetails; // For appointment scheduling
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
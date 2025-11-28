

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

export type GlobalRole = "super_admin" | "support" | "none" | null;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'agent' | 'system_summary'; // Added 'system_summary'
  text: string;
  timestamp: Date;
  agentId?: string; // UUID of the agent if sender is 'agent'
  ai_profile_key?: string | null;
  intake_payload?: unknown;
}

export interface InternalNote {
  id?: string;
  ticket_id?: string;
  agent_id?: string | null;
  agentId?: string | null; // legacy camelCase field
  note_text: string;
  text?: string; // legacy field name retained for compatibility
  timestamp?: Date;
  created_at?: string | null;
  company_id?: string | null;
  company_name?: string | null;
  metadata?: any;
  ai_profile_key?: string | null;
  intake_payload?: unknown;
}

export const normalizeInternalNotes = (raw: any): InternalNote[] => {
  if (!raw) return [];

  let candidate: any[] = [];

  if (Array.isArray(raw)) {
    candidate = raw;
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      candidate = Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } else {
    return [];
  }

  return candidate
    .filter((note) => note !== null && note !== undefined)
    .map((note) => {
      const rawText =
        typeof (note as any).note_text === 'string'
          ? (note as any).note_text
          : typeof (note as any).text === 'string'
          ? (note as any).text
          : '';

      const createdAt =
        typeof (note as any).created_at === 'string'
          ? (note as any).created_at
          : typeof (note as any).timestamp === 'string'
          ? (note as any).timestamp
          : undefined;

      const timestampValue =
        (note as any).timestamp instanceof Date
          ? (note as any).timestamp
          : createdAt
          ? new Date(createdAt)
          : undefined;

      return {
        ...note,
        id: typeof (note as any).id === 'string' ? (note as any).id : undefined,
        ticket_id:
          typeof (note as any).ticket_id === 'string'
            ? (note as any).ticket_id
            : typeof (note as any).ticketId === 'string'
            ? (note as any).ticketId
            : undefined,
        agent_id:
          typeof (note as any).agent_id === 'string'
            ? (note as any).agent_id
            : typeof (note as any).agentId === 'string'
            ? (note as any).agentId
            : null,
        agentId:
          typeof (note as any).agentId === 'string'
            ? (note as any).agentId
            : typeof (note as any).agent_id === 'string'
            ? (note as any).agent_id
            : null,
        note_text: rawText,
        text: rawText,
        created_at: createdAt ?? null,
        timestamp: timestampValue,
        company_id:
          typeof (note as any).company_id === 'string'
            ? (note as any).company_id
            : typeof (note as any).companyId === 'string'
            ? (note as any).companyId
            : null,
        company_name:
          typeof (note as any).company_name === 'string'
            ? (note as any).company_name
            : typeof (note as any).companyName === 'string'
            ? (note as any).companyName
            : null,
        metadata: (note as any).metadata ?? (note as any).meta,
        ai_profile_key: (note as any).ai_profile_key ?? (note as any).aiProfileKey ?? null,
        intake_payload: (note as any).intake_payload ?? (note as any).intakePayload,
      } as InternalNote;
    });
};

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
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  metadata?: Record<string, any> | null;
  company_id?: string | null;
  company_name?: string | null;
  created_at: Date;
  updated_at: Date;
  chat_history: ChatMessage[];
  assigned_ai_level: 1 | 2;
  assigned_agent_id?: string; // UUID of the agent assigned to this ticket
  workstation_id?: string;   // "Poste" or Workstation ID
  internal_notes: InternalNote[]; // Notes visible only to agents/managers
  current_appointment?: AppointmentDetails; // For appointment scheduling
}

export interface User {
  id: string; // uuid
  auth_uid?: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  language_preference: Locale;
  company_id?: string | null; // Stores the company name (text)
  company_name?: string | null;
  global_role?: GlobalRole | null;
}

// Ensure Locale is defined or imported if it's from LanguageContext
// For simplicity, assuming Locale is 'en' | 'fr' | 'ar' as typically defined in LanguageContext
export type Locale = 'en' | 'fr' | 'ar';
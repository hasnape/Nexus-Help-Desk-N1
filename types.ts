export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress',
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
  sender: 'user' | 'ai' | 'agent' | 'system_summary';
  text: string;
  timestamp: Date;
  agentId?: string;
  ai_profile_key?: string | null;
  intake_payload?: unknown;
}

export interface InternalNote {
  id?: string;
  ticket_id?: string;
  agent_id?: string | null;
  agentId?: string | null;
  note_text: string;
  text?: string;
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
  proposedDate: string;
  proposedTime: string;
  locationOrMethod: string;
  status: 'pending_user_approval' | 'pending_agent_approval' | 'confirmed' | 'cancelled_by_user' | 'cancelled_by_agent' | 'rescheduled_by_user' | 'rescheduled_by_agent';
  notes?: string;
  history?: AppointmentDetails[];
  id: string;
}

// ✅ SUMMARY AJOUTÉ ICI!
export interface Ticket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  details?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  company_id?: string | null;
  company_name?: string | null;
  created_at: Date;
  updated_at: Date;
  chat_history: ChatMessage[];
  assigned_ai_level: 1 | 2;
  assigned_agent_id?: string;
  workstation_id?: string;
  internal_notes: InternalNote[];
  current_appointment?: AppointmentDetails;
  summary?: string;                    // ✅ RÉSUMÉ IA
  summary_updated_at?: string | null;  // ✅ TIMESTAMP RÉSUMÉ
}

export interface User {
  id: string;
  auth_uid?: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  language_preference: Locale;
  company_id?: string | null;
  company_name?: string | null;
  global_role?: GlobalRole | null;
}

export type Locale = 'en' | 'fr' | 'ar';

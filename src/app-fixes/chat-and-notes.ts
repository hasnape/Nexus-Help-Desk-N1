/**
 * Helper functions for normalizing chat message and internal notes handling.
 * These functions ensure proper use of chat_messages.message_text and
 * internal_notes as JSON arrays.
 */

export type ChatMessage = {
  id?: string;
  sender: 'user' | 'agent' | 'ai';
  text: string;
  timestamp: number;
  author?: string;
  metadata?: Record<string, any>;
};

export type InternalNote = {
  text: string;
  timestamp: number;
  author: string;
  metadata?: Record<string, any>;
};

export type TicketMessageRow = {
  id: string;
  ticket_id: string;
  sender: 'user' | 'agent' | 'ai';
  message_text?: string;
  message?: string; // Legacy field
  timestamp?: string | number;
  created_at?: string;
  author?: string;
  metadata?: any;
};

/**
 * Maps a database row from chat_messages to a normalized ChatMessage object.
 * Handles both legacy 'message' field and new 'message_text' field.
 */
export function mapTicketMessageRowToChatMessage(
  row: TicketMessageRow
): ChatMessage {
  // Prefer message_text over message for forwards compatibility
  const text = row.message_text ?? row.message ?? '';
  
  // Parse timestamp - could be ISO string, epoch number, or created_at
  let timestamp: number;
  if (row.timestamp) {
    if (typeof row.timestamp === 'number') {
      timestamp = row.timestamp;
    } else {
      timestamp = new Date(row.timestamp).getTime();
    }
  } else if (row.created_at) {
    timestamp = new Date(row.created_at).getTime();
  } else {
    timestamp = Date.now();
  }

  return {
    id: row.id,
    sender: row.sender,
    text,
    timestamp,
    author: row.author,
    metadata: row.metadata,
  };
}

/**
 * Persists chat messages to the database using message_text field.
 * This helper ensures consistent use of the correct column name.
 * 
 * @param supabaseClient - Supabase client instance
 * @param ticketId - The ticket ID to associate messages with
 * @param messages - Array of chat messages to persist
 * @returns Promise resolving to the inserted records
 */
export async function persistTicketMessages(
  supabaseClient: any,
  ticketId: string,
  messages: ChatMessage[]
): Promise<{ data: any[] | null; error: any }> {
  const rows = messages.map((msg) => ({
    ticket_id: ticketId,
    sender: msg.sender,
    message_text: msg.text,
    timestamp: new Date(msg.timestamp).toISOString(),
    author: msg.author,
    metadata: msg.metadata,
  }));

  const { data, error } = await supabaseClient
    .from('chat_messages')
    .insert(rows)
    .select();

  return { data, error };
}

/**
 * Parses internal_notes from database (could be string or jsonb).
 * Always returns an array of InternalNote objects.
 * 
 * @param rawNotes - The internal_notes value from database (string, object, or array)
 * @returns Array of InternalNote objects
 */
export function parseInternalNotes(rawNotes: any): InternalNote[] {
  if (!rawNotes) {
    return [];
  }

  // If it's already an array, return it
  if (Array.isArray(rawNotes)) {
    return rawNotes;
  }

  // If it's a string, try to parse as JSON
  if (typeof rawNotes === 'string') {
    try {
      const parsed = JSON.parse(rawNotes);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // If parsed to non-array object, wrap it
      return [
        {
          text: typeof parsed === 'string' ? parsed : JSON.stringify(parsed),
          timestamp: Date.now(),
          author: 'system',
        },
      ];
    } catch {
      // Not valid JSON, wrap the string as a single note
      return [
        {
          text: rawNotes,
          timestamp: Date.now(),
          author: 'system',
        },
      ];
    }
  }

  // If it's an object but not array, wrap it
  if (typeof rawNotes === 'object') {
    return [
      {
        text: JSON.stringify(rawNotes),
        timestamp: Date.now(),
        author: 'system',
      },
    ];
  }

  return [];
}

/**
 * Serializes internal notes array to JSON string for storage.
 * 
 * @param notes - Array of internal notes
 * @returns JSON string representation
 */
export function serializeInternalNotes(notes: InternalNote[]): string {
  return JSON.stringify(notes);
}

/**
 * Adds a new internal note to an existing notes array.
 * 
 * @param existingNotes - Current notes (any format)
 * @param noteText - New note text to add
 * @param author - Author of the note
 * @returns Updated notes array
 */
export function addInternalNote(
  existingNotes: any,
  noteText: string,
  author: string
): InternalNote[] {
  const notes = parseInternalNotes(existingNotes);
  notes.push({
    text: noteText,
    timestamp: Date.now(),
    author,
  });
  return notes;
}

/**
 * Type guard to check if a ticket row has the new internal_notes_json field.
 */
export function hasInternalNotesJson(ticket: any): boolean {
  return (
    ticket &&
    'internal_notes_json' in ticket &&
    ticket.internal_notes_json !== undefined
  );
}

/**
 * Gets internal notes from a ticket, preferring internal_notes_json if available.
 * 
 * @param ticket - Ticket object from database
 * @returns Array of InternalNote objects
 */
export function getTicketInternalNotes(ticket: any): InternalNote[] {
  if (hasInternalNotesJson(ticket)) {
    return parseInternalNotes(ticket.internal_notes_json);
  }
  return parseInternalNotes(ticket.internal_notes);
}

/**
 * Revives date fields from ticket objects that may have been serialized.
 * Converts ISO date strings back to Date objects or timestamps.
 * 
 * @param ticket - Ticket object with potential date fields
 * @returns Ticket with properly typed date fields
 */
export function reviveTicketDates<T extends Record<string, any>>(ticket: T): T {
  const dateFields = [
    'created_at',
    'updated_at',
    'resolved_at',
    'closed_at',
    'appointment_date',
    'appointment_time',
    'due_date',
  ];

  const revived = { ...ticket };

  for (const field of dateFields) {
    if (revived[field] && typeof revived[field] === 'string') {
      try {
        // Keep as ISO string but validate it's a valid date
        const date = new Date(revived[field]);
        if (isNaN(date.getTime())) {
          // Invalid date, remove field
          delete revived[field];
        }
      } catch {
        // Invalid date, remove field
        delete revived[field];
      }
    }
  }

  return revived;
}

/**
 * Batch processes multiple ticket rows, applying date revival and message mapping.
 * 
 * @param tickets - Array of ticket objects from database
 * @returns Array of processed tickets
 */
export function processTicketRows<T extends Record<string, any>>(
  tickets: T[]
): T[] {
  return tickets.map((ticket) => reviveTicketDates(ticket));
}

/**
 * Batch processes multiple chat message rows.
 * 
 * @param rows - Array of chat message rows from database
 * @returns Array of normalized ChatMessage objects
 */
export function processChatMessageRows(
  rows: TicketMessageRow[]
): ChatMessage[] {
  return rows.map((row) => mapTicketMessageRowToChatMessage(row));
}

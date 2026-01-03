/**
 * App helpers to normalize chat messages and internal notes usage
 * 
 * These functions prioritize `message_text` column and normalize
 * internal_notes into consistent array format
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ChatMessage {
  id?: string;
  ticket_id: string;
  message_text: string;
  sender_type: 'user' | 'agent' | 'system';
  sender_id?: string;
  created_at?: string;
  metadata?: any;
}

export interface InternalNote {
  text: string;
  timestamp: number;
  author: string;
}

/**
 * Map a ticket message row to a normalized ChatMessage
 * Prioritizes message_text column
 */
export function mapTicketMessageRowToChatMessage(row: any): ChatMessage {
  return {
    id: row.id,
    ticket_id: row.ticket_id,
    message_text: row.message_text || row.message || '',
    sender_type: row.sender_type || 'user',
    sender_id: row.sender_id,
    created_at: row.created_at,
    metadata: row.metadata,
  };
}

/**
 * Persist ticket messages to chat_messages table
 * Uses message_text column for inserts
 */
export async function persistTicketMessages(
  supabase: SupabaseClient,
  messages: ChatMessage[]
): Promise<{ data: any[] | null; error: any }> {
  if (!messages || messages.length === 0) {
    return { data: [], error: null };
  }

  const rows = messages.map((msg) => ({
    ticket_id: msg.ticket_id,
    message_text: msg.message_text,
    sender_type: msg.sender_type,
    sender_id: msg.sender_id,
    metadata: msg.metadata,
  }));

  const { data, error } = await supabase
    .from('chat_messages')
    .insert(rows)
    .select();

  return { data, error };
}

/**
 * Revive date fields from ticket data
 * Ensures proper date parsing for ticket timestamps
 */
export function reviveTicketDates(ticket: any): any {
  if (!ticket) return ticket;

  const revived = { ...ticket };

  // Convert string dates back to Date objects if needed
  if (revived.created_at && typeof revived.created_at === 'string') {
    revived.created_at = new Date(revived.created_at);
  }
  if (revived.updated_at && typeof revived.updated_at === 'string') {
    revived.updated_at = new Date(revived.updated_at);
  }
  if (revived.closed_at && typeof revived.closed_at === 'string') {
    revived.closed_at = new Date(revived.closed_at);
  }

  return revived;
}

/**
 * Normalize internal_notes into array of note objects
 * Accepts: array, JSON string, or plain text
 * Returns: InternalNote[]
 */
export function normalizeInternalNotes(notes: any): InternalNote[] {
  if (!notes) {
    return [];
  }

  // Already an array of note objects
  if (Array.isArray(notes)) {
    return notes.map((note) => {
      if (typeof note === 'object' && note.text) {
        return {
          text: note.text,
          timestamp: note.timestamp || Date.now(),
          author: note.author || 'unknown',
        };
      }
      // Array of strings
      return {
        text: String(note),
        timestamp: Date.now(),
        author: 'system',
      };
    });
  }

  // Try parsing as JSON string
  if (typeof notes === 'string') {
    try {
      const parsed = JSON.parse(notes);
      if (Array.isArray(parsed)) {
        return normalizeInternalNotes(parsed);
      }
      // Single JSON object parsed
      if (typeof parsed === 'object') {
        return [
          {
            text: parsed.text || JSON.stringify(parsed),
            timestamp: parsed.timestamp || Date.now(),
            author: parsed.author || 'system',
          },
        ];
      }
    } catch {
      // Not valid JSON, treat as plain text
    }

    // Plain text string
    return [
      {
        text: notes,
        timestamp: Date.now(),
        author: 'system',
      },
    ];
  }

  // Object (non-array)
  if (typeof notes === 'object') {
    return [
      {
        text: (notes as any).text || JSON.stringify(notes),
        timestamp: (notes as any).timestamp || Date.now(),
        author: (notes as any).author || 'system',
      },
    ];
  }

  // Fallback: convert to string
  return [
    {
      text: String(notes),
      timestamp: Date.now(),
      author: 'system',
    },
  ];
}

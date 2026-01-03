/**
 * Helper functions for normalizing chat messages and internal_notes handling
 * to support the migration from internal_notes to internal_notes_json (JSONB)
 * and ensure consistent usage of chat_messages.message_text field
 */

import type { ChatMessage, InternalNote } from '../../types';

/**
 * Maps a database row from chat_messages table to ChatMessage interface
 * Prioritizes message_text field over legacy text field
 */
export function mapTicketMessageRowToChatMessage(row: any): ChatMessage {
  return {
    id: row.id || crypto.randomUUID(),
    sender: row.sender || 'user',
    // Prioritize message_text (new field) over text (legacy)
    text: row.message_text || row.text || '',
    timestamp: row.created_at ? new Date(row.created_at) : new Date(),
    agentId: row.agent_id || row.agentId,
  };
}

/**
 * Prepares chat messages for insertion into chat_messages table
 * Ensures message_text field is populated
 */
export function persistTicketMessages(messages: ChatMessage[], ticketId: string): any[] {
  return messages.map((msg) => ({
    ticket_id: ticketId,
    sender: msg.sender,
    // Store in message_text field (not legacy text field)
    message_text: msg.text,
    agent_id: msg.agentId || null,
    created_at: msg.timestamp || new Date(),
  }));
}

/**
 * Revives and normalizes internal_notes from database
 * Handles both old text format and new JSONB array format
 * Ensures consistent parsing to array of InternalNote objects
 */
export function reviveTicketDates(ticket: any): any {
  const result = { ...ticket };

  // Normalize created_at
  if (ticket.created_at) {
    result.created_at = new Date(ticket.created_at);
  }

  // Normalize updated_at
  if (ticket.updated_at) {
    result.updated_at = new Date(ticket.updated_at);
  }

  // Normalize internal_notes - handle both old and new formats
  result.internal_notes = normalizeInternalNotes(
    ticket.internal_notes_json || ticket.internal_notes
  );

  return result;
}

/**
 * Normalizes internal_notes into consistent array of InternalNote objects
 * Handles multiple input formats:
 * - JSONB array from internal_notes_json column
 * - Legacy text/JSON from internal_notes column
 * - Already parsed arrays
 */
function normalizeInternalNotes(raw: any): InternalNote[] {
  if (!raw) return [];

  let candidate: any[] = [];

  // If already an array, use it
  if (Array.isArray(raw)) {
    candidate = raw;
  }
  // If it's a string, try to parse it
  else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        candidate = parsed;
      } else {
        // If parsed to object but not array, wrap it
        candidate = [parsed];
      }
    } catch {
      // If parsing fails, treat as plain text note
      if (raw.trim()) {
        candidate = [{ note_text: raw, created_at: new Date() }];
      }
    }
  }
  // If it's an object (but not array), wrap it
  else if (typeof raw === 'object') {
    candidate = [raw];
  }

  // Map to InternalNote objects with consistent structure
  return candidate.map((note) => {
    if (typeof note === 'string') {
      return {
        note_text: note,
        created_at: new Date(),
      } as InternalNote;
    }

    return {
      id: note.id,
      ticket_id: note.ticket_id,
      agent_id: note.agent_id || note.agentId,
      agentId: note.agent_id || note.agentId,
      note_text: note.note_text || note.noteText || '',
      created_at: note.created_at ? new Date(note.created_at) : new Date(),
    } as InternalNote;
  });
}

/**
 * Serializes internal notes for storage in JSONB column
 * Ensures consistent format for database storage
 */
export function serializeInternalNotes(notes: InternalNote[]): any[] {
  return notes.map((note) => ({
    id: note.id,
    ticket_id: note.ticket_id,
    agent_id: note.agent_id || note.agentId,
    note_text: note.note_text,
    created_at: note.created_at?.toISOString() || new Date().toISOString(),
  }));
}

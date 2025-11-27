import { ChatMessage, InternalNote, Ticket } from '@/types';

export interface IntakeDeadline {
  description?: string;
  date?: string;
  timeframe?: string;
}

export interface IntakePayload {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  pseudonym?: string;
  age?: number;
  age_range?: string;
  country_of_origin?: string;
  origin_country?: string;
  current_location?: string;
  location?: string;
  legal_status?: string;
  status?: string;
  primary_goal?: string;
  goal?: string;
  urgency_level?: string;
  urgency?: string;
  practice_area?: string;
  practice?: string;
  main_issue?: string;
  key_concerns?: string[];
  next_steps?: string[];
  deadlines?: Array<string | IntakeDeadline>;
  timeline?: Array<string | IntakeDeadline>;
  milestones?: Array<string | IntakeDeadline>;
  risk_flags?: string[];
  [key: string]: unknown;
}

const getFirstString = (obj: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const numeric = Number.parseInt(value, 10);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }
  return undefined;
};

const parseStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : undefined))
      .filter((entry): entry is string => !!entry && entry.length > 0);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  return undefined;
};

export const parseIntakePayload = (value: unknown): IntakePayload | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const obj = value as Record<string, unknown>;
  const payload: IntakePayload = {};

  payload.full_name = getFirstString(obj, ['full_name', 'name', 'client_name']);
  payload.first_name = getFirstString(obj, ['first_name', 'given_name']);
  payload.last_name = getFirstString(obj, ['last_name', 'family_name']);
  payload.pseudonym = getFirstString(obj, ['pseudonym', 'nickname']);
  payload.age = parseNumber(obj.age);
  payload.age_range = getFirstString(obj, ['age_range', 'approx_age']);
  payload.country_of_origin = getFirstString(obj, ['country_of_origin', 'origin_country']);
  payload.origin_country = payload.origin_country || payload.country_of_origin;
  payload.current_location = getFirstString(obj, ['current_location', 'location', 'city']);
  payload.location = payload.location || payload.current_location;
  payload.legal_status = getFirstString(obj, ['legal_status', 'status']);
  payload.status = payload.status || payload.legal_status;
  payload.primary_goal = getFirstString(obj, ['primary_goal', 'goal', 'objective']);
  payload.goal = payload.goal || payload.primary_goal;
  payload.urgency_level = getFirstString(obj, ['urgency_level', 'urgency', 'urgency_rating']);
  payload.urgency = payload.urgency || payload.urgency_level;
  payload.practice_area = getFirstString(obj, ['practice_area', 'practice', 'area']);
  payload.practice = payload.practice || payload.practice_area;
  payload.main_issue = getFirstString(obj, ['main_issue', 'issue', 'matter']);

  payload.key_concerns = parseStringArray(obj.key_concerns || obj.concerns);
  payload.next_steps = parseStringArray(obj.next_steps || obj.proposed_steps);
  payload.deadlines =
    (Array.isArray(obj.deadlines) && (obj.deadlines as unknown[]).length > 0
      ? (obj.deadlines as Array<string | IntakeDeadline>)
      : undefined) ||
    (Array.isArray(obj.timeline) && (obj.timeline as unknown[]).length > 0
      ? (obj.timeline as Array<string | IntakeDeadline>)
      : undefined) ||
    (Array.isArray(obj.milestones) && (obj.milestones as unknown[]).length > 0
      ? (obj.milestones as Array<string | IntakeDeadline>)
      : undefined);
  payload.timeline = payload.timeline || payload.deadlines;
  payload.milestones = payload.milestones || payload.deadlines;
  payload.risk_flags = parseStringArray(obj.risk_flags || obj.risks);

  return Object.keys(payload).length > 0 ? payload : null;
};

export const getDisplayNameFromIntake = (payload?: IntakePayload | null): string | undefined => {
  if (!payload) return undefined;
  return (
    payload.full_name ||
    [payload.first_name, payload.last_name].filter(Boolean).join(' ').trim() ||
    payload.pseudonym
  );
};

export const getAgeDisplay = (payload?: IntakePayload | null): string | undefined => {
  if (!payload) return undefined;
  if (typeof payload.age === 'number') {
    return `${payload.age} years old`;
  }
  if (payload.age_range) return payload.age_range;
  return undefined;
};

export const getLocationDisplay = (payload?: IntakePayload | null): string | undefined => {
  if (!payload) return undefined;
  return payload.current_location || payload.location;
};

export const getLegalStatusDisplay = (payload?: IntakePayload | null): string | undefined => {
  if (!payload) return undefined;
  return payload.legal_status || payload.status;
};

export const getPrimaryGoalDisplay = (payload?: IntakePayload | null): string | undefined => {
  if (!payload) return undefined;
  return payload.primary_goal || payload.goal || payload.main_issue;
};

export const getUrgencyDisplay = (payload?: IntakePayload | null): string | undefined => {
  if (!payload) return undefined;
  return payload.urgency_level || payload.urgency;
};

export const getPracticeAreaDisplay = (payload?: IntakePayload | null, fallback?: string): string | undefined => {
  if (payload?.practice_area) return payload.practice_area;
  if (payload?.practice) return payload.practice;
  return fallback;
};

export const extractDeadlineList = (payload?: IntakePayload | null): string[] => {
  if (!payload) return [];
  const candidates = payload.deadlines || payload.timeline || payload.milestones;
  if (!Array.isArray(candidates)) return [];
  return candidates
    .map((deadline) => {
      if (typeof deadline === 'string') return deadline;
      if (!deadline) return undefined;
      const parts = [deadline.description, deadline.date, deadline.timeframe]
        .filter((part) => typeof part === 'string' && part.trim().length > 0)
        .map((part) => part!.trim());
      return parts.join(' – ').trim();
    })
    .filter((entry): entry is string => !!entry);
};

export const findLatestLaiTurnerIntake = (ticket: Ticket): IntakePayload | null => {
  const candidates: {
    payload: IntakePayload | null;
    aiProfileKey?: string | null;
    timestamp?: Date;
  }[] = [];

  (ticket.internal_notes || []).forEach((note: InternalNote) => {
    const payload = parseIntakePayload((note as any).intake_payload ?? (note as any).intakePayload);
    if (payload) {
      candidates.push({
        payload,
        aiProfileKey: (note as any).ai_profile_key ?? (note as any).aiProfileKey,
        timestamp: note.timestamp || (note.created_at ? new Date(note.created_at) : undefined),
      });
    }
  });

  (ticket.chat_history || []).forEach((message: ChatMessage) => {
    const payload = parseIntakePayload((message as any).intake_payload ?? (message as any).intakePayload);
    if (payload) {
      candidates.push({
        payload,
        aiProfileKey: (message as any).ai_profile_key ?? (message as any).aiProfileKey,
        timestamp: message.timestamp,
      });
    }
  });

  const laiSpecific = candidates
    .filter((candidate) => candidate.aiProfileKey === 'lai_turner_intake')
    .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  if (laiSpecific.length > 0) {
    return laiSpecific[0].payload;
  }

  const sorted = candidates.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  return sorted[0]?.payload || null;
};

export const findLatestAttorneySummary = (ticket: Ticket): string | undefined => {
  const notes = [...(ticket.internal_notes || [])].sort(
    (a, b) => (b.timestamp?.getTime?.() || 0) - (a.timestamp?.getTime?.() || 0)
  );
  for (const note of notes) {
    const text = note.text || '';
    const match = text.match(/\[ATTORNEY_SUMMARY\](.*?)\[\/ATTORNEY_SUMMARY\]/s);
    if (match && match[1]) {
      return match[1].trim();
    }
    if (text.toLowerCase().includes('attorney summary')) {
      return text;
    }
  }
  return undefined;
};

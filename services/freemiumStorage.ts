import { ChatMessage, InternalNote, Ticket } from "../types";

const FREEMIUM_COMPANY_KEY = "nexusFreemiumCompany";
const FREEMIUM_TICKETS_KEY = "nexusFreemiumTickets";
const FREEMIUM_SESSION_KEY = "nexusFreemiumSessionMeta";
const FREEMIUM_BACKUP_META_KEY = "nexusFreemiumBackupMeta";

type StoredChatMessage = Omit<ChatMessage, "timestamp"> & { timestamp: string };
type StoredInternalNote = Omit<InternalNote, "timestamp"> & { timestamp: string };
type StoredTicket = Omit<Ticket, "created_at" | "updated_at" | "chat_history" | "internal_notes"> & {
  created_at: string;
  updated_at: string;
  chat_history: StoredChatMessage[];
  internal_notes?: StoredInternalNote[];
};

type FreemiumSessionMeta = {
  userId: string;
  email: string;
  companyName: string;
  lastUpdated: string;
};

type FreemiumBackupMeta = {
  ticketCount: number;
  lastSynced: string;
};

const isBrowser = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getStoredFreemiumCompany = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(FREEMIUM_COMPANY_KEY);
};

export const setStoredFreemiumCompany = (companyName: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(FREEMIUM_COMPANY_KEY, companyName);
};

export const clearStoredFreemiumCompany = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(FREEMIUM_COMPANY_KEY);
};

const serializeTicket = (ticket: Ticket): StoredTicket => ({
  ...ticket,
  created_at: ticket.created_at.toISOString(),
  updated_at: ticket.updated_at.toISOString(),
  chat_history: ticket.chat_history.map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  })),
  internal_notes: ticket.internal_notes
    ? ticket.internal_notes.map((note) => ({
        ...note,
        timestamp: note.timestamp.toISOString(),
      }))
    : undefined,
});

const reviveTicket = (storedTicket: StoredTicket): Ticket => ({
  ...storedTicket,
  created_at: new Date(storedTicket.created_at),
  updated_at: new Date(storedTicket.updated_at),
  chat_history: storedTicket.chat_history.map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp),
  })),
  internal_notes: storedTicket.internal_notes
    ? storedTicket.internal_notes.map((note) => ({
        ...note,
        timestamp: new Date(note.timestamp),
      }))
    : undefined,
});

export const loadFreemiumTickets = (): Ticket[] | null => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(FREEMIUM_TICKETS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredTicket[];
    return parsed.map(reviveTicket);
  } catch (error) {
    console.error("Failed to parse freemium tickets from local storage:", error);
    return null;
  }
};

export const saveFreemiumTickets = (tickets: Ticket[]) => {
  if (!isBrowser()) return;
  try {
    const serialized = tickets.map(serializeTicket);
    window.localStorage.setItem(FREEMIUM_TICKETS_KEY, JSON.stringify(serialized));
    saveFreemiumBackupMeta({ ticketCount: tickets.length, lastSynced: new Date().toISOString() });
  } catch (error) {
    console.error("Failed to persist freemium tickets to local storage:", error);
  }
};

export const clearFreemiumTickets = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(FREEMIUM_TICKETS_KEY);
  window.localStorage.removeItem(FREEMIUM_BACKUP_META_KEY);
};

export const saveFreemiumSessionMeta = (meta: FreemiumSessionMeta) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(FREEMIUM_SESSION_KEY, JSON.stringify(meta));
  } catch (error) {
    console.error("Failed to persist freemium session meta:", error);
  }
};

export const getFreemiumSessionMeta = (): FreemiumSessionMeta | null => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(FREEMIUM_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FreemiumSessionMeta;
  } catch (error) {
    console.error("Failed to parse freemium session meta:", error);
    return null;
  }
};

export const clearFreemiumSessionMeta = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(FREEMIUM_SESSION_KEY);
};

const saveFreemiumBackupMeta = (meta: FreemiumBackupMeta) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(FREEMIUM_BACKUP_META_KEY, JSON.stringify(meta));
  } catch (error) {
    console.error("Failed to persist freemium backup meta:", error);
  }
};

export const getFreemiumBackupMeta = (): FreemiumBackupMeta | null => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(FREEMIUM_BACKUP_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FreemiumBackupMeta;
  } catch (error) {
    console.error("Failed to parse freemium backup meta:", error);
    return null;
  }
};

export const isFreemiumCompanyOnDevice = (companyName: string | null | undefined): boolean => {
  if (!companyName) return false;
  const stored = getStoredFreemiumCompany();
  if (!stored) return false;
  return stored.trim().toLowerCase() === companyName.trim().toLowerCase();
};

export const recordFreemiumSession = (userId: string, email: string, companyName: string) => {
  saveFreemiumSessionMeta({
    userId,
    email,
    companyName,
    lastUpdated: new Date().toISOString(),
  });
};

export const resetFreemiumStorage = () => {
  clearFreemiumTickets();
  clearFreemiumSessionMeta();
};

export const FREEMIUM_STORAGE_CONSTANTS = {
  companyKey: FREEMIUM_COMPANY_KEY,
  ticketsKey: FREEMIUM_TICKETS_KEY,
  sessionKey: FREEMIUM_SESSION_KEY,
  backupMetaKey: FREEMIUM_BACKUP_META_KEY,
};

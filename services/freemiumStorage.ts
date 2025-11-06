import {
  ChatMessage,
  InternalNote,
  Ticket,
  User,
  Locale,
  UserRole,
  TicketStatus,
  TicketPriority,
<<<<<<< HEAD
} from "../types";
=======
} from "@/types";
>>>>>>> origin/master

const STORAGE_KEY = "nsh_freemium_session";
const DEFAULT_SESSION_VERSION = "1.0.0";
const DEFAULT_TTL_DAYS = 30;

type FreemiumSessionMeta = {
  id: string;
  createdAt: string;
  lastSaveAt: string;
  lastSyncAt: string;
  version: string;
  expiresAt: string;
};

type FreemiumSessionUser = {
  id: string;
  displayName: string;
  email: string;
  roles: UserRole[];
  language?: Locale;
  companyId?: string;
};

type FreemiumTicketMessage = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
  agentId?: string;
};

type SerializedChatMessage = Omit<ChatMessage, "timestamp"> & { timestamp: string };
type SerializedInternalNote = Omit<InternalNote, "timestamp"> & { timestamp: string };

type SerializedTicketPayload = Omit<
  Ticket,
  "created_at" | "updated_at" | "chat_history" | "internal_notes"
> & {
  created_at: string;
  updated_at: string;
  chat_history: SerializedChatMessage[];
  internal_notes?: SerializedInternalNote[];
};

type FreemiumStoredTicket = {
  id: string;
  title: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: FreemiumTicketMessage[];
  payload: SerializedTicketPayload;
};

type FreemiumPrefs = {
  lang: Locale;
  theme: "light" | "dark";
};

type FreemiumSessionLastUser = {
  userId: string;
  email: string;
  companyName: string;
  lastUpdated: string;
};

type StoredFreemiumAccount = {
  id: string;
  email: string;
  emailLower: string;
  displayName: string;
  passwordHash: string;
  language: Locale;
  roles: UserRole[];
  companyName: string;
  companyNameLower: string;
  createdAt: string;
};

type FreemiumSessionAuth = {
  accounts: StoredFreemiumAccount[];
  deviceCompanyId: string | null;
  lastUser: FreemiumSessionLastUser | null;
};

type FreemiumSessionData = {
  meta: FreemiumSessionMeta;
  users: FreemiumSessionUser[];
  tickets: FreemiumStoredTicket[];
  prefs: FreemiumPrefs;
  auth: FreemiumSessionAuth;
};

const sessionState: { data: FreemiumSessionData | null } = { data: null };

const isBrowser = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const nowIso = (): string => new Date().toISOString();

const generateLocalId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `freemium-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getTtlExpiry = (ttlDays: number = DEFAULT_TTL_DAYS): string => {
  const ttl = Math.max(ttlDays, 1);
  const expires = new Date(Date.now() + ttl * 24 * 60 * 60 * 1000);
  return expires.toISOString();
};

const normalizeRoles = (roles: UserRole[] | undefined): UserRole[] => {
  if (!roles || roles.length === 0) {
    return [UserRole.MANAGER];
  }
  const unique = Array.from(new Set(roles));
  return unique.length > 0 ? unique : [UserRole.MANAGER];
};

const normalizeTicketMessage = (message: Partial<FreemiumTicketMessage>): FreemiumTicketMessage => ({
  id: message.id || generateLocalId(),
  text: message.text || "",
  createdAt: message.createdAt || nowIso(),
  author: message.author || "system",
  agentId: message.agentId,
});

const normalizeStoredTicket = (ticket: Partial<FreemiumStoredTicket>): FreemiumStoredTicket => {
  const createdAt = ticket.createdAt || nowIso();
  const normalizedMessages = (ticket.messages || []).map((message) => normalizeTicketMessage(message));
  return {
    id: ticket.id || generateLocalId(),
    title: ticket.title || "",
    status: ticket.status || TicketStatus.OPEN,
    createdAt,
    updatedAt: ticket.updatedAt || createdAt,
    messages: normalizedMessages,
    payload: ticket.payload || {
      id: ticket.id || generateLocalId(),
      user_id: "",
      title: ticket.title || "",
      description: "",
      category: "General",
      priority: TicketPriority.MEDIUM,
      status: ticket.status || TicketStatus.OPEN,
      created_at: createdAt,
      updated_at: ticket.updatedAt || createdAt,
      chat_history: [],
      assigned_ai_level: 1,
      assigned_agent_id: undefined,
      workstation_id: undefined,
      internal_notes: undefined,
      current_appointment: undefined,
    },
  };
};

const normalizePrefs = (prefs: Partial<FreemiumPrefs> | undefined): FreemiumPrefs => ({
  lang: prefs?.lang || "fr",
  theme: prefs?.theme || "light",
});

const normalizeSession = (input: Partial<FreemiumSessionData> | null | undefined): FreemiumSessionData => {
  const createdAt = input?.meta?.createdAt || nowIso();
  const expiresAt = input?.meta?.expiresAt || getTtlExpiry();

  const normalizedTickets = (input?.tickets || []).map((ticket) => normalizeStoredTicket(ticket));

  return {
    meta: {
      id: input?.meta?.id || generateLocalId(),
      createdAt,
      lastSaveAt: input?.meta?.lastSaveAt || createdAt,
      lastSyncAt: input?.meta?.lastSyncAt || input?.meta?.lastSaveAt || createdAt,
      version: input?.meta?.version || DEFAULT_SESSION_VERSION,
      expiresAt,
    },
    users: (input?.users || []).map((user) => ({
      id: user.id || generateLocalId(),
      displayName: user.displayName || user.email || "Utilisateur Freemium",
      email: user.email || "",
      roles: normalizeRoles(user.roles),
      language: user.language,
      companyId: user.companyId,
    })),
    tickets: normalizedTickets,
    prefs: normalizePrefs(input?.prefs),
    auth: {
      accounts: (input?.auth?.accounts || []).map((account) => ({
        id: account.id || generateLocalId(),
        email: account.email || "",
        emailLower: account.emailLower || account.email?.toLowerCase() || "",
        displayName: account.displayName || account.email || "",
        passwordHash: account.passwordHash || "",
        language: account.language || "fr",
        roles: normalizeRoles(account.roles),
        companyName: account.companyName || "",
        companyNameLower: account.companyNameLower || account.companyName?.toLowerCase() || "",
        createdAt: account.createdAt || nowIso(),
      })),
      deviceCompanyId: input?.auth?.deviceCompanyId || null,
      lastUser: input?.auth?.lastUser || null,
    },
  };
};

const persistSession = () => {
  if (!isBrowser() || !sessionState.data) return;
  sessionState.data.meta.lastSaveAt = nowIso();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionState.data));
  } catch (error) {
    console.error("Failed to persist freemium session", error);
  }
};

const ensureSession = (): FreemiumSessionData => {
  if (sessionState.data) {
    const expiresAt = new Date(sessionState.data.meta.expiresAt).getTime();
    if (Number.isFinite(expiresAt) && expiresAt > Date.now()) {
      return sessionState.data;
    }
  }

  let stored: FreemiumSessionData | null = null;
  if (isBrowser()) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        stored = JSON.parse(raw) as FreemiumSessionData;
      } catch (error) {
        console.warn("Failed to parse stored freemium session", error);
      }
    }
  }

  const normalized = normalizeSession(stored || undefined);
  const expires = new Date(normalized.meta.expiresAt).getTime();
  if (!Number.isFinite(expires) || expires <= Date.now()) {
    normalized.meta.expiresAt = getTtlExpiry();
  }

  sessionState.data = normalized;
  if (isBrowser()) {
    persistSession();
    (window as any).FreemiumSession = FreemiumSession;
  }
  return sessionState.data;
};

const encodeString = (input: string): string => {
  if (!isBrowser()) {
    return input;
  }
  try {
    return window.btoa(unescape(encodeURIComponent(input)));
  } catch (error) {
    console.warn("Failed to encode freemium credential string:", error);
    return input;
  }
};

const serializeTicket = (ticket: Ticket): FreemiumStoredTicket => {
  const serializedChat: SerializedChatMessage[] = ticket.chat_history.map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  }));

  const serializedNotes = ticket.internal_notes
    ? ticket.internal_notes.map((note) => ({
        ...note,
        timestamp: note.timestamp.toISOString(),
      }))
    : undefined;

  return {
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    createdAt: ticket.created_at.toISOString(),
    updatedAt: ticket.updated_at.toISOString(),
    messages: ticket.chat_history.map((message) => ({
      id: message.id,
      text: message.text,
      createdAt: message.timestamp.toISOString(),
      author: message.sender,
      agentId: message.agentId,
    })),
    payload: {
      ...ticket,
      created_at: ticket.created_at.toISOString(),
      updated_at: ticket.updated_at.toISOString(),
      chat_history: serializedChat,
      internal_notes: serializedNotes,
    },
  };
};

const reviveTicket = (stored: FreemiumStoredTicket): Ticket => {
  const payload = stored.payload;
  const revivedNotes = payload.internal_notes
    ? payload.internal_notes.map((note) => ({
        ...note,
        timestamp: new Date(note.timestamp),
      }))
    : undefined;

  return {
    ...payload,
    created_at: new Date(payload.created_at),
    updated_at: new Date(payload.updated_at),
    chat_history: payload.chat_history.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    })),
    internal_notes: revivedNotes,
  };
};

export const FreemiumSession = {
  init(): FreemiumSessionData {
    const session = ensureSession();
    return JSON.parse(JSON.stringify(session));
  },
  get(): FreemiumSessionData {
    const session = ensureSession();
    return JSON.parse(JSON.stringify(session));
  },
  save(): void {
    ensureSession();
    persistSession();
  },
  clear(): void {
    sessionState.data = null;
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear freemium session", error);
      }
    }
  },
  renew(ttlDays: number): void {
    const session = ensureSession();
    session.meta.expiresAt = getTtlExpiry(ttlDays);
    persistSession();
  },
  addUser({ displayName, email, roles }: { displayName: string; email: string; roles: UserRole[] }): FreemiumSessionUser {
    const session = ensureSession();
    const normalizedEmail = email.trim();
    const userRecord: FreemiumSessionUser = {
      id: generateLocalId(),
      displayName: displayName.trim() || normalizedEmail,
      email: normalizedEmail,
      roles: normalizeRoles(roles),
    };

    const existingIndex = session.users.findIndex(
      (user) => user.email.toLowerCase() === normalizedEmail.toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = session.users[existingIndex];
      const mergedRoles = Array.from(new Set([...existing.roles, ...userRecord.roles]));
      session.users[existingIndex] = {
        ...existing,
        displayName: userRecord.displayName,
        roles: mergedRoles,
      };
      session.meta.lastSyncAt = nowIso();
      persistSession();
      return { ...session.users[existingIndex] };
    }

    session.users.push(userRecord);
    session.meta.lastSyncAt = nowIso();
    persistSession();
    return { ...userRecord };
  },
  addTicket({ title, message }: { title: string; message?: string }): FreemiumStoredTicket {
    const session = ensureSession();
    const createdAt = nowIso();
    const ticketId = generateLocalId();
    const ticket: FreemiumStoredTicket = {
      id: ticketId,
      title: title.trim(),
      status: TicketStatus.OPEN,
      createdAt,
      updatedAt: createdAt,
      messages: message
        ? [
            {
              id: generateLocalId(),
              text: message,
              createdAt,
              author: "user",
            },
          ]
        : [],
      payload: {
        id: ticketId,
        user_id: "",
        title: title.trim(),
        description: message || "",
        category: "General",
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        created_at: createdAt,
        updated_at: createdAt,
        chat_history: message
          ? [
              {
                id: generateLocalId(),
                sender: "user",
                text: message,
                timestamp: createdAt,
                agentId: undefined,
              },
            ]
          : [],
        assigned_ai_level: 1,
        assigned_agent_id: undefined,
        workstation_id: undefined,
        internal_notes: undefined,
        current_appointment: undefined,
      },
    };

    session.tickets.push(ticket);
    session.meta.lastSyncAt = createdAt;
    persistSession();
    return JSON.parse(JSON.stringify(ticket));
  },
  updateTicket(id: string, patch: Partial<FreemiumStoredTicket>): FreemiumStoredTicket | null {
    const session = ensureSession();
    const target = session.tickets.find((ticket) => ticket.id === id);
    if (!target) return null;

    if (patch.title !== undefined) target.title = patch.title;
    if (patch.status !== undefined) target.status = patch.status;
    if (patch.messages) target.messages = patch.messages.map((message) => normalizeTicketMessage(message));
    if (patch.payload) target.payload = patch.payload;
    target.updatedAt = nowIso();

    session.meta.lastSyncAt = target.updatedAt;
    persistSession();
    return JSON.parse(JSON.stringify(target));
  },
  addTicketMessage(id: string, text: string, author: string = "user", agentId?: string): FreemiumTicketMessage | null {
    const session = ensureSession();
    const target = session.tickets.find((ticket) => ticket.id === id);
    if (!target) return null;

    const createdAt = nowIso();
    const message = normalizeTicketMessage({
      id: generateLocalId(),
      text,
      author,
      createdAt,
      agentId,
    });

    target.messages.push(message);
    target.payload.chat_history.push({
      id: message.id,
      sender: author as ChatMessage["sender"],
      text: message.text,
      timestamp: createdAt,
      agentId,
    });
    target.payload.updated_at = createdAt;
    target.updatedAt = createdAt;

    session.meta.lastSyncAt = createdAt;
    persistSession();
    return JSON.parse(JSON.stringify(message));
  },
  listTickets({ status }: { status?: TicketStatus }): FreemiumStoredTicket[] {
    const session = ensureSession();
    const filtered = status
      ? session.tickets.filter((ticket) => ticket.status === status)
      : session.tickets;
    return JSON.parse(JSON.stringify(filtered));
  },
  exportToFile(): void {
    if (!isBrowser()) return;
    const session = this.get();
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nexus-freemium-session-${session.meta.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  },
  importFromFile(file: File): Promise<void> {
    if (!isBrowser()) {
      return Promise.reject(new Error("File import is only supported in a browser environment."));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string) as FreemiumSessionData;
          sessionState.data = normalizeSession(parsed);
          persistSession();
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => {
        reject(reader.error || new Error("Failed to read backup file."));
      };
      reader.readAsText(file);
    });
  },
};

const getAccounts = (): StoredFreemiumAccount[] => {
  const session = ensureSession();
  return session.auth.accounts;
};

const setAccounts = (accounts: StoredFreemiumAccount[]) => {
  const session = ensureSession();
  session.auth.accounts = accounts;
  session.meta.lastSyncAt = nowIso();
  persistSession();
};

export const createFreemiumManagerAccount = (params: {
  email: string;
  password: string;
  fullName: string;
  language: Locale;
  companyName: string;
}): { success: boolean; account?: StoredFreemiumAccount; error?: string } => {
  if (!isBrowser()) {
    return { success: false, error: "Freemium accounts require a browser environment." };
  }

  const email = params.email.trim();
  const companyName = params.companyName.trim();
  const session = ensureSession();
  const normalizedCompany = companyName.toLowerCase();

  if (
    session.auth.deviceCompanyId &&
    session.auth.deviceCompanyId.trim().toLowerCase() !== normalizedCompany
  ) {
    return { success: false, error: "DEVICE_LOCKED" };
  }

  const accounts = getAccounts();
  const normalizedEmail = email.toLowerCase();
  if (accounts.some((account) => account.emailLower === normalizedEmail)) {
    return { success: false, error: "EMAIL_EXISTS" };
  }

  const userRecord = FreemiumSession.addUser({
    displayName: params.fullName.trim() || email,
    email,
    roles: [UserRole.MANAGER],
  });

  const storedUser = session.users.find((user) => user.id === userRecord.id);
  if (storedUser) {
    storedUser.language = params.language;
    storedUser.companyId = companyName;
  }

  const account: StoredFreemiumAccount = {
    id: userRecord.id,
    email,
    emailLower: normalizedEmail,
    displayName: userRecord.displayName,
    passwordHash: encodeString(params.password),
    language: params.language,
    roles: [UserRole.MANAGER],
    companyName,
    companyNameLower: normalizedCompany,
    createdAt: nowIso(),
  };

  const updatedAccounts = [...accounts, account];
  setAccounts(updatedAccounts);
  session.auth.deviceCompanyId = companyName;
  session.auth.lastUser = {
    userId: account.id,
    email: account.email,
    companyName,
    lastUpdated: nowIso(),
  };
  session.meta.lastSyncAt = nowIso();
  persistSession();

  return { success: true, account };
};

export const findFreemiumAccountByEmail = (email: string): StoredFreemiumAccount | undefined => {
  const normalizedEmail = email.trim().toLowerCase();
  return getAccounts().find((account) => account.emailLower === normalizedEmail);
};

export const findFreemiumAccountById = (id: string): StoredFreemiumAccount | undefined => {
  return getAccounts().find((account) => account.id === id);
};

export const validateFreemiumCredentials = (
  email: string,
  password: string,
  companyName: string
): StoredFreemiumAccount | null => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCompany = companyName.trim().toLowerCase();
  const encodedPassword = encodeString(password);
  const accounts = getAccounts();

  const match = accounts.find(
    (account) =>
      account.emailLower === normalizedEmail &&
      account.companyNameLower === normalizedCompany &&
      account.passwordHash === encodedPassword
  );

  return match || null;
};

export const convertFreemiumAccountToUser = (account: StoredFreemiumAccount): User => ({
  id: account.id,
  email: account.email,
  full_name: account.displayName,
  role: account.roles[0] || UserRole.MANAGER,
  language_preference: account.language,
  company_id: account.companyName,
});

export const getStoredFreemiumCompany = (): string | null => {
  const session = ensureSession();
  return session.auth.deviceCompanyId;
};

export const setStoredFreemiumCompany = (companyName: string) => {
  const session = ensureSession();
  session.auth.deviceCompanyId = companyName;
  session.meta.lastSyncAt = nowIso();
  persistSession();
};

export const clearStoredFreemiumCompany = () => {
  const session = ensureSession();
  session.auth.deviceCompanyId = null;
  persistSession();
};

export const loadFreemiumTickets = (): Ticket[] | null => {
  const session = ensureSession();
  if (!session.tickets.length) return null;
  return session.tickets.map(reviveTicket);
};

export const saveFreemiumTickets = (tickets: Ticket[]) => {
  const session = ensureSession();
  session.tickets = tickets.map(serializeTicket);
  session.meta.lastSyncAt = nowIso();
  persistSession();
};

export const clearFreemiumTickets = () => {
  const session = ensureSession();
  session.tickets = [];
  session.meta.lastSyncAt = nowIso();
  persistSession();
};

export const getFreemiumSessionMeta = (): FreemiumSessionLastUser | null => {
  const session = ensureSession();
  return session.auth.lastUser;
};

export const clearFreemiumSessionMeta = () => {
  const session = ensureSession();
  session.auth.lastUser = null;
  persistSession();
};

export const getFreemiumBackupMeta = (): { ticketCount: number; lastSynced: string } | null => {
  const session = ensureSession();
  if (!session.tickets.length) return null;
  return {
    ticketCount: session.tickets.length,
    lastSynced: session.meta.lastSyncAt,
  };
};

export const isFreemiumCompanyOnDevice = (companyName: string | null | undefined): boolean => {
  if (!companyName) return false;
  const session = ensureSession();
  if (!session.auth.deviceCompanyId) return false;
  return session.auth.deviceCompanyId.trim().toLowerCase() === companyName.trim().toLowerCase();
};

export const recordFreemiumSession = (userId: string, email: string, companyName: string) => {
  const session = ensureSession();
  session.auth.lastUser = {
    userId,
    email,
    companyName,
    lastUpdated: nowIso(),
  };
  session.meta.lastSyncAt = nowIso();
  persistSession();
};

export const resetFreemiumStorage = () => {
  const session = ensureSession();
  session.tickets = [];
  session.auth.lastUser = null;
  session.meta.lastSyncAt = nowIso();
  persistSession();
};

export const FREEMIUM_STORAGE_CONSTANTS = {
  sessionKey: STORAGE_KEY,
};

if (isBrowser()) {
  (window as any).FreemiumSession = FreemiumSession;
  FreemiumSession.init();
}

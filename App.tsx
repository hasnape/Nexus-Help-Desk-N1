import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from "react";
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Ticket, User, ChatMessage, TicketStatus, UserRole, Locale as AppLocale, AppointmentDetails } from "./types";
import { getFollowUpHelpResponse, getTicketSummary } from "./services/geminiService";
import { supabase } from "./services/supabaseClient";
import { ensureUserProfile } from "./services/authService";
import { guardedLogin, GuardedLoginError } from "./services/guardedLogin";
import type { GuardedLoginErrorKey } from "./services/guardedLogin";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NewTicketPage from "./pages/NewTicketPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import SignUpPage from "./pages/SignUpPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import HelpChatPage from "./pages/HelpChatPage";
import LegalPage from "./pages/LegalPage";
import UserManualPage from "./pages/UserManualPage";
import PromotionalPage from "./pages/PromotionalPage";
import LandingPage from "./pages/LandingPage";
import AccessibilitePage from "./pages/AccessibilitePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import PartnersPage from "./pages/PartnersPage";
import InfographiePage from "./pages/InfographiePage";
import DemoPage from "./pages/DemoPage";
import { DEFAULT_AI_LEVEL, DEFAULT_USER_ROLE, TICKET_STATUS_KEYS } from "./constants";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import LoadingSpinner from "./components/LoadingSpinner";
import CookieConsentBanner from "./components/CookieConsentBanner";
import type { Session } from "@supabase/supabase-js";
import PageLayout from './components/PageLayout';


interface AppContextType {
  user: User | null;
  login: (email: string, password: string, companyName: string) => Promise<string | true>;
  logout: () => Promise<void>;
  signUp: (
    email: string,
    fullName: string,
    password: string,
    options: {
      lang: AppLocale;
      role: UserRole;
      companyName: string;
      secretCode?: string;
      plan?: "freemium" | "standard" | "pro";
    }
  ) => Promise<string | true>;
  tickets: Ticket[];
  addTicket: (
    ticketData: Omit<Ticket, "id" | "created_at" | "updated_at" | "user_id" | "assigned_agent_id" | "internal_notes" | "current_appointment" | "assigned_ai_level" | "chat_history">,
    initialChatHistory: ChatMessage[]
  ) => Promise<Ticket | null>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  addChatMessage: (ticketId: string, userMessageText: string, onAiMessageAdded?: (aiMessage: ChatMessage) => void) => Promise<void>;
  sendAgentMessage: (ticketId: string, agentMessageText: string) => Promise<void>;
  isLoading: boolean;
  isLoadingAi: boolean;
  getTicketById: (ticketId: string) => Ticket | undefined;
  isAutoReadEnabled: boolean;
  toggleAutoRead: () => void;
  assignTicket: (ticketId: string, agentId: string | null) => Promise<void>;
  agentTakeTicket: (ticketId: string) => Promise<void>;
  getAgents: () => User[];
  getAllUsers: () => User[];
  proposeOrUpdateAppointment: (
    ticketId: string,
    details: Omit<AppointmentDetails, "proposedBy" | "id" | "history">,
    proposedBy: "agent" | "user",
    newStatus: AppointmentDetails["status"]
  ) => Promise<void>;
  restoreAppointment: (
    appointment: {
      id: string;
      ticket_id: string;
      proposed_by: "agent" | "user";
      status:
        | "pending_user_approval"
        | "pending_agent_approval"
        | "confirmed"
        | "cancelled_by_user"
        | "cancelled_by_agent"
        | "rescheduled_by_user"
        | "rescheduled_by_agent";
      proposed_date: string;
      proposed_time: string;
      location_or_method: string;
    },
    ticketId: string
  ) => Promise<boolean>;
  deleteAppointment: (appointmentId: string, ticketId: string) => Promise<boolean>;
  deleteTicket: (ticketId: string) => Promise<void>;
  updateUserRole: (userIdToUpdate: string, newRole: UserRole) => Promise<boolean>;
  deleteUserById: (userId: string) => Promise<void>;
  newlyCreatedCompanyName: string | null;
  setNewlyCreatedCompanyName: (name: string | null) => void;
  updateCompanyName: (newName: string) => Promise<boolean>;
  consentGiven: boolean;
  giveConsent: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type ChatStorageMode = "unknown" | "embedded" | "messages_table" | "unavailable";

type TicketMessageRow = {
  id?: string;
  ticket_id: string;
  sender?: string | null;
  content?: string | null;
  message_text?: string | null;
  text?: string | null;
  body?: string | null;
  created_at?: string | null;
  inserted_at?: string | null;
  timestamp?: string | null;
  agent_id?: string | null;
};

const reviveTicketDates = (data: any, chatHistoryOverride?: ChatMessage[]): Ticket => ({
  ...data,
  created_at: new Date(data.created_at),
  updated_at: new Date(data.updated_at),
  chat_history: chatHistoryOverride
    ? chatHistoryOverride
    : data.chat_history
    ? data.chat_history.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }))
    : [],
  internal_notes: data.internal_notes || [],
  current_appointment: data.current_appointment || undefined,
});

const mapTicketMessageRowToChatMessage = (row: TicketMessageRow): ChatMessage => {
  const textContent =
    row.content ?? row.message_text ?? row.text ?? row.body ?? "";
  const timestampString = row.created_at ?? row.inserted_at ?? row.timestamp ?? new Date().toISOString();
  return {
    id: row.id || crypto.randomUUID(),
    sender: (row.sender as ChatMessage["sender"]) || "system_summary",
    text: textContent,
    timestamp: new Date(timestampString),
    agentId: row.agent_id ?? undefined,
  };
};

const groupMessagesByTicket = (rows: TicketMessageRow[]): Map<string, ChatMessage[]> => {
  const grouped = new Map<string, ChatMessage[]>();
  rows.forEach((row) => {
    if (!row.ticket_id) {
      return;
    }
    const message = mapTicketMessageRowToChatMessage(row);
    const existing = grouped.get(row.ticket_id) ?? [];
    existing.push(message);
    grouped.set(row.ticket_id, existing);
  });
  return grouped;
};

const isOfflineNetworkError = (error: any): boolean => {
  if (!error) return false;
  const message =
    typeof error === "string"
      ? error
      : typeof error?.message === "string"
      ? error.message
      : "";

  const lower = message.toLowerCase();
  return (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network error") ||
    lower.includes("fetch failed")
  );
};

const isAbortError = (e: any) =>
  !!e && ((e.name === "AbortError") || String(e).includes("AbortError"));

// -- QUOTA RPC ------------------------------------
type QuotaResult = {
  used: number;
  limit: number | null;
  unlimited: boolean;
  timezone: string | null;
  percent_used?: number;
  plan_name?: string | null;
};

const getCompanyQuota = async (): Promise<QuotaResult | null> => {
  try {
    const { data, error } = await supabase.rpc("get_my_company_month_quota");
    if (error) {
      console.warn("[quota] RPC error:", error);
      return null;
    }
    return data as QuotaResult;
  } catch (e) {
    console.warn("[quota] RPC exception:", e);
    return null;
  }
};

const AppProviderContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newlyCreatedCompanyName, setNewlyCreatedCompanyName] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAutoReadEnabled, setIsAutoReadEnabled] = useState<boolean>(() => {
    const storedAutoRead = localStorage.getItem("aiHelpDeskAutoRead");
    return storedAutoRead ? JSON.parse(storedAutoRead) : true;
  });
  const [chatStorageMode, setChatStorageMode] = useState<ChatStorageMode>("unknown");
  const chatStorageModeRef = useRef<ChatStorageMode>(chatStorageMode);
  useEffect(() => {
    chatStorageModeRef.current = chatStorageMode;
  }, [chatStorageMode]);
  const [messageContentColumn, setMessageContentColumn] = useState<"content" | "message_text" | "text" | "body" | null>(null);
  const messageContentColumnRef = useRef<typeof messageContentColumn>(messageContentColumn);
  useEffect(() => {
    messageContentColumnRef.current = messageContentColumn;
  }, [messageContentColumn]);
  const [ticketMessageAgentColumn, setTicketMessageAgentColumn] = useState<"agent_id" | null>(null);
  const ticketMessageAgentColumnRef = useRef<"agent_id" | null>(ticketMessageAgentColumn);
  useEffect(() => {
    ticketMessageAgentColumnRef.current = ticketMessageAgentColumn;
  }, [ticketMessageAgentColumn]);
  const [hasInternalNotesColumn, setHasInternalNotesColumn] = useState<boolean | null>(null);
  const hasInternalNotesColumnRef = useRef<boolean | null>(hasInternalNotesColumn);
  useEffect(() => {
    hasInternalNotesColumnRef.current = hasInternalNotesColumn;
  }, [hasInternalNotesColumn]);
  const [hasCurrentAppointmentColumn, setHasCurrentAppointmentColumn] = useState<boolean | null>(null);
  const hasCurrentAppointmentColumnRef = useRef<boolean | null>(hasCurrentAppointmentColumn);
  useEffect(() => {
    hasCurrentAppointmentColumnRef.current = hasCurrentAppointmentColumn;
  }, [hasCurrentAppointmentColumn]);

  const { language, setLanguage: setAppLanguage, t: translateHook } = useLanguage();

  const shouldShortCircuitNetwork = useCallback((operation?: string) => false, []);

  const updateTicketsState = useCallback(
    (updater: (prevTickets: Ticket[]) => Ticket[], _forceLocalOnly?: boolean) => {
      setTickets((prevTickets) => updater(prevTickets));
    },
    []
  );

  const setTicketsDirect = useCallback((nextTickets: Ticket[]) => {
    setTickets(nextTickets);
  }, []);

  const pruneApptInState = (ticketId: string, appointmentId: string) => {
    updateTicketsState((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;

        const nextCurrent =
          t.current_appointment?.id === appointmentId ? undefined : t.current_appointment;

        const nextAppointments = Array.isArray((t as any).appointments)
          ? (t as any).appointments.filter((a: any) => a?.id !== appointmentId)
          : (t as any).appointments;

        return {
          ...t,
          current_appointment: nextCurrent,
          ...(nextAppointments !== undefined ? { appointments: nextAppointments } : {}),
        };
      })
    );
  };

  const restoreAppointment: AppContextType["restoreAppointment"] = async (appointment, ticketId) => {
    const applyRestore = (prev: Ticket[]) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;

        const restoredAppointment = {
          id: appointment.id,
          proposedBy: appointment.proposed_by,
          proposedDate: appointment.proposed_date,
          proposedTime: appointment.proposed_time,
          locationOrMethod: appointment.location_or_method,
          status: appointment.status,
        } as AppointmentDetails & Record<string, any>;

        (restoredAppointment as any).proposed_by = appointment.proposed_by;
        (restoredAppointment as any).proposed_date = appointment.proposed_date;
        (restoredAppointment as any).proposed_time = appointment.proposed_time;
        (restoredAppointment as any).location_or_method = appointment.location_or_method;

        const existingAppointments = Array.isArray((t as any).appointments)
          ? (t as any).appointments
          : undefined;

        const nextAppointments = existingAppointments
          ? [...existingAppointments.filter((a: any) => a?.id !== appointment.id), restoredAppointment]
          : existingAppointments;

        return {
          ...t,
          current_appointment: restoredAppointment,
          ...(nextAppointments !== undefined ? { appointments: nextAppointments } : {}),
        };
      });

    if (shouldShortCircuitNetwork("supabase.appointment_details.insert")) {
      updateTicketsState(applyRestore, true);
      return true;
    }

    const { id, ticket_id, proposed_by, status, proposed_date, proposed_time, location_or_method } = appointment;

    const { error } = await supabase
      .from("appointment_details")
      .insert([
        {
          id,
          ticket_id,
          proposed_by,
          status,
          proposed_date,
          proposed_time,
          location_or_method,
        },
      ]);

    if (error) {
      console.error("Error restoring appointment:", error);
      return false;
    }

    updateTicketsState(applyRestore);
    return true;
  };

  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent");
    if (storedConsent === "true") {
      setConsentGiven(true);
    }
  }, []);

  const detectChatStorageMode = useCallback(async (): Promise<"embedded" | "messages_table" | "unavailable"> => {
    try {
      const { error } = await supabase.from("tickets").select("id, chat_history").limit(1);
      if (!error) {
        return "embedded";
      }
      const message = (error.message || "").toLowerCase();
      const isMissingChatColumn =
        error.code === "42703" ||
        error.code === "PGRST204" ||
        message.includes("chat_history") ||
        (message.includes("column") && message.includes("chat"));
      if (isMissingChatColumn) {
        const { error: messagesTableError } = await supabase
          .from("ticket_messages")
          .select("ticket_id")
          .limit(1);
        if (!messagesTableError) {
          return "messages_table";
        }
        console.warn("ticket_messages table inaccessible:", messagesTableError);
        return "unavailable";
      }
      console.warn("Unexpected chat storage detection error:", error);
      return "unavailable";
    } catch (err) {
      console.warn("Failed to detect chat storage mode:", err);
      return "unavailable";
    }
  }, []);

  const resolveTicketMessageColumn = useCallback(async (): Promise<"content" | "message_text" | "text" | "body" | null> => {
    const candidates: Array<"content" | "message_text" | "text" | "body"> = [
      "content",
      "message_text",
      "text",
      "body",
    ];
    for (const candidate of candidates) {
      try {
        const { error } = await supabase.from("ticket_messages").select(candidate).limit(1);
        if (!error) {
          return candidate;
        }
        const message = (error.message || "").toLowerCase();
        if (error.code === "42703" || message.includes("does not exist") || message.includes("column")) {
          continue;
        }
        console.warn(`Unexpected error probing ticket_messages.${candidate}:`, error);
        return null;
      } catch (err) {
        console.warn(`Failed to probe ticket_messages.${candidate}:`, err);
        return null;
      }
    }
    return null;
  }, []);

  const ensureChatStorageMode = useCallback(async (): Promise<"embedded" | "messages_table" | "unavailable"> => {
    if (chatStorageModeRef.current === "unknown") {
      const detected = await detectChatStorageMode();
      chatStorageModeRef.current = detected;
      setChatStorageMode(detected);
      return detected;
    }
    return chatStorageModeRef.current;
  }, [detectChatStorageMode]);

  const ensureMessageContentColumn = useCallback(async () => {
    if (messageContentColumnRef.current) {
      return messageContentColumnRef.current;
    }
    const resolved = await resolveTicketMessageColumn();
    if (resolved) {
      messageContentColumnRef.current = resolved;
      setMessageContentColumn(resolved);
    }
    return resolved;
  }, [resolveTicketMessageColumn]);

  const ensureTicketMessageAgentColumn = useCallback(async () => {
    if (ticketMessageAgentColumnRef.current !== null) {
      return ticketMessageAgentColumnRef.current;
    }
    try {
      const { error } = await supabase.from("ticket_messages").select("agent_id").limit(1);
      if (!error) {
        ticketMessageAgentColumnRef.current = "agent_id";
        setTicketMessageAgentColumn("agent_id");
        return "agent_id";
      }
      const message = (error.message || "").toLowerCase();
      if (error.code === "42703" || message.includes("column") || message.includes("agent_id")) {
        ticketMessageAgentColumnRef.current = null;
        setTicketMessageAgentColumn(null);
        return null;
      }
      console.warn("Unexpected error probing ticket_messages.agent_id:", error);
      ticketMessageAgentColumnRef.current = null;
      setTicketMessageAgentColumn(null);
      return null;
    } catch (err) {
      console.warn("Failed to probe ticket_messages.agent_id:", err);
      ticketMessageAgentColumnRef.current = null;
      setTicketMessageAgentColumn(null);
      return null;
    }
  }, []);

  const ensureInternalNotesColumn = useCallback(async (): Promise<boolean> => {
    if (hasInternalNotesColumnRef.current !== null) {
      return Boolean(hasInternalNotesColumnRef.current);
    }
    try {
      const { error } = await supabase.from("tickets").select("internal_notes").limit(1);
      if (!error) {
        hasInternalNotesColumnRef.current = true;
        setHasInternalNotesColumn(true);
        return true;
      }
      const message = (error.message || "").toLowerCase();
      if (
        error.code === "42703" ||
        error.code === "PGRST204" ||
        message.includes("internal_notes") ||
        message.includes("column")
      ) {
        hasInternalNotesColumnRef.current = false;
        setHasInternalNotesColumn(false);
        return false;
      }
      console.warn("Unexpected error probing tickets.internal_notes:", error);
      hasInternalNotesColumnRef.current = false;
      setHasInternalNotesColumn(false);
      return false;
    } catch (err) {
      console.warn("Failed to probe tickets.internal_notes:", err);
      hasInternalNotesColumnRef.current = false;
      setHasInternalNotesColumn(false);
      return false;
    }
  }, []);

  const ensureCurrentAppointmentColumn = useCallback(async (): Promise<boolean> => {
    if (hasCurrentAppointmentColumnRef.current !== null) {
      return Boolean(hasCurrentAppointmentColumnRef.current);
    }
    try {
      const { error } = await supabase.from("tickets").select("current_appointment").limit(1);
      if (!error) {
        hasCurrentAppointmentColumnRef.current = true;
        setHasCurrentAppointmentColumn(true);
        return true;
      }
      const message = (error.message || "").toLowerCase();
      if (
        error.code === "42703" ||
        error.code === "PGRST204" ||
        message.includes("current_appointment") ||
        message.includes("column")
      ) {
        hasCurrentAppointmentColumnRef.current = false;
        setHasCurrentAppointmentColumn(false);
        return false;
      }
      console.warn("Unexpected error probing tickets.current_appointment:", error);
      hasCurrentAppointmentColumnRef.current = false;
      setHasCurrentAppointmentColumn(false);
      return false;
    } catch (err) {
      console.warn("Failed to probe tickets.current_appointment:", err);
      hasCurrentAppointmentColumnRef.current = false;
      setHasCurrentAppointmentColumn(false);
      return false;
    }
  }, []);

  const persistTicketMessages = useCallback(
    async (ticketId: string, messages: ChatMessage[]) => {
      if (!messages.length) {
        return;
      }
      const mode = chatStorageModeRef.current;
      if (mode !== "messages_table") {
        return;
      }
      const contentColumn = await ensureMessageContentColumn();
      if (!contentColumn) {
        console.warn("Unable to resolve ticket message content column. Skipping persistence.");
        return;
      }
      const agentColumn = await ensureTicketMessageAgentColumn();
      const payload = messages.map((message) => {
        const record: Record<string, any> = {
          ticket_id: ticketId,
          sender: message.sender,
        };
        record[contentColumn] = message.text;
        if (agentColumn && message.agentId) {
          record[agentColumn] = message.agentId;
        }
        return record;
      });
      const { error } = await supabase.from("ticket_messages").insert(payload);
      if (error) {
        console.error("Error persisting ticket messages:", error);
      }
    },
    [ensureMessageContentColumn, ensureTicketMessageAgentColumn]
  );

  const loadUserData = useCallback(
    async (session: Session | null) => {
      try {
        if (session?.user) {
          setIsLoading(true);
          const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("auth_uid", session.user.id)
            .single();

          if (profileError || !userProfile) {
            throw profileError || new Error("User profile not found");
          }
          setUser(userProfile);

          const [storageMode, internalNotesAvailable, currentAppointmentAvailable] = await Promise.all([
            ensureChatStorageMode(),
            ensureInternalNotesColumn(),
            ensureCurrentAppointmentColumn(),
          ]);
          const baseTicketColumns = [
            "id",
            "user_id",
            "title",
            "description",
            "category",
            "priority",
            "status",
            "assigned_ai_level",
            "assigned_agent_id",
            "workstation_id",
            "created_at",
            "updated_at",
          ];
          if (internalNotesAvailable) {
            baseTicketColumns.push("internal_notes");
          }
          if (storageMode === "embedded") {
            baseTicketColumns.push("chat_history");
          }
          if (currentAppointmentAvailable) {
            baseTicketColumns.push("current_appointment");
          }
          const ticketColumns = baseTicketColumns.join(", ");

          const [usersResponse, ticketsResponse] = await Promise.all([
            supabase
              .from("users")
              .select("id, auth_uid, email, full_name, role, language_preference, company_id"),
            supabase.from("tickets").select(ticketColumns),
          ]);

          setAllUsers(usersResponse.data || []);

          let fetchedTickets: Ticket[] = [];
          if (storageMode === "embedded") {
            fetchedTickets = ticketsResponse.data ? ticketsResponse.data.map((row: any) => reviveTicketDates(row)) : [];
          } else if (storageMode === "messages_table") {
            const ticketRows = ticketsResponse.data || [];
            let messagesByTicket = new Map<string, ChatMessage[]>();
            if (ticketRows.length > 0) {
              const ticketIds = ticketRows.map((row: any) => row.id);
              const { data: messageRows, error: messagesError } = await supabase
                .from("ticket_messages")
                .select(
                  "id, ticket_id, sender, content, message_text, text, body, created_at, inserted_at, timestamp, agent_id"
                )
                .in("ticket_id", ticketIds)
                .order("created_at", { ascending: true });
              let resolvedRows = messageRows;
              let resolvedError = messagesError;
              if (messagesError) {
                const lowerMessage = (messagesError.message || "").toLowerCase();
                if (messagesError.code === "42703" || lowerMessage.includes("created_at")) {
                  const { data: retryRows, error: retryError } = await supabase
                    .from("ticket_messages")
                    .select(
                      "id, ticket_id, sender, content, message_text, text, body, created_at, inserted_at, timestamp, agent_id"
                    )
                    .in("ticket_id", ticketIds);
                  resolvedRows = retryRows;
                  resolvedError = retryError;
                }
              }
              if (resolvedError) {
                console.error("Error loading ticket messages:", resolvedError);
              } else if (resolvedRows) {
                messagesByTicket = groupMessagesByTicket(resolvedRows as TicketMessageRow[]);
              }
            }
            fetchedTickets = ticketRows.map((row: any) => {
              const messages = messagesByTicket.get(row.id) ?? [];
              const sortedMessages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
              return reviveTicketDates(row, sortedMessages);
            });
          } else {
            fetchedTickets = ticketsResponse.data
              ? ticketsResponse.data.map((row: any) => reviveTicketDates(row, []))
              : [];
          }

          setTicketsDirect(fetchedTickets);
        } else {
          setUser(null);
          setTicketsDirect([]);
          setAllUsers([]);
        }
      } catch (error: any) {
        console.error("Error loading user data:", error);
        if (error?.message?.includes?.("Invalid Refresh Token")) {
          await supabase.auth.signOut();
        }
        setUser(null);
        setTicketsDirect([]);
        setAllUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [ensureChatStorageMode, ensureInternalNotesColumn, ensureCurrentAppointmentColumn, setTicketsDirect]
  );

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error }) => {
        if (!isMounted) {
          return;
        }
        if (error) {
          console.error("Error fetching session:", error);
          loadUserData(null);
          return;
        }
        if (session) {
          await ensureUserProfile().catch(console.warn);
        }
        loadUserData(session);
      })
      .catch((error) => {
        if (!isMounted || isAbortError(error)) {
          return;
        }
        console.error("Unexpected session fetch error:", error);
        loadUserData(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }
      if (session) {
        ensureUserProfile().catch(console.warn);
      }
      if (event === "TOKEN_REFRESHED" && !session) {
        loadUserData(null);
      } else if (session?.user?.id !== user?.auth_uid) {
        loadUserData(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData, user?.id]);

  useEffect(() => {
    if (user?.language_preference && user.language_preference !== language) {
      setAppLanguage(user.language_preference);
    }
  }, [user, language, setAppLanguage]);

  useEffect(() => {
    localStorage.setItem("aiHelpDeskAutoRead", JSON.stringify(isAutoReadEnabled));
  }, [isAutoReadEnabled]);

  const toggleAutoRead = () => {
    setIsAutoReadEnabled((prev) => !prev);
  };

  const giveConsent = () => {
    localStorage.setItem("cookieConsent", "true");
    setConsentGiven(true);
  };

  const translateGuardError = useCallback(
    (key: GuardedLoginErrorKey): string => {
      switch (key) {
        case "login.error.companyIdMismatch":
          return translateHook("login.error.companyIdMismatch", {
            default: "La compagnie ne correspond pas à votre compte.",
          });
        case "login.error.companyNotFound":
          return translateHook("login.error.companyNotFound", {
            default: "Cette compagnie n'existe pas.",
          });
        case "login.error.unknownEmail":
          return translateHook("login.error.unknownEmail", {
            default: "Cet email n'est pas reconnu.",
          });
        case "login.error.invalidCredentials":
          return translateHook("login.error.invalidCredentials", {
            default: "Invalid email or password. Please try again.",
          });
        case "login.error.profileFetchFailed":
          return translateHook("login.error.profileFetchFailed", {
            default: "Impossible de récupérer votre profil utilisateur pour la vérification.",
          });
        case "login.error.invalidCompanyCredentials":
        default:
          return translateHook("login.error.invalidCompanyCredentials", {
            default: "Identifiants invalides (email/compagnie).",
          });
      }
    },
    [translateHook]
  );

  const login = useCallback(
    (email: string, password: string, companyName: string): Promise<string | true> =>
      guardedLogin(email, password, companyName)
        .then(({ session, profile }) => {
          setUser(profile);
          return loadUserData(session)
            .then(() => true)
            .catch((loadError) => {
              console.error("Unexpected error while loading user data after login:", loadError);
              return translateGuardError("login.error.profileFetchFailed");
            });
        })
        .catch((authError: unknown) => {
          if (authError instanceof GuardedLoginError) {
            return translateGuardError(authError.translationKey);
          }
          console.error("Unexpected login error:", authError);
          return translateGuardError("login.error.invalidCompanyCredentials");
        }),
    [loadUserData, translateGuardError]
  );

  const signUp = async (
    email: string,
    fullName: string,
    password: string,
    options: {
      lang: AppLocale;
      role: UserRole;
      companyName: string;
      secretCode?: string;
      plan?: "freemium" | "standard" | "pro";
    }
  ): Promise<string | true> => {
    const { lang, role, companyName, secretCode, plan } = options;

    try {
      const { data, error } = await supabase.functions.invoke(
        "auth-signup",
        {
          body: {
            email,
            password,
            full_name: fullName,
            role,
            company_name: companyName,
            language_preference: lang,
            plan,
            secret_code: secretCode,
          },
        }
      );

      if (error) {
        const msg =
          (error as any)?.context?.error ??
          (error as any)?.message ??
          "signup_failed";
        return msg;
      }

      if (!data?.ok) {
        const apiErr = (data?.error ?? "signup_failed") as string;
        return apiErr;
      }

      if (role === UserRole.MANAGER) {
        setNewlyCreatedCompanyName(companyName);
      }

      return true;
    } catch (e: any) {
      return e?.context?.error ?? e?.message ?? "network_error";
    }
  };

  const logout = async () => {
    try {
      if (!shouldShortCircuitNetwork("supabase.auth.signOut")) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      if (!isOfflineNetworkError(error)) {
        console.error("Supabase logout error:", error);
      }
    } finally {
      setUser(null);
      setNewlyCreatedCompanyName(null);
      setTicketsDirect([]);
      setAllUsers([]);
    }
  };

  const updateUserRole = async (userIdToUpdate: string, newRole: UserRole): Promise<boolean> => {
    if (user?.role !== UserRole.MANAGER) return false;
    if (shouldShortCircuitNetwork("supabase.users.update")) {
      setAllUsers((prev) => prev.map((u) => (u.id === userIdToUpdate ? { ...u, role: newRole } : u)));
      return true;
    }
    const { error } = await supabase.from("users").update({ role: newRole }).eq("id", userIdToUpdate);
    if (error) {
      console.error("Error updating user role:", error);
      return false;
    }
    setAllUsers((prev) => prev.map((u) => (u.id === userIdToUpdate ? { ...u, role: newRole } : u)));
    return true;
  };

  const deleteUserById = async (userId: string): Promise<void> => {
    if (user?.role !== UserRole.MANAGER) return;
    if (shouldShortCircuitNetwork("supabase.rpc.delete_user_by_manager")) {
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
      updateTicketsState((prev) => {
        const ticketsAfterUserRemoval = prev.filter((t) => t.user_id !== userId);
        return ticketsAfterUserRemoval.map((t) =>
          t.assigned_agent_id === userId ? { ...t, assigned_agent_id: undefined } : t
        );
      });
      return;
    }
    try {
      const { error } = await supabase.rpc("delete_user_by_manager", { user_id_to_delete: userId });
      if (error) {
        console.error("Error deleting user via RPC:", error);
        alert(translateHook("managerDashboard.deleteUserError.rpc", { message: error.message }));
      } else {
        setAllUsers((prev) => prev.filter((u) => u.id !== userId));
        updateTicketsState((prev) => {
          const ticketsAfterUserRemoval = prev.filter((t) => t.user_id !== userId);
          return ticketsAfterUserRemoval.map((t) => (t.assigned_agent_id === userId ? { ...t, assigned_agent_id: undefined } : t));
        });
      }
    } catch (e: any) {
      console.error("Critical error calling delete user RPC:", e);
      alert(translateHook("managerDashboard.deleteUserError.critical", { message: e.message }));
    }
  };

  const addTicket = async (
    ticketData: Omit<Ticket, "id" | "created_at" | "updated_at" | "user_id" | "assigned_agent_id" | "internal_notes" | "current_appointment" | "assigned_ai_level" | "chat_history">,
    initialChatHistory: ChatMessage[]
  ): Promise<Ticket | null> => {
    if (!user) return null;
    const creatorUserId = user.id;
    setIsLoading(true);
    try {
      const now = new Date();
      const normalizedChatHistory = initialChatHistory.map((message) => ({
        ...message,
        id: message.id || crypto.randomUUID(),
        timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp),
      }));

      if (shouldShortCircuitNetwork("supabase.tickets.insert")) {
        const createdTicket: Ticket = {
          ...ticketData,
          id: crypto.randomUUID(),
          user_id: creatorUserId,
          chat_history: normalizedChatHistory,
          assigned_ai_level: DEFAULT_AI_LEVEL,
          assigned_agent_id: undefined,
          internal_notes: [],
          current_appointment: undefined,
          created_at: now,
          updated_at: now,
        };
        updateTicketsState((prevTickets) => [...prevTickets, createdTicket]);
        return createdTicket;
      }

      const [storageMode, internalNotesAvailable, currentAppointmentAvailable] = await Promise.all([
        ensureChatStorageMode(),
        ensureInternalNotesColumn(),
        ensureCurrentAppointmentColumn(),
      ]);
      const newTicketDataBase: Record<string, any> = {
        ...ticketData,
        user_id: creatorUserId,
        assigned_ai_level: DEFAULT_AI_LEVEL,
        assigned_agent_id: undefined,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      if (internalNotesAvailable) {
        newTicketDataBase.internal_notes = [];
      }
      if (currentAppointmentAvailable) {
        newTicketDataBase.current_appointment = null;
      }
      if (storageMode === "embedded") {
        newTicketDataBase.chat_history = normalizedChatHistory;
      }
      // --- quota pre-check (front) ---
      const quota = await getCompanyQuota();
      if (quota && !quota.unlimited && quota.limit !== null && quota.used >= quota.limit) {
        alert(
          translateHook("dashboard.quota.blockedUi", {
            default:
              "Votre quota mensuel de tickets est atteint. Passez à l'offre supérieure pour continuer.",
          })
        );
        setIsLoading(false);
        return null;
      }

      const { data, error } = await supabase
        .from("tickets")
        .insert(newTicketDataBase)
        .select()
        .single();

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("quota") || msg.includes("limit")) {
          alert(
            translateHook("dashboard.quota.blockedUi", {
              default: "Création refusée: quota mensuel atteint.",
            })
          );
          setIsLoading(false);
          return null;
        }
        throw error;
      }
      const createdTicket = reviveTicketDates(
        data,
        storageMode === "embedded" ? undefined : normalizedChatHistory
      );
      if (storageMode === "messages_table" && normalizedChatHistory.length > 0) {
        await persistTicketMessages(createdTicket.id, normalizedChatHistory);
      }
      updateTicketsState((prevTickets) => [...prevTickets, createdTicket]);
      return createdTicket;
    } catch (error) {
      console.error("Error creating ticket:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    if (shouldShortCircuitNetwork("supabase.tickets.update")) {
      const updatedAtDate = new Date();
      updateTicketsState((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status, updated_at: updatedAtDate } : t))
      );
      return;
    }
    const updated_at = new Date().toISOString();
    const { data, error } = await supabase.from("tickets").update({ status, updated_at }).eq("id", ticketId).select().single();
    if (error) console.error("Error updating ticket status:", error);
    else
      updateTicketsState((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
  };

  const deleteTicket = async (ticketId: string): Promise<void> => {
    if (shouldShortCircuitNetwork("supabase.tickets.delete")) {
      updateTicketsState((prev) => prev.filter((t) => t.id !== ticketId));
      return;
    }
    try {
      const { error } = await supabase.from("tickets").delete().eq("id", ticketId);
      if (error) {
        console.error("Error deleting ticket:", error);
        alert(translateHook("managerDashboard.deleteTicketError.rpc", { message: error.message }));
      } else {
        updateTicketsState((prev) => prev.filter((t) => t.id !== ticketId));
      }
    } catch (e: any) {
      console.error("Critical error deleting ticket:", e);
      alert(translateHook("managerDashboard.deleteTicketError.critical", { message: e.message }));
    }
  };

  const assignTicket = async (ticketId: string, agentId: string | null): Promise<void> => {
    const ticketToUpdate = tickets.find((t) => t.id === ticketId);
    if (!ticketToUpdate || user?.role !== "manager") return;
    let summaryMessage: ChatMessage | null = null;
    if (agentId && (!ticketToUpdate.assigned_agent_id || ticketToUpdate.assigned_agent_id !== agentId)) {
      setIsLoadingAi(true);
      try {
        const summaryText = await getTicketSummary(ticketToUpdate, language);
        summaryMessage = { id: crypto.randomUUID(), sender: "system_summary", text: summaryText, timestamp: new Date() };
      } catch (error) {
        console.error("Error generating ticket summary:", error);
        summaryMessage = {
          id: crypto.randomUUID(),
          sender: "system_summary",
          text: translateHook("appContext.error.summaryGenerationFailed"),
          timestamp: new Date(),
        };
      } finally {
        setIsLoadingAi(false);
      }
    }
    const updatedChatHistory = summaryMessage ? [...ticketToUpdate.chat_history, summaryMessage] : ticketToUpdate.chat_history;
    if (shouldShortCircuitNetwork("supabase.tickets.update")) {
      const updatedAtDate = new Date();
      updateTicketsState((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                assigned_agent_id: agentId || undefined,
                chat_history: updatedChatHistory,
                updated_at: updatedAtDate,
              }
            : t
        )
      );
      return;
    }
    const storageMode = await ensureChatStorageMode();
    const updatePayload: Record<string, any> = {
      assigned_agent_id: agentId || null,
      updated_at: new Date().toISOString(),
    };
    if (storageMode === "embedded") {
      updatePayload.chat_history = updatedChatHistory;
    }
    const { data, error } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticketId)
      .select()
      .single();
    if (error) {
      console.error("Error assigning ticket:", error);
    } else {
      if (storageMode === "messages_table" && summaryMessage) {
        await persistTicketMessages(ticketId, [summaryMessage]);
      }
      updateTicketsState((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? reviveTicketDates(data, storageMode === "embedded" ? undefined : updatedChatHistory)
            : t
        )
      );
    }
  };

  const agentTakeTicket = async (ticketId: string): Promise<void> => {
    if (!user || user.role !== UserRole.AGENT) return;
    if (shouldShortCircuitNetwork("supabase.tickets.update")) {
      const updatedAtDate = new Date();
      updateTicketsState((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, assigned_agent_id: user.id, updated_at: updatedAtDate } : t))
      );
      return;
    }
    const { data, error } = await supabase
      .from("tickets")
      .update({ assigned_agent_id: user.id, updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) {
      console.error("Agent could not take charge:", error);
    } else {
      updateTicketsState((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
    }
  };

  const getAgents = (): User[] => allUsers.filter((u) => u.role === UserRole.AGENT);
  const getAllUsers = (): User[] => allUsers;

  const sendAgentMessage = async (ticketId: string, agentMessageText: string): Promise<void> => {
    if (!user || (user.role !== UserRole.AGENT && user.role !== UserRole.MANAGER)) return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const agentMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "agent",
      text: agentMessageText,
      timestamp: new Date(),
      agentId: user.id,
    };
    const updated_chat_history = [...ticket.chat_history, agentMessage];
    const newStatus =
      ticket.status === TICKET_STATUS_KEYS.OPEN || ticket.status === TICKET_STATUS_KEYS.RESOLVED
        ? TICKET_STATUS_KEYS.IN_PROGRESS
        : ticket.status;
    if (shouldShortCircuitNetwork("supabase.tickets.update")) {
      const updatedAtDate = new Date();
      updateTicketsState(
        (prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  chat_history: updated_chat_history,
                  status: newStatus,
                  updated_at: updatedAtDate,
                }
              : t
          ),
        true
      );
      return;
    }
    const storageMode = chatStorageModeRef.current === "unknown" ? await ensureChatStorageMode() : chatStorageModeRef.current;
    const updatePayload: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (storageMode === "embedded") {
      updatePayload.chat_history = updated_chat_history;
    }
    const { data, error } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticketId)
      .select()
      .single();
    if (error) {
      console.error("Error sending agent message:", error);
    } else {
      if (storageMode === "messages_table") {
        await persistTicketMessages(ticketId, [agentMessage]);
      }
      updateTicketsState((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? reviveTicketDates(data, storageMode === "embedded" ? undefined : updated_chat_history)
            : t
        )
      );
    }
  };

  const addChatMessage = async (ticketId: string, userMessageText: string, onAiMessageAdded?: (aiMessage: ChatMessage) => void) => {
    if (!user) return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const timestamp = new Date();
    const userMessage: ChatMessage = { id: crypto.randomUUID(), sender: "user", text: userMessageText, timestamp };
    const newStatus =
      ticket.status === TICKET_STATUS_KEYS.RESOLVED || ticket.status === TICKET_STATUS_KEYS.CLOSED
        ? TICKET_STATUS_KEYS.IN_PROGRESS
        : ticket.status;
    const tempUpdatedChatHistory = [...ticket.chat_history, userMessage];
    updateTicketsState((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, chat_history: tempUpdatedChatHistory, status: newStatus, updated_at: timestamp }
          : t
      )
    );
    let storageMode = chatStorageModeRef.current;
    if (storageMode === "unknown") {
      storageMode = await ensureChatStorageMode();
    }
    if (ticket.assigned_agent_id) {
      if (shouldShortCircuitNetwork("supabase.tickets.update")) {
        return;
      }
      const updatePayload: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (storageMode === "embedded") {
        updatePayload.chat_history = tempUpdatedChatHistory;
      }
      const { data, error } = await supabase
        .from("tickets")
        .update(updatePayload)
        .eq("id", ticketId)
        .select()
        .single();
      if (error) {
        console.error("Error updating ticket after user message:", error);
      } else {
        if (storageMode === "messages_table") {
          await persistTicketMessages(ticketId, [userMessage]);
        }
        updateTicketsState((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? reviveTicketDates(data, storageMode === "embedded" ? undefined : tempUpdatedChatHistory)
              : t
          )
        );
      }
      return;
    }
    setIsLoadingAi(true);
    let finalChatHistory = tempUpdatedChatHistory;
    try {
      const aiResponse = await getFollowUpHelpResponse(
        ticket.title,
        ticket.category,
        tempUpdatedChatHistory,
        ticket.assigned_ai_level,
        user.language_preference
      );
      const aiResponseMessage: ChatMessage = { id: crypto.randomUUID(), sender: "ai", text: aiResponse.text, timestamp: new Date() };
      finalChatHistory = [...tempUpdatedChatHistory, aiResponseMessage];
      if (onAiMessageAdded) onAiMessageAdded(aiResponseMessage);
    } catch (error: any) {
      console.error("Error getting AI follow-up response:", error);
      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: translateHook("appContext.error.aiFollowUpFailed", { error: error?.message || "Unknown" }),
        timestamp: new Date(),
      };
      finalChatHistory = [...tempUpdatedChatHistory, fallbackMessage];
    } finally {
      if (shouldShortCircuitNetwork("supabase.tickets.update")) {
        updateTicketsState((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? { ...t, chat_history: finalChatHistory, status: newStatus, updated_at: new Date() }
              : t
          )
        );
        setIsLoadingAi(false);
        return;
      }
      const updatePayload: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (storageMode === "embedded") {
        updatePayload.chat_history = finalChatHistory;
      }
      const { data, error } = await supabase
        .from("tickets")
        .update(updatePayload)
        .eq("id", ticketId)
        .select()
        .single();
      if (error) {
        console.error("Error saving AI response:", error);
      } else {
        if (storageMode === "messages_table") {
          const messagesToPersist = finalChatHistory.filter((message) =>
            message.timestamp.getTime() >= userMessage.timestamp.getTime()
          );
          await persistTicketMessages(ticketId, messagesToPersist);
        }
        updateTicketsState((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? reviveTicketDates(data, storageMode === "embedded" ? undefined : finalChatHistory)
              : t
          )
        );
      }
      setIsLoadingAi(false);
    }
  };

  const proposeOrUpdateAppointment = async (
    ticketId: string,
    details: Omit<AppointmentDetails, "proposedBy" | "id" | "history">,
    proposedBy: "agent" | "user",
    newStatus: AppointmentDetails["status"]
  ): Promise<void> => {
    if (!user) return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const newAppointment: AppointmentDetails = {
      ...details,
      id: crypto.randomUUID(),
      proposedBy,
      status: newStatus,
      history: ticket.current_appointment ? [...(ticket.current_appointment.history || []), ticket.current_appointment] : [],
    };
    let chatMessageText = "";
    const { proposedDate, proposedTime, locationOrMethod } = details;
    const apptDateStr = new Date(proposedDate).toLocaleDateString(language, { weekday: "long", month: "long", day: "numeric" });
    if (newStatus === "pending_user_approval")
      chatMessageText = translateHook("appointment.chat.agentProposed", { date: apptDateStr, time: proposedTime, location: locationOrMethod });
    else if (newStatus === "confirmed")
      chatMessageText = translateHook("appointment.chat.userConfirmed", { date: apptDateStr, time: proposedTime, location: locationOrMethod });
    else if (newStatus === "rescheduled_by_user")
      chatMessageText = translateHook("appointment.chat.userWantsToReschedule", { date: apptDateStr, time: proposedTime, location: locationOrMethod });
    const systemMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: proposedBy === "agent" ? "agent" : "user",
      agentId: proposedBy === "agent" ? user.id : undefined,
      text: chatMessageText,
      timestamp: new Date(),
    };
    const updatedChatHistory = chatMessageText ? [...ticket.chat_history, systemMessage] : ticket.chat_history;
    if (shouldShortCircuitNetwork("supabase.tickets.update")) {
      const updatedAtDate = new Date();
      updateTicketsState((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                current_appointment: newAppointment,
                chat_history: updatedChatHistory,
                updated_at: updatedAtDate,
              }
            : t
        )
      );
      return;
    }
    const storageMode = chatStorageModeRef.current === "unknown" ? await ensureChatStorageMode() : chatStorageModeRef.current;
    const currentAppointmentAvailable =
      hasCurrentAppointmentColumnRef.current !== null
        ? Boolean(hasCurrentAppointmentColumnRef.current)
        : await ensureCurrentAppointmentColumn();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (currentAppointmentAvailable) {
      updatePayload.current_appointment = newAppointment;
    } else {
      console.warn("tickets.current_appointment column unavailable; skipping persistence of appointment details.");
    }
    if (storageMode === "embedded") {
      updatePayload.chat_history = updatedChatHistory;
    }
    const { data, error } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticketId)
      .select()
      .single();
    if (error) {
      console.error("Error proposing appointment:", error);
    } else {
      if (storageMode === "messages_table" && chatMessageText) {
        await persistTicketMessages(ticketId, [systemMessage]);
      }
      updateTicketsState((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) {
            return t;
          }
          if (currentAppointmentAvailable) {
            return reviveTicketDates(data, storageMode === "embedded" ? undefined : updatedChatHistory);
          }
          return {
            ...t,
            chat_history: updatedChatHistory,
            updated_at: new Date(updatePayload.updated_at),
            current_appointment: newAppointment,
          };
        })
      );
    }
  };

  const deleteAppointment = async (appointmentId: string, ticketId: string): Promise<boolean> => {
    if (shouldShortCircuitNetwork("supabase.appointment_details.delete")) {
      pruneApptInState(ticketId, appointmentId);
      return true;
    }

    const { error } = await supabase
      .from("appointment_details")
      .delete()
      .eq("id", appointmentId);

    if (error) {
      console.error("Error deleting appointment:", error);
      return false;
    }

    pruneApptInState(ticketId, appointmentId);
    return true;
  };

  const getTicketById = useCallback((ticketId: string) => tickets.find((t) => t.id === ticketId), [tickets]);

  const updateCompanyName = async (newName: string): Promise<boolean> => {
    if (!user || user.role !== UserRole.MANAGER || !user.company_id) return false;

    const { data: companyRow, error: findError } = await supabase
      .from("companies")
      .select("id,name")
      .eq("id", user.company_id)  // UUID
      .single();

    if (findError || !companyRow) {
      console.error("Company not found (by id)", findError);
      alert(translateHook("managerDashboard.companyInfo.updateError", { default: "Could not find the company to update." }));
      return false;
    }

    const { error: updateCompanyError } = await supabase
      .from("companies")
      .update({ name: newName })
      .eq("id", companyRow.id);

    if (updateCompanyError) {
      console.error("Error updating company name:", updateCompanyError);
      alert(translateHook("managerDashboard.companyInfo.updateError", { default: "Failed to update company name. The new name might be taken." }));
      return false;
    }

    // lightweight UI refresh
    setAllUsers((prev) => [...prev]);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        signUp,
        tickets,
        addTicket,
        updateTicketStatus,
        addChatMessage,
        sendAgentMessage,
        isLoading,
        isLoadingAi,
        getTicketById,
        isAutoReadEnabled,
        toggleAutoRead,
        assignTicket,
        getAgents,
        getAllUsers,
        proposeOrUpdateAppointment,
        restoreAppointment,
        deleteAppointment,
        deleteTicket,
        updateUserRole,
        agentTakeTicket,
        deleteUserById,
        newlyCreatedCompanyName,
        setNewlyCreatedCompanyName,
        updateCompanyName,
        consentGiven,
        giveConsent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AppProviderContent>{children}</AppProviderContent>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/login", { replace: true, state: { from: location } });
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      const target =
        user.role === UserRole.AGENT ? "/agent/dashboard" : user.role === UserRole.MANAGER ? "/manager/dashboard" : "/dashboard";
      navigate(target, { replace: true });
    }
  }, [user, isLoading, navigate, allowedRoles, location]);

  if (isLoading || !user || (allowedRoles && !allowedRoles.includes(user.role))) return null;
  return <>{children}</>;
};

const MainAppContent: React.FC = () => {
  const { user, isLoading, consentGiven, giveConsent } = useApp();
  const { isLoadingLang, t } = useLanguage();
  const location = useLocation(); // Moved to top level

  const noLayoutPages = ["/login", "/signup", "/landing"];
  const specialLayoutPages = ["/legal", "/manual", "/presentation", "/contact", "/about", "/testimonials", "/partners", "/infographie"];

  if (isLoading || isLoadingLang) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <LoadingSpinner size="lg" text={t("appName") + "..."} />
      </div>
    );
  }

  const renderRoutes = () => (
  <Routes>
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/legal" element={<LegalPage />} />
    <Route path="/manual" element={<UserManualPage />} />
    <Route path="/presentation" element={<PromotionalPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/accessibilite" element={<AccessibilitePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/testimonials" element={<TestimonialsPage />} />
    <Route path="/partners" element={<PartnersPage />} />
    <Route path="/infographie" element={<InfographiePage />} />
    <Route path="/demo" element={<DemoPage />} />

    {/* PricingPage */}
    <Route path="/pricing" element={<PricingPage />} />

    <Route path="/subscribe" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
          {user?.role === UserRole.AGENT ? (
            <Navigate to="/agent/dashboard" replace />
          ) : user?.role === UserRole.MANAGER ? (
            <Navigate to="/manager/dashboard" replace />
          ) : (
            <DashboardPage />
          )}
        </ProtectedRoute>
      }
    />

    <Route
      path="/help"
      element={
        <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
          <HelpChatPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/ticket/new"
      element={
        <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
          <NewTicketPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/ticket/:ticketId"
      element={
        <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
          <TicketDetailPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/agent/dashboard"
      element={
        <ProtectedRoute allowedRoles={[UserRole.AGENT, UserRole.MANAGER]}>
          <AgentDashboardPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/manager/dashboard"
      element={
        <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
          <ManagerDashboardPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/"
      element={
        user ? (
          user.role === UserRole.AGENT ? (
            <Navigate to="/agent/dashboard" replace />
          ) : user.role === UserRole.MANAGER ? (
            <Navigate to="/manager/dashboard" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        ) : (
          <Navigate to="/landing" replace />
        )
      }
    />
  </Routes>
);


  if (noLayoutPages.includes(location.pathname)) {
    return (
      <>
        {renderRoutes()}
        {!consentGiven && <CookieConsentBanner onAccept={giveConsent} />}
      </>
    );
  }

  if (specialLayoutPages.includes(location.pathname)) {
    return renderRoutes();
  }

  return (
  <PageLayout>
    {renderRoutes()}
    {!consentGiven && <CookieConsentBanner onAccept={giveConsent} />}
  </PageLayout>
);

};

function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <HashRouter>
          <MainAppContent />
        </HashRouter>
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
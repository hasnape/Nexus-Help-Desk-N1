import React, {
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import i18next from "i18next";
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  Ticket,
  User,
  ChatMessage,
  TicketStatus,
  UserRole,
  Locale as AppLocale,
  AppointmentDetails,
} from "@/types";
import { getFollowUpHelpResponse, getTicketSummary } from "./services/geminiService";
import { supabase } from "./services/supabaseClient";
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
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import LoadingSpinner from "./components/LoadingSpinner";
import CookieConsentBanner from "./components/CookieConsentBanner";
import type { Session } from "@supabase/supabase-js";
import { sendWelcomeManagerEmail, generateLoginUrl, formatRegistrationDate } from "./services/emailService";
import PageLayout from "./components/PageLayout";

/** ---------- Types utilitaires manquants (compilation sûre) ---------- */
type ChatStorageMode = "unknown" | "jsonb" | "table";
type TicketMessageRow = {
  id?: string;
  ticket_id?: string;
  content?: string;
  message_text?: string;
  text?: string;
  body?: string;
  created_at?: string;
  inserted_at?: string;
  timestamp?: string;
  sender?: ChatMessage["sender"] | string;
  agent_id?: string;
};

/** ---------- Helpers réseau centralisés (définis une seule fois) ---------- */
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
  !!e && (e.name === "AbortError" || String(e).includes("AbortError"));

const isOnlineRequiredService = (fnName: string) =>
  fnName === "getFollowUpHelpResponse" || fnName === "getTicketSummary";

/** Circuit court local (freemium/offline) – par défaut désactivé */
const shouldShortCircuitNetwork = (_key: string) => false;
/** Détection du mode de stockage (placeholder sûr) */
const ensureChatStorageMode = async (): Promise<ChatStorageMode> => "jsonb";

/** ---------- Contexte App ---------- */
interface AppContextType {
  user: User | null;
  login: (email: string, password: string, companyName: string) => Promise<string | true>;
  logout: () => void;
  signUp: (
    email: string,
    fullName: string,
    password: string,
    options: { lang: AppLocale; role: UserRole; companyName: string; secretCode?: string }
  ) => Promise<string | true>;
  tickets: Ticket[];
  addTicket: (
    ticketData: Omit<
      Ticket,
      | "id"
      | "created_at"
      | "updated_at"
      | "user_id"
      | "assigned_agent_id"
      | "internal_notes"
      | "current_appointment"
      | "assigned_ai_level"
      | "chat_history"
    >,
    initialChatHistory: ChatMessage[]
  ) => Promise<Ticket | null>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  addChatMessage: (
    ticketId: string,
    userMessageText: string,
    onAiMessageAdded?: (aiMessage: ChatMessage) => void
  ) => Promise<void>;
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
  deleteTicket: (ticketId: string) => Promise<void>;
  updateUserRole: (userIdToUpdate: string, newRole: UserRole) => Promise<boolean>;
  deleteUserById: (userId: string) => Promise<void>;
  newlyCreatedCompanyName: string | null;
  setNewlyCreatedCompanyName: (name: string | null) => void;
  updateCompanyName: (newName: string) => Promise<boolean>;
  consentGiven: boolean;
  giveConsent: () => void;
  quotaUsagePercent: number | null;
  refreshQuotaUsage: () => Promise<void>;
  restoreAppointment: () => Promise<void>;
  deleteAppointment: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

/** ---------- Helpers tickets ---------- */
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
  const textContent = row.content ?? row.message_text ?? row.text ?? row.body ?? "";
  const timestampString =
    row.created_at ?? row.inserted_at ?? row.timestamp ?? new Date().toISOString();
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
    if (!row.ticket_id) return;
    const message = mapTicketMessageRowToChatMessage(row);
    const existing = grouped.get(row.ticket_id) ?? [];
    existing.push(message);
    grouped.set(row.ticket_id, existing);
  });
  return grouped;
};

/** ---------- Quotas ---------- */
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

/** ---------- Provider App ---------- */
const AppProviderContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newlyCreatedCompanyName, setNewlyCreatedCompanyName] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [quotaUsagePercent, setQuotaUsagePercent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isFreemiumDevice] = useState<boolean>(false);
  const [isLocalFreemiumSession] = useState<boolean>(false);
  const [isAutoReadEnabled, setIsAutoReadEnabled] = useState<boolean>(() => {
    const storedAutoRead = localStorage.getItem("aiHelpDeskAutoRead");
    return storedAutoRead ? JSON.parse(storedAutoRead) : true;
  });
  const [chatStorageMode, setChatStorageMode] = useState<ChatStorageMode>("unknown");
  const chatStorageModeRef = useRef<ChatStorageMode>(chatStorageMode);
  useEffect(() => {
    chatStorageModeRef.current = chatStorageMode;
  }, [chatStorageMode]);

  const [messageContentColumn, setMessageContentColumn] = useState<
    "content" | "message_text" | "text" | "body" | null
  >(null);
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

  const [hasCurrentAppointmentColumn, setHasCurrentAppointmentColumn] = useState<boolean | null>(
    null
  );
  const hasCurrentAppointmentColumnRef = useRef<boolean | null>(hasCurrentAppointmentColumn);
  useEffect(() => {
    hasCurrentAppointmentColumnRef.current = hasCurrentAppointmentColumn;
  }, [hasCurrentAppointmentColumn]);

  const updateTicketsState = (updater: (prev: Ticket[]) => Ticket[]) => setTickets(updater);

  const { language, setLanguage: setAppLanguage, t: translateHook } = useLanguage();

  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent");
    if (storedConsent === "true") {
      setConsentGiven(true);
    }
  }, []);

  const loadUserData = useCallback(async (session: Session | null) => {
    try {
      if (session?.user) {
        setIsLoading(true);
        // IMPORTANT : auth.user.id correspond à public.users.auth_uid
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_uid", session.user.id)
          .single();

        if (profileError || !userProfile) {
          throw profileError || new Error("User profile not found");
        }
        setUser(userProfile);

        const [usersResponse, ticketsResponse] = await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("tickets").select("*"),
        ]);

        setAllUsers(usersResponse.data || []);
        setTickets(ticketsResponse.data ? ticketsResponse.data.map(reviveTicketDates) : []);
      } else {
        setUser(null);
        setTickets([]);
        setAllUsers([]);
      }
    } catch (error: any) {
      console.error("Error loading user data:", error);
      if (error.message?.includes("Invalid Refresh Token")) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setTickets([]);
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error fetching session:", error);
        loadUserData(null);
        return;
      }
      loadUserData(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && !session) {
        loadUserData(null);
      } else if (session?.user?.id !== user?.auth_uid) {
        loadUserData(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserData, user?.auth_uid]);

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

  const login = async (
    email: string,
    password: string,
    companyName: string
  ): Promise<string | true> => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Supabase login error:", error.message);
      return translateHook("login.error.invalidCredentials");
    }

    if (authData.user) {
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("company_id")
        .eq("auth_uid", authData.user.id)
        .single();

      if (profileError || !userProfile) {
        console.error("Could not fetch user profile for company verification:", profileError);
        await supabase.auth.signOut();
        return translateHook("login.error.profileFetchFailed");
      }

      // NB : Ici company_id est un UUID ; adaptez si companyName est un nom et non un id.
      if (userProfile.company_id !== companyName) {
        await supabase.auth.signOut();
        return translateHook("login.error.companyIdMismatch");
      }
    } else {
      return translateHook("login.error.invalidCredentials");
    }

    return true;
  };

  const signUp = async (
    email: string,
    fullName: string,
    password: string,
    options: { lang: AppLocale; role: UserRole; companyName: string; secretCode?: string }
  ): Promise<string | true> => {
    const { lang, role, companyName, secretCode } = options;

    if (role === UserRole.MANAGER) {
      if (!secretCode) {
        return translateHook("signup.error.secretCodeRequiredManager");
      }

      // Étape 1 : Validation via RPC
      const { data: validation, error: rpcError } = await supabase.rpc("creer_manager_avec_code", {
        email_utilisateur: email,
        mot_de_passe_utilisateur: password,
        nom_complet_utilisateur: fullName,
        nom_entreprise_utilisateur: companyName,
        code_activation: secretCode,
      });

      if (rpcError || validation?.error) {
        const errorMessage = rpcError?.message || validation?.error;
        console.error("Erreur lors de la validation du manager :", errorMessage);
        if (errorMessage && errorMessage.includes("activation_code_not_found")) {
          return "Le code d'activation est invalide ou a déjà été utilisé.";
        }
        if (errorMessage && errorMessage.includes("user_already_exists")) {
          return "Un utilisateur avec cet email existe déjà.";
        }
        return "Une erreur de serveur est survenue lors de la validation. Veuillez réessayer.";
      }

      if (!validation?.success || !validation.plan_name) {
        return "La validation a échoué sans message d'erreur clair.";
      }

      // Étape 2 : Création Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            language_preference: lang,
            role: UserRole.MANAGER,
            company_id: companyName,
            plan_name: validation.plan_name,
          },
        },
      });

      if (signUpError) {
        console.error("Erreur lors du Supabase signUp final:", signUpError);
        return signUpError.message;
      }

      try {
        const emailData = {
          managerName: fullName,
          managerEmail: email,
          companyName,
          secretCode: secretCode || "N/A",
          registrationDate: formatRegistrationDate(new Date()),
          loginUrl: generateLoginUrl(),
        };
        const emailResult = await sendWelcomeManagerEmail(emailData);
        if (!emailResult.success) {
          console.warn(
            "Inscription ok, mais l'email de bienvenue a échoué:",
            emailResult.error
          );
        }
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email de bienvenue:", emailError);
      }

      setNewlyCreatedCompanyName(companyName);
      return true;
    } else {
      try {
        const { data: existingCompany, error: findCompanyError } = await supabase
          .from("companies")
          .select("id")
          .eq("name", companyName)
          .limit(1);

        if (findCompanyError || !existingCompany || existingCompany.length === 0) {
          throw new Error(translateHook("signup.error.companyNotFound", { companyName }));
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              language_preference: lang,
              role,
              company_id: companyName,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        return true;
      } catch (e: any) {
        if (e.message?.toLowerCase().includes("user already registered")) {
          return translateHook("signup.error.emailInUse");
        }
        return e.message || translateHook("signup.error.generic");
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNewlyCreatedCompanyName(null);
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
    try {
      const { error } = await supabase.rpc("delete_user_by_manager", { user_id_to_delete: userId });
      if (error) {
        console.error("Error deleting user via RPC:", error);
        alert(translateHook("managerDashboard.deleteUserError.rpc", { message: error.message }));
      } else {
        setAllUsers((prev) => prev.filter((u) => u.id !== userId));
        updateTicketsState((prev) => {
          const ticketsAfterUserRemoval = prev.filter((t) => t.user_id !== userId);
          return ticketsAfterUserRemoval.map((t) =>
            t.assigned_agent_id === userId ? { ...t, assigned_agent_id: undefined } : t
          );
        });
      }
    } catch (e: any) {
      console.error("Critical error calling delete user RPC:", e);
      alert(translateHook("managerDashboard.deleteUserError.critical", { message: e.message }));
    }
  };

  const addTicket = async (
    ticketData: Omit<
      Ticket,
      | "id"
      | "created_at"
      | "updated_at"
      | "user_id"
      | "assigned_agent_id"
      | "internal_notes"
      | "current_appointment"
      | "assigned_ai_level"
      | "chat_history"
    >,
    initialChatHistory: ChatMessage[]
  ): Promise<Ticket | null> => {
    if (!user) return null;
    const creatorUserId = user.id;
    setIsLoading(true);
    try {
      const now = new Date();
      const newTicketData = {
        ...ticketData,
        user_id: creatorUserId,
        chat_history: initialChatHistory,
        assigned_ai_level: DEFAULT_AI_LEVEL,
        assigned_agent_id: undefined,
        internal_notes: [],
        current_appointment: undefined,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      const { data, error } = await supabase.from("tickets").insert(newTicketData).select().single();
      if (error) throw error;
      const createdTicket = reviveTicketDates(data);
      setTickets((prevTickets) => [...prevTickets, createdTicket]);
      return createdTicket;
    } catch (error) {
      console.error("Error creating ticket:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    const updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("tickets")
      .update({ status, updated_at })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error updating ticket status:", error);
    else updateTicketsState((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
  };

  const deleteTicket = async (ticketId: string): Promise<void> => {
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
        summaryMessage = {
          id: crypto.randomUUID(),
          sender: "system_summary",
          text: summaryText,
          timestamp: new Date(),
        };
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

    const updatedChatHistory = summaryMessage
      ? [...ticketToUpdate.chat_history, summaryMessage]
      : ticketToUpdate.chat_history;

    const updatePayload = {
      assigned_agent_id: agentId,
      chat_history: updatedChatHistory,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error assigning ticket:", error);
    else setTickets((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
  };

  const agentTakeTicket = async (ticketId: string): Promise<void> => {
    if (!user || user.role !== UserRole.AGENT) return;
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

    const updatePayload = {
      chat_history: updated_chat_history,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error sending agent message:", error);
    else setTickets((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
  };

  const addChatMessage = async (
    ticketId: string,
    userMessageText: string,
    onAiMessageAdded?: (aiMessage: ChatMessage) => void
  ) => {
    if (!user) return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const timestamp = new Date();
    const userMessage: ChatMessage = { id: crypto.randomUUID(), sender: "user", text: userMessageText, timestamp };
    const newStatus =
      ticket.status === TICKET_STATUS_KEYS.RESOLVED || ticket.status === TICKET_STATUS_KEYS.CLOSED
        ? TICKET_STATUS_KEYS.IN_PROGRESS
        : ticket.status;

    let tempUpdatedChatHistory = [...ticket.chat_history, userMessage];

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, chat_history: tempUpdatedChatHistory, status: newStatus, updated_at: new Date() }
          : t
      )
    );

    let storageMode = chatStorageModeRef.current;
    if (storageMode === "unknown") {
      storageMode = await ensureChatStorageMode();
      setChatStorageMode(storageMode);
    }

    if (ticket.assigned_agent_id) {
      await supabase
        .from("tickets")
        .update({
          chat_history: tempUpdatedChatHistory,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);
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
      const aiResponseMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: aiResponse.text,
        timestamp: new Date(),
      };
      finalChatHistory = [...tempUpdatedChatHistory, aiResponseMessage];
      if (onAiMessageAdded) onAiMessageAdded(aiResponseMessage);
    } catch (error: any) {
      console.error("Error getting AI follow-up response:", error);
      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: translateHook("appContext.error.aiFollowUpFailed", {
          error: error?.message || "Unknown",
        }),
        timestamp: new Date(),
      };
      finalChatHistory = [...tempUpdatedChatHistory, fallbackMessage];
    } finally {
      const updatePayload = {
        chat_history: finalChatHistory,
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("tickets")
        .update(updatePayload)
        .eq("id", ticketId)
        .select()
        .single();
      if (error) console.error("Error saving AI response:", error);
      else setTickets((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
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
    const apptDateStr = new Date(proposedDate).toLocaleDateString(language, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    if (newStatus === "pending_user_approval")
      chatMessageText = translateHook("appointment.chat.agentProposed", {
        date: apptDateStr,
        time: proposedTime,
        location: locationOrMethod,
      });
    else if (newStatus === "confirmed")
      chatMessageText = translateHook("appointment.chat.userConfirmed", {
        date: apptDateStr,
        time: proposedTime,
        location: locationOrMethod,
      });
    else if (newStatus === "rescheduled_by_user")
      chatMessageText = translateHook("appointment.chat.userWantsToReschedule", {
        date: apptDateStr,
        time: proposedTime,
        location: locationOrMethod,
      });

    const systemMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: proposedBy === "agent" ? "agent" : "user",
      agentId: proposedBy === "agent" ? user.id : undefined,
      text: chatMessageText,
      timestamp: new Date(),
    };

    const updatedChatHistory = chatMessageText ? [...ticket.chat_history, systemMessage] : ticket.chat_history;

    const updatePayload = {
      current_appointment: newAppointment,
      chat_history: updatedChatHistory,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error proposing appointment:", error);
    else setTickets((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
  };

  const getTicketById = useCallback(
    (ticketId: string) => tickets.find((t) => t.id === ticketId),
    [tickets]
  );

  const updateCompanyName = async (newName: string): Promise<boolean> => {
    if (!user || user.role !== UserRole.MANAGER || !user.company_id) return false;
    const oldName = user.company_id;

    const { data: companyResults, error: findError } = await supabase
      .from("companies")
      .select("id")
      .eq("name", oldName)
      .limit(1);

    if (findError) {
      console.error("Error finding company to update:", findError);
      alert(
        translateHook("managerDashboard.companyInfo.updateError", {
          default: "Could not find the company to update.",
        })
      );
      return false;
    }

    const companyRow = (companyResults && (companyResults as any)[0]) || null;
    if (!companyRow) {
      alert(
        translateHook("managerDashboard.companyInfo.updateError", {
          default: "Company not found.",
        })
      );
      return false;
    }

    const { error: updateCompanyError } = await supabase
      .from("companies")
      .update({ name: newName })
      .eq("id", companyRow.id);

    if (updateCompanyError) {
      console.error("Error updating company name:", updateCompanyError);
      alert(
        translateHook("managerDashboard.companyInfo.updateError", {
          default: "Failed to update company name. The new name might be taken.",
        })
      );
      return false;
    }

    setAllUsers((prev) => [...prev]);
    return true;
  };

  const refreshQuotaUsage = async () => {
    const res = await getCompanyQuota();
    if (!res) {
      setQuotaUsagePercent(null);
      return;
    }
    if (res.unlimited) {
      setQuotaUsagePercent(0);
      return;
    }
    if (typeof res.used === "number" && typeof res.limit === "number" && res.limit > 0) {
      setQuotaUsagePercent(Math.min(100, Math.round((res.used / res.limit) * 100)));
    } else {
      setQuotaUsagePercent(null);
    }
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
        restoreAppointment: async () => {},
        deleteAppointment: async () => {},
        deleteTicket,
        updateUserRole,
        agentTakeTicket,
        deleteUserById,
        newlyCreatedCompanyName,
        setNewlyCreatedCompanyName,
        updateCompanyName,
        consentGiven,
        giveConsent,
        quotaUsagePercent,
        refreshQuotaUsage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AppProviderContent>{children}</AppProviderContent>;
};

/** ---------- Routes protégées ---------- */
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
        user.role === UserRole.AGENT
          ? "/agent/dashboard"
          : user.role === UserRole.MANAGER
          ? "/manager/dashboard"
          : "/dashboard";
      navigate(target, { replace: true });
    }
  }, [user, isLoading, navigate, allowedRoles, location]);

  if (isLoading || !user || (allowedRoles && !allowedRoles.includes(user.role))) return null;
  return <>{children}</>;
};

/** ---------- Shell principal ---------- */
const MainAppContent: React.FC = () => {
  const { user, isLoading, consentGiven, giveConsent } = useApp();
  const { isLoadingLang, t } = useLanguage();
  const location = useLocation();

  const noLayoutPages = ["/login", "/signup", "/landing"];
  const specialLayoutPages = [
    "/legal",
    "/manual",
    "/presentation",
    "/contact",
    "/about",
    "/testimonials",
    "/partners",
    "/infographie",
  ];

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

      <Route path="/pricing" element={<PricingPage />} />

      <Route
        path="/subscribe"
        element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />

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
  useEffect(() => {
    const apply = () => {
      const lng = i18next.language;
      document.documentElement.lang = lng;
      document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    };
    apply();
    const handler = () => apply();
    i18next.on("languageChanged", handler);
    return () => {
      i18next.off("languageChanged", handler);
    };
  }, []);

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

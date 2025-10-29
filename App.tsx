import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Ticket, User, ChatMessage, TicketStatus, UserRole, Locale as AppLocale, AppointmentDetails } from "./types";
import { getFollowUpHelpResponse, getTicketSummary } from "./services/geminiService";
import { supabase } from "./services/supabaseClient";
import { ensureUserProfile } from "./services/authService";
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
import SubscriptionPage from "./pages/SubscriptionPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import PartnersPage from "./pages/PartnersPage";
import InfographiePage from "./pages/InfographiePage";
import { DEFAULT_AI_LEVEL, DEFAULT_USER_ROLE, TICKET_STATUS_KEYS } from "./constants";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import LoadingSpinner from "./components/LoadingSpinner";
import CookieConsentBanner from "./components/CookieConsentBanner";
import type { Session } from "@supabase/supabase-js";
import { sendWelcomeManagerEmail, generateLoginUrl, formatRegistrationDate } from "./services/emailService";
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

const reviveTicketDates = (data: any): Ticket => ({
  ...data,
  created_at: new Date(data.created_at),
  updated_at: new Date(data.updated_at),
  chat_history: data.chat_history ? data.chat_history.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })) : [],
  internal_notes: data.internal_notes || [],
  current_appointment: data.current_appointment || undefined,
});

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

  const { language, setLanguage: setAppLanguage, t: translateHook } = useLanguage();

  const shouldShortCircuitNetwork = useCallback(() => false, []);

  const updateTicketsState = useCallback((updater: (prevTickets: Ticket[]) => Ticket[]) => {
    setTickets((prevTickets) => updater(prevTickets));
  }, []);

  const setTicketsDirect = useCallback((nextTickets: Ticket[]) => {
    setTickets(nextTickets);
  }, []);

  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent");
    if (storedConsent === "true") {
      setConsentGiven(true);
    }
  }, []);

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

          const [usersResponse, ticketsResponse] = await Promise.all([
            supabase
              .from("users")
              .select("id, auth_uid, email, full_name, role, language_preference, company_id"),
            supabase
              .from("tickets")
              .select(
                "id, user_id, title, description, category, priority, status, assigned_ai_level, assigned_agent_id, workstation_id, created_at, updated_at, chat_history, current_appointment"
              ),
          ]);

          setAllUsers(usersResponse.data || []);

          const fetchedTickets = ticketsResponse.data ? ticketsResponse.data.map(reviveTicketDates) : [];
          setTicketsDirect(fetchedTickets);
        } else {
          setUser(null);
          setTicketsDirect([]);
          setAllUsers([]);
        }
      } catch (error: any) {
        console.error("Error loading user data:", error);
        if (error.message.includes("Invalid Refresh Token")) {
          await supabase.auth.signOut();
        }
        setUser(null);
        setTicketsDirect([]);
        setAllUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [setTicketsDirect]
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

  const login = async (email: string, password: string, _companyName: string): Promise<string | true> => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !authData.user) {
        console.error("Supabase login error:", error?.message || "Unknown error");
        return translateHook("login.error.invalidCredentials");
      }

      return true;
    } catch (authError: any) {
      console.error("Unexpected login error:", authError);
      return translateHook("login.error.invalidCredentials");
    }
  };

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

    if (role === UserRole.MANAGER) {
      if (!plan) {
        return translateHook("signup.error.planSelectionRequired");
      }

      if (plan === "freemium") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              language_preference: lang,
              role: UserRole.MANAGER,
              company_name: companyName,
              plan_name: plan,
            },
          },
        });

        if (signUpError) {
          console.error("Erreur lors de l'inscription Freemium:", signUpError);
          if (signUpError.message && signUpError.message.toLowerCase().includes("user already registered")) {
            return translateHook("signup.error.emailInUse");
          }
          return signUpError.message || translateHook("signup.error.generic");
        }

        try {
          const emailData = {
            managerName: fullName,
            managerEmail: email,
            companyName,
            secretCode: "Freemium",
            registrationDate: formatRegistrationDate(new Date()),
            loginUrl: generateLoginUrl(),
          };
          const emailResult = await sendWelcomeManagerEmail(emailData);
          if (!emailResult.success) {
            console.warn("Failed to send welcome email for freemium manager:", emailResult.error);
          }
        } catch (emailError) {
          console.warn("Unexpected error sending freemium welcome email:", emailError);
        }

        setNewlyCreatedCompanyName(companyName);
        return true;
      }

      if (!secretCode) {
        return translateHook("signup.error.secretCodeRequiredManager");
      }
      
      // ===================================================================
      // CORRECTION FINALE : Nouvelle logique en 2 étapes
      // ===================================================================

      // ÉTAPE 1: Valider le code d'activation via une fonction serveur.
      // Nous utiliserons la fonction 'creer_manager_avec_code' pour cette validation.
      // Assurez-vous que cette fonction existe bien sur Supabase avec le bon code.
      const { data: validation, error: rpcError } = await supabase.rpc('creer_manager_avec_code', {
        email_utilisateur: email,
        mot_de_passe_utilisateur: password, // envoyé mais non utilisé pour le signup
        nom_complet_utilisateur: fullName,
        nom_entreprise_utilisateur: companyName,
        code_activation: secretCode
      });

      if (rpcError || validation?.error) {
        const errorMessage = rpcError?.message || validation?.error;
        console.error("Erreur lors de la validation du manager :", errorMessage);
        if (errorMessage && errorMessage.includes('activation_code_not_found')) {
          return "Le code d'activation est invalide ou a déjà été utilisé.";
        }
         if (errorMessage && errorMessage.includes('user_already_exists')) {
          return "Un utilisateur avec cet email existe déjà.";
        }
        return "Une erreur de serveur est survenue lors de la validation. Veuillez réessayer.";
      }
      
      if (!validation?.success || !validation.plan_name) {
          return "La validation a échoué sans message d'erreur clair.";
      }

      // ÉTAPE 2: Si la validation réussit, on crée l'utilisateur avec la méthode native de Supabase.
      // Le trigger 'handle_new_user' s'occupera de créer le profil dans public.users.
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            language_preference: lang,
            role: UserRole.MANAGER,
            company_name: companyName, // Passe le nom de l'entreprise
            plan_name: validation.plan_name // Passe le nom du plan validé par la fonction RPC
          }
        }
      });
      
      if (signUpError) {
        console.error("Erreur lors du Supabase signUp final:", signUpError);
        return signUpError.message;
      }
      
      // Si l'inscription réussit, on peut envoyer l'email de bienvenue
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
          console.warn("⚠️ L'inscription a réussi, mais l'envoi de l'email de bienvenue a échoué:", emailResult.error);
        }
      } catch (emailError) {
        console.error("❌ Erreur critique lors de l'envoi de l'email de bienvenue:", emailError);
      }
      
      setNewlyCreatedCompanyName(companyName);
      return true;

    } else {
      // --- LOGIQUE INCHANGÉE POUR LES AUTRES RÔLES (USER, AGENT) ---
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
          options: { data: { full_name: fullName, language_preference: lang, role, company_name: companyName } },
        });

        if (signUpError) {
          throw signUpError;
        }

        return true;

      } catch (e: any) {
        if (e.message.toLowerCase().includes("user already registered")) {
          return translateHook("signup.error.emailInUse");
        }
        return e.message || translateHook("signup.error.generic");
      }
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

      const newTicketData = {
        ...ticketData,
        user_id: creatorUserId,
        chat_history: normalizedChatHistory,
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
    const { data, error } = await supabase
      .from("tickets")
      .update({ assigned_agent_id: agentId || null, updated_at: new Date().toISOString(), chat_history: updatedChatHistory })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error assigning ticket:", error);
    else
      updateTicketsState((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
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
    const { data, error } = await supabase
      .from("tickets")
      .update({ chat_history: updated_chat_history, status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error sending agent message:", error);
    else
      updateTicketsState((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
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
    if (ticket.assigned_agent_id) {
      if (shouldShortCircuitNetwork("supabase.tickets.update")) {
        return;
      }
      await supabase
        .from("tickets")
        .update({ chat_history: tempUpdatedChatHistory, status: newStatus, updated_at: new Date().toISOString() })
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
      const { data, error } = await supabase
        .from("tickets")
        .update({ chat_history: finalChatHistory, status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", ticketId)
        .select()
        .single();
      if (error) console.error("Error saving AI response:", error);
      else
        updateTicketsState((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
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
    const { data, error } = await supabase
      .from("tickets")
      .update({ current_appointment: newAppointment, chat_history: updatedChatHistory, updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error proposing appointment:", error);
    else
      updateTicketsState((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
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
    <Route path="/about" element={<AboutPage />} />
    <Route path="/testimonials" element={<TestimonialsPage />} />
    <Route path="/partners" element={<PartnersPage />} />
    <Route path="/infographie" element={<InfographiePage />} />

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
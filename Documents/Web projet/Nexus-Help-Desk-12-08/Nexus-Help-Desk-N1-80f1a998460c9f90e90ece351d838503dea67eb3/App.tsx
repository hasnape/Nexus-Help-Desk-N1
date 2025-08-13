import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { Ticket, User, ChatMessage, TicketStatus, UserRole, Locale as AppLocale, AppointmentDetails } from "./types";
import { getFollowUpHelpResponse, getTicketSummary } from "./services/geminiService";
import { supabase } from "./services/supabaseClient";
import Navbar from "./components/Navbar";
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
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
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
      if (error.message.includes("Invalid Refresh Token")) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && !session) {
        loadUserData(null);
      } else if (session?.user?.id !== user?.id) {
        loadUserData(session);
      }
    });

    return () => {
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

  const login = async (email: string, password: string, companyName: string): Promise<string | true> => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Supabase login error:", error.message);
      return translateHook("login.error.invalidCredentials");
    }

    if (authData.user) {
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !userProfile) {
        console.error("Could not fetch user profile for company verification:", profileError);
        await supabase.auth.signOut();
        return translateHook("login.error.profileFetchFailed");
      }

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

    try {
      if (role === UserRole.MANAGER) {
        if (secretCode !== "123456") {
          throw new Error(translateHook("signup.error.invalidSecretCodeManager"));
        }

        const { error: createCompanyError } = await supabase.from("companies").insert({ name: companyName });
        if (createCompanyError) {
          console.error("Error creating company:", createCompanyError);
          if (createCompanyError.code === "23505") {
            throw new Error(translateHook("signup.error.companyNameTaken"));
          }
          throw new Error(translateHook("signup.error.companyCreateFailed"));
        }
        setNewlyCreatedCompanyName(companyName);
      } else {
        const { data: existingCompany, error: findCompanyError } = await supabase
          .from("companies")
          .select("id")
          .eq("name", companyName)
          .limit(1);

        if (findCompanyError) {
          console.error("Error querying for company:", findCompanyError);
          throw new Error(translateHook("signup.error.generic"));
        }

        if (!existingCompany || existingCompany.length === 0) {
          console.error("Company not found during signup:", companyName);
          throw new Error(translateHook("signup.error.companyNotFound", { companyName }));
        }
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, language_preference: lang, role, company_id: companyName } },
      });

      if (signUpError) {
        console.error("Supabase signup error:", signUpError);
        if (signUpError.message.toLowerCase().includes("user already registered")) {
          throw new Error(translateHook("signup.error.emailInUse"));
        }
        throw new Error(signUpError.message || translateHook("signup.error.generic"));
      }

      if (!signUpData.user) {
        throw new Error(translateHook("signup.error.generic"));
      }

      if (role === UserRole.MANAGER) {
        try {
          const emailData = {
            managerName: fullName,
            managerEmail: email,
            companyName,
            secretCode: secretCode || "123456",
            registrationDate: formatRegistrationDate(new Date()),
            loginUrl: generateLoginUrl(),
          };
          const emailResult = await sendWelcomeManagerEmail(emailData);
          if (emailResult.success) {
            console.log("✅ Email de bienvenue envoyé avec succès au manager");
          } else {
            console.warn("⚠️ Échec de l'envoi de l'email de bienvenue:", emailResult.error);
          }
        } catch (emailError) {
          console.error("❌ Erreur lors de l'envoi de l'email de bienvenue:", emailError);
        }
      }

      return true;
    } catch (e: any) {
      return e.message || translateHook("signup.error.generic");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNewlyCreatedCompanyName(null);
  };

  const updateUserRole = async (userIdToUpdate: string, newRole: UserRole): Promise<boolean> => {
    if (user?.role !== UserRole.MANAGER) return false;
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
        setTickets((prev) => {
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
    const { data, error } = await supabase.from("tickets").update({ status, updated_at }).eq("id", ticketId).select().single();
    if (error) console.error("Error updating ticket status:", error);
    else setTickets((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
  };

  const deleteTicket = async (ticketId: string): Promise<void> => {
    try {
      const { error } = await supabase.from("tickets").delete().eq("id", ticketId);
      if (error) {
        console.error("Error deleting ticket:", error);
        alert(translateHook("managerDashboard.deleteTicketError.rpc", { message: error.message }));
      } else {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
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
    const { data, error } = await supabase
      .from("tickets")
      .update({ assigned_agent_id: agentId || null, updated_at: new Date().toISOString(), chat_history: updatedChatHistory })
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
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
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
    const { data, error } = await supabase
      .from("tickets")
      .update({ chat_history: updated_chat_history, status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error sending agent message:", error);
    else setTickets((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
  };

  const addChatMessage = async (ticketId: string, userMessageText: string, onAiMessageAdded?: (aiMessage: ChatMessage) => void) => {
    if (!user) return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), sender: "user", text: userMessageText, timestamp: new Date() };
    const newStatus =
      ticket.status === TICKET_STATUS_KEYS.RESOLVED || ticket.status === TICKET_STATUS_KEYS.CLOSED
        ? TICKET_STATUS_KEYS.IN_PROGRESS
        : ticket.status;
    let tempUpdatedChatHistory = [...ticket.chat_history, userMessage];
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, chat_history: tempUpdatedChatHistory, status: newStatus, updated_at: new Date() } : t
      )
    );
    if (ticket.assigned_agent_id) {
      await supabase.from("tickets").update({ chat_history: tempUpdatedChatHistory, status: newStatus, updated_at: new Date().toISOString() }).eq("id", ticketId);
      return;
    }
    setIsLoadingAi(true);
    let finalChatHistory;
    try {
      const aiResponse = await getFollowUpHelpResponse(ticket.title, ticket.category, tempUpdatedChatHistory, ticket.assigned_ai_level, user.language_preference);
      const aiResponseMessage: ChatMessage = { id: crypto.randomUUID(), sender: "ai", text: aiResponse.text, timestamp: new Date() };
      finalChatHistory = [...tempUpdatedChatHistory, aiResponseMessage];
      if (onAiMessageAdded) onAiMessageAdded(aiResponseMessage);
    } catch (error: any) {
      console.error("Error getting AI follow-up response:", error);
      finalChatHistory = [
        ...tempUpdatedChatHistory,
        { id: crypto.randomUUID(), sender: "ai", text: translateHook("appContext.error.aiFollowUpFailed", { error: error.message || "Unknown" }), timestamp: new Date() },
      ];
    } finally {
      const { data, error } = await supabase
        .from("tickets")
        .update({ chat_history: finalChatHistory, status: newStatus, updated_at: new Date().toISOString() })
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
    const { data, error } = await supabase
      .from("tickets")
      .update({ current_appointment: newAppointment, chat_history: updatedChatHistory, updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error proposing appointment:", error);
    else setTickets((prev) => prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t)));
  };

  const getTicketById = useCallback((ticketId: string) => tickets.find((t) => t.id === ticketId), [tickets]);

  const updateCompanyName = async (newName: string): Promise<boolean> => {
    if (!user || user.role !== UserRole.MANAGER || !user.company_id) return false;
    const oldName = user.company_id;
    const { data: companyResults, error: findError } = await supabase.from("companies").select("id").eq("name", oldName).limit(1);
    if (findError) {
      console.error("Error finding company to update:", findError);
      alert(translateHook("managerDashboard.companyInfo.updateError", { default: "Could not find the company to update." }));
      return false;
    }
    if (!companyResults || companyResults.length === 0) {
      console.error("Data integrity error: company not found with name", oldName);
      alert(translateHook("managerDashboard.companyInfo.updateError", { default: "Could not find the company to update." }));
      return false;
    }
    const companyData = companyResults[0];
    const { error: updateCompanyError } = await supabase.from("companies").update({ name: newName }).eq("id", companyData.id);
    if (updateCompanyError) {
      console.error("Error updating company name:", updateCompanyError);
      alert(translateHook("managerDashboard.companyInfo.updateError", { default: "Failed to update company name. The new name might be taken." }));
      return false;
    }
    const { error: updateUserError } = await supabase.from("users").update({ company_id: newName }).eq("company_id", oldName);
    if (updateUserError) {
      console.error("CRITICAL: Failed to update users' company_id. Data is now inconsistent.", updateUserError);
      await supabase.from("companies").update({ name: oldName }).eq("id", companyData.id);
      alert(translateHook("managerDashboard.companyInfo.updateError", { default: "Failed to update company name for all users. The change has been rolled back." }));
      return false;
    }
    setUser((prevUser) => (prevUser ? { ...prevUser, company_id: newName } : null));
    setAllUsers((prevUsers) => prevUsers.map((u) => (u.company_id === oldName ? { ...u, company_id: newName } : u)));
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
      <Route path="/subscribe" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
            {user?.role === UserRole.AGENT ? <Navigate to="/agent/dashboard" replace /> : user?.role === UserRole.MANAGER ? <Navigate to="/manager/dashboard" replace /> : <DashboardPage />}
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
            user.role === UserRole.AGENT ? <Navigate to="/agent/dashboard" replace /> : user.role === UserRole.MANAGER ? <Navigate to="/manager/dashboard" replace /> : <Navigate to="/dashboard" replace />
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
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderRoutes()}
      </main>
      <footer className="bg-slate-100 py-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} {t("appName")}. {t("footer.allRightsReserved", { default: "All Rights Reserved." })}</p>
        <p className="mt-1">
          <Link to="/legal" className="hover:text-primary hover:underline">{t("footer.legalLink", { default: "Legal & Documentation" })}</Link>
          <span className="mx-2 text-slate-400">|</span>
          <Link to="/manual" className="hover:text-primary hover:underline">{t("footer.userManualLink", { default: "User Manual" })}</Link>
          <span className="mx-2 text-slate-400">|</span>
          <Link to="/presentation" className="hover:text-primary hover:underline">{t("footer.promotionalLink", { default: "Presentation" })}</Link>
        </p>
      </footer>
      {!consentGiven && <CookieConsentBanner onAccept={giveConsent} />}
    </div>
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
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import {
  Ticket,
  User,
  ChatMessage,
  TicketStatus,
  UserRole,
  Locale as AppLocale,
  AppointmentDetails,
  Company,
  Plan,
} from "./types";
import {
  getFollowUpHelpResponse,
  getTicketSummary,
} from "./services/geminiService";
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
const UserManualPage = require("./pages/UserManualPage").default;
import PromotionalPage from "./pages/PromotionalPage";
import LandingPage from "./pages/LandingPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ContactPage from "./pages/ContactPage";
import { DEFAULT_AI_LEVEL, TICKET_STATUS_KEYS } from "./constants";
// import supprimé : plus de gestion i18n
import CookieConsentBanner from "./components/CookieConsentBanner";
import { SidebarProvider } from "./contexts/SidebarContext";
import { PlanProvider, PLAN_LIMITS } from "./contexts/PlanContext";
// import { useNavigationGuard } from "./hooks/useNavigationGuard"; // supprimé car inutilisé
import ContextDebugger from "./components/ContextDebugger";
// import supprimé : plus de gestion i18n

interface AppContextType {
  user: User | null;
  company: Company | null;
  login: (
    email: string,
    password: string,
    companyName: string
  ) => Promise<string | true>;
  logout: () => void;
  signUp: (
    email: string,
    fullName: string,
    password: string,
    options: {
      lang: AppLocale;
      role: UserRole;
      companyName: string;
      plan?: Plan;
    }
  ) => Promise<string | true>;
  tickets: Ticket[];
  addTicket: (
    ticketData: Omit<
      Ticket,
      | "id"
      | "created_at"
      | "updated_at"
      | "user_id"
      | "company_id"
      | "assigned_agent_id"
      | "internal_notes"
      | "current_appointment"
      | "assigned_ai_level"
      | "chat_history"
    >,
    initialChatHistory: ChatMessage[]
  ) => Promise<Ticket | null | string>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  addChatMessage: (
    ticketId: string,
    userMessageText: string,
    onAiMessageAdded?: (aiMessage: ChatMessage) => void
  ) => Promise<void>;
  sendAgentMessage: (
    ticketId: string,
    agentMessageText: string
  ) => Promise<void>;
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
    details: Omit<AppointmentDetails, "proposed_by" | "proposed_at">,
    proposedBy: "agent" | "user",
    newStatus: string
  ) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  updateUserRole: (
    userIdToUpdate: string,
    newRole: UserRole
  ) => Promise<boolean | string>;
  deleteUserById: (userId: string) => Promise<void>;
  newlyCreatedCompanyName: string | null;
  setNewlyCreatedCompanyName: (name: string | null) => void;
  updateCompanyName: (newName: string) => Promise<boolean>;
  updateCompanyPlan: (plan: Plan) => Promise<boolean>;
  consentGiven: boolean;
  giveConsent: () => void;
  forceStopAllLoading: () => void;
  plan: string;
  setPlan: (plan: string) => void;
  activationCode: string;
  setActivationCode: (code: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ✅ Fonctions utilitaires
const reviveTicketDates = (data: any): Ticket => {
  if (!data) {
    throw new Error("Invalid ticket data: data is null or undefined");
  }

  try {
    return {
      ...data,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
      chat_history: data.chat_history
        ? data.chat_history.map((c: any) => ({
            ...c,
            timestamp: c.timestamp ? new Date(c.timestamp) : new Date(),
          }))
        : [],
      internal_notes: data.internal_notes || [],
      current_appointment: data.current_appointment || undefined,
    };
  } catch (error) {
    console.error("Error reviving ticket dates:", error);
    throw new Error("Failed to process ticket data");
  }
};

const reviveCompanyDates = (data: any): Company => {
  if (!data) {
    throw new Error("Invalid company data: data is null or undefined");
  }

  try {
    return {
      ...data,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
    };
  } catch (error) {
    console.error("Error reviving company dates:", error);
    throw new Error("Failed to process company data");
  }
};

const AppProviderContent: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newlyCreatedCompanyName, setNewlyCreatedCompanyName] = useState<
    string | null
  >(null);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  // Ajout des états pour le plan et le code d'activation
  const [plan, setPlan] = useState<string>("freemium");
  const [activationCode, setActivationCode] = useState<string>("");

  // ✅ SIMPLIFICATION: État de chargement plus simple
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAutoReadEnabled, setIsAutoReadEnabled] = useState<boolean>(() => {
    const storedAutoRead = localStorage.getItem("aiHelpDeskAutoRead");
    return storedAutoRead ? JSON.parse(storedAutoRead) : true;
  });

  const userRef = useRef(user);
  userRef.current = user;

  const authStateLoading = useRef(false);
  const authTimeout = useRef<NodeJS.Timeout | null>(null);

  // Suppression de la logique i18n, tout est en français statique

  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent");
    if (storedConsent === "true") {
      setConsentGiven(true);
    }
  }, []);

  // ✅ OPTIMISATION: Authentification simplifiée
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log(`🔑 Auth event: ${event}`, session?.user?.id || "no user");

      // Cas de déconnexion
      if (event === "SIGNED_OUT" || !session?.user) {
        console.log("🚪 User signed out");
        setUser(null);
        setCompany(null);
        setTickets([]);
        setAllUsers([]);
        setIsLoading(false);
        return;
      }

      // Éviter les rechargements sur TOKEN_REFRESHED
      if (event === "TOKEN_REFRESHED" && userRef.current) {
        console.log("🔄 Token refreshed, user already loaded");
        return;
      }

      // Charger les données seulement pour SIGNED_IN ou INITIAL_SESSION
      if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") {
        return;
      }

      // ✅ Protection contre les appels multiples
      if (authStateLoading.current) {
        console.log("⏸️ Auth already in progress, skipping");
        return;
      }

      authStateLoading.current = true;
      setIsLoading(true);

      // Timeout réduit
      const authTimeout = setTimeout(() => {
        console.error("⏰ Auth timeout, stopping");
        authStateLoading.current = false;
        setIsLoading(false);
      }, 15000); // 15 secondes

      try {
        console.log("🔍 Fetching user data...");
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError || !userProfile) {
          throw new Error(
            `Failed to fetch user profile: ${profileError?.message}`
          );
        }

        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("name", userProfile.company_id)
          .single();

        if (companyError || !companyData) {
          throw new Error(
            `Failed to fetch company data: ${companyError?.message}`
          );
        }

        const [usersResponse, ticketsResponse] = await Promise.all([
          supabase
            .from("users")
            .select("*")
            .eq("company_id", userProfile.company_id),
          supabase
            .from("tickets")
            .select("*")
            .eq("company_id", userProfile.company_id),
        ]);

        if (usersResponse.error)
          throw new Error(
            `Failed to fetch users: ${usersResponse.error.message}`
          );
        if (ticketsResponse.error)
          throw new Error(
            `Failed to fetch tickets: ${ticketsResponse.error.message}`
          );

        if (mounted) {
          setUser(userProfile);
          setCompany(reviveCompanyDates(companyData));
          setAllUsers(usersResponse.data || []);
          setTickets(
            ticketsResponse.data
              ? ticketsResponse.data.map(reviveTicketDates)
              : []
          );
          console.log("✅ All data loaded successfully.");
        }
      } catch (error) {
        console.error("💥 Auth error:", error);
        setUser(null);
        setCompany(null);
        setTickets([]);
        setAllUsers([]);
      } finally {
        clearTimeout(authTimeout);
        authStateLoading.current = false;
        setIsLoading(false);
        console.log("🏁 Auth complete");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Suppression du changement de langue utilisateur, tout est en français

  useEffect(() => {
    localStorage.setItem(
      "aiHelpDeskAutoRead",
      JSON.stringify(isAutoReadEnabled)
    );
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
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Supabase login error:", error.message);
        return "Identifiants invalides.";
      }

      if (authData.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("company_id")
          .eq("id", authData.user.id)
          .single();

        if (profileError || !userProfile) {
          console.error("Could not fetch user profile:", profileError);
          await supabase.auth.signOut();
          return "Impossible de récupérer le profil utilisateur.";
        }

        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("id")
          .eq("name", userProfile.company_id)
          .single();

        if (companyError || !companyData) {
          console.error("Could not fetch company data:", companyError);
          await supabase.auth.signOut();
          return "Entreprise introuvable.";
        }

        if (userProfile.company_id !== companyName) {
          await supabase.auth.signOut();
          return "Le nom de l'entreprise ne correspond pas.";
        }
      } else {
        return "Identifiants invalides.";
      }

      return true;
    } catch (error: any) {
      console.error("Critical login error:", error);
      return "Une erreur inattendue est survenue. Veuillez réessayer.";
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
      plan?: Plan;
    }
  ): Promise<string | true> => {
    const { lang, role, companyName, plan } = options;

    try {
      if (role === UserRole.MANAGER) {
        const { error: createCompanyError } = await supabase
          .from("companies")
          .insert({ name: companyName, plan: plan || "freemium" });

        if (createCompanyError) {
          console.error("Error creating company:", createCompanyError);
          if (createCompanyError.code === "23505") {
            throw new Error("Ce nom d'entreprise est déjà utilisé.");
          }
          throw new Error("Impossible de créer l'entreprise.");
        }
        setNewlyCreatedCompanyName(companyName);
      } else {
        const { data: existingCompanyData, error: findCompanyError } =
          await supabase
            .from("companies")
            .select("id, plan")
            .eq("name", companyName)
            .single();

        if (findCompanyError || !existingCompanyData) {
          console.error("Error finding company:", findCompanyError);
          throw new Error("Entreprise introuvable : " + companyName);
        }

        if (
          role === UserRole.AGENT &&
          existingCompanyData.plan === "freemium"
        ) {
          const { count: agentCount, error: countError } = await supabase
            .from("users")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyName)
            .eq("role", UserRole.AGENT);

          if (countError) {
            console.error("Error counting agents:", countError);
            throw new Error("Erreur lors du comptage des agents.");
          }

          // ✅ Utiliser PLAN_LIMITS au lieu de hardcoder "3"
          const agentLimit =
            PLAN_LIMITS[existingCompanyData.plan as Plan]?.maxAgents || 1;

          if (agentCount !== null && agentCount >= agentLimit) {
            throw new Error(
              `Limite d'agents atteinte pour la formule ${existingCompanyData.plan}. Veuillez demander à votre manager de mettre à niveau.`
            );
          }
        }
      }

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: fullName,
              language_preference: lang,
              role: role,
              company_id: companyName,
            },
          },
        });

      if (signUpError) {
        console.error("Supabase signup error:", signUpError);
        if (
          signUpError.message.toLowerCase().includes("user already registered")
        ) {
          throw new Error("Cet email est déjà utilisé.");
        }
        throw new Error(signUpError.message || "Erreur lors de l'inscription.");
      }

      if (!signUpData.user) {
        throw new Error("Erreur lors de l'inscription.");
      }

      return true;
    } catch (e: any) {
      return e.message || "Erreur lors de l'inscription.";
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Déconnexion en cours...");

      setUser(null);
      setCompany(null);
      setTickets([]);
      setAllUsers([]);
      setNewlyCreatedCompanyName(null);
      setIsLoading(false);

      Object.keys(localStorage).forEach((key) => {
        if (key.includes("sb-") || key.includes("supabase")) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.includes("sb-") || key.includes("supabase")) {
          sessionStorage.removeItem(key);
        }
      });

      await supabase.auth.signOut();
      window.location.href = "/login";

      console.log("✅ Déconnexion terminée");
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
      window.location.href = "/login";
    }
  };

  // ✅ Fonction d'arrêt d'urgence
  const forceStopAllLoading = useCallback(() => {
    console.log("🚨 ARRÊT FORCÉ DE TOUS LES CHARGEMENTS");
    setIsLoading(false);
    setIsLoadingAi(false);
    authStateLoading.current = false;

    if (authTimeout.current) {
      clearTimeout(authTimeout.current);
      authTimeout.current = null;
    }

    setUser(null);
    setCompany(null);
    setTickets([]);
    setAllUsers([]);
  }, []);

  // ✅ Fonctions simplifiées (je garde seulement les essentielles pour l'exemple)
  const updateUserRole = async (
    userIdToUpdate: string,
    newRole: UserRole
  ): Promise<boolean | string> => {
    if (user?.role !== UserRole.MANAGER || !company) return false;

    if (newRole === UserRole.AGENT && company.plan) {
      const currentAgentCount = allUsers.filter(
        (u) => u.role === UserRole.AGENT
      ).length;

      // ✅ Utiliser PLAN_LIMITS au lieu de hardcoder "3"
      const agentLimit = PLAN_LIMITS[company.plan as Plan]?.maxAgents || 1;

      if (
        agentLimit !== Number.MAX_SAFE_INTEGER &&
        currentAgentCount >= agentLimit
      ) {
        return `Limite d'agents atteinte pour la formule ${company.plan}. Veuillez mettre à niveau pour ajouter plus d'agents.`;
      }
    }

    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userIdToUpdate);

    if (error) {
      console.error("Error updating user role:", error);
      return false;
    }
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userIdToUpdate ? { ...u, role: newRole } : u))
    );
    return true;
  };

  const deleteUserById = async (userId: string): Promise<void> => {
    if (user?.role !== UserRole.MANAGER) return;

    try {
      const { error } = await supabase.rpc("delete_user_by_manager", {
        user_id_to_delete: userId,
      });

      if (error) {
        console.error("Error deleting user via RPC:", error);
        alert(
          `Erreur lors de la suppression de l'utilisateur : ${error.message}`
        );
      } else {
        setAllUsers((prev) => prev.filter((u) => u.id !== userId));
        setTickets((prev) => {
          const ticketsAfterUserRemoval = prev.filter(
            (t) => t.user_id !== userId
          );
          return ticketsAfterUserRemoval.map((t) =>
            t.assigned_agent_id === userId
              ? { ...t, assigned_agent_id: undefined }
              : t
          );
        });
      }
    } catch (e: any) {
      console.error("Critical error calling delete user RPC:", e);
      alert(
        `Erreur critique lors de la suppression de l'utilisateur : ${e.message}`
      );
    }
  };

  const addTicket = async (
    ticketData: Omit<
      Ticket,
      | "id"
      | "created_at"
      | "updated_at"
      | "user_id"
      | "company_id"
      | "assigned_agent_id"
      | "internal_notes"
      | "current_appointment"
      | "assigned_ai_level"
      | "chat_history"
    >,
    initialChatHistory: ChatMessage[]
  ): Promise<Ticket | null | string> => {
    if (!user || !company) {
      console.error("User or company not found when creating ticket");
      return "Session utilisateur expirée. Veuillez vous reconnecter.";
    }

    if (company.plan === "freemium") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("company_id", company.name)
        .gte("created_at", startOfMonth.toISOString());

      if (error) {
        console.error("Error counting tickets:", error);
        return "Impossible de vérifier la limite de tickets. Veuillez réessayer.";
      } else if (count !== null && count >= 200) {
        return "Vous avez atteint la limite de 200 tickets/mois pour la formule Freemium. Veuillez passer à une formule supérieure.";
      }
    }

    const creatorUserId = user.id;

    try {
      const now = new Date();
      const newTicketData = {
        ...ticketData,
        user_id: creatorUserId,
        company_id: company.name,
        chat_history: initialChatHistory,
        assigned_ai_level: DEFAULT_AI_LEVEL,
        assigned_agent_id: undefined,
        internal_notes: [],
        current_appointment: undefined,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      const { data, error } = await supabase
        .from("tickets")
        .insert(newTicketData)
        .select()
        .single();

      if (error) {
        console.error("Error creating ticket:", error);
        return "Impossible de créer le ticket. Veuillez réessayer.";
      }

      const createdTicket = reviveTicketDates(data);
      setTickets((prevTickets) => [...prevTickets, createdTicket]);
      return createdTicket;
    } catch (error) {
      console.error("Critical error creating ticket:", error);
      return "Erreur critique lors de la création du ticket. Veuillez contacter le support.";
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
    else
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t))
      );
  };

  const deleteTicket = async (ticketId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticketId);
      if (error) {
        console.error("Error deleting ticket:", error);
        alert(`Erreur lors de la suppression du ticket : ${error.message}`);
      } else {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      }
    } catch (e: any) {
      console.error("Critical error deleting ticket:", e);
      alert(`Erreur critique lors de la suppression du ticket : ${e.message}`);
    }
  };

  const assignTicket = async (
    ticketId: string,
    agentId: string | null
  ): Promise<void> => {
    const ticketToUpdate = tickets.find((t) => t.id === ticketId);
    if (!ticketToUpdate) {
      console.error("Ticket not found:", ticketId);
      return;
    }

    if (user?.role !== "manager") {
      console.error("User not authorized to assign tickets");
      return;
    }

    let summaryMessage: ChatMessage | null = null;

    if (
      agentId &&
      (!ticketToUpdate.assigned_agent_id ||
        ticketToUpdate.assigned_agent_id !== agentId)
    ) {
      setIsLoadingAi(true);
      try {
        // getTicketSummary attend un type Locale, on force "fr"
        const summaryText = await getTicketSummary(ticketToUpdate, "fr");
        summaryMessage = {
          id: crypto.randomUUID(),
          sender: "system_summary",
          message: summaryText,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Error generating ticket summary:", error);
        summaryMessage = {
          id: crypto.randomUUID(),
          sender: "system_summary",
          message: "Impossible de générer le résumé du ticket.",
          timestamp: new Date(),
        };
      } finally {
        setIsLoadingAi(false);
      }
    }

    const updatedChatMessages = summaryMessage
      ? [...ticketToUpdate.chat_messages, summaryMessage]
      : ticketToUpdate.chat_messages;

    try {
      const { data, error } = await supabase
        .from("tickets")
        .update({
          assigned_agent_id: agentId || null,
          updated_at: new Date().toISOString(),
          chat_messages: updatedChatMessages,
        })
        .eq("id", ticketId)
        .select()
        .single();

      if (error) {
        console.error("Error assigning ticket:", error);
        alert("Impossible d'assigner le ticket. Veuillez réessayer.");
      } else {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t))
        );
      }
    } catch (error) {
      console.error("Critical error assigning ticket:", error);
      alert("Erreur critique lors de l'assignation du ticket.");
    }
  };

  const agentTakeTicket = async (ticketId: string): Promise<void> => {
    if (!user || user.role !== UserRole.AGENT) return;
    const { data, error } = await supabase
      .from("tickets")
      .update({
        assigned_agent_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .select()
      .single();

    if (error) {
      console.error("Agent could not take charge:", error);
    } else {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t))
      );
    }
  };

  const getAgents = (): User[] =>
    allUsers.filter((u) => u.role === UserRole.AGENT);
  const getAllUsers = (): User[] => allUsers;

  const sendAgentMessage = async (
    ticketId: string,
    agentMessageText: string
  ): Promise<void> => {
    if (
      !user ||
      (user.role !== UserRole.AGENT && user.role !== UserRole.MANAGER)
    )
      return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const agentMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "agent",
      message: agentMessageText,
      timestamp: new Date(),
      agentId: user.id,
    };
    const updated_chat_messages = [...ticket.chat_messages, agentMessage];
    const newStatus =
      ticket.status === TICKET_STATUS_KEYS.OPEN ||
      ticket.status === TICKET_STATUS_KEYS.RESOLVED
        ? TICKET_STATUS_KEYS.IN_PROGRESS
        : ticket.status;

    const { data, error } = await supabase
      .from("tickets")
      .update({
        chat_messages: updated_chat_messages,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error sending agent message:", error);
    else
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t))
      );
  };

  const addChatMessage = async (
    ticketId: string,
    userMessageText: string,
    onAiMessageAdded?: (aiMessage: ChatMessage) => void
  ) => {
    if (!user) return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      message: userMessageText,
      timestamp: new Date(),
    };
    const newStatus =
      ticket.status === TICKET_STATUS_KEYS.RESOLVED ||
      ticket.status === TICKET_STATUS_KEYS.CLOSED
        ? TICKET_STATUS_KEYS.IN_PROGRESS
        : ticket.status;

    let tempUpdatedChatMessages = [...ticket.chat_messages, userMessage];
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              chat_messages: tempUpdatedChatMessages,
              status: newStatus,
              updated_at: new Date(),
            }
          : t
      )
    );

    if (ticket.assigned_agent_id) {
      await supabase
        .from("tickets")
        .update({
          chat_messages: tempUpdatedChatMessages,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);
      return;
    }

    setIsLoadingAi(true);
    let finalChatMessages;
    try {
      const aiResponse = await getFollowUpHelpResponse(
        ticket.title,
        ticket.category,
        tempUpdatedChatMessages,
        ticket.assigned_ai_level,
        user.language_preference
      );
      const aiResponseMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        message: aiResponse.text,
        timestamp: new Date(),
      };
      finalChatMessages = [...tempUpdatedChatMessages, aiResponseMessage];
      if (onAiMessageAdded) onAiMessageAdded(aiResponseMessage);
    } catch (error: any) {
      console.error("Error getting AI follow-up response:", error);
      finalChatMessages = [
        ...tempUpdatedChatMessages,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          message: `Erreur lors de la réponse IA : ${
            error.message || "Inconnue"
          }`,
          timestamp: new Date(),
        },
      ];
    } finally {
      const { data, error } = await supabase
        .from("tickets")
        .update({
          chat_messages: finalChatMessages,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId)
        .select()
        .single();
      if (error) console.error("Error saving AI response:", error);
      else
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t))
        );
      setIsLoadingAi(false);
    }
  };

  const proposeOrUpdateAppointment = async (
    ticketId: string,
    details: Omit<AppointmentDetails, "proposed_by" | "proposed_at">,
    proposedBy: "agent" | "user",
    newStatus: string
  ): Promise<void> => {
    if (!user || !company || company.plan !== "pro") return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const newAppointment: AppointmentDetails = {
      date: details.date,
      time: details.time,
      location_method: details.location_method,
      proposed_by: proposedBy,
      proposed_at: new Date().toISOString(),
    };

    let chatMessageText = "";
    const apptDateStr = new Date(details.date).toLocaleDateString("fr-FR", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    if (newStatus === "pending_user_approval")
      chatMessageText = `Rendez-vous proposé le ${apptDateStr} à ${details.time} (${details.location_method})`;
    else if (newStatus === "confirmed")
      chatMessageText = `Rendez-vous confirmé le ${apptDateStr} à ${details.time} (${details.location_method})`;
    else if (newStatus === "rescheduled_by_user")
      chatMessageText = `Demande de replanification pour le ${apptDateStr} à ${details.time} (${details.location_method})`;

    const systemMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: proposedBy === "agent" ? "agent" : "user",
      agentId: proposedBy === "agent" ? user.id : undefined,
      message: chatMessageText,
      timestamp: new Date(),
    };
    const updatedChatMessages = chatMessageText
      ? [...ticket.chat_messages, systemMessage]
      : ticket.chat_messages;

    const { data, error } = await supabase
      .from("tickets")
      .update({
        appointment_details: newAppointment,
        chat_messages: updatedChatMessages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) console.error("Error proposing appointment:", error);
    else
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t))
      );
  };

  const getTicketById = useCallback(
    (ticketId: string) => tickets.find((t) => t.id === ticketId),
    [tickets]
  );

  const updateCompanyName = async (newName: string): Promise<boolean> => {
    if (
      !user ||
      user.role !== UserRole.MANAGER ||
      !user.company_id ||
      !company
    ) {
      return false;
    }
    const oldName = user.company_id;

    const { error: updateCompanyError } = await supabase
      .from("companies")
      .update({ name: newName })
      .eq("id", company.id);

    if (updateCompanyError) {
      console.error("Error updating company name:", updateCompanyError);
      alert(
        "Impossible de mettre à jour le nom de l'entreprise. Le nouveau nom est peut-être déjà pris."
      );
      return false;
    }

    const { error: updateUserError } = await supabase
      .from("users")
      .update({ company_id: newName })
      .eq("company_id", oldName);

    if (updateUserError) {
      console.error(
        "CRITICAL: Failed to update users' company_id. Data is now inconsistent.",
        updateUserError
      );
      await supabase
        .from("companies")
        .update({ name: oldName })
        .eq("id", company.id);
      alert(
        "Impossible de mettre à jour le nom de l'entreprise pour tous les utilisateurs. Le changement a été annulé."
      );
      return false;
    }

    const { error: updateTicketsError } = await supabase
      .from("tickets")
      .update({ company_id: newName })
      .eq("company_id", oldName);

    if (updateTicketsError) {
      console.error(
        "CRITICAL: Failed to update tickets' company_id.",
        updateTicketsError
      );
      alert(
        "ERREUR CRITIQUE : Impossible de mettre à jour le nom de l'entreprise sur les tickets. Veuillez contacter le support."
      );
    }

    setUser((prevUser) =>
      prevUser ? { ...prevUser, company_id: newName } : null
    );
    setCompany((prevCompany) =>
      prevCompany ? { ...prevCompany, name: newName } : null
    );
    setAllUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.company_id === oldName ? { ...u, company_id: newName } : u
      )
    );
    setTickets((prevTickets) =>
      prevTickets.map((t) =>
        t.company_id === oldName ? { ...t, company_id: newName } : t
      )
    );

    return true;
  };

  const updateCompanyPlan = async (plan: Plan): Promise<boolean> => {
    if (!company) {
      alert(
        "Impossible de trouver les informations de l'entreprise à mettre à jour."
      );
      return false;
    }

    const { error } = await supabase
      .from("companies")
      .update({ plan: plan, subscription_id: null })
      .eq("id", company.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating company plan:", error);
      alert(
        "Impossible de mettre à jour votre abonnement. Veuillez contacter le support."
      );
      return false;
    }

    setCompany((prevCompany) =>
      prevCompany ? { ...prevCompany, plan, subscription_id: undefined } : null
    );
    alert("Votre abonnement a été mis à jour avec succès !");
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        company,
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
        updateCompanyPlan,
        consentGiven,
        giveConsent,
        forceStopAllLoading,
        plan,
        setPlan,
        activationCode,
        setActivationCode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
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

  if (isLoading || !user || (allowedRoles && !allowedRoles.includes(user.role)))
    return null;

  return <>{children}</>;
};

const MainAppContent: React.FC = () => {
  const { user, isLoading, consentGiven, giveConsent, forceStopAllLoading } =
    useApp();
  // Suppression de la logique i18n
  const navigate = useNavigate();
  const location = useLocation();

  const forceStopLoadingNow = useCallback(() => {
    console.warn("🚨 ARRÊT IMMÉDIAT DU LOADING");
    forceStopAllLoading();

    Object.keys(localStorage).forEach((key) => {
      if (key.includes("sb-") || key.includes("supabase")) {
        localStorage.removeItem(key);
      }
    });

    window.location.href = "/login";
  }, [forceStopAllLoading]);

  const forceUnlockAuth = useCallback(() => {
    console.warn("🚨 DÉBLOCAGE FORCÉ - Navigation vers login");
    navigate("/login", { replace: true });
  }, [navigate]);

  // ✅ SUPPRESSION COMPLÈTE DU SPINNER
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {"Nexus Help Desk"}
            </h1>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Application:</span>
                <span
                  className={isLoading ? "text-amber-600" : "text-green-600"}
                >
                  {isLoading ? "⏳ Chargement..." : "✅ Prêt"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Traductions:</span>
                <span
                  className={isLoading ? "text-amber-600" : "text-green-600"}
                >
                  {isLoading ? "⏳ Chargement..." : "✅ Prêt"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Utilisateur:</span>
                <span className={user ? "text-green-600" : "text-red-600"}>
                  {user ? "✅ Connecté" : "❌ Non connecté"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Environnement:</span>
                <span className="text-blue-600">
                  {import.meta.env.MODE || "dev"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {isLoading && (
                <>
                  <button
                    onClick={forceStopLoadingNow}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors"
                  >
                    🚨 ARRÊT IMMÉDIAT
                  </button>
                  <button
                    onClick={forceUnlockAuth}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                  >
                    🔄 Aller au Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
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

      <Route
        path="/subscribe"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}
          >
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
          <ProtectedRoute
            allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}
          >
            <HelpChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ticket/new"
        element={
          <ProtectedRoute
            allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}
          >
            <NewTicketPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ticket/:ticketId"
        element={
          <ProtectedRoute
            allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}
          >
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

  const noLayoutPages = ["/login", "/signup", "/landing"];
  const specialLayoutPages = ["/legal", "/manual", "/presentation", "/contact"];

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
    <>
      <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          {renderRoutes()}
        </main>
        <footer className="bg-slate-100 py-4 text-center text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {"Nexus Support Hub"}.{" "}
            {"Tous droits réservés."}
          </p>
          <p className="mt-1">
            <Link to="/legal" className="hover:text-primary hover:underline">
              {"Mentions légales & Documentation"}
            </Link>
            <span className="mx-2 text-slate-400">|</span>
            <Link to="/manual" className="hover:text-primary hover:underline">
              {"Manuel utilisateur"}
            </Link>
            <span className="mx-2 text-slate-400">|</span>
            <Link
              to="/presentation"
              className="hover:text-primary hover:underline"
            >
              {"Présentation"}
            </Link>
          </p>
        </footer>
      </div>

      <ContextDebugger />
    </>
  );
};

function App() {
  return (
    <SidebarProvider>
      <AppProvider>
        <PlanProvider>
          <Router>
            <MainAppContent />
          </Router>
        </PlanProvider>
      </AppProvider>
    </SidebarProvider>
  );
}

export default App;

// Toutes les fonctions utilisent déjà translateHook (alias t) pour les messages d'erreur et feedback utilisateur.
// Vérification des clés modulaires :
// login.error.invalidCredentials, login.error.profileFetchFailed, login.error.companyNotFound, login.error.companyIdMismatch, login.error.generic
// signup.error.companyNameTaken, signup.error.companyCreateFailed, signup.error.companyNotFound, signup.error.agentLimitReached, signup.error.emailInUse, signup.error.generic
// managerDashboard.error.agentLimitReached, managerDashboard.deleteUserError.rpc, managerDashboard.deleteUserError.critical, newTicket.error.userNotFound, newTicket.error.countingTickets, newTicket.error.ticketLimitReached, newTicket.error.createFailed, newTicket.error.critical
// managerDashboard.deleteTicketError.rpc, managerDashboard.deleteTicketError.critical, managerDashboard.error.assignTicketFailed, managerDashboard.error.assignTicketCritical
// appContext.error.summaryGenerationFailed
// Toutes ces clés doivent exister dans les fichiers de traduction modulaires.

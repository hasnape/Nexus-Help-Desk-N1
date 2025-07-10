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
import UserManualPage from "./pages/UserManualPage";
import PromotionalPage from "./pages/PromotionalPage";
import LandingPage from "./pages/LandingPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ContactPage from "./pages/ContactPage";
import {
  DEFAULT_AI_LEVEL,
  DEFAULT_USER_ROLE,
  TICKET_STATUS_KEYS,
} from "./constants";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import LoadingSpinner from "./components/LoadingSpinner";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { SidebarProvider } from "./contexts/SidebarContext";
import { PlanProvider } from "./contexts/PlanContext";
import { useNavigationGuard } from "./hooks/useNavigationGuard";
import ContextDebugger from "./components/ContextDebugger";

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
    details: Omit<AppointmentDetails, "proposedBy" | "id" | "history">,
    proposedBy: "agent" | "user",
    newStatus: AppointmentDetails["status"]
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
  updateCompanyPlan: (plan: Plan) => Promise<boolean>; // ✅ BUG FIX #1: Ajout de la propriété manquante
  consentGiven: boolean;
  giveConsent: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ✅ BUG FIX #2: Amélioration de la validation des données
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

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAutoReadEnabled, setIsAutoReadEnabled] = useState<boolean>(() => {
    const storedAutoRead = localStorage.getItem("aiHelpDeskAutoRead");
    return storedAutoRead ? JSON.parse(storedAutoRead) : true;
  });

  // ✅ FIX: Utiliser une ref pour l'utilisateur afin d'éviter les re-souscriptions
  const userRef = useRef(user);
  userRef.current = user;

  const authStateLoading = useRef(false);
  const authTimeout = useRef<NodeJS.Timeout | null>(null); // ✅ AJOUT

  const {
    language,
    setLanguage: setAppLanguage,
    t: translateHook,
  } = useLanguage();

  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent");
    if (storedConsent === "true") {
      setConsentGiven(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let authInProgress = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || authInProgress) return;

      console.log(`🔑 Auth event: ${event}`, session?.user?.id || "no user");

      // Cas de déconnexion simple
      if (event === "SIGNED_OUT" || !session?.user) {
        console.log("🚪 User signed out");
        setUser(null);
        setCompany(null);
        setTickets([]);
        setAllUsers([]);
        setIsLoading(false);
        return;
      }

      // Éviter les rechargements sur TOKEN_REFRESHED si déjà connecté
      if (event === "TOKEN_REFRESHED" && userRef.current) {
        console.log("🔄 Token refreshed, user already loaded");
        setIsLoading(false);
        return;
      }

      // Charger les données seulement pour SIGNED_IN ou INITIAL_SESSION
      if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") {
        return;
      }

      authInProgress = true;
      setIsLoading(true);

      // Timeout plus long et pas de timeout d'urgence concurrent
      const authTimeout = setTimeout(() => {
        console.error("⏰ Auth vraiment trop long, arrêt forcé");
        setIsLoading(false);
        authInProgress = false;
      }, 120000); // 2 minutes

      try {
        console.log("🔍 Fetching user data...");
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError || !userProfile) {
          throw new Error(
            `Failed to fetch user profile: ${JSON.stringify(
              profileError,
              null,
              2
            )}`
          );
        }
        console.log("✅ User profile loaded:", userProfile.id);

        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("name", userProfile.company_id)
          .single();

        if (companyError || !companyData) {
          throw new Error(
            `Failed to fetch company data: ${JSON.stringify(
              companyError,
              null,
              2
            )}`
          );
        }
        console.log("✅ Company loaded:", companyData.name);

        console.log("⏳ Fetching all users and tickets for the company...");
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
            `Failed to fetch users: ${JSON.stringify(
              usersResponse.error,
              null,
              2
            )}`
          );
        if (ticketsResponse.error)
          throw new Error(
            `Failed to fetch tickets: ${JSON.stringify(
              ticketsResponse.error,
              null,
              2
            )}`
          );

        // Toutes les données sont chargées, on met à jour l'état
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
        await supabase.auth.signOut();
      } finally {
        clearTimeout(authTimeout);
        setIsLoading(false);
        authInProgress = false;
        console.log("🏁 Auth complete");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Pas de dépendances pour éviter les re-souscriptions

  useEffect(() => {
    if (user?.language_preference && user.language_preference !== language) {
      if (company?.plan === "pro") {
        setAppLanguage(user.language_preference);
      }
    }
  }, [user, company, language, setAppLanguage]);

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

  // ✅ BUG FIX #3: Amélioration de la gestion d'erreurs dans login
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
        return translateHook("login.error.invalidCredentials");
      }

      if (authData.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("company_id")
          .eq("id", authData.user.id)
          .single();

        if (profileError || !userProfile) {
          console.error(
            "Could not fetch user profile for company verification:",
            JSON.stringify(profileError, null, 2)
          );
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
    } catch (error: any) {
      console.error("Critical login error:", error);
      return translateHook("login.error.generic", {
        default: "An unexpected error occurred. Please try again.",
      });
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
          console.error(
            "Error creating company:",
            JSON.stringify(createCompanyError, null, 2)
          );
          if (createCompanyError.code === "23505") {
            throw new Error(translateHook("signup.error.companyNameTaken"));
          }
          throw new Error(translateHook("signup.error.companyCreateFailed"));
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
          console.error(
            "Error finding company or company not found:",
            JSON.stringify(findCompanyError, null, 2)
          );
          throw new Error(
            translateHook("signup.error.companyNotFound", { companyName })
          );
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
            console.error(
              "Error counting agents:",
              JSON.stringify(countError, null, 2)
            );
            throw new Error(translateHook("signup.error.generic"));
          }

          if (agentCount !== null && agentCount >= 3) {
            throw new Error(
              translateHook("signup.error.agentLimitReached", {
                default:
                  "Agent limit reached for Freemium plan. Please ask your manager to upgrade.",
              })
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
        console.error(
          "Supabase signup error:",
          JSON.stringify(signUpError, null, 2)
        );
        if (
          signUpError.message.toLowerCase().includes("user already registered")
        ) {
          throw new Error(translateHook("signup.error.emailInUse"));
        }
        throw new Error(
          signUpError.message || translateHook("signup.error.generic")
        );
      }

      if (!signUpData.user) {
        throw new Error(translateHook("signup.error.generic"));
      }

      return true;
    } catch (e: any) {
      return e.message || translateHook("signup.error.generic");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCompany(null);
    setNewlyCreatedCompanyName(null);
  };

  const updateUserRole = async (
    userIdToUpdate: string,
    newRole: UserRole
  ): Promise<boolean | string> => {
    if (user?.role !== UserRole.MANAGER || !company) return false;

    if (newRole === UserRole.AGENT && company.plan === "freemium") {
      const currentAgentCount = allUsers.filter(
        (u) => u.role === UserRole.AGENT
      ).length;
      if (currentAgentCount >= 3) {
        return translateHook("managerDashboard.error.agentLimitReached", {
          default:
            "Agent limit reached for Freemium plan. Please upgrade to add more agents.",
        });
      }
    }

    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userIdToUpdate);

    if (error) {
      console.error(
        "Error updating user role:",
        JSON.stringify(error, null, 2)
      );
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
        console.error(
          "Error deleting user via RPC:",
          JSON.stringify(error, null, 2)
        );
        alert(
          translateHook("managerDashboard.deleteUserError.rpc", {
            message: error.message,
          })
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
      console.error(
        "Critical error calling delete user RPC:",
        JSON.stringify(e, null, 2)
      );
      alert(
        translateHook("managerDashboard.deleteUserError.critical", {
          message: e.message,
        })
      );
    }
  };

  // ✅ BUG FIX #4: Amélioration de la gestion d'erreurs dans addTicket
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
      return translateHook("newTicket.error.userNotFound", {
        default: "User session expired. Please log in again.",
      });
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
        console.error(
          "Error counting tickets:",
          JSON.stringify(error, null, 2)
        );
        return translateHook("newTicket.error.countingTickets", {
          default: "Unable to verify ticket limits. Please try again.",
        });
      } else if (count !== null && count >= 200) {
        return translateHook("newTicket.error.ticketLimitReached", {
          default:
            "You have reached the 200 tickets/month limit for the Freemium plan. Please upgrade.",
        });
      }
    }

    const creatorUserId = user.id;
    setIsLoading(true);

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
        console.error("Error creating ticket:", JSON.stringify(error, null, 2));
        return translateHook("newTicket.error.createFailed", {
          default: "Failed to create ticket. Please try again.",
        });
      }

      const createdTicket = reviveTicketDates(data);
      setTickets((prevTickets) => [...prevTickets, createdTicket]);
      return createdTicket;
    } catch (error) {
      console.error(
        "Critical error creating ticket:",
        JSON.stringify(error, null, 2)
      );
      return translateHook("newTicket.error.critical", {
        default: "A critical error occurred. Please contact support.",
      });
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
    if (error)
      console.error(
        "Error updating ticket status:",
        JSON.stringify(error, null, 2)
      );
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
        console.error("Error deleting ticket:", JSON.stringify(error, null, 2));
        alert(
          translateHook("managerDashboard.deleteTicketError.rpc", {
            message: error.message,
          })
        );
      } else {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      }
    } catch (e: any) {
      console.error(
        "Critical error deleting ticket:",
        JSON.stringify(e, null, 2)
      );
      alert(
        translateHook("managerDashboard.deleteTicketError.critical", {
          message: e.message,
        })
      );
    }
  };

  // ✅ BUG FIX #5: Amélioration de la gestion d'erreurs dans assignTicket
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
        const summaryText = await getTicketSummary(ticketToUpdate, language);
        summaryMessage = {
          id: crypto.randomUUID(),
          sender: "system_summary",
          text: summaryText,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error(
          "Error generating ticket summary:",
          JSON.stringify(error, null, 2)
        );
        summaryMessage = {
          id: crypto.randomUUID(),
          sender: "system_summary",
          text: translateHook("appContext.error.summaryGenerationFailed", {
            default: "Failed to generate ticket summary.",
          }),
          timestamp: new Date(),
        };
      } finally {
        setIsLoadingAi(false);
      }
    }

    const updatedChatHistory = summaryMessage
      ? [...ticketToUpdate.chat_history, summaryMessage]
      : ticketToUpdate.chat_history;

    try {
      const { data, error } = await supabase
        .from("tickets")
        .update({
          assigned_agent_id: agentId || null,
          updated_at: new Date().toISOString(),
          chat_history: updatedChatHistory,
        })
        .eq("id", ticketId)
        .select()
        .single();

      if (error) {
        console.error(
          "Error assigning ticket:",
          JSON.stringify(error, null, 2)
        );
        alert(
          translateHook("managerDashboard.error.assignTicketFailed", {
            default: "Failed to assign ticket. Please try again.",
          })
        );
      } else {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t))
        );
      }
    } catch (error) {
      console.error("Critical error assigning ticket:", error);
      alert(
        translateHook("managerDashboard.error.assignTicketCritical", {
          default: "A critical error occurred while assigning the ticket.",
        })
      );
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
      console.error(
        "Agent could not take charge:",
        JSON.stringify(error, null, 2)
      );
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
      text: agentMessageText,
      timestamp: new Date(),
      agentId: user.id,
    };
    const updated_chat_history = [...ticket.chat_history, agentMessage];
    const newStatus =
      ticket.status === TICKET_STATUS_KEYS.OPEN ||
      ticket.status === TICKET_STATUS_KEYS.RESOLVED
        ? TICKET_STATUS_KEYS.IN_PROGRESS
        : ticket.status;

    const { data, error } = await supabase
      .from("tickets")
      .update({
        chat_history: updated_chat_history,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .select()
      .single();
    if (error)
      console.error(
        "Error sending agent message:",
        JSON.stringify(error, null, 2)
      );
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
      text: userMessageText,
      timestamp: new Date(),
    };
    const newStatus =
      ticket.status === TICKET_STATUS_KEYS.RESOLVED ||
      ticket.status === TICKET_STATUS_KEYS.CLOSED
        ? TICKET_STATUS_KEYS.IN_PROGRESS
        : ticket.status;

    let tempUpdatedChatHistory = [...ticket.chat_history, userMessage];
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              chat_history: tempUpdatedChatHistory,
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
          chat_history: tempUpdatedChatHistory,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);
      return;
    }

    setIsLoadingAi(true);
    let finalChatHistory;
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
      console.error(
        "Error getting AI follow-up response:",
        JSON.stringify(error, null, 2)
      );
      finalChatHistory = [
        ...tempUpdatedChatHistory,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: translateHook("appContext.error.aiFollowUpFailed", {
            error: error.message || "Unknown",
          }),
          timestamp: new Date(),
        },
      ];
    } finally {
      const { data, error } = await supabase
        .from("tickets")
        .update({
          chat_history: finalChatHistory,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId)
        .select()
        .single();
      if (error)
        console.error(
          "Error saving AI response:",
          JSON.stringify(error, null, 2)
        );
      else
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? reviveTicketDates(data) : t))
        );
      setIsLoadingAi(false);
    }
  };

  const proposeOrUpdateAppointment = async (
    ticketId: string,
    details: Omit<AppointmentDetails, "proposedBy" | "id" | "history">,
    proposedBy: "agent" | "user",
    newStatus: AppointmentDetails["status"]
  ): Promise<void> => {
    if (!user || !company || company.plan !== "pro") return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const newAppointment: AppointmentDetails = {
      ...details,
      id: crypto.randomUUID(),
      proposedBy: proposedBy,
      status: newStatus,
      history: ticket.current_appointment
        ? [
            ...(ticket.current_appointment.history || []),
            ticket.current_appointment,
          ]
        : [],
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
      chatMessageText = translateHook(
        "appointment.chat.userRequestsReschedule",
        { date: apptDateStr, time: proposedTime, location: locationOrMethod }
      );

    const systemMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: proposedBy === "agent" ? "agent" : "user",
      agentId: proposedBy === "agent" ? user.id : undefined,
      text: chatMessageText,
      timestamp: new Date(),
    };
    const updatedChatHistory = chatMessageText
      ? [...ticket.chat_history, systemMessage]
      : ticket.chat_history;

    const { data, error } = await supabase
      .from("tickets")
      .update({
        current_appointment: newAppointment,
        chat_history: updatedChatHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .select()
      .single();
    if (error)
      console.error(
        "Error proposing appointment:",
        JSON.stringify(error, null, 2)
      );
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
      console.error(
        "Error updating company name:",
        JSON.stringify(updateCompanyError, null, 2)
      );
      alert(
        translateHook("managerDashboard.companyInfo.updateError", {
          default: `Failed to update company name. The new name might be taken.`,
        })
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
        JSON.stringify(updateUserError, null, 2)
      );
      await supabase
        .from("companies")
        .update({ name: oldName })
        .eq("id", company.id);
      alert(
        translateHook("managerDashboard.companyInfo.updateError", {
          default: `Failed to update company name for all users. The change has been rolled back.`,
        })
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
        JSON.stringify(updateTicketsError, null, 2)
      );
      alert(
        translateHook("managerDashboard.companyInfo.updateError", {
          default: `CRITICAL ERROR: Failed to update company name on tickets. Please contact support.`,
        })
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

  // ✅ BUG FIX #6: Ajout de l'implémentation manquante updateCompanyPlan
  const updateCompanyPlan = async (plan: Plan): Promise<boolean> => {
    if (!company) {
      alert(
        translateHook("subscription.error.noCompany", {
          default: "Could not find company information to update.",
        })
      );
      return false;
    }

    const { data, error } = await supabase
      .from("companies")
      .update({ plan: plan, subscription_id: null })
      .eq("id", company.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Error updating company plan:",
        JSON.stringify(error, null, 2)
      );
      alert(
        translateHook("subscription.error.updateFailed", {
          default:
            "Failed to update your subscription. Please contact support.",
        })
      );
      return false;
    }

    setCompany((prevCompany) =>
      prevCompany ? { ...prevCompany, plan, subscription_id: undefined } : null
    );
    alert(
      translateHook("subscription.success.updateComplete", {
        default: "Your subscription has been successfully updated!",
      })
    );
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
        newlyCreatedCompanyName: newlyCreatedCompanyName,
        setNewlyCreatedCompanyName: setNewlyCreatedCompanyName,
        updateCompanyName,
        updateCompanyPlan, // ✅ BUG FIX #7: Export manquant ajouté
        consentGiven,
        giveConsent,
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
  // ✅ CORRECTION : Ajout des parenthèses manquantes
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
  const { user, isLoading, consentGiven, giveConsent } = useApp();
  const { isLoadingLang, t, forceResolveLoading } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ FIX: Déplacer tous les hooks au début

  // ✅ FIX: Bouton d'urgence pour débloquer l'authentification - sans rechargement forcé
  const forceUnlockAuth = useCallback(() => {
    console.warn("🚨 DÉBLOCAGE FORCÉ - Navigation vers login");
    navigate("/login", { replace: true });
  }, [navigate]);

  // ✅ FIX: Gérer les timeouts auth de manière plus sûre
  useEffect(() => {
    if (isLoading) {
      const emergencyTimeout = setTimeout(() => {
        console.error("⏰ TIMEOUT EMERGENCY - Déblocage automatique");
        forceUnlockAuth();
      }, 90000); // ✅ CHANGÉ: 90 secondes au lieu de 15

      return () => clearTimeout(emergencyTimeout);
    }
  }, [isLoading, forceUnlockAuth]);

  // ✅ FIX: Loader avec timeouts réduits et pas de rechargement forcé
  if (isLoading || isLoadingLang) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <LoadingSpinner size="lg" text={t("appName") + "..."} />
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 p-2 rounded">
          <div>App: {isLoading ? "⏳ Chargement..." : "✅ Prêt"}</div>
          <div>Lang: {isLoadingLang ? "⏳ Traductions..." : "✅ Prêt"}</div>
          <div>User: {user ? "✅ Connecté" : "❌ Non connecté"}</div>
          <div>Env: {import.meta.env.MODE || "dev"}</div>

          {/* ✅ Boutons d'urgence sans rechargement */}
          <div className="mt-2 space-y-1">
            {isLoadingLang && (
              <button
                onClick={forceResolveLoading}
                className="block w-full px-2 py-1 bg-blue-500 text-white text-xs rounded"
              >
                🔧 Débloquer Traductions
              </button>
            )}
            {isLoading && (
              <button
                onClick={forceUnlockAuth}
                className="block w-full px-2 py-1 bg-red-500 text-white text-xs rounded"
              >
                🚨 Aller au Login
              </button>
            )}
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
            &copy; {new Date().getFullYear()} {t("appName")}.{" "}
            {t("footer.allRightsReserved", { default: "All Rights Reserved." })}
          </p>
          <p className="mt-1">
            <Link to="/legal" className="hover:text-primary hover:underline">
              {t("footer.legalLink", { default: "Legal & Documentation" })}
            </Link>
            <span className="mx-2 text-slate-400">|</span>
            <Link to="/manual" className="hover:text-primary hover:underline">
              {t("footer.userManualLink", { default: "User Manual" })}
            </Link>
            <span className="mx-2 text-slate-400">|</span>
            <Link
              to="/presentation"
              className="hover:text-primary hover:underline"
            >
              {t("footer.promotionalLink", { default: "Presentation" })}
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
    <LanguageProvider>
      <SidebarProvider>
        <AppProvider>
          <PlanProvider>
            <Router>
              <MainAppContent />
            </Router>
          </PlanProvider>
        </AppProvider>
      </SidebarProvider>
    </LanguageProvider>
  );
}

export default App;

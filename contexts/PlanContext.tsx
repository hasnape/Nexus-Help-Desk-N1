import React, { createContext, useContext, ReactNode } from "react";
import { Plan, UserRole } from "../types";
import { useApp } from "../App";
import { useLanguage } from "./LanguageContext";

// Définition des limites pour chaque plan
export interface PlanLimits {
  maxAgents: number;
  maxTicketsPerMonth: number;
  hasAdvancedTicketManagement: boolean;
  hasVoiceFeatures: boolean;
  hasAppointmentScheduling: boolean;
  hasDetailedReports: boolean;
  hasPrioritySupport: boolean;
  hasUnlimitedTickets: boolean;
  hasInternalNotes: boolean;
  hasTicketAssignment: boolean;
  aiLevel: 1 | 2; // Niveau d'IA disponible
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  freemium: {
    maxAgents: 5, // 🎁 +67% (était 3)
    maxTicketsPerMonth: 1000, // 🎁 +400% (était 200)
    hasAdvancedTicketManagement: true, // 🎁 NOUVEAU: Feature premium gratuite
    hasVoiceFeatures: false,
    hasAppointmentScheduling: false,
    hasDetailedReports: false,
    hasPrioritySupport: false,
    hasUnlimitedTickets: false,
    hasInternalNotes: true, // 🎁 NOUVEAU: Essentiel gratuit
    hasTicketAssignment: true, // 🎁 NOUVEAU: Essentiel gratuit
    aiLevel: 1,
  },
  standard: {
    maxAgents: Number.MAX_SAFE_INTEGER, // 🚀 ILLIMITÉ (vs 10)
    maxTicketsPerMonth: Number.MAX_SAFE_INTEGER, // 🚀 ILLIMITÉ (vs 1000)
    hasAdvancedTicketManagement: true,
    hasVoiceFeatures: true,
    hasAppointmentScheduling: true,
    hasDetailedReports: false,
    hasPrioritySupport: true, // 🚀 NOUVEAU
    hasUnlimitedTickets: true, // 🚀 NOUVEAU
    hasInternalNotes: true,
    hasTicketAssignment: true,
    aiLevel: 1,
  },
  pro: {
    maxAgents: Number.MAX_SAFE_INTEGER,
    maxTicketsPerMonth: Number.MAX_SAFE_INTEGER,
    hasAdvancedTicketManagement: true,
    hasVoiceFeatures: true,
    hasAppointmentScheduling: true,
    hasDetailedReports: true,
    hasPrioritySupport: true,
    hasUnlimitedTickets: true,
    hasInternalNotes: true,
    hasTicketAssignment: true,
    aiLevel: 2,
  },
};

interface PlanContextType {
  currentPlan: Plan;
  planLimits: PlanLimits;
  canCreateTicket: () => boolean;
  canAddAgent: () => boolean;
  getTicketsUsedThisMonth: () => number;
  getAgentsCount: () => number;
  isFeatureAvailable: (feature: keyof PlanLimits) => boolean;
  upgradeRequired: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};

// ✅ NOUVEAU Hook sécurisé
export const usePlanSafe = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    console.warn("usePlanSafe: Utilisé en dehors de PlanProvider");
    return {
      currentPlan: "freemium" as Plan,
      planLimits: PLAN_LIMITS.freemium,
      canCreateTicket: () => false,
      canAddAgent: () => false,
      getTicketsUsedThisMonth: () => 0,
      getAgentsCount: () => 0,
      isFeatureAvailable: () => false,
      upgradeRequired: true,
    };
  }
  return context;
};

interface PlanProviderProps {
  children: ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  // Déplacer useApp ici, dans le composant, pas au niveau du module
  const { company, tickets, getAllUsers } = useApp();
  const { t } = useLanguage();

  const currentPlan: Plan = company?.plan || "freemium";
  const planLimits = PLAN_LIMITS[currentPlan];

  const getTicketsUsedThisMonth = (): number => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return tickets.filter((ticket) => ticket.created_at >= startOfMonth).length;
  };

  const getAgentsCount = (): number => {
    return getAllUsers().filter(
      (user) => user.role === UserRole.AGENT || user.role === UserRole.MANAGER
    ).length;
  };

  const canCreateTicket = (): boolean => {
    if (planLimits.hasUnlimitedTickets) return true;
    return getTicketsUsedThisMonth() < planLimits.maxTicketsPerMonth;
  };

  const canAddAgent = (): boolean => {
    if (planLimits.maxAgents === Number.MAX_SAFE_INTEGER) return true;
    return getAgentsCount() < planLimits.maxAgents;
  };

  const isFeatureAvailable = (feature: keyof PlanLimits): boolean => {
    const featureValue = planLimits[feature];
    if (typeof featureValue === "boolean") {
      return featureValue;
    }
    return true; // Pour les valeurs numériques, on considère qu'elles sont disponibles
  };

  const upgradeRequired =
    !canCreateTicket() || !canAddAgent() || currentPlan === "freemium";

  const contextValue: PlanContextType = {
    currentPlan,
    planLimits,
    canCreateTicket,
    canAddAgent,
    getTicketsUsedThisMonth,
    getAgentsCount,
    isFeatureAvailable,
    upgradeRequired,
  };

  return (
    <PlanContext.Provider value={contextValue}>{children}</PlanContext.Provider>
  );
};

// Hook pour obtenir le nom du plan traduit
export const usePlanName = () => {
  const { currentPlan } = usePlan();
  const { t } = useLanguage();

  const planNames = {
    freemium: t("plans.freemium.name", { default: "Freemium" }),
    standard: t("plans.standard.name", { default: "Standard" }),
    pro: t("plans.pro.name", { default: "Pro" }),
  };

  return planNames[currentPlan];
};

// Hook pour obtenir la description du plan traduite
export const usePlanDescription = () => {
  const { currentPlan } = usePlan();
  const { t } = useLanguage();

  const planDescriptions = {
    freemium: t("plans.freemium.description", {
      default: "Plan gratuit avec fonctionnalités de base",
    }),
    standard: t("plans.standard.description", {
      default: "Plan standard avec fonctionnalités avancées",
    }),
    pro: t("plans.pro.description", {
      default: "Plan professionnel avec toutes les fonctionnalités",
    }),
  };

  return planDescriptions[currentPlan];
};

import React, { createContext, useContext, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plan, UserRole } from "../types";
import { useApp } from "../App";

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
  getTicketsUsedThisMonth: () => number;
  getAgentsCount: () => number;
  checkFeatureAccess: (feature: keyof PlanLimits) => boolean;
  isOverTicketLimit: () => boolean;
  isOverAgentLimit: () => number;
  isNearTicketLimit: (threshold?: number) => boolean;
  isNearAgentLimit: (threshold?: number) => boolean;
  getPlanDescription: () => string;
  canCreateTicket: () => boolean;
  canAddAgent: () => boolean;
  getUsagePercentage: (type: "tickets" | "agents") => number;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlanSafe = () => {
  const context = useContext(PlanContext);
  if (!context) {
    console.warn("usePlanSafe: Utilisé en dehors de PlanProvider");
    return {
      currentPlan: "freemium" as Plan,
      planLimits: PLAN_LIMITS.freemium,
      getTicketsUsedThisMonth: () => 0,
      getAgentsCount: () => 0,
      checkFeatureAccess: () => false,
      isOverTicketLimit: () => false,
      isOverAgentLimit: () => 0,
      isNearTicketLimit: () => false,
      isNearAgentLimit: () => false,
      getPlanDescription: () => "Plan Freemium",
      canCreateTicket: () => true,
      canAddAgent: () => false,
      getUsagePercentage: () => 0,
    };
  }
  return context;
};

export const usePlan = (): PlanContextType => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};

interface PlanProviderProps {
  children: ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const { company, tickets, getAllUsers } = useApp();
  const { t } = useTranslation(["pricing", "common"]);

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

  const checkFeatureAccess = (feature: keyof PlanLimits): boolean => {
    return planLimits[feature] as boolean;
  };

  const isOverTicketLimit = (): boolean => {
    if (planLimits.hasUnlimitedTickets) return false;
    return getTicketsUsedThisMonth() >= planLimits.maxTicketsPerMonth;
  };

  const isOverAgentLimit = (): number => {
    const currentAgents = getAgentsCount();
    if (planLimits.maxAgents === Number.MAX_SAFE_INTEGER) return 0;
    return Math.max(0, currentAgents - planLimits.maxAgents);
  };

  const isNearTicketLimit = (threshold: number = 0.8): boolean => {
    if (planLimits.hasUnlimitedTickets) return false;
    const used = getTicketsUsedThisMonth();
    return used / planLimits.maxTicketsPerMonth >= threshold;
  };

  const isNearAgentLimit = (threshold: number = 0.8): boolean => {
    if (planLimits.maxAgents === Number.MAX_SAFE_INTEGER) return false;
    const used = getAgentsCount();
    return used / planLimits.maxAgents >= threshold;
  };

  const getPlanDescription = (): string => {
    return t(`pricing.${currentPlan}.description`);
  };

  const canCreateTicket = (): boolean => {
    return !isOverTicketLimit();
  };

  const canAddAgent = (): boolean => {
    return isOverAgentLimit() === 0;
  };

  const getUsagePercentage = (type: "tickets" | "agents"): number => {
    if (type === "tickets") {
      if (planLimits.hasUnlimitedTickets) return 0;
      return Math.min(
        100,
        (getTicketsUsedThisMonth() / planLimits.maxTicketsPerMonth) * 100
      );
    } else {
      if (planLimits.maxAgents === Number.MAX_SAFE_INTEGER) return 0;
      return Math.min(100, (getAgentsCount() / planLimits.maxAgents) * 100);
    }
  };

  const value: PlanContextType = {
    currentPlan,
    planLimits,
    getTicketsUsedThisMonth,
    getAgentsCount,
    checkFeatureAccess,
    isOverTicketLimit,
    isOverAgentLimit,
    isNearTicketLimit,
    isNearAgentLimit,
    getPlanDescription,
    canCreateTicket,
    canAddAgent,
    getUsagePercentage,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

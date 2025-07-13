import { usePlan } from '../contexts/PlanContext';
// Suppression de l'import inutilisé

export const usePlanLimits = () => {
  const planContext = usePlan();
  // Suppression de toute logique liée à la langue, tout est statique en français

  // Wrapper pour vérifications communes avec messages traduits
  const checkTicketCreation = () => {
    const allowed = planContext.canCreateTicket();
    return {
      allowed,
      warningMessage: allowed ? undefined : `Nombre maximal de tickets atteint (${planContext.planLimits.maxTicketsPerMonth}). Veuillez mettre à niveau votre abonnement.`
    };
  };

  const checkAgentAddition = () => {
    const allowed = planContext.canAddAgent();
    return {
      allowed,
      warningMessage: allowed ? undefined : `Nombre maximal d'agents atteint (${planContext.planLimits.maxAgents}). Veuillez mettre à niveau votre abonnement.`
    };
  };

  const checkFeatureAccess = (feature: keyof import('../contexts/PlanContext').PlanLimits) => {
    const allowed = planContext.checkFeatureAccess(feature);
    return {
      allowed,
      warningMessage: allowed ? undefined : `Fonctionnalité non disponible dans votre abonnement actuel.`
    };
  };

  const getUsageStatus = () => {
    const { planLimits } = planContext;
    
    return {
      planName: planContext.currentPlan,
      limits: planLimits,
      hasUnlimitedTickets: planLimits.hasUnlimitedTickets,
      hasUnlimitedAgents: planLimits.maxAgents === Infinity,
    };
  };

  return {
    ...planContext,
    checkTicketCreation,
    checkAgentAddition,
    checkFeatureAccess,
    getUsageStatus,
  };
};
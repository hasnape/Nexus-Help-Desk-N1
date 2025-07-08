import { usePlan } from '../contexts/PlanContext';
import { useLanguage } from '../contexts/LanguageContext';

export const usePlanLimits = () => {
  const planContext = usePlan();
  const { t } = useLanguage();

  // Wrapper pour vérifications communes avec messages traduits
  const checkTicketCreation = () => {
    const allowed = planContext.canCreateTicket();
    return {
      allowed,
      warningMessage: allowed ? undefined : t("maxTicketsReached", { 
        limit: planContext.planLimits.maxTicketsPerMonth 
      })
    };
  };

  const checkAgentAddition = () => {
    const allowed = planContext.canAddAgent();
    return {
      allowed,
      warningMessage: allowed ? undefined : t("maxAgentsReached", { 
        limit: planContext.planLimits.maxAgents 
      })
    };
  };

  const checkFeatureAccess = (feature: keyof import('../contexts/PlanContext').PlanLimits) => {
    const allowed = planContext.isFeatureAvailable(feature);
    return {
      allowed,
      warningMessage: allowed ? undefined : t("featureNotAvailable")
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
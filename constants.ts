// constants.ts (racine du projet)
import { TicketPriority, TicketStatus, UserRole } from "@/types";

/**
 * Clés i18n pour les catégories de tickets.
 * Exemple d’usage : t(key) où key ∈ TICKET_CATEGORY_KEYS
 */
export const TICKET_CATEGORY_KEYS = [
  "ticketCategory.SoftwareIssue",
  "ticketCategory.HardwareProblem",
  "ticketCategory.AccountAccess",
  "ticketCategory.BillingInquiry",
  "ticketCategory.NetworkOutage",
  "ticketCategory.MaterialReplacementRequest",
  "ticketCategory.LostMaterial",
  "ticketCategory.BrokenMaterial",
  "ticketCategory.MaterialInvestigation",
  "ticketCategory.GeneralQuestion",
] as const;
export type TicketCategoryKey = typeof TICKET_CATEGORY_KEYS[number];

/**
 * Les enums sont exposés tels quels pour former les clés i18n :
 * ex. t(`ticketPriority.${TicketPriority.LOW}`)
 */
export const TICKET_PRIORITY_KEYS = TicketPriority;
export const TICKET_STATUS_KEYS = TicketStatus;

/** Rôles utilisateurs (clé i18n) */
export const USER_ROLE_KEYS = UserRole;

/** Niveau d’IA par défaut (contrôlé) */
export const DEFAULT_AI_LEVEL: 1 | 2 = 1;

/** Rôle par défaut d’un nouvel utilisateur */
export const DEFAULT_USER_ROLE: UserRole = UserRole.USER;

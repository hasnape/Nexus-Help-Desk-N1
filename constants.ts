import { TicketPriority, TicketStatus, UserRole } from '@/types';

// APP_NAME is now handled by translations: t('appName')

// These are now keys for translation
export const TICKET_CATEGORY_KEYS: string[] = [
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
];

// Enum values themselves will be used as part of the key
// e.g., t(`ticketPriority.${TicketPriority.LOW}`) -> t('ticketPriority.Low')
export const TICKET_PRIORITY_KEYS = TicketPriority;

// Enum values themselves will be used as part of the key
// e.g., t(`ticketStatus.${TicketStatus.OPEN}`) -> t('ticketStatus.Open')
export const TICKET_STATUS_KEYS = TicketStatus;

// User Roles for translation keys
export const USER_ROLE_KEYS = UserRole;

export const DEFAULT_AI_LEVEL: 1 | 2 = 1;
export const DEFAULT_USER_ROLE: UserRole = UserRole.USER;


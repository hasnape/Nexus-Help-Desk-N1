import type { SerializableChatMessage } from "./types.ts";
import { DEFAULT_NEXUS_PROFILE } from "./defaultNexusProfile.ts";
import { LAI_TURNER_PROFILE } from "./laiTurnerProfile.ts";

export type AiProfileContext = {
  language: "fr" | "en" | "ar";
  ticketTitle: string;
  ticketCategoryKey: string;
  assignedAiLevel: 1 | 2;
  chatHistory: SerializableChatMessage[];
  companyId?: string | null;
  companyName?: string | null;
  ticketId?: string;
  additionalSystemContext?: string;
  knowledgeContext?: string | null;
};

export type AiProfile = {
  id: string;
  /**
   * Retourne true si ce profil doit être utilisé
   * pour cette compagnie (basé sur id + nom).
   */
  matches: (opts: {
    companyId?: string | null;
    companyName?: string | null;
  }) => boolean;

  /**
   * Construit le systemInstruction Gemini pour ce profil
   * (y compris les règles JSON, N1/N2 ou intake juridique, etc.).
   */
  buildSystemInstruction: (ctx: AiProfileContext) => string;
};

const PROFILES: AiProfile[] = [
  LAI_TURNER_PROFILE,
  DEFAULT_NEXUS_PROFILE, // toujours en dernier
];

export function pickProfile(opts: {
  companyId?: string | null;
  companyName?: string | null;
}): AiProfile {
  return PROFILES.find((p) => p.matches(opts)) ?? DEFAULT_NEXUS_PROFILE;
}

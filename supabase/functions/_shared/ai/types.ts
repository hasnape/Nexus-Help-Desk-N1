export type SerializableChatMessage = {
  sender: string; // "user" | "agent" | "ai" | "system_summary" ...
  text: string;
};

export type AiProfileKey =
  | "default-nexus-it"
  | "default_nexus_helpdesk"
  | "lai-turner-intake";

export interface CompanyAiSettings {
  company_id: string;
  ai_profile_key: AiProfileKey | null;
  system_prompt_override?: string | null;
  extra_context?: any;
  intake_schema?: any;
  updated_at?: string | null;
}

export type AiProfileContext = {
  language: "fr" | "en" | "ar";
  ticketTitle: string;
  ticketCategoryKey: string;
  assignedAiLevel: 1 | 2;
  chatHistory: SerializableChatMessage[];
  companyId?: string | null;
  companyName?: string | null;
  ticketId?: string;
  aiSettings?: CompanyAiSettings | null;
  additionalSystemContext?: string;
  knowledgeContext?: string | null;
};

export interface AiProfile {
  key: AiProfileKey;
  match: (ctx: {
    companyId?: string | null;
    companyName?: string | null;
    aiSettings?: CompanyAiSettings | null;
  }) => boolean;
  buildSystemInstruction: (
    ctx: AiProfileContext & { knowledgeContext?: string | null },
  ) => string;
  processModelJson: (
    raw: any,
    ctx: AiProfileContext,
  ) => {
    responseText: string;
    escalationSuggested: boolean;
    attorneySummary?: string;
    intakeData?: any | null;
  };
}

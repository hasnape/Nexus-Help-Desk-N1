// supabase/functions/nexus-ai/index.ts

import { serve } from "https://deno.land/std@0.219.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  GoogleGenAI,
  type Content,
  type GenerateContentResponse,
} from "npm:@google/genai";

import type {
  AiProfileContext,
  CompanyAiSettings,
  SerializableChatMessage,
} from "../_shared/ai/types.ts";
import { formatChatHistoryForGemini } from "../_shared/ai/utils.ts";
import { pickAiProfile } from "../_shared/ai/profiles.ts";

import {
  handleOptions,
  guardOriginOr403,
  json,
} from "../_shared/cors.ts";

// --------------------
// Config & clients
// --------------------
const MODEL_NAME = "gemini-2.5-flash";

// Validate required environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

if (!SUPABASE_URL) {
  console.error("[nexus-ai] FATAL: SUPABASE_URL is not configured");
}
if (!SERVICE_ROLE_KEY) {
  console.error("[nexus-ai] FATAL: SUPABASE_SERVICE_ROLE_KEY is not configured");
}
if (!GEMINI_API_KEY) {
  console.error("[nexus-ai] FATAL: GEMINI_API_KEY is not configured");
}

const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
  global: {
    headers: {
      "x-client-info": "nexus-ai-edge-fn",
    },
  },
});

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });

type FollowUpPayload = {
  mode: "followUp";
  language: "fr" | "en" | "ar";
  ticketTitle: string;
  ticketCategoryKey: string;
  assignedAiLevel: 1 | 2;
  chatHistory: SerializableChatMessage[];
  companyId?: string;
  companyName?: string | null;
  ticketId?: string;
  additionalSystemContext?: string;
};

type SummarizePayload = {
  mode: "summarizeAndCategorizeChat";
  language: "fr" | "en" | "ar";
  targetLanguage: string;
  chatHistory: SerializableChatMessage[];
  validCategories: string[];
  validPriorities: string[];
};

type TicketSummaryPayload = {
  mode: "ticketSummary";
  language: "fr" | "en" | "ar";
  targetLanguage: string;
  ticket: {
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    workstation_id?: string | null;
    chat_history: SerializableChatMessage[];
  };
};

type IntakeFirstContactPayload = {
  context?: string | null;
  mode: "intake_first_contact";
  full_name?: string;
  email?: string;
  phone?: string;
  preferred_language?: string;
  practice_area_raw?: string;
  urgency_raw?: string;
  story?: string;
  objective?: string;
};

type RequestBody =
  | FollowUpPayload
  | SummarizePayload
  | TicketSummaryPayload
  | IntakeFirstContactPayload;

/**
 * Construit le contexte FAQ d'une société (company_knowledge),
 * filtré par company_id et, si fourni, par langue (lang = 'fr' | 'en' | 'ar').
 */
async function buildCompanyKnowledgeContext(
  companyId?: string,
  language?: "fr" | "en" | "ar",
): Promise<string | null> {
  if (!companyId) {
    console.warn("[nexus-ai] buildCompanyKnowledgeContext: missing companyId");
    return null;
  }

  let query = supabase
    .from("company_knowledge")
    .select("question, answer, tags, lang")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(25);

  if (language) {
    query = query.eq("lang", language);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("[nexus-ai] company_knowledge error:", error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log(
      "[nexus-ai] company_knowledge: no rows for company",
      companyId,
      "lang =",
      language,
    );
    return null;
  }

  const blocks = data.map((row: any, i: number) => {
    const tags = Array.isArray(row.tags)
      ? row.tags.join(", ")
      : (row.tags ?? "");
    return `FAQ #${i + 1}
Question: ${row.question}
Answer: ${row.answer}${tags ? `\nTags: ${tags}` : ""}`;
  });

  return `COMPANY KNOWLEDGE BASE

These Q&A entries come from the client's official documentation and MUST be used as an authoritative source when relevant.

${blocks.join("\n\n")}`;
}

async function loadCompanyAiSettings(
  companyId?: string | null,
): Promise<CompanyAiSettings | null> {
  if (!companyId) return null;

  const { data, error } = await supabase
    .from("company_ai_settings")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.warn("[nexus-ai] company_ai_settings error:", error);
    }
    return null;
  }

  return data as CompanyAiSettings;
}

// --------------------
// 1) summarizeAndCategorizeChat
// --------------------
async function handleSummarizeAndCategorizeChat(
  body: SummarizePayload,
) {
  const {
    language,
    targetLanguage,
    chatHistory,
    validCategories,
    validPriorities,
  } = body;

  const geminiHistory = formatChatHistoryForGemini(chatHistory);

  const categoryList = validCategories.join(", ");
  const priorityList = validPriorities.join(", ");

  const systemInstruction = `You are Nexus, a ticket analysis AI. Your task is to process a conversation between a user and a help desk assistant.
Based on the full conversation, you MUST generate a JSON object with four specific keys: "title", "description", "category", and "priority".
The response MUST be ONLY a raw JSON object, without any markdown like \`\\\`\\\`json.

1.  "title": Create a short, descriptive title (5-10 words) for the ticket. This should summarize the user's core problem.
2.  "description": Write a comprehensive summary of the entire conversation. Include the initial problem, key details provided by the user, and any troubleshooting steps already attempted by the assistant.
3.  "category": Choose the BEST matching category from this specific list: [${categoryList}]. You MUST select one of these exact keys.
4.  "priority": Assess the urgency and impact of the issue and choose a priority from this specific list: [${priorityList}].

The entire JSON response, including all string values, MUST be in ${targetLanguage}.
Do not add any explanations or text outside of the JSON object.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: geminiHistory,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.5,
    },
  });

  if (!response.text) {
    throw new Error("Gemini API did not return text content for summary.");
  }

  let jsonStr = response.text.trim();
  const fenceRegex = /```(?:json)?\s*\n?(.*?)\n?\s*```/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }

  const parsed = JSON.parse(jsonStr);

  if (
    !parsed.title ||
    !parsed.description ||
    !parsed.category ||
    !parsed.priority
  ) {
    throw new Error("AI response is missing required fields.");
  }

  return {
    title: parsed.title,
    description: parsed.description,
    category: parsed.category,
    priority: parsed.priority,
  };
}

// --------------------
// 2) followUp (N1/N2 + FAQ)
// --------------------
async function handleFollowUp(body: FollowUpPayload) {
  const {
    language,
    ticketTitle,
    ticketCategoryKey,
    assignedAiLevel,
    chatHistory,
    companyId,
    companyName,
    ticketId,
    additionalSystemContext,
  } = body;

  const geminiHistory = formatChatHistoryForGemini(chatHistory);

  const companyNameFromContext = companyName ?? null;
  const companyIdFromContext = companyId ?? null;

  const aiSettings = await loadCompanyAiSettings(companyIdFromContext);

  const knowledgeContext = await buildCompanyKnowledgeContext(
    companyIdFromContext ?? undefined,
    language,
  );

  // Lai & Turner guardrail: when companyId matches "fe6b59cd-8f99-47ed-be5a-2a0931872070"
  // or companyName contains "lai & turner", the matcher MUST return the
  // "lai-turner-intake" profile defined in laiTurnerProfile.ts (multi-tenant rules remain intact).
  const profile = pickAiProfile({
    companyId: companyIdFromContext,
    companyName: companyNameFromContext,
    aiSettings,
  });

  const ctx: AiProfileContext = {
    language,
    ticketTitle,
    ticketCategoryKey,
    assignedAiLevel,
    chatHistory,
    companyId: companyIdFromContext,
    companyName: companyNameFromContext,
    ticketId,
    additionalSystemContext,
    aiSettings,
    knowledgeContext,
  };

  const systemInstruction = profile.buildSystemInstruction({
    ...ctx,
    knowledgeContext,
  });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: geminiHistory,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.7,
      topP: 0.95,
      topK: 50,
    },
  });

  if (!response.text) {
    throw new Error("Gemini API did not return text content for follow-up.");
  }

  let jsonStr = response.text.trim();
  const fenceRegex = /```(?:json)?\s*\n?(.*?)\n?\s*```/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }

  const parsed = JSON.parse(jsonStr);
  const result = profile.processModelJson(parsed, ctx);

  if (result.attorneySummary && ticketId) {
    const { error: noteError } = await supabase.from("internal_notes").insert({
      ticket_id: ticketId,
      agent_id: null,
      note_text: result.attorneySummary,
      company_id: companyIdFromContext ?? null,
      company_name: companyNameFromContext ?? null,
    });

    if (noteError) {
      console.error("[nexus-ai] Failed to insert attorney summary:", noteError);
    }
  }

  if (result.intakeData && ticketId) {
    const { error: intakeError } = await supabase.from("ticket_intake_data").upsert(
      {
        ticket_id: ticketId,
        company_id: companyIdFromContext ?? null,
        raw_json: result.intakeData,
        last_updated_at: new Date().toISOString(),
      },
      { onConflict: "ticket_id" },
    );

    if (intakeError) {
      console.error("[nexus-ai] Failed to upsert ticket intake data:", intakeError);
    }
  }

  return {
    responseText: result.responseText,
    escalationSuggested: result.escalationSuggested,
  };
}

// --------------------
// 3) ticketSummary
// --------------------
async function handleTicketSummary(body: TicketSummaryPayload) {
  const { language, targetLanguage, ticket } = body;

  const ticketContext = `Ticket Title: "${ticket.title}"
Category: "${ticket.category}" 
Initial Description: "${ticket.description}"
Status: ${ticket.status}
Priority: ${ticket.priority}
Workstation ID: ${ticket.workstation_id || "Not provided"}
`;

  const historyContent = formatChatHistoryForGemini(ticket.chat_history || []);

  const systemInstruction = `You are Nexus, an AI assistant. Your task is to provide a concise summary (2-4 sentences) of the user's problem and key interactions based on the provided ticket context and chat history. 
This summary is for a help desk agent who is about to take over the ticket.
Focus on:
1. The core issue the user is facing.
2. Any significant information already provided by the user.
3. Key troubleshooting steps already attempted (if any).
4. Current state or outstanding questions from the user.
Do not include greetings or conversational fluff. Provide only the summary.
IMPORTANT: Respond ONLY in ${targetLanguage}.`;

  const contents: Content[] = [
    {
      role: "user",
      parts: [
        {
          text: `Please summarize the following ticket:\n\n${ticketContext}`,
        },
      ],
    },
    ...historyContent,
  ];

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      systemInstruction,
      temperature: 0.5,
      topP: 0.9,
      topK: 30,
    },
  });

  if (!response.text) {
    throw new Error("Gemini API did not return text content for summary.");
  }

  return { summary: response.text };
}

// --------------------
// 4) lai_turner_intake (intake_first_contact)
// --------------------
function normalizeString(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

async function handleLaiTurnerIntake(body: IntakeFirstContactPayload) {
  try {
    const intakeData = {
      full_name: normalizeString(body.full_name),
      practice_area: normalizeString(body.practice_area_raw),
      urgency: normalizeString(body.urgency_raw),
      primary_goal: normalizeString(body.objective),
      main_issue: normalizeString(body.story),
      preferred_language: normalizeString(body.preferred_language),
      contact: {
        email: normalizeString(body.email),
        phone: normalizeString(body.phone),
      },
    };

    return {
      ok: true,
      intakeData,
      message: "Lai & Turner intake captured.",
    };
  } catch (err) {
    console.error("[nexus-ai] lai_turner_intake error:", err);
    return {
      ok: false,
      intakeData: null,
      userFacingError:
        "L’AI intake Lai & Turner est momentanément indisponible. Merci de réessayer ou de contacter directement le cabinet.",
    };
  }
}

// --------------------
// HTTP handler
// --------------------
serve(async (req: Request) => {
  // 1) Pré-vol CORS
  const maybeOptions = handleOptions(req);
  if (maybeOptions) return maybeOptions;

  // 2) Vérifier l'Origin
  const guard = guardOriginOr403(req);
  if (guard instanceof Response) return guard;
  const corsHeaders = guard; // Record<string, string>

  // 3) Check environment variables before processing
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error("[nexus-ai] Missing required environment variables");
    return json(
      {
        error: "configuration_error",
        message: "Server configuration error: Missing required environment variables. Please contact support.",
      },
      500,
      corsHeaders,
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch (err) {
    console.error("[nexus-ai] invalid JSON body:", err);
    return json(
      { 
        error: "invalid_request",
        message: "Invalid JSON body" 
      },
      400,
      corsHeaders,
    );
  }

  try {
    if (
      body.mode === "intake_first_contact" &&
      (body as IntakeFirstContactPayload).context === "lai_turner_intake"
    ) {
      const result = await handleLaiTurnerIntake(body as IntakeFirstContactPayload);
      return json(result, 200, corsHeaders);
    }

    if (body.mode === "summarizeAndCategorizeChat") {
      const result = await handleSummarizeAndCategorizeChat(body);
      return json(result, 200, corsHeaders);
    }

    if (body.mode === "followUp") {
      const result = await handleFollowUp(body);
      return json(result, 200, corsHeaders);
    }

    if (body.mode === "ticketSummary") {
      const result = await handleTicketSummary(body);
      return json(result, 200, corsHeaders);
    }

    return json(
      { 
        error: "unsupported_mode",
        message: `Unsupported mode: ${(body as any)?.mode || 'unknown'}` 
      },
      400,
      corsHeaders,
    );
  } catch (err: any) {
    const mode = (body as any)?.mode ?? "unknown";
    console.error("[nexus-ai] internal error:", mode, err);
    
    // Extract meaningful error message
    let userMessage = "An internal error occurred while processing your request.";
    
    if (err instanceof Error) {
      // Check for specific error types
      if (err.message.includes("API key")) {
        userMessage = "AI service configuration error. Please contact support.";
      } else if (err.message.includes("rate limit") || err.message.includes("quota")) {
        userMessage = "AI service rate limit exceeded. Please try again in a few minutes.";
      } else if (err.message.includes("timeout")) {
        userMessage = "AI service timeout. Please try again.";
      } else if (err.message.includes("network") || err.message.includes("fetch")) {
        userMessage = "Network error connecting to AI service. Please try again.";
      } else {
        // Use the actual error message if it's user-friendly
        userMessage = err.message;
      }
    }
    
    return json(
      {
        error: "internal_ai_error",
        mode,
        message: userMessage,
        details: err instanceof Error ? err.message : String(err),
      },
      500,
      corsHeaders,
    );
  }
});

// supabase/functions/nexus-ai/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import {
  GoogleGenAI,
  type Content,
  type GenerateContentResponse,
} from "npm:@google/genai";

import {
  handleOptions,
  guardOriginOr403,
  json,
} from "../_shared/cors.ts";

// --------------------
// Config & clients
// --------------------
const MODEL_NAME = "gemini-2.5-flash";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  global: {
    headers: {
      "x-client-info": "nexus-ai-edge-fn",
    },
  },
});

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --------------------
// Types communs
// --------------------
type SerializableChatMessage = {
  sender: string; // "user" | "agent" | "ai" | "system_summary" ...
  text: string;
};

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

type RequestBody = FollowUpPayload | SummarizePayload | TicketSummaryPayload;

const DEFAULT_SYSTEM_PROMPT = `You are Nexus, an IT Help Desk AI assistant.`;

const LAI_TURNER_COMPANY_ID = "fe6b59cd-8f99-47ed-be5a-2a0931872070";

const LAI_TURNER_SYSTEM_PROMPT = `
You are Lai & Turner Law Firm’s virtual intake assistant.

You are NOT an IT help desk and NOT a Level 1 technical support agent.
Never describe yourself as “support informatique” or “Level 1 support”.
Your role is to perform a structured legal intake and help potential clients understand how Lai & Turner could assist them in:
- Family Law
- Personal Injury
- Criminal Defense
- Business Immigration

Your job is NOT to give final legal advice or a detailed legal strategy.
Your job is to:
- Understand the client’s situation in their own words.
- Identify which practice area(s) their issue belongs to (Family, Injury, Criminal, Business Immigration).
- Collect enough information to open or enrich an intake file.
- Explain, in plain language, what Lai & Turner typically does in such cases.
- Suggest reasonable next steps (for example: scheduling a consultation, gathering documents, clarifying timelines).
- Keep the conversation human, empathetic, and action-oriented so the potential client does not feel “dropped”.

Tone and principles:
- Lai & Turner “chases justice, not just verdicts”.
- Treat every client like a human being, not a case number.
- Use plain language, avoid heavy legal jargon.
- Never promise a specific outcome or guarantee a result.
- Always remind the user that only an attorney can provide legal advice and that this chat alone does not create an attorney–client relationship.

Language:
- ALWAYS answer in the same language the user uses.
- If the user writes in French, answer in French.
- If the user writes in English, answer in English.
- Do not switch languages by yourself.

──────── INTAKE DATA YOU MUST COLLECT FOR PERSONAL CASES ────────

When the user talks about their own situation (immigration status, family situation, injury, criminal charges, etc.), you MUST gently collect the key intake fields BEFORE you escalate or say that the team will review the case.

Try to gather, when relevant and not already known:
- Full name or preferred name.
- Age or approximate age.
- Country of origin / citizenship.
- Where they are currently located (city/region/country).
- Their current legal status (for example: no status, ESTA, tourist visa, student visa, permanent resident, citizen, etc.).
- The main facts of the situation (what happened, when, and where).
- Their main goal (what they want to achieve).
- Any important deadlines or upcoming dates (court dates, expirations, hearings, travel, etc.).
- How urgent the situation feels to them (for example: emergency, within days, within weeks, longer term).
- Preferred contact method (phone, video/Zoom, in-person) if that’s relevant.

Do this in a human way, step by step, not as an interrogation.  
Do NOT ask all questions at once. Group them in small, logical batches (2–4 questions maximum at a time).  
If the user does not want to answer a question, acknowledge that, skip that field, and move on. Do NOT block the conversation.

──────── EXAMPLE FOR BUSINESS IMMIGRATION (PERSONAL CASE) ────────

If a user says:
“I live in LA, I am from France, I don’t have a work visa and I want to work. What can I do?”

You MUST:
- Acknowledge their situation with empathy.
- Ask a small number of clear follow-up questions to better understand:
  - Their current status in the U.S. (no status, ESTA, tourist, student, etc.).
  - Their work or business goals (employee with an employer, freelancer, founder creating a business, etc.).
  - Any previous U.S. visa history or denials.
  - Any deadlines or risks (overstaying, expiring status, upcoming travel).
- Only AFTER you have collected the basic picture (status, goals, origin, location, urgency), you can explain that there are different paths in U.S. immigration law and that which option is realistic depends on their full story.
- Emphasize that you cannot give legal advice or confirm a specific path in chat, but that Lai & Turner regularly helps people in similar situations.

You MUST NOT:
- Say that this is “not covered by Level 1 support” or “out of scope for Level 1”.
- End the conversation immediately by escalating without asking intake questions.
- Give a detailed legal strategy or tell them exactly what to file.

──────── HOW TO END A CONVERSATION AND PROPOSE NEXT STEPS ────────

Before closing or escalating a conversation where the user is a potential client:

1. Summarize, in client-friendly language, what you understood about their situation in a few clear sentences.
2. Explain briefly what the typical next steps with Lai & Turner look like (for example: consultation, review of documents, discussion with an attorney).
3. Ask the user for their AVAILABILITY for a potential consultation, in the same language they used. For example:
   - In English: “What days and times in the coming days would work best for you for a consultation, and do you prefer phone, video, or in-person?”
   - In French: “Quels jours et quels créneaux horaires, dans les prochains jours, vous conviendraient le mieux pour une consultation, et préférez-vous par téléphone, en visio ou en présentiel ?”
4. Keep the tone reassuring and encouraging so the user understands that Lai & Turner can review their case, even if the answer is not immediate.

You should only talk about “escalating to the team” in terms of:
- “An attorney at Lai & Turner will need to review your situation in detail.”
- “Our team can review your information and suggest the best way to move forward.”
Do NOT use technical internal phrases like “support Level 1/Level 2” with the client.

──────── INTERNAL ATTORNEY SUMMARY BLOCK ────────

For Lai & Turner conversations, you MUST include at the very end of your response a block in the following format:

[ATTORNEY_SUMMARY]
(Write a concise summary for the attorney only, not for the client.
Include at least:
- Practice area(s) (Family / Personal Injury / Criminal / Business Immigration).
- Identity elements (name if provided, age or age range, country of origin, current location).
- Current legal status (if known) and main goal.
- Key facts and dates mentioned by the user.
- Any red flags or urgency.
- Suggested next steps for the attorney.
- Any availability or preferences the client mentioned for a consultation.)
[/ATTORNEY_SUMMARY]

Everything inside [ATTORNEY_SUMMARY]...[/ATTORNEY_SUMMARY] is for the Lai & Turner team only.
It will be stored as an internal note on the ticket when possible and should NOT be shown to the client.
Outside of that block, write normally for the client, in a helpful, empathetic tone.
`;

function isLaiTurnerCompany(opts: {
  companyId?: string | null;
  companyName?: string | null;
}): boolean {
  const id = opts.companyId ?? "";
  const name = (opts.companyName ?? "").trim().toLowerCase();

  if (id === LAI_TURNER_COMPANY_ID) {
    return true;
  }

  if (!name) return false;

  return name === "lai & turner" || name.includes("lai & turner");
}

function getSystemPromptForCompany(opts: {
  companyId?: string | null;
  companyName?: string | null;
}): string {
  if (isLaiTurnerCompany(opts)) {
    return LAI_TURNER_SYSTEM_PROMPT;
  }

  return DEFAULT_SYSTEM_PROMPT;
}

// --------------------
// Helpers
// --------------------
function getLanguageName(locale: string): string {
  switch (locale) {
    case "fr":
      return "French";
    case "ar":
      return "Arabic";
    case "en":
    default:
      return "English";
  }
}

function formatChatHistoryForGemini(
  history: SerializableChatMessage[],
): Content[] {
  return history.map((m) => ({
    role: m.sender === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));
}

function extractAttorneySummaryBlock(fullText: string): {
  cleanText: string;
  summary?: string;
} {
  const start = fullText.indexOf("[ATTORNEY_SUMMARY]");
  const end = fullText.indexOf("[/ATTORNEY_SUMMARY]");

  if (start === -1 || end === -1 || end <= start) {
    return { cleanText: fullText };
  }

  const summary = fullText
    .slice(start + "[ATTORNEY_SUMMARY]".length, end)
    .trim();
  const cleanText =
    fullText.slice(0, start).trimEnd() +
    "\n\n" +
    fullText.slice(end + "[/ATTORNEY_SUMMARY]".length).trimStart();

  return { cleanText: cleanText.trim(), summary };
}

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

  const targetLanguage = getLanguageName(language);
  const geminiHistory = formatChatHistoryForGemini(chatHistory);

  const companyNameFromContext = companyName ?? null;
  const companyIdFromContext = companyId ?? null;
  const isLaiTurnerContext = isLaiTurnerCompany({
    companyId: companyIdFromContext,
    companyName: companyNameFromContext,
  });
  const systemPrompt = getSystemPromptForCompany({
    companyId: companyIdFromContext,
    companyName: companyNameFromContext,
  });

  // 🔥 Ici on charge VRAIMENT la FAQ de la société + langue
  const knowledgeContext = await buildCompanyKnowledgeContext(
    companyId,
    language,
  );

  const faqInstruction = knowledgeContext
    ? `
You ALSO have access to a COMPANY KNOWLEDGE BASE (FAQ) below.

IMPORTANT RULES ABOUT THE FAQ:
- First, check if the user's latest question is clearly answered or strongly related to one or more FAQ entries.
- If yes, you MUST base your answer primarily on that FAQ content, even if the topic is not strictly IT (for example: road safety, radars, ethylotests, internal company rules, legal obligations, etc.).
- Only if no FAQ entry is relevant are you allowed to say that the question is outside your IT support scope.
- Never invent laws or rules: rely on the FAQ as the primary source.

${knowledgeContext}
`
    : `
No company FAQ is provided for this ticket. Behave as a classic IT help desk AI assistant.
`;

  const roleInstructions =
    assignedAiLevel === 1
      ? `
You are acting as a Level 1 (N1) support agent. Your task is to continue assisting the user by focusing on common solutions for known basic issues, gathering further essential details (one or two questions at a time), or guiding the user through simple, predefined troubleshooting steps. If the issue persists after these initial attempts or if it clearly requires more advanced expertise, inform the user that you have documented all interactions and the issue will be escalated to our Level 2 (N2) technical team for further investigation.

N1 Specific instructions based on category:
- If the category is "ticketCategory.MaterialReplacementRequest", "ticketCategory.LostMaterial", or "ticketCategory.BrokenMaterial":
  - If the specific item isn't identified yet, ask for it.
  - If the item is identified but, for example, the circumstances (if "LostMaterial" or "BrokenMaterial") are unknown, ask: "Thanks for confirming the item. Could you briefly describe how it was lost/broken?".
  - Once basic info is gathered (item, very brief circumstance), state: "Thank you. I have noted these details. Your request will be forwarded to our IT hardware team for processing."
  - Do NOT attempt to troubleshoot the hardware issue itself.
- If the category is "ticketCategory.MaterialInvestigation":
  - Ask one more basic clarifying question based on the user's last message.
  - If the issue is not immediately resolvable with a very simple suggestion, then state: "Thank you for the additional information. This will help our Level 2 technical team investigate further. I've documented our conversation, and they will take a closer look."
  - Avoid making a final decision on replacement or complex troubleshooting.
- For all other categories (Level 1): Guide through one more basic, common troubleshooting step. If it fails or if the user indicates the problem is complex, inform them: "I've noted the steps we've tried. It seems this issue requires a more in-depth look. I'll document our conversation and escalate this to our Level 2 support team."
`
      : `
You are acting as a Level 2 (N2) IT Help Desk AI specialist. Your primary role is to diagnose and resolve technical incidents that require more in-depth knowledge than Level 1 support. Respond professionally and technically, aiming to identify the root cause. Ask targeted diagnostic questions if needed, one or two at a time. If you propose a solution, it should be within the scope of an N2 agent (advanced configuration, specific repairs, known complex workarounds, but not N3 architecture or development).

N2 Specific instructions based on category:
- If the category is "ticketCategory.MaterialReplacementRequest", "ticketCategory.LostMaterial", or "ticketCategory.BrokenMaterial":
  - Confirm all details are present. If user has further questions about process, answer them.
- If the category is "ticketCategory.MaterialInvestigation":
  - Continue the diagnostic conversation with more technical questions.
  - Offer more specific troubleshooting steps that an N2 would perform.
  - If a replacement seems likely after N2 diagnosis: "Based on these findings, it appears a replacement of [item] is the most effective solution. I can process this for you. Would you like to proceed with requesting a replacement?"
- For all other categories (Level 2): Provide more technical or in-depth solutions, as appropriate.
`;

  const systemInstruction = `${systemPrompt}
You are assisting with a ticket titled "${ticketTitle}" in category key "${ticketCategoryKey}".

${faqInstruction}
${additionalSystemContext || ""}

The provided conversation history contains all previous messages, with the user's latest message being the last one in the history.
Your entire response MUST be a single, raw JSON object, without any markdown like \`\\\`\\\`json.
The JSON object must have two keys: "responseText" and "escalationSuggested".

1. "responseText": This is the message you will show to the user. It must be helpful, empathetic, professional, and clear. Ask only one or two questions at a time if more information is needed. The response text must be in ${targetLanguage}.
2. "escalationSuggested": This is a boolean (true/false). Set it to true ONLY if your "responseText" indicates that you cannot resolve the issue and are escalating it, forwarding it to another team, or suggesting the user create a ticket. Otherwise, set it to false.

Follow these specific role instructions to formulate your "responseText":
${roleInstructions}`;

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

  let responseText = parsed.responseText || parsed.text;
  const escalationSuggested = parsed.escalationSuggested;

  if (
    typeof responseText !== "string" ||
    typeof escalationSuggested !== "boolean"
  ) {
    throw new Error(
      "AI response is not in the expected format. It must contain a 'responseText' (or 'text') string and an 'escalationSuggested' boolean.",
    );
  }

  if (isLaiTurnerContext) {
    const { cleanText, summary } = extractAttorneySummaryBlock(responseText);
    responseText = cleanText;

    if (summary && ticketId) {
      const { error: noteError } = await supabase.from("internal_notes").insert({
        ticket_id: ticketId,
        agent_id: null,
        note_text: summary,
        company_id: companyId ?? null,
        company_name: companyNameFromContext ?? companyName ?? null,
      });

      if (noteError) {
        console.error("[nexus-ai] Failed to insert Lai & Turner attorney summary:", noteError);
      }
    }
  }

  return { responseText, escalationSuggested };
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

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch (err) {
    console.error("[nexus-ai] invalid JSON body:", err);
    return json(
      { error: "Invalid JSON body" },
      400,
      corsHeaders,
    );
  }

  try {
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
      { error: "Unsupported mode" },
      400,
      corsHeaders,
    );
  } catch (err: any) {
    console.error("[nexus-ai] internal error:", err);
    return json(
      { error: "Internal AI error" },
      500,
      corsHeaders,
    );
  }
});

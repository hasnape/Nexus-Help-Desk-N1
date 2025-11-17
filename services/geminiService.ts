import { fetchCompanyFaqForAi, buildFaqContextSnippet } from "./companyKnowledgeService";
import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { ChatMessage, Ticket, TicketPriority } from "../types";
import { Locale } from "../contexts/LanguageContext";
import { TICKET_CATEGORY_KEYS } from "../constants";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "VITE_GEMINI_API_KEY environment variable is not set. Gemini API calls will not work."
  );
}

// Modèle stable utilisé
const MODEL_NAME = "gemini-2.5-flash";

function formatChatHistoryForGemini(appChatHistory: ChatMessage[]): Content[] {
  // On retire les messages "system_summary" qui ne servent qu’en interne
  return appChatHistory
    .filter((msg) => msg.sender !== "system_summary")
    .map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));
}

const getLanguageName = (locale: Locale): string => {
  switch (locale) {
    case "en":
      return "English";
    case "fr":
      return "French";
    case "ar":
      return "Arabic";
    default:
      return "English";
  }
};

// ---------------------------------------------------------------------------
// 1) Résumé + catégorisation (création auto de ticket)
// ---------------------------------------------------------------------------
export async function summarizeAndCategorizeChat(
  chatHistory: ChatMessage[],
  language: Locale
): Promise<{
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
}> {
  if (!ai)
    throw new Error("AI Service Unavailable: API Key not configured.");

  const geminiFormattedHistory = formatChatHistoryForGemini(chatHistory);
  const targetLanguage = getLanguageName(language);

  const validCategories = TICKET_CATEGORY_KEYS.join(", ");
  const validPriorities = Object.values(TicketPriority).join(", ");

  const systemInstruction = `You are Nexus, a ticket analysis AI. Your task is to process a conversation between a user and a help desk assistant.
Based on the full conversation, you MUST generate a JSON object with four specific keys: "title", "description", "category", and "priority".
The response MUST be ONLY a raw JSON object, without any markdown like \`\\\`\\\`json.

1.  "title": Create a short, descriptive title (5-10 words) for the ticket. This should summarize the user's core problem.
2.  "description": Write a comprehensive summary of the entire conversation. Include the initial problem, key details provided by the user, and any troubleshooting steps already attempted by the assistant.
3.  "category": Choose the BEST matching category from this specific list: [${validCategories}]. You MUST select one of these exact keys.
4.  "priority": Assess the urgency and impact of the issue and choose a priority from this specific list: [${validPriorities}].

The entire JSON response, including all string values, MUST be in ${targetLanguage}.
Do not add any explanations or text outside of the JSON object.`;

  const contentsForSummary: Content[] = [...geminiFormattedHistory];

  try {
    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: MODEL_NAME,
      contents: contentsForSummary,
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

    const parsedData = JSON.parse(jsonStr);

    if (
      !parsedData.title ||
      !parsedData.description ||
      !parsedData.category ||
      !parsedData.priority
    ) {
      throw new Error("AI response is missing required fields.");
    }
    if (!TICKET_CATEGORY_KEYS.includes(parsedData.category)) {
      console.warn(
        `AI returned invalid category: ${parsedData.category}. Defaulting.`
      );
      parsedData.category =
        TICKET_CATEGORY_KEYS.find((k) => k.includes("General")) ||
        TICKET_CATEGORY_KEYS[0];
    }
    if (!Object.values(TicketPriority).includes(parsedData.priority)) {
      console.warn(
        `AI returned invalid priority: ${parsedData.priority}. Defaulting.`
      );
      parsedData.priority = TicketPriority.MEDIUM;
    }

    return parsedData;
  } catch (error: any) {
    console.error("Error summarizing and categorizing chat:", error);
    throw new Error(
      `Failed to process chat summary. ${error.message || "Unknown Gemini Error"}`
    );
  }
}

// ---------------------------------------------------------------------------
// 2) Réponse d’aide (N1 / N2) AVEC FAQ company_knowledge (personnalisation)
// ---------------------------------------------------------------------------
export async function getFollowUpHelpResponse(
  ticketTitle: string,
  ticketCategoryKey: string,
  fullChatHistoryIncludingCurrentUserMessage: ChatMessage[],
  assignedAiLevel: 1 | 2 = 1, // N1 par défaut
  language: Locale,
  additionalSystemContext?: string,
  opts?: {
    companyId?: string; // 👈 Optionnel : si fourni, on charge les FAQ de cette entreprise
  }
): Promise<{ text: string; escalationSuggested: boolean }> {
  if (!ai) {
    return {
      text: "AI Service Unavailable: API Key not configured or invalid. This should be managed by a backend server.",
      escalationSuggested: true,
    };
  }

  const geminiFormattedHistory = formatChatHistoryForGemini(
    fullChatHistoryIncludingCurrentUserMessage
  );
  const targetLanguage = getLanguageName(language);

  // 🔹 2.1 Charger les FAQ spécifiques à l’entreprise si companyId présent
  let faqContext = "";
  if (opts?.companyId) {
    try {
      const faqEntries = await fetchCompanyFaqForAi(
        opts.companyId,
        language,
        20
      );
      faqContext = buildFaqContextSnippet(faqEntries);
    } catch (err) {
      console.error(
        "[getFollowUpHelpResponse] Failed to load company FAQ:",
        err
      );
    }
  }

  // Bloc d’instructions additionnel si des FAQ sont disponibles
  const faqInstruction = faqContext
    ? `
COMPANY-SPECIFIC FAQ KNOWLEDGE (internal):
${faqContext}

IMPORTANT:
- Before answering, ALWAYS check if the user's current question is covered by one of these Q/A pairs.
- IF the question matches (or is very similar), you MUST base your answer primarily on the corresponding FAQ answer, staying consistent with it.
- You may rephrase the answer in a natural way, but do NOT contradict the FAQ and do NOT invent additional rules that change its meaning.
- You do NOT need to list all FAQ entries to the user. Just answer normally, as a help desk agent, using this FAQ as your ground truth.
- If no FAQ clearly applies, behave as a normal N${assignedAiLevel} help desk AI as described below.
`
    : "";

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

  const systemInstruction = `You are Nexus, an IT Help Desk AI assistant.
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

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: geminiFormattedHistory,
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
    const parsedData = JSON.parse(jsonStr);

    const responseText = parsedData.responseText || parsedData.text;
    const escalationSuggested = parsedData.escalationSuggested;

    if (
      typeof responseText !== "string" ||
      typeof escalationSuggested !== "boolean"
    ) {
      throw new Error(
        "AI response is not in the expected format. It must contain a 'responseText' (or 'text') string and an 'escalationSuggested' boolean."
      );
    }

    return { text: responseText, escalationSuggested };
} catch (error: any) {
  console.error("Error getting follow-up AI response from Gemini:", error);

  const isOverloaded =
    error?.error?.status === "UNAVAILABLE" ||
    error?.error?.code === 503 ||
    typeof error?.message === "string" &&
      error.message.includes("The model is overloaded");

  if (isOverloaded) {
    // Message propre pour l'utilisateur final
    const textFr = `Notre assistant IA est momentanément indisponible en raison d’une surcharge du service.
Je continue à suivre votre demande : vous pouvez soit réessayer dans quelques instants, soit laisser un message plus détaillé et un agent humain prendra le relais.`;
    const textEn = `Our AI assistant is temporarily unavailable due to service overload.
You can try again shortly, or leave more details and a human agent will follow up.`;
    const textAr = `مساعد الذكاء الاصطناعي غير متوفر مؤقتًا بسبب ضغط على الخدمة.
يمكنك المحاولة لاحقًا أو ترك مزيد من التفاصيل وسيقوم عميل بشري بمتابعة طلبك.`;

    // choisis en fonction de la langue si tu veux, ici je mets FR par défaut:
    return { text: textFr, escalationSuggested: true };
  }

  const defaultErrorText = `I'm sorry, I encountered an issue trying to process your follow-up request. Details: ${
    error.message || "Unknown error"
  }. (Error in getFollowUpHelpResponse - Direct Client Call)`;

  return { text: defaultErrorText, escalationSuggested: true };
}
}

// ---------------------------------------------------------------------------
// 3) Résumé d’un ticket pour un agent (vue synthèse)
// ---------------------------------------------------------------------------
export async function getTicketSummary(
  ticket: Ticket,
  language: Locale
): Promise<string> {
  if (!ai)
    return "AI Service for summary unavailable: API Key not configured.";

  const targetLanguage = getLanguageName(language);
  const ticketContext = `Ticket Title: "${ticket.title}"
Category: "${ticket.category}" 
Initial Description: "${ticket.description}"
Status: ${ticket.status}
Priority: ${ticket.priority}
Workstation ID: ${ticket.workstation_id || "Not provided"}
`;

  const geminiFormattedHistory = formatChatHistoryForGemini(
    ticket.chat_history
  );

  const systemInstruction = `You are Nexus, an AI assistant. Your task is to provide a concise summary (2-4 sentences) of the user's problem and key interactions based on the provided ticket context and chat history. 
This summary is for a help desk agent who is about to take over the ticket.
Focus on:
1. The core issue the user is facing.
2. Any significant information already provided by the user.
3. Key troubleshooting steps already attempted (if any).
4. Current state or outstanding questions from the user.
Do not include greetings or conversational fluff. Provide only the summary.
IMPORTANT: Respond ONLY in ${targetLanguage}.`;

  const contentsForSummary: Content[] = [
    {
      role: "user",
      parts: [
        {
          text: `Please summarize the following ticket:\n\n${ticketContext}`,
        },
      ],
    },
    ...geminiFormattedHistory.map((item) => ({
      ...item,
      role: item.role === "user" ? "user" : "model",
    })),
  ];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contentsForSummary,
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

    return response.text;
  } catch (error: any) {
    console.error("Error getting ticket summary from Gemini:", error);
    if (language === "fr")
      return `Désolé, impossible de générer le résumé du ticket. Erreur: ${
        error.message || "Inconnue"
      }`;
    if (language === "ar")
      return `عذراً، لم نتمكن من إنشاء ملخص للتذكرة. خطأ: ${
        error.message || "غير معروف"
      }`;
    return `Sorry, could not generate ticket summary. Error: ${
      error.message || "Unknown"
    }`;
  }
}

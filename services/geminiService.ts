// services/geminiService.ts
// 🔐 Aucune clé Gemini dans le front : tout passe par la Supabase Edge Function `nexus-ai`

import { ChatMessage, Ticket, TicketPriority } from "../types";
import { Locale } from "../contexts/LanguageContext";
import { TICKET_CATEGORY_KEYS } from "../constants";

// Endpoint du proxy Vercel → Supabase Edge Function
// Tu peux le surcharger avec VITE_NEXUS_AI_ENDPOINT si besoin.
const NEXUS_AI_ENDPOINT =
  import.meta.env.VITE_NEXUS_AI_ENDPOINT || "/api/edge-proxy/nexus-ai";

/**
 * On ne veut pas envoyer toute la structure interne de ChatMessage,
 * seulement ce dont le backend a besoin.
 */
type SerializableChatMessage = {
  sender: ChatMessage["sender"];
  text: string;
};

function buildBackendChatHistory(
  history: ChatMessage[]
): SerializableChatMessage[] {
  return history
    .filter((msg) => msg.sender !== "system_summary")
    .map((msg) => ({
      sender: msg.sender,
      text: msg.text,
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

// ---------------------
// Appel générique backend
// ---------------------
async function callNexusAi<TResponse>(
  payload: Record<string, any>
): Promise<TResponse> {
  const res = await fetch(NEXUS_AI_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    // Si tu utilises des cookies d'auth (session Nexus)
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch (e) {
    // Réponse non JSON
  }

  if (!res.ok) {
    const msg =
      (json && (json.error || json.message)) ||
      `Nexus AI backend error (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return json as TResponse;
}

// ---------------------------------------------------------------------------
// 1) Résumé + catégorisation (création auto de ticket)
//    -> mode "summarizeAndCategorizeChat" côté supabase/functions/nexus-ai
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
  const targetLanguage = getLanguageName(language);
  const backendHistory = buildBackendChatHistory(chatHistory);

  const validCategories = TICKET_CATEGORY_KEYS;
  const validPriorities = Object.values(TicketPriority);

  type BackendResponse = {
    title: string;
    description: string;
    category: string;
    priority: TicketPriority | string;
  };

  try {
    const data = await callNexusAi<BackendResponse>({
      mode: "summarizeAndCategorizeChat",
      language, // "fr" | "en" | "ar"
      targetLanguage, // label lisible pour le prompt backend
      chatHistory: backendHistory,
      validCategories,
      validPriorities,
    });

    if (!data.title || !data.description || !data.category || !data.priority) {
      throw new Error("AI response is missing required fields.");
    }

    // Validation/normalisation côté front (ceinture + bretelles)
    let normalizedCategory = data.category;
    if (!TICKET_CATEGORY_KEYS.includes(normalizedCategory)) {
      console.warn(
        `[summarizeAndCategorizeChat] Invalid category from AI: ${normalizedCategory}. Defaulting.`,
      );
      normalizedCategory =
        TICKET_CATEGORY_KEYS.find((k) => k.includes("General")) ||
        TICKET_CATEGORY_KEYS[0];
    }

    let normalizedPriority = data.priority as TicketPriority;
    if (!Object.values(TicketPriority).includes(normalizedPriority)) {
      console.warn(
        `[summarizeAndCategorizeChat] Invalid priority from AI: ${data.priority}. Defaulting to Medium.`,
      );
      normalizedPriority = TicketPriority.MEDIUM;
    }

    return {
      title: data.title,
      description: data.description,
      category: normalizedCategory,
      priority: normalizedPriority,
    };
  } catch (error: any) {
    console.error("Error summarizing and categorizing chat (backend):", error);
    throw new Error(
      `Failed to process chat summary. ${
        error.message || "Unknown AI backend error"
      }`,
    );
  }
}

// ---------------------------------------------------------------------------
// 2) Réponse d’aide (N1 / N2) AVEC FAQ company_knowledge (personnalisation)
//    -> mode "followUp" côté supabase/functions/nexus-ai
// ---------------------------------------------------------------------------
export async function getFollowUpHelpResponse(
  ticketTitle: string,
  ticketCategoryKey: string,
  fullChatHistoryIncludingCurrentUserMessage: ChatMessage[],
  assignedAiLevel: 1 | 2 = 1, // N1 par défaut
  language: Locale,
  additionalSystemContext?: string,
  opts?: {
    companyId?: string; // 👈 pour charger les FAQ de l’entreprise côté backend
  }
): Promise<{ text: string; escalationSuggested: boolean }> {
  const backendHistory = buildBackendChatHistory(
    fullChatHistoryIncludingCurrentUserMessage,
  );

  type BackendResponse = {
    responseText: string;
    escalationSuggested: boolean;
  };

  try {
    const data = await callNexusAi<BackendResponse>({
      mode: "followUp",
      language, // "fr" | "en" | "ar"
      ticketTitle: ticketTitle || "General Support Request",
      ticketCategoryKey: ticketCategoryKey || "ticketCategory.GeneralQuestion",
      assignedAiLevel,
      chatHistory: backendHistory,
      companyId: opts?.companyId,
      additionalSystemContext: additionalSystemContext || "",
    });

    if (
      typeof data.responseText !== "string" ||
      typeof data.escalationSuggested !== "boolean"
    ) {
      throw new Error(
        "AI backend response is not in the expected format. It must contain 'responseText' (string) and 'escalationSuggested' (boolean).",
      );
    }

    return {
      text: data.responseText,
      escalationSuggested: data.escalationSuggested,
    };
  } catch (error: any) {
    console.error("Error getting follow-up AI response from backend:", error);

    // Fallback propre pour l’utilisateur, sans exposer d’erreurs internes
    const textFr = `Notre assistant IA a rencontré un problème inattendu.
Vous pouvez réessayer dans quelques instants ou laisser plus de détails : un agent humain prendra le relais si besoin.`;
    const textEn = `Our AI assistant encountered an unexpected issue.
You can try again shortly or provide more details, and a human agent will follow up if needed.`;
    const textAr = `واجه مساعد الذكاء الاصطناعي مشكلة غير متوقعة.
يمكنك المحاولة لاحقًا أو تقديم مزيد من التفاصيل، وسيقوم عميل بشري بمتابعة طلبك عند الحاجة.`;

    let text = textFr;
    if (language === "en") text = textEn;
    if (language === "ar") text = textAr;

    return { text, escalationSuggested: true };
  }
}

// ---------------------------------------------------------------------------
// 3) Résumé d’un ticket pour un agent (vue synthèse)
//    -> mode "ticketSummary" côté supabase/functions/nexus-ai
// ---------------------------------------------------------------------------
export async function getTicketSummary(
  ticket: Ticket,
  language: Locale,
): Promise<string> {
  const targetLanguage = getLanguageName(language);

  type BackendResponse = {
    summary: string;
  };

  try {
    const data = await callNexusAi<BackendResponse>({
      mode: "ticketSummary",
      language, // "fr" | "en" | "ar"
      targetLanguage,
      ticket: {
        // On envoie seulement ce qui est utile au backend
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        workstation_id: ticket.workstation_id,
        chat_history: buildBackendChatHistory(ticket.chat_history || []),
      },
    });

    if (typeof data.summary !== "string") {
      throw new Error("AI backend did not return a valid summary string.");
    }

    return data.summary;
  } catch (error: any) {
    console.error("Error getting ticket summary from backend:", error);

    if (language === "fr")
      return `Désolé, impossible de générer le résumé du ticket pour le moment. Erreur: ${
        error.message || "Inconnue"
      }`;
    if (language === "ar")
      return `عذراً، لم نتمكن من إنشاء ملخص للتذكرة حاليًا. خطأ: ${
        error.message || "غير معروف"
      }`;
    return `Sorry, could not generate ticket summary at the moment. Error: ${
      error.message || "Unknown"
    }`;
  }
}

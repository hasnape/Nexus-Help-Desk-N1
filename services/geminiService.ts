// services/geminiService.ts
// 🔐 Version sans clé Gemini côté front : tout passe par la Supabase Edge Function `nexus-ai`
// via le proxy Vercel /api/edge-proxy/nexus-ai

import { ChatMessage, Ticket, TicketPriority } from "../types";
import { Locale } from "../contexts/LanguageContext";
import { TICKET_CATEGORY_KEYS } from "../constants";

// Endpoint du proxy Vercel → Supabase Edge Function
// Tu peux le surcharger avec VITE_NEXUS_AI_ENDPOINT si besoin dans ton .env
const NEXUS_AI_ENDPOINT =
  import.meta.env.VITE_NEXUS_AI_ENDPOINT || "/api/edge-proxy/nexus-ai";

export const LAI_TURNER_COMPANY_ID = "fe6b59cd-8f99-47ed-be5a-2a0931872070";

export function isLaiTurnerCompany(opts: {
  companyId?: string | null;
  companyName?: string | null;
}): boolean {
  const id = (opts.companyId ?? "").trim();
  const name = (opts.companyName ?? "").toLowerCase().trim();

  if (id === LAI_TURNER_COMPANY_ID) return true;
  if (!name) return false;

  return name === "lai & turner" || name.includes("lai & turner");
}

/**
 * On ne veut plus envoyer toute la structure interne de ChatMessage,
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

// ---------------------------------------------------------------------------
// 🆕 FONCTION DE NORMALISATION: Priority française → enum anglais
// ---------------------------------------------------------------------------
/**
 * Normalise une valeur de priorité (peut être en français ou anglais)
 * vers l'enum TicketPriority anglais
 * @param priorityName - La valeur retournée par Gemini/Backend
 * @returns La valeur enum correspondante (Low|Medium|High)
 */
const normalizePriority = (priorityName: string | undefined): TicketPriority => {
  if (!priorityName) {
    return TicketPriority.MEDIUM; // Défaut sûr
  }

  const lower = priorityName.toLowerCase().trim();

  // --- Mappages FRANÇAIS → Enum ---
  if (lower === "élevée" || lower === "élevé" || lower === "haute" || lower === "très élevée") {
    return TicketPriority.HIGH;
  }
  if (lower === "moyenne" || lower === "moyen") {
    return TicketPriority.MEDIUM;
  }
  if (lower === "basse" || lower === "bas" || lower === "faible") {
    return TicketPriority.LOW;
  }

  // --- Mappages ANGLAIS (cas où backend retournerait déjà en anglais) ---
  if (lower === "high") {
    return TicketPriority.HIGH;
  }
  if (lower === "medium") {
    return TicketPriority.MEDIUM;
  }
  if (lower === "low") {
    return TicketPriority.LOW;
  }

  // --- Fallback en cas de valeur inconnue ---
  console.warn(
    `[normalizePriority] Unrecognized priority value: "${priorityName}". Defaulting to Medium.`
  );
  return TicketPriority.MEDIUM;
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
    // On envoie les cookies Supabase auth si présents
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // Réponse non JSON (erreur interne grave)
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
  summary: string; // ✅ AJOUTÉ: Le résumé explicite pour la DB
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
      targetLanguage,
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
        `[summarizeAndCategorizeChat] Invalid category from AI: ${normalizedCategory}. Defaulting.`
      );
      normalizedCategory =
        TICKET_CATEGORY_KEYS.find((k) => k.includes("General")) ||
        TICKET_CATEGORY_KEYS[0];
    }

    // Utiliser normalizePriority() pour convertir la string en Enum
    const normalizedPriority = normalizePriority(data.priority as string);

    return {
      title: data.title,
      description: data.description,
      category: normalizedCategory,
      priority: normalizedPriority,
      // ✅ C'est ici la clé : La "description" générée par l'IA lors du chat initial
      // est en réalité le résumé de la conversation. On le retourne en tant que 'summary'.
      summary: data.description, 
    };
  } catch (error: any) {
    console.error("Error summarizing and categorizing chat (backend):", error);
    throw new Error(
      `Failed to process chat summary. ${
        error.message || "Unknown AI backend error"
      }`
    );
  }
}

// ---------------------------------------------------------------------------
// 2) Réponse d'aide (N1 / N2) AVEC FAQ company_knowledge (personnalisation)
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
    companyId?: string; // 👈 pour charger les FAQ de l'entreprise côté backend
    companyName?: string | null;
    ticketId?: string;
    useLaiTurnerPrompt?: boolean;
  }
): Promise<{ text: string; escalationSuggested: boolean }> {
  const backendHistory = buildBackendChatHistory(
    fullChatHistoryIncludingCurrentUserMessage
  );

  const normalizedCompanyId = opts?.companyId?.trim() || null;
  const normalizedCompanyName = opts?.companyName?.trim() || null;
  const useLaiTurnerPrompt =
    opts?.useLaiTurnerPrompt ??
    isLaiTurnerCompany({
      companyId: normalizedCompanyId,
      companyName: normalizedCompanyName,
    });

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
      companyId: normalizedCompanyId || undefined,
      companyName: normalizedCompanyName,
      ticketId: opts?.ticketId,
      additionalSystemContext: additionalSystemContext || "",
      useLaiTurnerPrompt,
    });

    if (
      typeof data.responseText !== "string" ||
      typeof data.escalationSuggested !== "boolean"
    ) {
      throw new Error(
        "AI backend response is not in the expected format. It must contain 'responseText' (string) and 'escalationSuggested' (boolean)."
      );
    }

    return {
      text: data.responseText,
      escalationSuggested: data.escalationSuggested,
    };
  } catch (error: any) {
    console.error("Error getting follow-up AI response from backend:", error);

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
// 3) Résumé d'un ticket pour un agent (vue synthèse)
//    -> mode "ticketSummary" côté supabase/functions/nexus-ai
// ---------------------------------------------------------------------------
export async function getTicketSummary(
  ticket: Ticket,
  language: Locale
): Promise<string> {
  const targetLanguage = getLanguageName(language);

  type BackendResponse = {
    summary: string;
  };

  try {
    const data = await callNexusAi<BackendResponse>({
      mode: "ticketSummary",
      language,
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
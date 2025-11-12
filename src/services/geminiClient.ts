import { ChatMessage, Ticket } from '@/types';
import { Locale } from "@/contexts/LanguageContext";

const API_ENDPOINT = "/api/gemini";

async function callGeminiAPI(action: string, payload: any) {
    const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload })
    });

    if (!response.ok) {
        throw new Error(`Gemini API call failed: ${response.statusText}`);
    }

    return response.json();
}

export async function summarizeAndCategorizeChat(
    chatHistory: ChatMessage[],
    language: Locale
) {
    return callGeminiAPI("summarizeAndCategorizeChat", { chatHistory, language });
}

export async function getFollowUpHelpResponse(
    ticketTitle: string,
    ticketCategoryKey: string,
    fullChatHistoryIncludingCurrentUserMessage: ChatMessage[],
    assignedAiLevel: 1 | 2 = 1,
    language: Locale,
    additionalSystemContext?: string
) {
    return callGeminiAPI("getFollowUpHelpResponse", {
        ticketTitle,
        ticketCategoryKey,
        chatHistory: fullChatHistoryIncludingCurrentUserMessage,
        assignedAiLevel,
        language,
        additionalSystemContext,
    });
}

export async function getTicketSummary(ticket: Ticket, language: Locale) {
    return callGeminiAPI("getTicketSummary", { ticket, language });
}

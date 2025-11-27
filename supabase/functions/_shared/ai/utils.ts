import type { Content } from "npm:@google/genai";
import type { SerializableChatMessage } from "./types.ts";

export function getLanguageName(locale: string): string {
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

export function formatChatHistoryForGemini(
  history: SerializableChatMessage[],
): Content[] {
  return history.map((m) => ({
    role: m.sender === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));
}

/**
 * Extraire le bloc [ATTORNEY_SUMMARY] ... [/ATTORNEY_SUMMARY]
 * s'il est présent dans le texte complet de la réponse.
 */
export function extractAttorneySummaryBlock(fullText: string): {
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

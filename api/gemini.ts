import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Safe maximum chat history length
const MAX_CHAT_HISTORY_LENGTH = 200;

// Validate and trim chat history to safe length
function sanitizeChatHistory(chatHistory: any): any[] {
  if (!Array.isArray(chatHistory)) {
    throw new Error("chatHistory must be an array");
  }
  
  // Take only the last MAX_CHAT_HISTORY_LENGTH messages
  return chatHistory.slice(-MAX_CHAT_HISTORY_LENGTH);
}

// Normalize AI SDK response to extract text
function normalizeResponse(result: any): string {
  // Handle different possible response shapes
  if (!result) {
    console.warn("Empty response from AI SDK");
    return "";
  }
  
  // Direct text property
  if (typeof result.text === "string") {
    return result.text;
  }
  
  // Response in result.response.text
  if (result.response && typeof result.response.text === "string") {
    return result.response.text;
  }
  
  // candidates array structure (common in Gemini responses)
  if (Array.isArray(result.candidates) && result.candidates[0]) {
    const candidate = result.candidates[0];
    if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts)) {
      const textParts = candidate.content.parts
        .filter((p: any) => p.text)
        .map((p: any) => p.text)
        .join("");
      if (textParts) return textParts;
    }
  }
  
  console.warn("Unexpected AI response shape:", JSON.stringify(result).substring(0, 200));
  return "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Validate GEMINI_API_KEY exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured");
    return res.status(500).json({ 
      error: "Server configuration error: GEMINI_API_KEY is missing" 
    });
  }

  // Initialize AI client
  const ai = new GoogleGenAI({ apiKey });

  // Validate request method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request body
    const { action, chatHistory, language, ticket, ticketTitle, ticketCategoryKey, assignedAiLevel, additionalSystemContext } = req.body;

    if (!action) {
      return res.status(400).json({ error: "Missing required field: action" });
    }

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Missing or invalid required field: chatHistory (must be an array)" });
    }

    // Sanitize chat history to safe length
    const safeChatHistory = sanitizeChatHistory(chatHistory);

    let result;

    switch (action) {
      case "summarizeAndCategorizeChat":
        result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: safeChatHistory,
          config: {
            systemInstruction: `You are Nexus, a ticket analysis AI. ...`,
            responseMimeType: "application/json",
            temperature: 0.5,
          }
        });
        break;

      case "getFollowUpHelpResponse":
        result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: safeChatHistory,
          config: {
            systemInstruction: `You are Nexus, an IT Help Desk AI assistant...`,
            responseMimeType: "application/json",
            temperature: 0.7,
          }
        });
        break;

      case "getTicketSummary":
        result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: safeChatHistory,
          config: {
            systemInstruction: `You are Nexus, an AI assistant. Provide a concise summary...`,
            temperature: 0.5,
          }
        });
        break;

      default:
        console.warn("Unknown action requested:", action);
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    // Normalize and extract text from response
    const text = normalizeResponse(result);

    return res.status(200).json({ text });

  } catch (err: any) {
    console.error("Gemini API error:", err.message || err);
    return res.status(500).json({ 
      error: err.message || "Gemini API error" 
    });
  }
}

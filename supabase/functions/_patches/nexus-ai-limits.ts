/**
 * Nexus AI Edge Function Safety Patches
 * 
 * This file provides helper functions to improve safety and reliability
 * of the nexus-ai edge function:
 * 1. Limit chat history to prevent token overflow
 * 2. Check GEMINI_API_KEY before making API calls
 */

/**
 * Limits chat history to a safe number of recent messages
 * to prevent token overflow and excessive API costs
 * 
 * @param chatHistory - Full chat history array
 * @param maxMessages - Maximum number of messages to keep (default: 100)
 * @returns Limited chat history array
 */
export function limitChatHistory<T>(chatHistory: T[], maxMessages = 100): T[] {
  if (!Array.isArray(chatHistory)) {
    console.warn('limitChatHistory: input is not an array, returning empty array');
    return [];
  }

  if (chatHistory.length <= maxMessages) {
    return chatHistory;
  }

  // Take the most recent messages
  const limited = chatHistory.slice(-maxMessages);
  
  console.log(`Chat history limited from ${chatHistory.length} to ${limited.length} messages`);
  
  return limited;
}

/**
 * Validates that GEMINI_API_KEY is configured
 * Returns early response if key is missing
 * 
 * @param headers - CORS headers object to include in error response
 * @returns Response object if key is missing, null if key exists
 */
export function checkGeminiApiKey(headers: Record<string, string>): Response | null {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!apiKey || apiKey.trim() === '') {
    console.error('GEMINI_API_KEY is not configured or is empty');
    return new Response(
      JSON.stringify({
        error: 'server_configuration_error',
        message: 'AI service is not properly configured',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    );
  }
  
  return null; // Key is valid, proceed with request
}

/**
 * Usage example in nexus-ai/index.ts:
 * 
 * // At the start of the request handler, after CORS handling:
 * const apiKeyError = checkGeminiApiKey(cors);
 * if (apiKeyError) return apiKeyError;
 * 
 * // Before processing chat history:
 * const safeChatHistory = limitChatHistory(payload.chatHistory, 100);
 * 
 * // Use safeChatHistory instead of payload.chatHistory in AI calls
 */

/**
 * Configuration constants
 */
export const AI_LIMITS = {
  MAX_CHAT_HISTORY: 100,        // Maximum messages to send to AI
  MAX_FOLLOW_UP_HISTORY: 50,    // Maximum for follow-up conversations
  MAX_SUMMARIZE_HISTORY: 200,   // Maximum for summarization tasks
} as const;

/**
 * Apply appropriate limits based on mode
 */
export function limitByMode(chatHistory: any[], mode: string): any[] {
  switch (mode) {
    case 'followUp':
      return limitChatHistory(chatHistory, AI_LIMITS.MAX_FOLLOW_UP_HISTORY);
    case 'summarizeAndCategorizeChat':
      return limitChatHistory(chatHistory, AI_LIMITS.MAX_SUMMARIZE_HISTORY);
    default:
      return limitChatHistory(chatHistory, AI_LIMITS.MAX_CHAT_HISTORY);
  }
}

/**
 * Helpers for Nexus AI edge function safety
 * - Limit chat history to prevent token overflow
 * - Check Gemini API key is configured
 */

const MAX_HISTORY = 50;

/**
 * Limit chat history to last MAX_HISTORY messages
 * @param chatHistory - Array of chat messages
 * @returns Sliced array with last MAX_HISTORY messages
 */
export function limitChatHistory(chatHistory: any[]): any[] {
  if (!Array.isArray(chatHistory)) {
    console.warn('limitChatHistory: chatHistory is not an array, returning empty array');
    return [];
  }

  if (chatHistory.length <= MAX_HISTORY) {
    return chatHistory;
  }

  console.log(`Limiting chat history from ${chatHistory.length} to ${MAX_HISTORY} messages`);
  return chatHistory.slice(-MAX_HISTORY);
}

/**
 * Check if Gemini API key is configured
 * @param apiKey - Gemini API key from environment
 * @throws Error if API key is missing
 */
export function checkGeminiKey(apiKey: string | undefined): void {
  if (!apiKey || apiKey.trim() === '') {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('GEMINI_API_KEY is not configured in environment');
  }
}

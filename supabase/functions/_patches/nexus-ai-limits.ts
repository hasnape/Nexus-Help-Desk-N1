/**
 * Helper utilities for nexus-ai edge function.
 * 
 * Provides:
 * - Chat history limiting to prevent token overflow
 * - GEMINI_API_KEY validation
 * 
 * Usage in nexus-ai/index.ts:
 * 
 * ```typescript
 * import { limitChatHistory, validateGeminiApiKey } from "../_patches/nexus-ai-limits.ts";
 * 
 * // Validate API key early
 * const keyValidation = validateGeminiApiKey();
 * if (!keyValidation.valid) {
 *   return json({ error: keyValidation.error }, 500, cors);
 * }
 * 
 * // Limit chat history before sending to Gemini
 * const limitedHistory = limitChatHistory(payload.chatHistory, MAX_HISTORY);
 * const geminiHistory = formatChatHistoryForGemini(limitedHistory);
 * ```
 */

export type SerializableChatMessage = {
  sender: 'user' | 'agent' | 'ai';
  text: string;
  timestamp: number;
  author?: string;
  metadata?: Record<string, any>;
};

/**
 * Maximum number of messages to include in chat history.
 * Prevents token overflow and keeps context manageable.
 */
export const MAX_HISTORY = 50;

/**
 * Minimum number of recent messages to always include.
 */
export const MIN_RECENT_MESSAGES = 10;

/**
 * Limits chat history to a maximum number of messages.
 * Always includes the most recent messages and tries to maintain conversation context.
 * 
 * @param history - Full chat history
 * @param maxMessages - Maximum number of messages to include (default: MAX_HISTORY)
 * @returns Limited chat history with most recent messages
 */
export function limitChatHistory(
  history: SerializableChatMessage[],
  maxMessages: number = MAX_HISTORY
): SerializableChatMessage[] {
  if (!history || !Array.isArray(history)) {
    return [];
  }

  if (history.length <= maxMessages) {
    return history;
  }

  // Take the most recent messages
  return history.slice(-maxMessages);
}

/**
 * Limits chat history with smart truncation.
 * Keeps recent messages and attempts to preserve important context from older messages.
 * 
 * @param history - Full chat history
 * @param maxMessages - Maximum number of messages to include
 * @param keepRecent - Number of recent messages to always keep
 * @returns Intelligently limited chat history
 */
export function smartLimitChatHistory(
  history: SerializableChatMessage[],
  maxMessages: number = MAX_HISTORY,
  keepRecent: number = MIN_RECENT_MESSAGES
): SerializableChatMessage[] {
  if (!history || !Array.isArray(history)) {
    return [];
  }

  if (history.length <= maxMessages) {
    return history;
  }

  // Always keep the most recent messages
  const recentMessages = history.slice(-keepRecent);
  
  // Calculate how many older messages we can include
  const remainingSlots = maxMessages - keepRecent;
  
  if (remainingSlots <= 0) {
    return recentMessages;
  }

  // Get older messages, prioritizing those with more context
  const olderMessages = history.slice(0, -keepRecent);
  
  // Sample older messages evenly across the conversation
  const sampledOlder: SerializableChatMessage[] = [];
  const step = Math.ceil(olderMessages.length / remainingSlots);
  
  for (let i = 0; i < olderMessages.length && sampledOlder.length < remainingSlots; i += step) {
    sampledOlder.push(olderMessages[i]);
  }

  return [...sampledOlder, ...recentMessages];
}

/**
 * Validates that GEMINI_API_KEY is set and not empty.
 * 
 * @param apiKey - Optional API key to validate (defaults to Deno.env.get("GEMINI_API_KEY"))
 * @returns Validation result
 */
export function validateGeminiApiKey(apiKey?: string): {
  valid: boolean;
  error?: string;
  key?: string;
} {
  const key = apiKey ?? Deno.env.get("GEMINI_API_KEY");

  if (!key) {
    return {
      valid: false,
      error: "GEMINI_API_KEY is not set in environment variables",
    };
  }

  if (key.trim().length === 0) {
    return {
      valid: false,
      error: "GEMINI_API_KEY is empty",
    };
  }

  if (key.length < 20) {
    return {
      valid: false,
      error: "GEMINI_API_KEY appears to be invalid (too short)",
    };
  }

  return {
    valid: true,
    key: key.trim(),
  };
}

/**
 * Calculates approximate token count for chat history.
 * Uses rough estimation: 1 token ≈ 4 characters.
 * 
 * @param history - Chat history to estimate
 * @returns Approximate token count
 */
export function estimateTokenCount(
  history: SerializableChatMessage[]
): number {
  if (!history || !Array.isArray(history)) {
    return 0;
  }

  let charCount = 0;
  for (const msg of history) {
    charCount += (msg.text || '').length;
    charCount += (msg.sender || '').length;
    charCount += (msg.author || '').length;
  }

  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(charCount / 4);
}

/**
 * Limits chat history to stay within a token budget.
 * 
 * @param history - Full chat history
 * @param maxTokens - Maximum tokens allowed (default: 30000)
 * @returns Limited chat history within token budget
 */
export function limitChatHistoryByTokens(
  history: SerializableChatMessage[],
  maxTokens: number = 30000
): SerializableChatMessage[] {
  if (!history || !Array.isArray(history)) {
    return [];
  }

  // Start with all messages and remove from the beginning if over budget
  let limited = [...history];
  let tokenCount = estimateTokenCount(limited);

  while (tokenCount > maxTokens && limited.length > MIN_RECENT_MESSAGES) {
    limited.shift(); // Remove oldest message
    tokenCount = estimateTokenCount(limited);
  }

  return limited;
}

/**
 * Validates chat history structure and sanitizes if needed.
 * 
 * @param history - Chat history to validate
 * @returns Validated and sanitized history
 */
export function validateChatHistory(
  history: any
): SerializableChatMessage[] {
  if (!history || !Array.isArray(history)) {
    return [];
  }

  return history
    .filter((msg) => {
      // Must have required fields
      return (
        msg &&
        typeof msg === 'object' &&
        msg.text &&
        msg.sender &&
        ['user', 'agent', 'ai'].includes(msg.sender)
      );
    })
    .map((msg) => ({
      sender: msg.sender,
      text: String(msg.text || ''),
      timestamp: msg.timestamp || Date.now(),
      author: msg.author,
      metadata: msg.metadata,
    }));
}

/**
 * Checks if Supabase environment variables are properly configured.
 * 
 * @returns Validation result with details
 */
export function validateSupabaseEnv(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl) {
    errors.push("SUPABASE_URL is not set");
  } else if (!supabaseUrl.startsWith("http")) {
    errors.push("SUPABASE_URL is invalid");
  }

  if (!serviceRoleKey) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY is not set");
  } else if (serviceRoleKey.length < 20) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY appears invalid");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Complete environment validation for nexus-ai function.
 * 
 * @returns Validation result
 */
export function validateNexusAiEnv(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const geminiValidation = validateGeminiApiKey();
  if (!geminiValidation.valid) {
    errors.push(geminiValidation.error || "GEMINI_API_KEY validation failed");
  }

  const supabaseValidation = validateSupabaseEnv();
  if (!supabaseValidation.valid) {
    errors.push(...supabaseValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

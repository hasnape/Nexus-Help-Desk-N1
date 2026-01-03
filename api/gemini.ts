import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure GEMINI_API_KEY exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    return res.status(500).json({
      error: 'Server configuration error: GEMINI_API_KEY is missing',
    });
  }

  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate required fields in JSON payload
  const { action, chatHistory } = req.body || {};

  if (!action) {
    return res.status(400).json({ error: 'Missing required field: action' });
  }

  if (!Array.isArray(chatHistory)) {
    return res.status(400).json({
      error: 'Missing or invalid required field: chatHistory (must be an array)',
    });
  }

  // Trim chatHistory to safe length (last 200 messages)
  const safeChatHistory = chatHistory.slice(-200);

  // Initialize AI client
  const ai = new GoogleGenAI({ apiKey });

  try {
    let result;

    switch (action) {
      case 'summarizeAndCategorizeChat':
        result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: safeChatHistory,
          config: {
            systemInstruction: `You are Nexus, a ticket analysis AI. Analyze the chat history and provide a summary with categorization.`,
            responseMimeType: 'application/json',
            temperature: 0.5,
          },
        });
        break;

      case 'getFollowUpHelpResponse':
        result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: safeChatHistory,
          config: {
            systemInstruction: `You are Nexus, an IT Help Desk AI assistant. Provide helpful follow-up responses.`,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
        break;

      case 'getTicketSummary':
        result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: safeChatHistory,
          config: {
            systemInstruction: `You are Nexus, an AI assistant. Provide a concise summary of the ticket.`,
            temperature: 0.5,
          },
        });
        break;

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    // Normalize SDK response (handle different shapes)
    let text: string;
    if (result && typeof result === 'object') {
      // Try various response shapes from SDK
      if ('text' in result && typeof result.text === 'string') {
        text = result.text;
      } else if ('text' in result && typeof result.text === 'function') {
        text = result.text();
      } else if (
        'candidates' in result &&
        Array.isArray(result.candidates) &&
        result.candidates.length > 0
      ) {
        const candidate = result.candidates[0];
        if (candidate.content && candidate.content.parts) {
          text = candidate.content.parts.map((p: any) => p.text || '').join('');
        } else {
          console.warn('Unexpected candidate shape:', candidate);
          text = JSON.stringify(candidate);
        }
      } else {
        console.warn('Unexpected response shape:', result);
        text = JSON.stringify(result);
      }
    } else {
      console.warn('Unexpected result type:', typeof result);
      text = String(result || '');
    }

    return res.status(200).json({ text });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return res.status(500).json({
      error: err.message || 'Gemini API error',
    });
  }
}

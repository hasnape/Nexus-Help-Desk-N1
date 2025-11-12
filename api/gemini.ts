import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY! // clé stockée dans les variables Vercel
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { action, chatHistory } = req.body ?? {};

        if (!action) {
            return res.status(400).json({ error: "Missing action type" });
        }

        let result;

        switch (action) {
            case "summarizeAndCategorizeChat":
                result = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: chatHistory,
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
                    contents: chatHistory,
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
                    contents: chatHistory,
                    config: {
                        systemInstruction: `You are Nexus, an AI assistant. Provide a concise summary...`,
                        temperature: 0.5,
                    }
                });
                break;

            default:
                return res.status(400).json({ error: "Unknown action" });
        }

        return res.status(200).json({ text: result.text });

    } catch (err: any) {
        console.error("Gemini API error:", err);
        return res.status(500).json({ error: err.message || "Gemini API error" });
    }
}

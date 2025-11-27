import type { AiProfile, AiProfileContext } from "./types.ts";
import { getLanguageName } from "./utils.ts";

function normalizeModelPayload(raw: any) {
  let payload = raw;

  if (typeof payload === "string") {
    let cleaned = payload.trim();
    const fenceRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/i;
    const match = cleaned.match(fenceRegex);
    if (match?.[1]) {
      cleaned = match[1].trim();
    }

    try {
      payload = JSON.parse(cleaned);
    } catch (err) {
      throw new Error(
        "Model response is not valid JSON for Nexus default profile",
      );
    }
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(
      "Model response must be a JSON object with responseText and escalationSuggested",
    );
  }

  return payload as Record<string, unknown>;
}

export const DEFAULT_NEXUS_PROFILE: AiProfile = {
  key: "default_nexus_helpdesk",
  match: ({ aiSettings }) => {
    if (!aiSettings) return true;
    return (
      aiSettings.ai_profile_key === "default_nexus_helpdesk" ||
      aiSettings.ai_profile_key === "default-nexus-it" ||
      aiSettings.ai_profile_key === null
    );
  },
  buildSystemInstruction: (ctx: AiProfileContext): string => {
    const targetLanguage = getLanguageName(ctx.language);

    const faqInstruction = ctx.knowledgeContext
      ? `
You have access to COMPANY KNOWLEDGE (FAQ) below. Before answering, always check if the latest user question is clearly covered or strongly related to one or more FAQ entries. If yes, rely on that FAQ content as your primary source. Do not invent constraints or policies beyond what is provided. If no FAQ entry is relevant, continue as a standard help desk.

${ctx.knowledgeContext}
`
      : `
No company FAQ is provided. Behave as a standard IT help desk assistant while staying open to general questions.
`;

    const n1Instructions = `
You are acting as Level 1 (N1) support.
- Collect essential details: device or app, OS, impact, urgency, recent changes.
- Propose up to one or two simple troubleshooting steps.
- Keep questions simple and ask only one or two at a time.
- If the issue persists or needs deeper expertise, set escalationSuggested to true and clearly tell the user you are escalating to a higher level.
`;

    const n2Instructions = `
You are acting as Level 2 (N2) support.
- Provide more technical diagnostics and targeted steps while staying clear and empathetic.
- Explain reasoning briefly and avoid unnecessary jargon.
- Keep questions focused (one or two at a time) and propose actionable steps suited to N2 scope.
`;

    const companyExtraContext = ctx.aiSettings?.extra_context
      ? `\nAdditional company context: ${JSON.stringify(ctx.aiSettings.extra_context)}`
      : "";

    const systemPromptOverride = ctx.aiSettings?.system_prompt_override
      ? `\nCompany-specific instructions: ${ctx.aiSettings.system_prompt_override}`
      : "";

    const languageReminder = `Always write the user-facing message in ${targetLanguage}.`;

    return `
You are Nexus Support Hub, the virtual help desk assistant for IT Level 1 and Level 2 support. Your responses must stay professional, empathetic, concise, and action-oriented. Do not promise impossible outcomes and be transparent when escalation is needed.

Ticket details:
- Title: "${ctx.ticketTitle}"
- Category key: "${ctx.ticketCategoryKey}"

Knowledge base usage:
${faqInstruction}

Support level guidance:
${ctx.assignedAiLevel === 1 ? n1Instructions : n2Instructions}

General behavior:
- Ask for missing information with simple, direct questions (one or two at a time).
- Provide concrete next steps the user can try now.
- Prioritize answers based on the company knowledge base when relevant, even if the topic is not purely IT.
- If escalationSuggested is true, clearly indicate you are handing the request to a human or higher-level team.
- ${languageReminder}
${ctx.additionalSystemContext || ""}${companyExtraContext}${systemPromptOverride}

OUTPUT FORMAT (STRICT JSON ONLY):
Return a single raw JSON object without markdown fences. Follow exactly this structure:
{
  "responseText": "Clear, empathetic answer for the user in ${targetLanguage}. Include any necessary questions (max two at once).",
  "escalationSuggested": false
}
You may include extra keys such as "structuredIntake" when useful. Keep the JSON valid and minimal.
`;
  },
  processModelJson: (raw: any, _ctx: AiProfileContext) => {
    const payload = normalizeModelPayload(raw);

    const responseText = payload.responseText;
    const escalationSuggested = payload.escalationSuggested;

    if (typeof responseText !== "string") {
      throw new Error(
        "Model response missing a valid string responseText for Nexus default profile",
      );
    }

    if (typeof escalationSuggested !== "boolean") {
      throw new Error(
        "Model response missing a boolean escalationSuggested for Nexus default profile",
      );
    }

    const { responseText: _rt, escalationSuggested: _es, ...rest } = payload;

    return {
      responseText: responseText.trim(),
      escalationSuggested,
      ...rest,
    } as {
      responseText: string;
      escalationSuggested: boolean;
      structuredIntake?: unknown;
      [key: string]: unknown;
    };
  },
};

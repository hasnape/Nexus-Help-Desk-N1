import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Textarea } from "./FormElements";
import { TICKET_CATEGORY_KEYS } from "../constants";
import { getFollowUpHelpResponse } from "../services/geminiService";
import { useLanguage } from "../contexts/LanguageContext";
import { ChatMessage } from "../types";

export type AgentAssistMessage = {
  id: string;
  role: "agent" | "ai";
  content: string;
  createdAt: string;
};

interface NexusAgentAssistWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId?: string;
  ticketTitle?: string;
  ticketSummary?: string;
  currentRole: "manager" | "agent" | "user" | null;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const buildSystemContext = (ticketTitle?: string, ticketSummary?: string) => {
  const contextParts = [
    "Tu es l’assistant interne Nexus AI. Tu aides un agent ou manager de support à rédiger des réponses professionnelles et concises pour un ticket.",
    "Ne réponds jamais directement au client : propose seulement un texte que l’agent pourra adapter.",
  ];

  if (ticketTitle) {
    contextParts.push(`Titre du ticket : ${ticketTitle}`);
  }
  if (ticketSummary) {
    contextParts.push(`Résumé du ticket : ${ticketSummary}`);
  }

  return contextParts.join("\n");
};

const NexusAgentAssistWidget: React.FC<NexusAgentAssistWidgetProps> = ({
  isOpen,
  onClose,
  ticketId,
  ticketTitle,
  ticketSummary,
  currentRole,
}) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<AgentAssistMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ticketCategoryKey = useMemo(
    () =>
      TICKET_CATEGORY_KEYS.includes("ticketCategory.GeneralQuestion")
        ? "ticketCategory.GeneralQuestion"
        : TICKET_CATEGORY_KEYS[0] || "ticketCategory.GeneralQuestion",
    []
  );

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen || (currentRole !== "manager" && currentRole !== "agent")) {
    return null;
  }

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: AgentAssistMessage = {
      id: crypto.randomUUID(),
      role: "agent",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const chatHistoryForAi: ChatMessage[] = updatedMessages.map((msg) => ({
      id: msg.id,
      sender: msg.role === "ai" ? "ai" : "user",
      text: msg.content,
      timestamp: new Date(msg.createdAt),
    }));

    const additionalSystemContext = buildSystemContext(ticketTitle, ticketSummary);

    try {
      const aiResponse = await getFollowUpHelpResponse(
        ticketTitle || "Assistance interne Nexus AI",
        ticketCategoryKey,
        chatHistoryForAi,
        1,
        language,
        additionalSystemContext,
        { ticketId }
      );

      const aiMessage: AgentAssistMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        content: aiResponse.text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error while contacting Nexus AI for agent assist", error);
      const fallbackMessage: AgentAssistMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        content:
          "Une erreur est survenue. Vous pouvez réessayer dans un instant ou reformuler votre demande.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 w-[380px] max-w-full">
      <div className="flex h-[450px] flex-col rounded-xl border border-slate-700 bg-slate-900/95 text-white shadow-2xl backdrop-blur">
        <header className="flex items-start justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold leading-6">Aide Nexus AI (interne)</h2>
            <p className="mt-1 text-xs text-slate-200">
              Les réponses sont proposées pour vous aider à répondre au client, elles ne sont pas envoyées automatiquement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-200 transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Fermer le widget d’aide Nexus AI"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-1">
              <div
                className={`w-fit max-w-full rounded-lg px-3 py-2 text-sm shadow-sm ${
                  message.role === "agent"
                    ? "bg-indigo-600/90 text-white"
                    : "bg-slate-800 text-slate-50"
                }`}
              >
                <span className="block whitespace-pre-wrap">{message.content}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {message.role === "agent" ? "Vous" : "Nexus AI"} · {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-800 px-4 py-3">
          <label htmlFor="nexus-agent-assist-input" className="sr-only">
            Saisissez votre message pour Nexus AI
          </label>
          <Textarea
            id="nexus-agent-assist-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question à Nexus AI..."
            className="mb-3 min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-800 text-sm text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={!input.trim() || isLoading}>
              {isLoading ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NexusAgentAssistWidget;

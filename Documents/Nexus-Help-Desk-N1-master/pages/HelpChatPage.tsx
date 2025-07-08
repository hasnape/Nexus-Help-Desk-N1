import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../App";
import ChatMessageComponent from "../components/ChatMessage";
import { Button, Textarea } from "../components/FormElements";
import { ChatMessage } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { useLanguage } from "../contexts/LanguageContext";
import { getFollowUpHelpResponse } from "../services/geminiService";
import useTextToSpeech from "../hooks/useTextToSpeech";
import { usePlanLimits } from "../hooks/usePlanLimits";
import PlanLimitAlert from "../components/PlanLimitAlert";
import PlanLimitModal from "../components/PlanLimitModal";

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
    <path
      fillRule="evenodd"
      d="M5.5 8.5A.5.5 0 016 8h1v1.167a5.006 5.006 0 004 0V8h1a.5.5 0 01.5.5v.167A5.003 5.003 0 0013 12.5V14.5h.5a.5.5 0 010 1h-7a.5.5 0 010-1H7v-2a5.003 5.003 0 00.5-3.833V8.5z"
      clipRule="evenodd"
    />
  </svg>
);

const SpeakerLoudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M10 3a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM6.5 5.05A.75.75 0 005 5.801v8.397a.75.75 0 001.5.652V5.802a.75.75 0 00-.75-.752zM13.5 5.05a.75.75 0 00-.75.752v8.397a.75.75 0 001.5.652V5.802a.75.75 0 00-.75-.752zM2.75 7.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5zM17.25 7.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5z" />
  </svg>
);

const SpeakerOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M13.28 6.72a.75.75 0 00-1.06-1.06L10 7.94 7.78 5.66a.75.75 0 00-1.06 1.06L8.94 9l-2.22 2.22a.75.75 0 101.06 1.06L10 10.06l2.22 2.22a.75.75 0 101.06-1.06L11.06 9l2.22-2.28z" />
    <path
      fillRule="evenodd"
      d="M10 1a9 9 0 100 18 9 9 0 000-18zM2.5 10a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z"
      clipRule="evenodd"
    />
  </svg>
);

const HelpChatPage: React.FC = () => {
  const { user, isAutoReadEnabled, toggleAutoRead } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { checkTicketCreation, checkFeatureAccess, isFeatureAvailable } =
    usePlanLimits();

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showCreateTicketButton, setShowCreateTicketButton] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [initialMessageSpoken, setInitialMessageSpoken] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planModalFeature, setPlanModalFeature] = useState<string>("");

  // Vérifier si le navigateur supporte la synthèse vocale
  const browserSupportsTextToSpeech =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Vérifier les limitations de plan
  const ticketCreationCheck = checkTicketCreation();
  const voiceFeatureCheck = checkFeatureAccess("hasVoiceFeatures");

  // Effect for initializing chat and handling pre-filled messages
  useEffect(() => {
    const initialAiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "ai",
      text: t("helpChat.initialMessage"),
      timestamp: new Date(),
    };

    const locationState = location.state as { initialMessage?: string } | null;
    const prefilledMessage = locationState?.initialMessage;

    if (prefilledMessage) {
      // If there's a pre-filled message, send it immediately
      setChatHistory([initialAiMessage]);
      handleSendMessage(null, prefilledMessage);
      // Clear the state from location to prevent re-sending on refresh
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      // Otherwise, just show the welcome message
      setChatHistory([initialAiMessage]);
    }
  }, [t, location.state]);

  // Ajout de l'importation des valeurs du hook useSpeechRecognition
  const { transcript, isListening, startListening, stopListening } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setNewMessage((prev) => prev + (prev ? " " : "") + transcript);
    }
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Hook for text-to-speech
  const { speak, isSpeaking } = useTextToSpeech();

  // Auto-read the initial welcome message from the AI if enabled.
  useEffect(() => {
    if (
      !initialMessageSpoken &&
      chatHistory.length === 1 &&
      chatHistory[0].sender === "ai" &&
      isAutoReadEnabled &&
      browserSupportsTextToSpeech
    ) {
      const initialMessage = chatHistory[0];
      setInitialMessageSpoken(true);
      speak(initialMessage.text, () => setSpeakingMessageId(null));
      setSpeakingMessageId(initialMessage.id);
    }
  }, [
    chatHistory,
    isAutoReadEnabled,
    browserSupportsTextToSpeech,
    speak,
    initialMessageSpoken,
  ]);

  const handleSendMessage = async (
    e: React.FormEvent | null,
    messageTextOverride?: string
  ) => {
    if (e) e.preventDefault();
    if (isListening) stopListening();

    const textToSend = (messageTextOverride || newMessage).trim();
    if (textToSend === "" || isLoadingAi || !user) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };
    const currentChat = [...chatHistory, userMessage];
    setChatHistory(currentChat);
    setNewMessage("");
    setIsLoadingAi(true);

    try {
      const aiResponse = await getFollowUpHelpResponse(
        "General Support Request", // Generic title for pre-ticket chat
        "ticketCategory.GeneralQuestion", // Generic category
        currentChat,
        1,
        user.language_preference
      );
      const aiResponseMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: aiResponse.text,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, aiResponseMessage]);

      if (isAutoReadEnabled && browserSupportsTextToSpeech) {
        speak(aiResponse.text, () => setSpeakingMessageId(null));
        setSpeakingMessageId(aiResponseMessage.id);
      }

      if (aiResponse.escalationSuggested) {
        setShowCreateTicketButton(true);
      }
    } catch (error: any) {
      console.error(
        "Error getting AI follow-up response:",
        JSON.stringify(error, null, 2)
      );
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: t("appContext.error.aiFollowUpFailed", {
          error: error.message || "Unknown",
        }),
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
      setShowCreateTicketButton(true); // Show button on error as well
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSpeakMessage = (text: string, messageId: string) => {
    // If your useTextToSpeech hook provides a stop or cancel method, use it here.
    // Otherwise, just handle speaking logic.
    if (isSpeaking && speakingMessageId === messageId) {
      setSpeakingMessageId(null);
      // Optionally, add a stop/cancel method if available from the hook
    } else {
      speak(text, () => setSpeakingMessageId(null));
      setSpeakingMessageId(messageId);
    }
  };

  const handleCreateTicket = () => {
    if (!ticketCreationCheck.allowed) {
      setPlanModalFeature("Création de ticket");
      setShowPlanModal(true);
      return;
    }

    // Logic existante pour créer un ticket
    navigate("/new-ticket", {
      state: {
        chatHistory: chatHistory,
        from: location,
      },
    });
  };

  const handleVoiceToggle = () => {
    if (!voiceFeatureCheck.allowed) {
      setPlanModalFeature("Fonctionnalités vocales");
      setShowPlanModal(true);
      return;
    }

    toggleAutoRead();
  };

  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Alert de limitation si nécessaire */}
      {!ticketCreationCheck.allowed && (
        <PlanLimitAlert
          customMessage={ticketCreationCheck.warningMessage}
          className="mb-4"
        />
      )}

      {/* Chat interface existante */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((message) => (
            <ChatMessageComponent
              key={message.id}
              message={message}
            />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input area avec vérifications de plan */}
        <div className="border-t border-slate-300 p-4 bg-surface">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t("helpChat.placeholder")}
                rows={2}
                onKeyDown={handleKeyDown}
                disabled={isLoadingAi}
              />
            </div>

            {/* Bouton vocal avec limitation */}
            <Button
              onClick={
                isFeatureAvailable("hasVoiceFeatures")
                  ? startListening
                  : handleVoiceToggle
              }
              variant={isListening ? "primary" : "secondary"}
              size="md"
              disabled={isLoadingAi}
              title={
                isFeatureAvailable("hasVoiceFeatures")
                  ? isListening
                    ? t("helpChat.stopListening")
                    : t("helpChat.startListening")
                  : t("planLimits.upgradeForVoice")
              }
            >
              <MicrophoneIcon className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleSendMessage}
              variant="primary"
              size="md"
              disabled={isLoadingAi || !newMessage.trim()}
            >
              {isLoadingAi ? <LoadingSpinner /> : t("helpChat.send")}
            </Button>
          </div>

          {/* Controls avec limitations */}
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center space-x-2">
              <Button
                onClick={
                  isFeatureAvailable("hasVoiceFeatures")
                    ? handleVoiceToggle
                    : () => {
                        setPlanModalFeature("Fonctionnalités vocales");
                        setShowPlanModal(true);
                      }
                }
                variant="secondary"
                size="sm"
                title={
                  isFeatureAvailable("hasVoiceFeatures")
                    ? isAutoReadEnabled
                      ? t("helpChat.disableAutoRead")
                      : t("helpChat.enableAutoRead")
                    : t("planLimits.upgradeForVoice")
                }
              >
                {isFeatureAvailable("hasVoiceFeatures") && isAutoReadEnabled ? (
                  <SpeakerLoudIcon className="w-4 h-4" />
                ) : (
                  <SpeakerOffIcon className="w-4 h-4" />
                )}
                <span className="ml-1">
                  {isFeatureAvailable("hasVoiceFeatures")
                    ? isAutoReadEnabled
                      ? t("helpChat.autoReadOn")
                      : t("helpChat.autoReadOff")
                    : t("helpChat.voiceDisabled")}
                </span>
              </Button>
            </div>

            {showCreateTicketButton && (
              <Button
                onClick={handleCreateTicket}
                variant="primary"
                size="sm"
                disabled={!ticketCreationCheck.allowed}
                title={
                  !ticketCreationCheck.allowed
                    ? ticketCreationCheck.warningMessage
                    : undefined
                }
              >
                {t("helpChat.createTicketButton")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de limitation de plan */}
      <PlanLimitModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={t("planLimits.featureNotAvailable")}
        message={
          planModalFeature
            ? t("planLimits.upgradePrompt", { feature: planModalFeature })
            : ""
        }
      />
    </div>
  );
};

export default HelpChatPage;

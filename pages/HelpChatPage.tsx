import React, { useState, useEffect, useRef, Suspense } from "react";
// import supprimé : plus de logique i18n
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../App";
import { Button, Textarea } from "../components/FormElements";
import { ChatMessage } from "../types";
import ChatMessageComponent from "../components/ChatMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
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
    <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-.75a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5H10v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
  </svg>
);

const SpeakerLoudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M10 3.75a.75.75 0 00-1.264-.546L5.203 6H2.667a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h2.536l3.533 2.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899zM13.536 7.464a.75.75 0 00-1.061 1.061 2 2 0 010 2.828.75.75 0 001.06 1.061 3.5 3.5 0 000-4.95z" />
  </svg>
);

const SpeakerOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M9.25 16.25a.75.75 0 001.5 0V3.75a.75.75 0 00-1.264-.546L5.203 6H2.667a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h2.536l3.533 2.796c.246.195.514.204.75.046zM12.22 5.22a.75.75 0 011.06 0l1.5 1.5 1.5-1.5a.75.75 0 111.06 1.06l-1.5 1.5 1.5 1.5a.75.75 0 11-1.06 1.06l-1.5-1.5-1.5 1.5a.75.75 0 01-1.06-1.06l1.5-1.5-1.5-1.5a.75.75 0 010-1.06z" />
  </svg>
);

const HelpChatPage: React.FC = () => {
  const { isAutoReadEnabled, toggleAutoRead } = useApp();
  // Suppression de la logique i18n
  const navigate = useNavigate();
  const location = useLocation();
  const { checkTicketCreation, checkFeatureAccess } = usePlanLimits();

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

  const browserSupportsTextToSpeech =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const ticketCreationCheck = checkTicketCreation();
  const voiceFeatureCheck = checkFeatureAccess("hasVoiceFeatures");

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { speak, cancel } = useTextToSpeech();

  useEffect(() => {
    const initialAiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "ai",
      message: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    };

    const locationState = location.state as { initialMessage?: string } | null;
    const prefilledMessage = locationState?.initialMessage;

    if (prefilledMessage) {
      setChatHistory([initialAiMessage]);
      setNewMessage(prefilledMessage);
    } else {
      setChatHistory([initialAiMessage]);

      if (
        isAutoReadEnabled &&
        browserSupportsTextToSpeech &&
        !initialMessageSpoken
      ) {
        speak("Bonjour ! Comment puis-je vous aider aujourd'hui ?");
        setInitialMessageSpoken(true);
      }
    }
  }, [
    location.state,
    isAutoReadEnabled,
    browserSupportsTextToSpeech,
    initialMessageSpoken,
    speak,
  ]);

  useEffect(() => {
    if (transcript) {
      setNewMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      message: newMessage,
      timestamp: new Date(),
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setNewMessage("");
    // Si le hook ne fournit pas resetTranscript, on ignore cette ligne

    setIsLoadingAi(true);
    try {
      const response = await getFollowUpHelpResponse(
        "Assistant IA",
        "general",
        updatedHistory,
        1,
        "fr"
      );

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        message: response.text,
        timestamp: new Date(),
      };

      const finalHistory = [...updatedHistory, aiMessage];
      setChatHistory(finalHistory);

      if (response.escalationSuggested) {
        setShowCreateTicketButton(true);
      }

      if (isAutoReadEnabled && browserSupportsTextToSpeech) {
        speak(response.text);
        setSpeakingMessageId(aiMessage.id);
      }
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        message: "Une erreur est survenue. Veuillez réessayer.",
        timestamp: new Date(),
      };
      setChatHistory([...updatedHistory, errorMessage]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCreateTicket = () => {
    if (!ticketCreationCheck.allowed) {
      setShowPlanModal(true);
      setPlanModalFeature("Création de ticket");
      return;
    }

    navigate("/ticket/new", { state: { chatHistory } });
  };

  const handleVoiceFeatureClick = (feature: string) => {
    if (!voiceFeatureCheck.allowed) {
      setShowPlanModal(true);
      setPlanModalFeature(feature);
      return;
    }

    if (feature === "microphone") {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    } else if (feature === "speaker") {
      toggleAutoRead();
    }
  };

  const handleSpeakMessage = (messageId: string, text: string) => {
    if (!voiceFeatureCheck.allowed) {
      setShowPlanModal(true);
      setPlanModalFeature("Lire la réponse à voix haute");
      return;
    }

    if (speakingMessageId === messageId) {
      cancel();
      setSpeakingMessageId(null);
    } else {
      speak(text);
      setSpeakingMessageId(messageId);
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-textPrimary mb-2">
            Centre d'aide et chat IA
          </h1>
          <p className="text-slate-600">
            Discutez avec notre assistant IA ou créez un ticket de support.
          </p>
        </div>

        {!ticketCreationCheck.allowed && (
          <PlanLimitAlert
            message={ticketCreationCheck.warningMessage}
            type="warning"
          />
        )}

        <div className="flex-1 bg-surface rounded-lg shadow-lg flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {chatHistory.map((message) => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  onSpeak={
                    browserSupportsTextToSpeech
                      ? (text) => handleSpeakMessage(message.id, text)
                      : undefined
                  }
                  isSpeaking={speakingMessageId === message.id}
                  showSpeakButton={
                    voiceFeatureCheck.allowed && browserSupportsTextToSpeech
                  }
                  speechSupported={browserSupportsTextToSpeech}
                  speakButtonProps={{
                    "aria-label":
                      speakingMessageId === message.id
                        ? "Arrêter la lecture du message"
                        : "Lire le message à voix haute",
                    title:
                      speakingMessageId === message.id
                        ? "Arrêter la lecture"
                        : "Lire le message à voix haute",
                  }}
                />
              ))}
              {isLoadingAi && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-lg p-3 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-slate-600">
                        {"L'IA réfléchit..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="p-4 border-t border-slate-200">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  rows={3}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col space-y-2">
                {browserSupportsSpeechRecognition && (
                  <Button
                    variant={isListening ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleVoiceFeatureClick("microphone")}
                    disabled={!voiceFeatureCheck.allowed}
                    title={
                      !voiceFeatureCheck.allowed
                        ? "Fonctionnalité vocale non disponible avec votre formule."
                        : isListening
                        ? "Arrêter l'écoute"
                        : "Démarrer la reconnaissance vocale"
                    }
                  >
                    <MicrophoneIcon className="w-4 h-4" />
                  </Button>
                )}
                {browserSupportsTextToSpeech && (
                  <Button
                    variant={isAutoReadEnabled ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleVoiceFeatureClick("speaker")}
                    disabled={!voiceFeatureCheck.allowed}
                    title={
                      !voiceFeatureCheck.allowed
                        ? "Fonctionnalité vocale non disponible avec votre formule."
                        : isAutoReadEnabled
                        ? "Couper la lecture vocale"
                        : "Lire la réponse à voix haute"
                    }
                  >
                    {isAutoReadEnabled ? (
                      <SpeakerLoudIcon className="w-4 h-4" />
                    ) : (
                      <SpeakerOffIcon className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoadingAi}
                >
                  Envoyer
                </Button>
              </div>
            </div>

            {isListening && (
              <div className="mt-2 text-sm text-primary">
                Reconnaissance vocale en cours...
              </div>
            )}
          </div>
        </div>

        {showCreateTicketButton && (
          <div className="mt-4 text-center">
            <Button
              variant="primary"
              onClick={handleCreateTicket}
              disabled={!ticketCreationCheck.allowed}
            >
              Créer un ticket de support
            </Button>
          </div>
        )}

        {showPlanModal && (
          <PlanLimitModal
            isOpen={showPlanModal}
            onClose={() => setShowPlanModal(false)}
            feature={
              typeof planModalFeature === "string" &&
              [
                "maxTicketsPerMonth",
                "maxAgents",
                "hasVoiceFeatures",
                "hasUnlimitedTickets",
                "hasUnlimitedAgents",
              ].includes(planModalFeature)
                ? (planModalFeature as keyof import("../contexts/PlanContext.tsx").PlanLimits)
                : undefined
            }
          />
        )}
      </div>
    </Suspense>
  );
};

export default HelpChatPage;

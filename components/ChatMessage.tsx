import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ChatMessage as ChatMessageType } from "../types";
import { useApp } from "../App";

interface ChatMessageComponentProps {
  message: ChatMessageType;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  showSpeakButton?: boolean;
}

const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M10 3.75a.75.75 0 00-1.264-.546L5.203 6H2.667a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h2.536l3.533 2.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
  </svg>
);

const ChatMessageComponent: React.FC<ChatMessageComponentProps> = ({
  message,
  onSpeak,
  isSpeaking = false,
  showSpeakButton = false,
}) => {
  const { t, i18n } = useTranslation(["common", "components"]);
  const { getAllUsers } = useApp();

  const getSenderName = (): string => {
    switch (message.sender) {
      case "user":
        return t("chatMessage.you", "Vous");
      case "agent":
        if (message.agentId) {
          const agent = getAllUsers().find((u) => u.id === message.agentId);
          return agent?.full_name || t("chatMessage.agent", "Agent");
        }
        return t("chatMessage.agent", "Agent");
      case "ai":
        return t("chatMessage.ai", "IA");
      case "system_summary":
        return t("chatMessage.system", "Système");
      default:
        return t("chatMessage.system", "Système");
    }
  };

  const getSenderColor = () => {
    switch (message.sender) {
      case "user":
        return "bg-blue-500 text-white";
      case "agent":
        return "bg-green-500 text-white";
      case "ai":
        return "bg-purple-500 text-white";
      case "system_summary":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getMessageAlignment = () => {
    if (message.sender === "user") {
      return "flex-row-reverse";
    }
    return "flex-row";
  };

  const getMessageBubbleStyle = () => {
    if (message.sender === "user") {
      return "bg-blue-500 text-white ml-auto";
    }
    switch (message.sender) {
      case "agent":
        return "bg-green-100 text-green-800";
      case "ai":
        return "bg-purple-100 text-purple-800";
      case "system_summary":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Suspense fallback={<div className="flex gap-3 mb-4 animate-pulse h-16" />}>
      <div className={`flex gap-3 mb-4 ${getMessageAlignment()}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getSenderColor()}`}
          aria-label={t("chatMessage.avatarAria", "Avatar expéditeur")}
        >
          {getSenderName().charAt(0).toUpperCase()}
        </div>

        {/* Message Content */}
        <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-lg">
          {/* Sender Name and Timestamp */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-sm font-medium text-gray-600"
              aria-label={t("chatMessage.senderAria", "Nom de l'expéditeur")}
            >
              {getSenderName()}
            </span>
            <span
              className="text-xs text-gray-400"
              aria-label={t("chatMessage.timestampAria", "Heure du message")}
            >
              {t("chatMessage.timestamp", {
                time: new Date(message.timestamp).toLocaleTimeString(
                  i18n.language,
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                ),
              })}
            </span>
          </div>

          {/* Message Bubble */}
          <div
            className={`rounded-lg p-3 ${getMessageBubbleStyle()}`}
            aria-label={t("chatMessage.bubbleAria", "Contenu du message")}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.text}
            </p>
          </div>

          {/* Actions */}
          {showSpeakButton && onSpeak && (
            <div className="flex items-center mt-2">
              <button
                onClick={() => onSpeak(message.text)}
                disabled={isSpeaking}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isSpeaking
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
                title={
                  isSpeaking
                    ? t("chatMessage.stopSpeaking", "Arrêter la lecture")
                    : t("chatMessage.speakMessage", "Écouter le message")
                }
                aria-label={
                  isSpeaking
                    ? t("chatMessage.stopSpeaking", "Arrêter la lecture")
                    : t("chatMessage.speakMessage", "Écouter le message")
                }
                tabIndex={0}
              >
                <SpeakerIcon className="w-3 h-3" />
                {isSpeaking
                  ? t("chatMessage.reading", "Lecture...")
                  : t("chatMessage.listen", "Écouter")}
              </button>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default ChatMessageComponent;

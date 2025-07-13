import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "../App";
import ChatMessageComponent from "../components/ChatMessage";
import { Button, Textarea, Select, Input } from "../components/FormElements";
import {
  TicketStatus,
  ChatMessage as ChatMessageType,
  TicketPriority,
  UserRole,
  AppointmentDetails,
} from "../types";
import { TICKET_STATUS_KEYS, TICKET_PRIORITY_KEYS } from "../constants";
import LoadingSpinner from "../components/LoadingSpinner";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useTextToSpeech from "../hooks/useTextToSpeech";

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

const SpeakerMutedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M10 3.75a.75.75 0 00-1.14-.64L5.24 5.74a.75.75 0 00-.49.65v7.22c0 .27.14.52.37.66l3.38 2.25a.75.75 0 001.14-.64V3.75zM15.98 7.67a.75.75 0 10-1.06-1.06L13.5 8.03l-1.42-1.42a.75.75 0 00-1.06 1.06L12.44 9.09l-1.42 1.42a.75.75 0 001.06 1.06L13.5 10.15l1.42 1.42a.75.75 0 001.06-1.06L14.56 9.09l1.42-1.42z" />
  </svg>
);

const TicketDetailPageContent: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation([
    "ticketDetail",
    "common",
    "enums",
    "components",
  ]);

  const {
    user,
    getTicketById,
    sendChatMessage,
    updateTicketStatus,
    isAutoReadEnabled,
    toggleAutoRead,
    proposeOrUpdateAppointment,
  } = useApp();

  const ticket = ticketId ? getTicketById(ticketId) : undefined;

  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [lastSpokenAiMessage, setLastSpokenAiMessage] = useState<{
    text: string;
    id: string;
  } | null>(null);

  // Appointment proposal state for agents/managers
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptLocationMethod, setApptLocationMethod] = useState("");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const {
    isListening: isListeningChatInput,
    transcript: chatTranscript,
    startListening: startChatListening,
    stopListening: stopChatListening,
    error: speechErrorText,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const {
    speak,
    stop: stopSpeaking,
    speaking: isSpeaking,
    supported: speechSynthesisSupported,
  } = useTextToSpeech();

  // Obtenir la locale BCP-47 pour la synthèse vocale
  const getBCP47Locale = (): string => {
    const langMap: Record<string, string> = {
      fr: "fr-FR",
      en: "en-US",
      ar: "ar-SA",
    };
    return langMap[i18n.language] || "fr-FR";
  };

  useEffect(() => {
    if (!ticket) {
      navigate("/tickets");
      return;
    }
  }, [ticket, navigate]);

  useEffect(() => {
    if (chatTranscript.trim()) {
      setNewMessage(chatTranscript);
    }
  }, [chatTranscript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.chat_messages]);

  useEffect(() => {
    if (!ticket?.chat_messages || !isAutoReadEnabled) return;

    const lastMessage = ticket.chat_messages[ticket.chat_messages.length - 1];
    if (
      lastMessage?.sender === "ai" &&
      lastMessage.id !== lastSpokenAiMessage?.id &&
      speechSynthesisSupported
    ) {
      setLastSpokenAiMessage({ text: lastMessage.message, id: lastMessage.id });
      speak(lastMessage.message, getBCP47Locale());
      setSpeakingMessageId(lastMessage.id);
    }
  }, [
    ticket?.chat_messages,
    isAutoReadEnabled,
    speak,
    speechSynthesisSupported,
    lastSpokenAiMessage,
  ]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket) return;

    try {
      await sendChatMessage(ticket.id, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (ticket) {
      updateTicketStatus(ticket.id, newStatus);
    }
  };

  const handleVoiceInput = () => {
    if (isListeningChatInput) {
      stopChatListening();
    } else {
      startChatListening();
    }
  };

  const handleSpeakMessage = (message: ChatMessageType) => {
    if (isSpeaking && speakingMessageId === message.id) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      speak(message.message, getBCP47Locale());
      setSpeakingMessageId(message.id);
    }
  };

  const canModifyTicket = () => {
    if (!user) return false;
    return user.role === UserRole.AGENT || user.role === UserRole.MANAGER;
  };

  const handleSubmitAppointment = async () => {
    if (!ticket || !apptDate || !apptTime || !apptLocationMethod.trim()) {
      return;
    }

    const appointmentDetails: AppointmentDetails = {
      date: apptDate,
      time: apptTime,
      location_method: apptLocationMethod.trim(),
      proposed_by: user?.id || "",
      proposed_at: new Date().toISOString(),
    };

    try {
      await proposeOrUpdateAppointment(ticket.id, appointmentDetails);
      setApptDate("");
      setApptTime("");
      setApptLocationMethod("");
      setShowAppointmentForm(false);
    } catch (error) {
      console.error("Failed to propose appointment:", error);
    }
  };

  if (!ticket) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <LoadingSpinner text={t("ticketDetail.loading.ticket")} />
      </div>
    );
  }

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto"
      aria-label={t("ticketDetail.pageAria", "Détail du ticket")}
    >
      {/* Header */}
      <div
        className="mb-6"
        aria-label={t("ticketDetail.headerAria", "En-tête du ticket")}
      >
        <Link
          to="/tickets"
          className="inline-flex items-center text-primary hover:text-primary-dark mb-4"
          aria-label={t(
            "ticketDetail.backAria",
            "Retour à la liste des tickets"
          )}
        >
          ← {t("ticketDetail.navigation.backToTickets")}
        </Link>
        <h1
          className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2"
          aria-label={t("ticketDetail.titleAria", "Titre du ticket")}
        >
          {ticket.title}
        </h1>
        <div
          className="flex flex-wrap gap-4 text-sm text-slate-600"
          aria-label={t("ticketDetail.infoAria", "Infos ticket")}
        >
          <span>
            <strong>{t("ticketDetail.info.ticketId")}:</strong> {ticket.id}
          </span>
          <span>
            <strong>{t("ticketDetail.info.status")}:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                ticket.status === "open"
                  ? "bg-red-100 text-red-800"
                  : ticket.status === "in_progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : ticket.status === "resolved"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
              aria-label={t("ticketDetail.statusAria", "Statut du ticket")}
            >
              {t(`enums.ticketStatus.${ticket.status}`, ticket.status)}
            </span>
          </span>
          <span>
            <strong>{t("ticketDetail.info.priority")}:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                ticket.priority === "urgent"
                  ? "bg-red-100 text-red-800"
                  : ticket.priority === "high"
                  ? "bg-orange-100 text-orange-800"
                  : ticket.priority === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
              aria-label={t("ticketDetail.priorityAria", "Priorité du ticket")}
            >
              {t(`enums.ticketPriority.${ticket.priority}`, ticket.priority)}
            </span>
          </span>
        </div>
      </div>

      {/* Auto-read toggle for AI responses */}
      {speechSynthesisSupported && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                {t("ticketDetail.voiceSettings.autoRead.title")}
              </h3>
              <p className="text-xs text-blue-600 mt-1">
                {t("ticketDetail.voiceSettings.autoRead.description")}
              </p>
            </div>
            <button
              onClick={toggleAutoRead}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAutoReadEnabled ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAutoReadEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Ticket Description */}
      <div
        className="mb-6 p-4 bg-slate-50 rounded-lg"
        aria-label={t("ticketDetail.descriptionAria", "Description du ticket")}
      >
        <h2
          className="text-lg font-semibold text-slate-800 mb-2"
          aria-label={t(
            "ticketDetail.descriptionTitleAria",
            "Titre de la description"
          )}
        >
          {t("ticketDetail.sections.description")}
        </h2>
        <p
          className="text-slate-700 whitespace-pre-wrap"
          aria-label={t(
            "ticketDetail.descriptionTextAria",
            "Texte de la description"
          )}
        >
          {ticket.detailed_description}
        </p>
        {ticket.workstation_id && (
          <div
            className="mt-3 text-sm text-slate-600"
            aria-label={t(
              "ticketDetail.workstationAria",
              "ID poste de travail"
            )}
          >
            <strong>{t("ticketDetail.info.workstationId")}:</strong>{" "}
            {ticket.workstation_id}
          </div>
        )}
      </div>

      {/* Status Management (Agents/Managers only) */}
      {canModifyTicket() && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-lg">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {t("ticketDetail.sections.statusManagement")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TICKET_STATUS_KEYS.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status as TicketStatus)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  ticket.status === status
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t(`enums.ticketStatus.${status}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Section (Agents/Managers only) */}
      {canModifyTicket() && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {t("ticketDetail.sections.appointment")}
            </h2>
            <button
              onClick={() => setShowAppointmentForm(!showAppointmentForm)}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark"
            >
              {showAppointmentForm
                ? t("common.actions.cancel")
                : t("ticketDetail.appointment.proposeNew")}
            </button>
          </div>

          {ticket.appointment_details && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <h3 className="font-medium text-green-800 mb-2">
                {t("ticketDetail.appointment.existing")}
              </h3>
              <div className="text-sm text-green-700">
                <p>
                  <strong>{t("ticketDetail.appointment.date")}:</strong>{" "}
                  {ticket.appointment_details.date} {t("common.labels.at")}{" "}
                  {ticket.appointment_details.time}
                </p>
                <p>
                  <strong>{t("ticketDetail.appointment.location")}:</strong>{" "}
                  {ticket.appointment_details.location_method}
                </p>
              </div>
            </div>
          )}

          {showAppointmentForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("ticketDetail.appointment.form.date")}
                  type="date"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  required
                />
                <Input
                  label={t("ticketDetail.appointment.form.time")}
                  type="time"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  required
                />
              </div>
              <Input
                label={t("ticketDetail.appointment.form.location")}
                value={apptLocationMethod}
                onChange={(e) => setApptLocationMethod(e.target.value)}
                placeholder={t(
                  "ticketDetail.appointment.form.locationPlaceholder"
                )}
                required
              />
              <button
                onClick={handleSubmitAppointment}
                disabled={!apptDate || !apptTime || !apptLocationMethod.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t("ticketDetail.appointment.form.submit")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div
        className="mb-6"
        aria-label={t("ticketDetail.conversationAria", "Section conversation")}
      >
        <h2
          className="text-lg font-semibold text-slate-800 mb-4"
          aria-label={t(
            "ticketDetail.conversationTitleAria",
            "Titre conversation"
          )}
        >
          {t("ticketDetail.sections.conversation")}
        </h2>
        <div
          className="space-y-4 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-4"
          aria-label={t(
            "ticketDetail.conversationListAria",
            "Liste des messages"
          )}
        >
          {ticket.chat_messages && ticket.chat_messages.length > 0 ? (
            ticket.chat_messages.map((message) => (
              <div
                key={message.id}
                className="relative"
                aria-label={t("ticketDetail.messageAria", "Message du chat")}
              >
                <ChatMessageComponent
                  message={message}
                  onSpeak={() => handleSpeakMessage(message)}
                  speaking={
                    speechSynthesisSupported
                      ? isSpeaking && speakingMessageId === message.id
                      : false
                  }
                  speechSupported={speechSynthesisSupported}
                  speakButtonProps={{
                    "aria-label":
                      isSpeaking && speakingMessageId === message.id
                        ? t(
                            "ticketDetail.conversation.stopSpeakingAria",
                            "Arrêter la lecture du message"
                          )
                        : t(
                            "ticketDetail.conversation.speakAria",
                            "Lire le message à voix haute"
                          ),
                    title:
                      isSpeaking && speakingMessageId === message.id
                        ? t(
                            "ticketDetail.conversation.stopSpeakingTitle",
                            "Arrêter la lecture"
                          )
                        : t(
                            "ticketDetail.conversation.speakTitle",
                            "Lire le message à voix haute"
                          ),
                  }}
                />
              </div>
            ))
          ) : (
            <p
              className="text-slate-500 text-center py-8"
              aria-label={t("ticketDetail.noMessagesAria", "Aucun message")}
            >
              {t("ticketDetail.conversation.noMessages")}
            </p>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="space-y-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              label={t("ticketDetail.conversation.messageInput")}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("ticketDetail.conversation.messagePlaceholder")}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          {browserSupportsSpeechRecognition && (
            <button
              onClick={handleVoiceInput}
              className={`mb-1 p-2 rounded-md transition-colors ${
                isListeningChatInput
                  ? "bg-red-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              title={
                isListeningChatInput
                  ? t("ticketDetail.conversation.stopListening")
                  : t("ticketDetail.conversation.startListening")
              }
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {speechErrorText && (
          <p className="text-red-600 text-sm">{speechErrorText}</p>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-slate-500">
            {t("ticketDetail.conversation.enterToSend")}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            variant="primary"
          >
            {t("common.actions.send")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const TicketDetailPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TicketDetailPageContent />
    </Suspense>
  );
};

export default TicketDetailPage;

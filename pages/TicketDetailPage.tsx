import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// Suppression de l'i18n
import { useApp } from "../App";
import ChatMessageComponent from "../components/ChatMessage";
import { Button, Textarea, Input } from "../components/FormElements";
import {
  TicketStatus,
  ChatMessage as ChatMessageType,
  UserRole,
  AppointmentDetails,
} from "../types";
import { TICKET_STATUS_KEYS } from "../constants";
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

// ... Suppression des icônes inutilisées ...

const TicketDetailPageContent: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  // Suppression de l'i18n, tout le contenu sera statique en français

  const {
    user,
    getTicketById,
    addChatMessage,
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

  const { speak, cancel, isSpeaking } = useTextToSpeech();
  const speechSynthesisSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // ...

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
      speak(lastMessage.message);
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
      await addChatMessage(ticket.id, newMessage);
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
      cancel();
      setSpeakingMessageId(null);
    } else {
      speak(message.message);
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
      const role = user?.role === UserRole.AGENT ? "agent" : "user";
      await proposeOrUpdateAppointment(
        ticket.id,
        appointmentDetails,
        role,
        user?.id ?? ""
      );
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
        <LoadingSpinner text="Chargement du ticket..." />
      </div>
    );
  }

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto"
      aria-label="Détail du ticket"
    >
      {/* Header */}
      <div className="mb-6" aria-label="En-tête du ticket">
        <Link
          to="/tickets"
          className="inline-flex items-center text-primary hover:text-primary-dark mb-4"
          aria-label="Retour à la liste des tickets"
        >
          ← Retour aux tickets
        </Link>
        <h1
          className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2"
          aria-label="Titre du ticket"
        >
          {ticket.title}
        </h1>
        <div
          className="flex flex-wrap gap-4 text-sm text-slate-600"
          aria-label="Infos ticket"
        >
          <span>
            <strong>ID du ticket :</strong> {ticket.id}
          </span>
          <span>
            <strong>Statut :</strong>{" "}
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
              aria-label="Statut du ticket"
            >
              {ticket.status === "open"
                ? "Ouvert"
                : ticket.status === "in_progress"
                ? "En cours"
                : ticket.status === "resolved"
                ? "Résolu"
                : ticket.status}
            </span>
          </span>
          <span>
            <strong>Priorité :</strong>{" "}
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
              aria-label="Priorité du ticket"
            >
              {ticket.priority === "urgent"
                ? "Urgent"
                : ticket.priority === "high"
                ? "Haute"
                : ticket.priority === "medium"
                ? "Moyenne"
                : ticket.priority}
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
                Lecture automatique des réponses IA
              </h3>
              <p className="text-xs text-blue-600 mt-1">
                Activez pour lire automatiquement les réponses de l'IA à voix
                haute.
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
        aria-label="Description du ticket"
      >
        <h2
          className="text-lg font-semibold text-slate-800 mb-2"
          aria-label="Titre de la description"
        >
          Description
        </h2>
        <p
          className="text-slate-700 whitespace-pre-wrap"
          aria-label="Texte de la description"
        >
          {ticket.detailed_description}
        </p>
        {ticket.workstation_id && (
          <div
            className="mt-3 text-sm text-slate-600"
            aria-label="ID poste de travail"
          >
            <strong>ID poste de travail :</strong> {ticket.workstation_id}
          </div>
        )}
      </div>

      {/* Status Management (Agents/Managers only) */}
      {canModifyTicket() && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-lg">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Gestion du statut
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Array.isArray(TICKET_STATUS_KEYS)
              ? TICKET_STATUS_KEYS.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as TicketStatus)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      ticket.status === status
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {status === "open"
                      ? "Ouvert"
                      : status === "in_progress"
                      ? "En cours"
                      : status === "resolved"
                      ? "Résolu"
                      : status}
                  </button>
                ))
              : null}
          </div>
        </div>
      )}

      {/* Appointment Section (Agents/Managers only) */}
      {canModifyTicket() && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Rendez-vous
            </h2>
            <button
              onClick={() => setShowAppointmentForm(!showAppointmentForm)}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark"
            >
              {showAppointmentForm
                ? "Annuler"
                : "Proposer un nouveau rendez-vous"}
            </button>
          </div>

          {ticket.appointment_details && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <h3 className="font-medium text-green-800 mb-2">
                Rendez-vous existant
              </h3>
              <div className="text-sm text-green-700">
                <p>
                  <strong>Date :</strong> {ticket.appointment_details.date} à{" "}
                  {ticket.appointment_details.time}
                </p>
                <p>
                  <strong>Lieu :</strong>{" "}
                  {ticket.appointment_details.location_method}
                </p>
              </div>
            </div>
          )}

          {showAppointmentForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  required
                />
                <Input
                  label="Heure"
                  type="time"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Lieu ou méthode de rendez-vous"
                value={apptLocationMethod}
                onChange={(e) => setApptLocationMethod(e.target.value)}
                placeholder="Ex : Salle 101, Visio, Téléphone..."
                required
              />
              <button
                onClick={handleSubmitAppointment}
                disabled={!apptDate || !apptTime || !apptLocationMethod.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Proposer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div className="mb-6" aria-label="Section conversation">
        <h2
          className="text-lg font-semibold text-slate-800 mb-4"
          aria-label="Titre conversation"
        >
          Conversation
        </h2>
        <div
          className="space-y-4 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-4"
          aria-label="Liste des messages"
        >
          {ticket.chat_messages && ticket.chat_messages.length > 0 ? (
            ticket.chat_messages.map((message) => (
              <div
                key={message.id}
                className="relative"
                aria-label="Message du chat"
              >
                <ChatMessageComponent
                  message={message}
                  onSpeak={() => handleSpeakMessage(message)}
                  isSpeaking={
                    speechSynthesisSupported
                      ? isSpeaking && speakingMessageId === message.id
                      : false
                  }
                  speechSupported={speechSynthesisSupported}
                  speakButtonProps={{
                    "aria-label":
                      isSpeaking && speakingMessageId === message.id
                        ? "Arrêter la lecture du message"
                        : "Lire le message à voix haute",
                    title:
                      isSpeaking && speakingMessageId === message.id
                        ? "Arrêter la lecture"
                        : "Lire le message à voix haute",
                  }}
                />
              </div>
            ))
          ) : (
            <p
              className="text-slate-500 text-center py-8"
              aria-label="Aucun message"
            >
              Aucun message pour ce ticket.
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
              label="Votre message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message ici..."
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
                  ? "Arrêter la dictée vocale"
                  : "Démarrer la dictée vocale"
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
            Appuyez sur Entrée pour envoyer
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            variant="primary"
          >
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
};

const TicketDetailPage: React.FC = () => {
  // Suppression du Suspense et du fallback inutile
  return <TicketDetailPageContent />;
};

export default TicketDetailPage;

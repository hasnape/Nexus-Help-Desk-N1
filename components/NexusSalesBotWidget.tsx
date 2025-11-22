import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import { useLanguage } from '../contexts/LanguageContext';
import { getFollowUpHelpResponse } from '../services/geminiService';
import { TICKET_CATEGORY_KEYS } from '../constants';

type NexusSalesBotWidgetProps = {
  allowAutoRead?: boolean;
};

const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M5 4a3 3 0 00-3 3v7a3 3 0 003 3h1v2.586A1 1 0 006.707 21l3.293-3H19a3 3 0 003-3V7a3 3 0 00-3-3H5z" />
  </svg>
);

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
    <path
      fillRule="evenodd"
      d="M5.5 8.5A.5.5 0 016 8h1v1.167a5.006 5.006 0 004 0V8h1a.5.5 0 01.5.5v.167A5.003 5.003 0 0013 12.5V14.5h.5a.5.5 0 010 1h-7a.5.5 0 010-1H7v-2a5.003 5.003 0 00-.5-3.833V8.5z"
      clipRule="evenodd"
    />
  </svg>
);

const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M11 3a1 1 0 00-1.707-.707l-3 3A1 1 0 006 6h-.586A1 1 0 004 7v6a1 1 0 001.414.707L7 13.414V14a1 1 0 00.293.707l3 3A1 1 0 0013 17V3h-2z" />
    <path d="M15.657 5.343a1 1 0 10-1.414 1.414 4 4 0 010 5.486 1 1 0 001.414 1.414 6 6 0 000-8.314z" />
  </svg>
);

const StopSpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M4.707 3.293a1 1 0 00-1.414 1.414l12 12a1 1 0 001.414-1.414l-12-12z"
      clipRule="evenodd"
    />
    <path d="M11 3a1 1 0 00-1.707-.707l-3 3A1 1 0 006 6h-.586A1 1 0 004 7v6a1 1 0 001.414.707L7 13.414V14a1 1 0 00.293.707l3 3A1 1 0 0013 17V9.414l-2-2V3z" />
  </svg>
);

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

const buildInitialMessage = (language: string): string => {
  if (language === 'fr') {
    return "Bonjour, je suis Nexus, l’assistant commercial. Je peux vous présenter les offres Freemium, Standard et Pro, et vous aider à naviguer sur le site. Que souhaitez-vous savoir ?";
  }
  if (language === 'ar') {
    return 'مرحبًا، أنا نيكسوس، المساعد التجاري. يمكنني شرح عروض Freemium وStandard وPro ومساعدتك في تصفح الموقع. ما الذي تود معرفته؟';
  }
  return "Hello, I'm Nexus, the sales assistant. I can present the Freemium, Standard, and Pro plans and guide you through the site. What would you like to know?";
};

const buildErrorFallback = (language: string): string => {
  if (language === 'fr') {
    return 'Notre assistant est momentanément indisponible. Vous pouvez réessayer dans quelques instants ou nous contacter via la page Support.';
  }
  if (language === 'ar') {
    return 'المساعد غير متاح حاليًا. يمكنك المحاولة مرة أخرى بعد قليل أو الاتصال بنا عبر صفحة الدعم.';
  }
  return 'Our assistant is temporarily unavailable. Please try again shortly or contact us via the Support page.';
};

const additionalContext = `Tu es Nexus, un assistant commercial pour Nexus Support Hub. Ton rôle est :
- d’expliquer les offres Freemium, Standard (19 €/mois) et Pro (39 €/mois),
- d’expliquer que nous sommes en phase Bêta / Early Access avec quelques entreprises pilotes,
- d’expliquer les points clés : support N1/N2, multilingue FR/EN/AR, hébergement Supabase (RLS, PostgreSQL), accessibilité inspirée du RGAA 4.1,
- d’orienter l’utilisateur vers la bonne action : démarrer l’essai gratuit, demander une démo, ou visiter une section du site (Tarifs, Présentation, Contact, etc.),
- d’adopter un ton professionnel, clair, honnête, sans inventer de chiffres non vérifiés,
- de répondre dans la langue de l’utilisateur.`;

const NexusSalesBotWidget: React.FC<NexusSalesBotWidgetProps> = ({ allowAutoRead = false }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const panelId = useId();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError,
  } = useSpeechRecognition();

  const { isSpeaking, speak, cancel, browserSupportsTextToSpeech, error: ttsError } = useTextToSpeech();

  const ticketCategoryKey = useMemo(
    () =>
      TICKET_CATEGORY_KEYS.includes('ticketCategory.SalesQuestion')
        ? 'ticketCategory.SalesQuestion'
        : 'ticketCategory.GeneralQuestion',
    []
  );

  useEffect(() => {
    if (transcript) {
      setNewMessage((prev) => `${prev}${prev ? ' ' : ''}${transcript}`);
    }
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (isOpen && chatHistory.length === 0) {
      const initial: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: buildInitialMessage(language),
        timestamp: new Date(),
      };
      setChatHistory([initial]);
      if (allowAutoRead && browserSupportsTextToSpeech) {
        speak(initial.text, () => setSpeakingMessageId(null));
        setSpeakingMessageId(initial.id);
      }
    }
  }, [isOpen, chatHistory.length, language, allowAutoRead, browserSupportsTextToSpeech, speak]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const toggleWidget = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isListening) {
      stopListening();
    }
    const trimmed = newMessage.trim();
    if (!trimmed || isLoadingAi) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    const currentHistory = [...chatHistory, userMessage];
    setChatHistory(currentHistory);
    setNewMessage('');
    setIsLoadingAi(true);

    try {
      const aiResponse = await getFollowUpHelpResponse(
        'Nexus Sales Assistant',
        ticketCategoryKey,
        currentHistory,
        1,
        language,
        additionalContext
      );

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: aiResponse.text,
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, aiMessage]);
      if (allowAutoRead && browserSupportsTextToSpeech) {
        speak(aiMessage.text, () => setSpeakingMessageId(null));
        setSpeakingMessageId(aiMessage.id);
      }
    } catch (error) {
      console.error('Sales bot response error', error);
      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: buildErrorFallback(language),
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSpeakMessage = (message: ChatMessage) => {
    if (message.sender !== 'ai' || !browserSupportsTextToSpeech) return;
    if (isSpeaking && speakingMessageId === message.id) {
      cancel();
      setSpeakingMessageId(null);
      return;
    }
    if (isSpeaking) {
      cancel();
    }
    speak(message.text, () => setSpeakingMessageId(null));
    setSpeakingMessageId(message.id);
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`relative max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow ${
            isUser
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          {!isUser && browserSupportsTextToSpeech && (
            <button
              type="button"
              onClick={() => handleSpeakMessage(message)}
              className="absolute -left-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow hover:bg-gray-50"
              aria-label={
                isSpeaking && speakingMessageId === message.id
                  ? t('salesBot.stopReading', { default: 'Stop reading' })
                  : t('salesBot.readAloud', { default: 'Read aloud' })
              }
            >
              {isSpeaking && speakingMessageId === message.id ? (
                <StopSpeakerIcon className="h-4 w-4" />
              ) : (
                <SpeakerIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow">
          {t('salesBot.launchLabel', { default: 'Assistant Nexus' })}
        </span>
        <button
          type="button"
          onClick={toggleWidget}
          aria-label={t('salesBot.openAssistant', { default: "Ouvrir l’assistant commercial Nexus" })}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <ChatBubbleIcon className="h-6 w-6" />
        </button>
      </div>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:inset-auto sm:right-6 sm:bottom-24 sm:w-[360px] sm:rounded-2xl"
        >
          <div className="flex items-start justify-between border-b border-gray-200 p-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('salesBot.title', { default: 'Assistant commercial Nexus' })}
              </h2>
              <p className="text-sm text-gray-600">
                {t('salesBot.subtitle', { default: 'Des réponses rapides sur nos offres et fonctionnalités.' })}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleWidget}
              aria-label={t('common.close', { default: 'Close' })}
              className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex max-h-[60vh] min-h-[240px] flex-col gap-3 overflow-y-auto bg-gray-50 p-4 sm:max-h-[480px]">
            {chatHistory.map(renderMessage)}
            {isLoadingAi && (
              <div className="text-center text-xs text-gray-500">
                {t('salesBot.loading', { default: 'Nexus rédige une réponse…' })}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="space-y-2 border-t border-gray-200 bg-white p-4">
            {(speechError || ttsError) && (
              <p className="text-xs text-red-600">{speechError || ttsError}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                aria-label={
                  isListening
                    ? t('speechRecognition.stop', { default: 'Stop listening' })
                    : t('speechRecognition.start', { default: 'Start listening' })
                }
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-primary shadow transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isListening ? 'bg-primary/10' : 'bg-white'
                }`}
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('salesBot.placeholder', { default: 'Posez votre question...' })}
                className="min-h-[56px] flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={isLoadingAi || !newMessage.trim()}
                className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoadingAi
                  ? t('common.loading', { default: '...' })
                  : t('common.send', { default: 'Envoyer' })}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NexusSalesBotWidget;

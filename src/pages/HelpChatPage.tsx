

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import ChatMessageComponent from '../components/ChatMessage';
import { Button, Textarea } from '../components/FormElements';
import { ChatMessage, UserRole } from '@/types';
import LoadingSpinner from '../components/LoadingSpinner';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { useLanguage } from '@/contexts/LanguageContext';
import { getFollowUpHelpResponse } from '../services/geminiService';
import useTextToSpeech from '../hooks/useTextToSpeech';


const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
    <path fillRule="evenodd" d="M5.5 8.5A.5.5 0 016 8h1v1.167a5.006 5.006 0 004 0V8h1a.5.5 0 01.5.5v.167A5.003 5.003 0 0013 12.5V14.5h.5a.5.5 0 010 1h-7a.5.5 0 010-1H7v-2a5.003 5.003 0 00.5-3.833V8.5z" clipRule="evenodd" />
  </svg>
);

const SpeakerLoudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 3a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM6.5 5.05A.75.75 0 005 5.801v8.397a.75.75 0 001.5.652V5.802a.75.75 0 00-.75-.752zM13.5 5.05a.75.75 0 00-.75.752v8.397a.75.75 0 001.5.652V5.802a.75.75 0 00-.75-.752zM2.75 7.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5zM17.25 7.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5z" />
  </svg>
);

const SpeakerOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M13.28 6.72a.75.75 0 00-1.06-1.06L10 7.94 7.78 5.66a.75.75 0 00-1.06 1.06L8.94 9l-2.22 2.22a.75.75 0 101.06 1.06L10 10.06l2.22 2.22a.75.75 0 101.06-1.06L11.06 9l2.22-2.28z" />
    <path fillRule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zM2.5 10a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" clipRule="evenodd" />
  </svg>
);

const HelpChatPage: React.FC = () => {
    const { user, isAutoReadEnabled, toggleAutoRead } = useApp();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const [showCreateTicketButton, setShowCreateTicketButton] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [initialMessageSpoken, setInitialMessageSpoken] = useState(false);

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        error: speechError,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    const {
        isSpeaking,
        speak,
        cancel: cancelSpeech,
        error: ttsError,
        browserSupportsTextToSpeech
    } = useTextToSpeech();

    // Effect for initializing chat and handling pre-filled messages
    useEffect(() => {
        const initialAiMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: t('helpChat.initialMessage'),
            timestamp: new Date()
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

    useEffect(() => {
        if (transcript) {
            setNewMessage(prev => prev + (prev ? ' ' : '') + transcript);
        }
    }, [transcript]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Auto-read the initial welcome message from the AI if enabled.
    useEffect(() => {
        if (
            !initialMessageSpoken &&
            chatHistory.length === 1 &&
            chatHistory[0].sender === 'ai' &&
            isAutoReadEnabled &&
            browserSupportsTextToSpeech
        ) {
            const initialMessage = chatHistory[0];
            setInitialMessageSpoken(true);
            speak(initialMessage.text, () => setSpeakingMessageId(null));
            setSpeakingMessageId(initialMessage.id);
        }
    }, [chatHistory, isAutoReadEnabled, browserSupportsTextToSpeech, speak, initialMessageSpoken]);

    const handleSendMessage = async (e: React.FormEvent | null, messageTextOverride?: string) => {
        if (e) e.preventDefault();
        if (isListening) stopListening();

        const textToSend = (messageTextOverride || newMessage).trim();
        if (textToSend === '' || isLoadingAi || !user) return;

        const userMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text: textToSend, timestamp: new Date() };
        const currentChat = [...chatHistory, userMessage];
        setChatHistory(currentChat);
        setNewMessage('');
        setIsLoadingAi(true);

        try {
            const aiResponse = await getFollowUpHelpResponse(
                'General Support Request', // Generic title for pre-ticket chat
                'ticketCategory.GeneralQuestion', // Generic category
                currentChat,
                1,
                user.language_preference
            );
            const aiResponseMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', text: aiResponse.text, timestamp: new Date() };
            setChatHistory(prev => [...prev, aiResponseMessage]);
            
            if (isAutoReadEnabled && browserSupportsTextToSpeech) {
                speak(aiResponse.text, () => setSpeakingMessageId(null));
                setSpeakingMessageId(aiResponseMessage.id);
            }

            if (aiResponse.escalationSuggested) {
                setShowCreateTicketButton(true);
            }

        } catch (error: any) {
            console.error("Error getting AI follow-up response:", JSON.stringify(error, null, 2));
            const errorMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', text: t("appContext.error.aiFollowUpFailed", { error: error.message || 'Unknown'}), timestamp: new Date() };
            setChatHistory(prev => [...prev, errorMsg]);
            setShowCreateTicketButton(true); // Show button on error as well
        } finally {
            setIsLoadingAi(false);
        }
    };

    const handleSpeakMessage = (text: string, messageId: string) => {
        if (isSpeaking && speakingMessageId === messageId) {
          cancelSpeech(); 
          setSpeakingMessageId(null);
        } else {
          if (isSpeaking) cancelSpeech();
          speak(text, () => setSpeakingMessageId(null));
          setSpeakingMessageId(messageId);
        }
    };
    
    const handleCreateTicket = () => {
        navigate('/ticket/new', { state: { chatHistory } });
    };

    return (
        <div className="max-w-4xl mx-auto bg-surface shadow-xl rounded-lg overflow-hidden flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)]">
            <header className="bg-slate-700 text-white p-4 sm:p-6 text-center relative">
                <h1 className="text-xl sm:text-2xl font-bold">{t('helpChat.title')}</h1>
                <p className="text-sm text-slate-300">{t('helpChat.subtitle')}</p>
                 {browserSupportsTextToSpeech && (
                    <div className="absolute top-1/2 -translate-y-1/2 end-4">
                        <Button 
                            onClick={toggleAutoRead} 
                            variant="outline" 
                            size="sm"
                            className="!p-1.5 sm:!p-2 !border-slate-500 hover:!bg-slate-600 focus:!ring-sky-500"
                            title={isAutoReadEnabled ? t('navbar.toggleAutoReadDisable') : t('navbar.toggleAutoReadEnable')}
                        >
                            {isAutoReadEnabled ? <SpeakerLoudIcon className="w-5 h-5 text-sky-300" /> : <SpeakerOffIcon className="w-5 h-5 text-slate-400" />}
                        </Button>
                    </div>
                )}
            </header>

            <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-slate-50 border-b border-t border-slate-200">
                {ttsError && <p className="text-xs text-red-600 text-center mb-2">{t('ticketDetail.speechPlaybackError', {error: ttsError})}</p>}
                {chatHistory.map(msg => (
                    <ChatMessageComponent 
                        key={msg.id} 
                        message={msg} 
                        userFullName={user?.full_name} 
                        onSpeak={(text, id) => handleSpeakMessage(text, id)}
                        onCancelSpeak={() => { cancelSpeech(); setSpeakingMessageId(null); }}
                        isCurrentlySpeaking={speakingMessageId === msg.id && isSpeaking}
                        browserSupportsTextToSpeech={browserSupportsTextToSpeech}
                    />
                ))}
                 {isLoadingAi && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow bg-slate-200 text-slate-800 rounded-bl-none">
                            <div className="flex items-center"><p className="font-semibold text-sm me-2">{t('ticketDetail.aiAssistantName')}</p><LoadingSpinner size="sm" className="!p-0" /></div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 sm:p-6 bg-slate-100 border-t border-slate-200">
                 {showCreateTicketButton && (
                    <div className="text-center mb-4 p-3 bg-primary/10 rounded-md">
                        <p className="text-sm text-primary-dark mb-2">{t('helpChat.createTicketExplanation')}</p>
                        <Button variant="primary" onClick={handleCreateTicket}>
                            {t('helpChat.createTicketButton')}
                        </Button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-start space-x-2 sm:space-x-3 rtl:space-x-reverse">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isListening ? t('ticketDetail.chatPlaceholder.listening') : t('helpChat.placeholder')}
                        rows={2}
                        className="flex-grow resize-none focus:ring-2"
                        disabled={isLoadingAi || isListening}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSendMessage(e); }}}
                    />
                    {browserSupportsSpeechRecognition && (
                        <Button type="button" onClick={() => isListening ? stopListening() : startListening()} variant={isListening ? 'danger' : 'secondary'} size="md" className="h-full px-3 sm:px-4 self-stretch !py-0" aria-label={isListening ? t('ticketDetail.micButton.stopRecording') : t('ticketDetail.micButton.startRecording')} disabled={isLoadingAi} title={isListening ? t('ticketDetail.micButton.stopRecording') : t('ticketDetail.micButton.startRecording')}>
                            <MicrophoneIcon className="w-5 h-5" />
                        </Button>
                    )}
                    <Button type="submit" variant="primary" size="md" className="h-full px-3 sm:px-5 self-stretch !py-0" disabled={isLoadingAi || !newMessage.trim() || isListening} isLoading={isLoadingAi}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                        <span className="ms-1 sm:ms-2 hidden sm:inline">{isLoadingAi ? t('ticketDetail.sendMessageButtonLoading') : t('ticketDetail.sendMessageButton')}</span>
                    </Button>
                </form>
                {browserSupportsSpeechRecognition && !isListening && !speechError && (
                    <p className="text-xs text-center text-slate-500 mt-2">{t('helpChat.voiceInputHint')}</p>
                )}
                {speechError && <p className="text-xs text-red-600 text-center mt-2">{speechError}</p>}
            </div>
        </div>
    );
};

export default HelpChatPage;
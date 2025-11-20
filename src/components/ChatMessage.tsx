
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { Button } from './FormElements';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/App';

const SpeakerWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M9.498 3.542A4.502 4.502 0 006.5 6.5v1.237A4.004 4.004 0 004 11.5v3a.5.5 0 001 0v-3a3.002 3.002 0 012.05-2.883.5.5 0 00.45-.456V6.5a3.502 3.502 0 012.998-3.458.5.5 0 000-.992zM14.5 5a.5.5 0 000 1a2.5 2.5 0 012.5 2.5.5.5 0 001 0A3.5 3.5 0 0014.5 5z" />
    <path d="M10 3a.5.5 0 000 1A5.506 5.506 0 0115.5 9.5a.5.5 0 001 0A6.507 6.507 0 0010 3z" />
  </svg>
);

const SpeakerXMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 3.5A6.5 6.5 0 003.5 10a.75.75 0 001.5 0 5 5 0 0110 0 .75.75 0 001.5 0A6.5 6.5 0 0010 3.5zM6.07 7.73l-.944.943a.75.75 0 101.06 1.06l.944-.943a.75.75 0 10-1.06-1.06zm8.92 0a.75.75 0 00-1.06 1.06l.943.943a.75.75 0 001.06-1.06l-.943-.943zM8.755 11h2.49a.75.75 0 000-1.5H8.755a.75.75 0 000 1.5z" />
    <path fillRule="evenodd" d="M3.235 3.235a.75.75 0 011.06 0L10 8.94l5.705-5.706a.75.75 0 111.06 1.06L11.06 10l5.706 5.705a.75.75 0 11-1.06 1.06L10 11.06l-5.705 5.706a.75.75 0 01-1.06-1.06L8.94 10 3.235 4.295a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

const InformationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
  </svg>
);


interface ChatMessageProps {
  message: ChatMessageType;
  userFullName?: string; 
  onSpeak?: (text: string, messageId: string) => void;
  onCancelSpeak?: () => void;
  isCurrentlySpeaking?: boolean;
  browserSupportsTextToSpeech?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
    message, 
    userFullName, 
    onSpeak, 
    onCancelSpeak, 
    isCurrentlySpeaking = false,
    browserSupportsTextToSpeech = false 
}) => {
  const { t, getBCP47Locale } = useLanguage();
  const { getAllUsers } = useApp();
  const isSenderUser = message.sender === 'user';
  const isSystemSummary = message.sender === 'system_summary';
  
  let displayName = '';
  if (message.sender === 'user') {
    displayName = userFullName || t('ticketDetail.userDisplayName');
  } else if (message.sender === 'ai') {
    displayName = t('ticketDetail.aiAssistantName');
  } else if (message.sender === 'agent') {
    const agent = getAllUsers().find(u => u.id === message.agentId);
    displayName = t('ticketDetail.agentDisplayName', { agentName: agent?.full_name || t('ticketDetail.unknownAgent', { default: "Agent" }) });
  } else if (isSystemSummary) {
    displayName = t('chatMessage.systemSummaryTitle', { default: "System Summary" });
  }

  const handleSpeakerClick = () => {
    if (message.sender !== 'ai' || !browserSupportsTextToSpeech || !onSpeak || !onCancelSpeak) return;

    if (isCurrentlySpeaking) {
      onCancelSpeak();
    } else {
      onSpeak(message.text, message.id);
    }
  };

  const getBubbleStyles = () => {
    if (isSenderUser) {
      return 'bg-blue-600 text-white rounded-br-none';
    } else if (isSystemSummary) {
      return 'bg-purple-100 text-purple-800 border border-purple-300 rounded-bl-none';
    } else { // AI or Agent
      return 'bg-slate-200 text-slate-800 rounded-bl-none';
    }
  };

  const getTextAlign = () => {
    if (isSystemSummary) return 'justify-center'; // Center system messages or keep left
    return isSenderUser ? 'justify-end' : 'justify-start';
  }

  const getMargin = () => {
    if (isSystemSummary) return 'mx-auto'; // Center system messages
    return isSenderUser ? 'ms-auto' : 'me-auto';
  }


  return (
    <div className={`flex mb-4 ${getTextAlign()}`}>
      <div 
        className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow relative ${getBubbleStyles()} ${getMargin()}`}
      >
        <div className="flex items-center mb-1">
          {isSystemSummary && <InformationCircleIcon className="w-4 h-4 me-2 text-purple-600" />}
          <p className={`font-semibold text-sm ${isSystemSummary ? 'text-purple-700' : ''}`}>{displayName}</p>
          {!isSystemSummary && (
            <p className={`text-xs mx-2 ${isSenderUser ? 'text-blue-200' : 'text-slate-500'}`}>
              {new Date(message.timestamp).toLocaleTimeString(getBCP47Locale(), { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {message.sender === 'ai' && browserSupportsTextToSpeech && onSpeak && onCancelSpeak && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeakerClick}
              className="!p-1 !ms-auto !border-none hover:!bg-slate-300 focus:!ring-0"
              aria-label={
                isCurrentlySpeaking
                  ? t('tts.stopReading', { defaultValue: t('chatMessage.stopSpeakingLabel') })
                  : t('tts.readMessage', { defaultValue: t('chatMessage.speakMessageLabel') })
              }
              title={
                isCurrentlySpeaking
                  ? t('tts.stopReading', { defaultValue: t('chatMessage.stopSpeakingLabel') })
                  : t('tts.readMessage', { defaultValue: t('chatMessage.speakMessageLabel') })
              }
            >
              {isCurrentlySpeaking ?
                <SpeakerXMarkIcon className="w-4 h-4 text-red-500" /> :
                <SpeakerWaveIcon className="w-4 h-4 text-slate-600" />
              }
            </Button>
          )}
        </div>
        <p className={`text-sm whitespace-pre-wrap ${isSystemSummary ? 'italic' : ''}`}>{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;

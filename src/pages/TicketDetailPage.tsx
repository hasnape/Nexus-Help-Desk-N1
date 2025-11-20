
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/App';
import ChatMessageComponent from '@/components/ChatMessage';
import { Button, Textarea, Select, Input } from '@/components/FormElements'; // Added Input
import { TicketStatus, ChatMessage as ChatMessageType, TicketPriority, UserRole, AppointmentDetails } from '@/types';
import { TICKET_STATUS_KEYS, TICKET_PRIORITY_KEYS } from '@/constants';
import LoadingSpinner from '@/components/LoadingSpinner';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useTextToSpeech from '@/hooks/useTextToSpeech';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';



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

const ReplayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M15.323 6.401a.75.75 0 011.06.023l1.804 1.904a.75.75 0 01-.024 1.06 8.5 8.5 0 11-6.702-8.056.75.75 0 011.45.394 7 7 0 105.405 6.471l-1.804-1.904a.75.75 0 01.024-1.06zM8.75 4.5a.75.75 0 00-1.5 0v4.44l-1.97-1.97a.75.75 0 10-1.06 1.06L6.44 10l-2.22 2.22a.75.75 0 101.06 1.06L7.25 11.56V14.5a.75.75 0 001.5 0V4.5z" clipRule="evenodd" />
  </svg>
);

const HeadsetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M12.529 2.193a.75.75 0 00-1.058.086L7.79 5.862A3.751 3.751 0 006.25 8.25v3.5A3.751 3.751 0 007.79 15.34l3.68 3.583a.75.75 0 001.059.086l.001-.001.001-.001a11.203 11.203 0 004.16-5.191C17.73 11.042 18 10.01 18 9c0-1.01-.27-2.042-.71-3.007a11.203 11.203 0 00-4.16-5.192l-.001-.001zM7.75 8.25a2.25 2.25 0 012.25-2.25h.5a2.25 2.25 0 012.25 2.25v3.5a2.25 2.25 0 01-2.25-2.25h-.5a2.25 2.25 0 01-2.25-2.25v-3.5z" />
    <path d="M3.504 9.42a.75.75 0 010-1.061l1.5-1.5a.75.75 0 111.06 1.061L5.03 9l1.033 1.03a.75.75 0 01-1.06 1.061l-1.5-1.5-.001-.002zM15.46 8.44a.75.75 0 011.06 0l1.5 1.5a.75.75 0 11-1.06 1.06L15.938 10l-1.03 1.03a.75.75 0 11-1.06-1.06l1.5-1.5z" />
  </svg>
);

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M5.75 3a.75.75 0 01.75.75V4h7V3.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V3.75A.75.75 0 015.75 3zM4.5 8.5A.5.5 0 015 8h10a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H5a.5.5 0 01-.5-.5v-3zM5 13.25A.75.75 0 005.75 14h.5a.75.75 0 000-1.5h-.5A.75.75 0 005 13.25zM7.25 13a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zm2.25.75A.75.75 0 0010.25 13h.5a.75.75 0 000-1.5h-.5a.75.75 0 00-.75.75zm2.25-.75a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);


const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const {
    getTicketById,
    user,
    addChatMessage,
    sendAgentMessage,
    isLoadingAi,
    updateTicketStatus,
    isAutoReadEnabled,
    toggleAutoRead,
    proposeOrUpdateAppointment,
    deleteAppointment,
    restoreAppointment
  } = useApp();
  const { t, getBCP47Locale, language } = useLanguage();
  const { t: i18nT } = useTranslation(['appointment', 'common']);

  const ticket = ticketId ? getTicketById(ticketId) : undefined;

  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [lastSpokenAiMessage, setLastSpokenAiMessage] = useState<{ text: string; id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: 'success' | 'error'; msg: string }>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  type AppointmentDetail = {
    id: string;
    ticket_id: string;
    proposed_by: 'agent' | 'user';
    status:
      | 'pending_user_approval'
      | 'pending_agent_approval'
      | 'confirmed'
      | 'cancelled_by_user'
      | 'cancelled_by_agent'
      | 'rescheduled_by_user'
      | 'rescheduled_by_agent';
    proposed_date: string;
    proposed_time: string;
    location_or_method: string;
  };

  const [undoAppt, setUndoAppt] = useState<AppointmentDetail | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<number | null>(null);
  const undoBtnRef = useRef<HTMLButtonElement | null>(null);
  const deleteBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!feedback) return;
    const focusTimeout = window.setTimeout(() => {
      feedbackRef.current?.focus();
    }, 0);
    const dismissTimeout = window.setTimeout(() => setFeedback(null), 3000);
    return () => {
      window.clearTimeout(focusTimeout);
      window.clearTimeout(dismissTimeout);
    };
  }, [feedback]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        window.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, []);

  // Appointment proposal state for agents/managers
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptLocationMethod, setApptLocationMethod] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);


  const {
    isListening: isListeningChatInput,
    transcript: chatTranscript,
    startListening: startChatListening,
    stopListening: stopChatListening,
    error: speechErrorText,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const {
    isSpeaking,
    speakingMessageId,
    speak,
    cancel: cancelSpeech,
    error: ttsErrorText,
    browserSupportsTextToSpeech
  } = useTextToSpeech();

  useEffect(() => {
    if (chatTranscript) {
      setNewMessage(prev => prev + (prev ? ' ' : '') + chatTranscript);
    }
  }, [chatTranscript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.chat_history]);
  
  useEffect(() => {
    if (!ticket && ticketId) {
        const redirectTimer = setTimeout(() => {
            if (!getTicketById(ticketId)) {
                navigate('/dashboard', { replace: true });
            }
        }, 1500); 

        return () => clearTimeout(redirectTimer);
    }
  }, [ticket, ticketId, getTicketById, navigate]);


  const handleSpeakMessage = (text: string, messageId: string, isAiMsg: boolean) => {
    if (isListeningChatInput) stopChatListening();
    if (isAiMsg) setLastSpokenAiMessage({ text, id: messageId });
    speak(text, { messageId });
  };

  const handleNewAiMessageForAutoRead = (aiMessage: ChatMessageType) => {
    if (isAutoReadEnabled && browserSupportsTextToSpeech && aiMessage.id !== speakingMessageId && aiMessage.sender === 'ai') {
      handleSpeakMessage(aiMessage.text, aiMessage.id, true);
    }
  };

  if (!ticket || !user) {
    return <div className="text-center py-10"><LoadingSpinner text={t('ticketDetail.loading')} /></div>;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListeningChatInput) stopChatListening();
    if (newMessage.trim() === '' || !ticketId || isLoadingAi) return;
    
    if (isSpeaking) { cancelSpeech(); }

    if (user.role === UserRole.AGENT || user.role === UserRole.MANAGER) {
      await sendAgentMessage(ticketId, newMessage.trim());
    } else { 
      await addChatMessage(ticketId, newMessage.trim(), handleNewAiMessageForAutoRead);
    }
    setNewMessage('');
  };

  const handleStatusChange = (newStatusString: string) => {
    const newStatus = newStatusString as TicketStatus;
    if (ticketId) updateTicketStatus(ticketId, newStatus);
  };
  
  const handleCancelCurrentlySpeaking = () => { cancelSpeech(); };

  const handleChatMicButtonClick = () => {
    if (isSpeaking) { cancelSpeech(); }
    if (isListeningChatInput) stopChatListening(); else startChatListening();
  };

  const handleRepeatLastMessage = () => {
    let messageToSpeak = lastSpokenAiMessage;
    if (!messageToSpeak && ticket?.chat_history) {
        const lastAiMsgInHistory = ticket.chat_history.filter(m => m.sender === 'ai').pop();
        if (lastAiMsgInHistory) messageToSpeak = { text: lastAiMsgInHistory.text, id: lastAiMsgInHistory.id };
    }
    if (messageToSpeak && browserSupportsTextToSpeech) {
        speak(messageToSpeak!.text, { messageId: messageToSpeak.id });
        setLastSpokenAiMessage(messageToSpeak);
    }
  };

  const handleContactAgent = () => {
    alert(t('ticketDetail.contactAgent.alertMessage'));
  };

  const handleDeleteAppointment = async () => {
    const currentAppointmentId = ticket.current_appointment?.id;
    if (!currentAppointmentId) {
      return;
    }
    setIsDeletingAppointment(true);
    await deleteAppointment(currentAppointmentId, ticket.id);
    setIsDeletingAppointment(false);
  };

  const handleProposeAppointment = async () => {
    if (!apptDate || !apptTime || !apptLocationMethod || !ticketId || (user.role !== UserRole.AGENT && user.role !== UserRole.MANAGER)) return;
    const currentStatusForProposal: AppointmentDetails['status'] = 'pending_user_approval';
    await proposeOrUpdateAppointment(
        ticketId,
        { 
            proposedDate: apptDate, 
            proposedTime: apptTime, 
            locationOrMethod: apptLocationMethod,
            status: currentStatusForProposal
        },
        'agent',
        currentStatusForProposal
    );
    setShowAppointmentForm(false);
    setApptDate(''); setApptTime(''); setApptLocationMethod('');
  };

  const handleUserAcceptAppointment = () => {
    if (!ticket.current_appointment || !ticketId) return;
    proposeOrUpdateAppointment(
        ticketId,
        { ...ticket.current_appointment },
        'user',
        'confirmed'
    );
  };

  const handleUserSuggestDifferentAppointment = () => {
     if (!ticket.current_appointment || !ticketId) return;
      proposeOrUpdateAppointment(
        ticketId,
        { ...ticket.current_appointment },
        'user',
        'rescheduled_by_user'
    );
  };


  const canRepeatLastMessage = (lastSpokenAiMessage || ticket.chat_history.some(m => m.sender === 'ai')) && browserSupportsTextToSpeech;
  const isTicketClosedOrResolved = ticket.status === TICKET_STATUS_KEYS.RESOLVED || ticket.status === TICKET_STATUS_KEYS.CLOSED;
  const isAgentOrManager = user.role === UserRole.AGENT || user.role === UserRole.MANAGER;

  const priorityColors: Record<string, string> = { 
      [TICKET_PRIORITY_KEYS.LOW]: 'text-green-600', 
      [TICKET_PRIORITY_KEYS.MEDIUM]: 'text-yellow-600', 
      [TICKET_PRIORITY_KEYS.HIGH]: 'text-red-600' 
  };
  const statusColorsTag: Record<string, string> = { 
    [TICKET_STATUS_KEYS.OPEN]: 'bg-blue-100 text-blue-800', 
    [TICKET_STATUS_KEYS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800', 
    [TICKET_STATUS_KEYS.RESOLVED]: 'bg-green-100 text-green-800',
    [TICKET_STATUS_KEYS.CLOSED]: 'bg-slate-100 text-slate-800'
  };
  
  const statusOptions = Object.values(TICKET_STATUS_KEYS).map(statusKey => ({
    value: statusKey,
    label: t(`ticketStatus.${statusKey}`)
  }));

  const renderAppointmentSection = () => {
    if (isAgentOrManager) {
      return (
        <div className="my-4 p-3 bg-slate-100 rounded-md border border-slate-300">
          {!showAppointmentForm && (
            <Button onClick={() => setShowAppointmentForm(true)} variant="secondary" size="sm">
              <CalendarIcon className="w-4 h-4 me-2" />
              {t('appointment.proposeButtonLabel')}
            </Button>
          )}
          {showAppointmentForm && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700">{t('appointment.form.title')}</h4>
              <Input type="date" label={t('appointment.form.dateLabel')} value={apptDate} onChange={e => setApptDate(e.target.value)} />
              <Input type="time" label={t('appointment.form.timeLabel')} value={apptTime} onChange={e => setApptTime(e.target.value)} />
              <Input type="text" label={t('appointment.form.locationMethodLabel')} placeholder={t('appointment.form.locationMethodPlaceholder')} value={apptLocationMethod} onChange={e => setApptLocationMethod(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleProposeAppointment} variant="primary" size="sm" disabled={!apptDate || !apptTime || !apptLocationMethod}>
                  {t('appointment.form.submitButton')}
                </Button>
                <Button onClick={() => setShowAppointmentForm(false)} variant="outline" size="sm">
                  {t('appointment.form.cancelButton')}
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    } else if (user.role === UserRole.USER && ticket.current_appointment && ticket.current_appointment.status === 'pending_user_approval') {
      const { proposedDate, proposedTime, locationOrMethod } = ticket.current_appointment;
      const formattedDate = new Date(proposedDate).toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
      return (
        <div className="my-4 p-3 bg-blue-50 border border-blue-300 rounded-md text-sm">
          <p className="font-semibold text-blue-700">{t('appointment.user.pendingApprovalTitle')}</p>
          <p>{t('appointment.user.proposalDetails', { date: formattedDate, time: proposedTime, location: locationOrMethod })}</p>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleUserAcceptAppointment} variant="primary" size="sm">{t('appointment.user.acceptButton')}</Button>
            <Button onClick={handleUserSuggestDifferentAppointment} variant="outline" size="sm">{t('appointment.user.suggestDifferentButton')}</Button>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const renderCurrentAppointmentInfo = () => {
    if (!ticket.current_appointment) return null;
    const { proposedDate, proposedTime, locationOrMethod, status } = ticket.current_appointment;
    const formattedDate = new Date(proposedDate).toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    let statusText = t(`appointment.status.${status}`, { default: status });
    let statusColor = 'text-slate-700';
    if (status === 'confirmed') statusColor = 'text-green-700 font-semibold';
    else if (status.includes('pending')) statusColor = 'text-yellow-700';
    else if (status.includes('cancelled')) statusColor = 'text-red-700';

    return (
      <div className={`mt-2 p-2 rounded text-xs border ${status === 'confirmed' ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-300'}`}>
          <span className="font-semibold">{t('appointment.currentStatusLabel')}: </span>
          <span className={statusColor}>{statusText}</span>
          <br />
          {t('appointment.detailsLabel', { date: formattedDate, time: proposedTime, location: locationOrMethod })}
          {isAgentOrManager && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                ref={deleteBtnRef}
                type="button"
                className="px-3 py-1 rounded-md border text-sm disabled:opacity-50 shrink-0"
                disabled={deleting}
                aria-label={i18nT('appointment.delete_button')}
                title={i18nT('appointment.delete_button')}
                onClick={async () => {
                  if (deleting) return;
                  const appt = ticket.current_appointment;
                  if (!appt?.id) return;

                  const confirmed = window.confirm(
                    `${i18nT('appointment.confirm_title')}\n\n${i18nT('appointment.confirm_body')}`
                  );
                  if (!confirmed) return;

                  const normalizedTime = appt.proposedTime?.length === 5
                    ? `${appt.proposedTime}:00`
                    : appt.proposedTime;

                  const appointmentSnapshot: AppointmentDetail = {
                    id: appt.id,
                    ticket_id: ticket.id,
                    proposed_by: appt.proposedBy,
                    status: appt.status,
                    proposed_date: appt.proposedDate,
                    proposed_time: normalizedTime,
                    location_or_method: appt.locationOrMethod,
                  };

                  setUndoAppt(appointmentSnapshot);

                  setDeleting(true);
                  const ok = await deleteAppointment(appt.id, ticket.id);
                  setDeleting(false);

                  if (ok) {
                    setShowUndo(true);
                    window.setTimeout(() => {
                      undoBtnRef.current?.focus();
                    }, 0);
                    if (undoTimerRef.current) {
                      window.clearTimeout(undoTimerRef.current);
                    }
                    undoTimerRef.current = window.setTimeout(() => {
                      setShowUndo(false);
                      setUndoAppt(null);
                      undoTimerRef.current = null;
                    }, 10000);
                  } else {
                    if (undoTimerRef.current) {
                      window.clearTimeout(undoTimerRef.current);
                      undoTimerRef.current = null;
                    }
                    setShowUndo(false);
                    setUndoAppt(null);
                  }

                  const successMsg =
                    i18nT('appointment.delete_success', { defaultValue: 'Rendez-vous supprimé.' }) ||
                    'Rendez-vous supprimé.';
                  const errorMsg =
                    i18nT('appointment.delete_error', {
                      defaultValue: 'Échec de la suppression du rendez-vous.',
                    }) || 'Échec de la suppression du rendez-vous.';

                  if (ok) {
                    setFeedback({ type: 'success', msg: successMsg });
                  } else {
                    setFeedback({ type: 'error', msg: errorMsg });
                    window.setTimeout(() => {
                      deleteBtnRef.current?.focus();
                    }, 300);
                  }
                }}
              >
                {deleting
                  ? i18nT('common.deleting')
                  : i18nT('appointment.delete_button')}
              </button>
            </div>
          )}
        </div>
      );
  };


  return (
    <>
      <div className="max-w-4xl mx-auto bg-surface shadow-xl rounded-lg overflow-hidden flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)]">
      <header className="bg-slate-700 text-white p-4 sm:p-6">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl sm:text-2xl font-bold truncate" title={ticket.title}>{ticket.title}</h1>
          <Link to={user.role === UserRole.USER ? "/dashboard" : (user.role === UserRole.AGENT ? "/agent/dashboard" : "/manager/dashboard")}>
            <Button variant="outline" size="sm" className="!text-white !border-white hover:!bg-slate-600">
              {t('ticketDetail.backToDashboardButton')}
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div><span className="font-semibold block text-slate-300">{t('ticketDetail.categoryLabel')}</span><span className="text-slate-100">{t(ticket.category)}</span></div>
          <div><span className="font-semibold block text-slate-300">{t('ticketDetail.priorityLabel')}</span><span className={`${priorityColors[ticket.priority] || 'text-slate-100'} font-medium`}>{t(`ticketPriority.${ticket.priority}`)}</span></div>
          <div><span className="font-semibold block text-slate-300">{t('ticketDetail.createdLabel')}</span><span className="text-slate-100">{new Date(ticket.created_at).toLocaleDateString(getBCP47Locale())}</span></div>
          <div><span className="font-semibold block text-slate-300">{t('ticketDetail.statusLabel')}</span><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColorsTag[ticket.status]}`}>{t(`ticketStatus.${ticket.status}`)}</span></div>
        </div>
        {ticket.workstation_id && <div className="mt-2 text-xs"><span className="font-semibold text-slate-300">{t('newTicket.form.workstationIdLabel')}: </span><span className="text-slate-100">{ticket.workstation_id}</span></div>}
        {ticket.assigned_agent_id && isAgentOrManager && <div className="mt-2 text-xs"><span className="font-semibold text-slate-300">{t('managerDashboard.tableHeader.assignedAgent')}: </span><span className="text-slate-100">{ticket.assigned_agent_id}</span></div>}
        {renderCurrentAppointmentInfo()}
        {feedback && (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live={feedback.type === 'error' ? 'assertive' : 'polite'}
            className={
              'mt-2 rounded-md px-3 py-2 text-sm outline-none ' +
              (feedback.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200')
            }
          >
            <div className="flex items-start gap-2">
              {feedback.type === 'success' ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 flex-shrink-0">
                  <path
                    d="M9 12l2 2 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 flex-shrink-0">
                  <path
                    d="M10.29 3.86l-8.4 14.58A2 2 0 003.53 22h16.94a2 2 0 001.74-3.56L13.82 3.86a2 2 0 00-3.53 0z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 9v4m0 4h.01"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <span>{feedback.msg}</span>
            </div>
          </div>
        )}
        {showUndo && undoAppt && (
          <div
            className="mt-2 rounded-md border px-3 py-2 text-sm flex items-center justify-between"
            role="status"
            aria-live="polite"
          >
            <span>{i18nT('appointment.deleted_banner', { defaultValue: 'Rendez-vous supprimé.' }) || 'Rendez-vous supprimé.'}</span>
            <div className="flex items-center gap-2">
              <button
                ref={undoBtnRef}
                className="px-3 py-1 rounded-md border"
                onClick={async () => {
                  if (undoTimerRef.current) {
                    window.clearTimeout(undoTimerRef.current);
                    undoTimerRef.current = null;
                  }
                  setShowUndo(false);
                  if (!undoAppt) return;
                  const ok = await restoreAppointment(undoAppt, undoAppt.ticket_id);
                  if (!ok) {
                    console.error('Failed to restore appointment');
                    const restoreErrorMsg =
                      i18nT('appointments.restore_error', {
                        defaultValue: 'Échec de la restauration du rendez-vous.',
                      }) || 'Échec de la restauration du rendez-vous.';
                    setFeedback({ type: 'error', msg: restoreErrorMsg });
                  } else {
                    const restoreSuccessMsg =
                      i18nT('appointments.restore_success', {
                        defaultValue: 'Rendez-vous restauré.',
                      }) || 'Rendez-vous restauré.';
                    setFeedback({ type: 'success', msg: restoreSuccessMsg });
                  }
                  setUndoAppt(null);
                }}
              >
                {i18nT('appointment.undo', { defaultValue: 'Annuler' }) || 'Annuler'}
              </button>
              <button
                className="px-2 py-1 text-xs opacity-70 hover:opacity-100"
                onClick={() => {
                  if (undoTimerRef.current) {
                    window.clearTimeout(undoTimerRef.current);
                    undoTimerRef.current = null;
                  }
                  setShowUndo(false);
                  setUndoAppt(null);
                }}
                aria-label={i18nT('common.close', { defaultValue: 'Fermer' }) || 'Fermer'}
                title={i18nT('common.close', { defaultValue: 'Fermer' }) || 'Fermer'}
              >
                {i18nT('common.close', { defaultValue: 'Fermer' }) || 'Fermer'}
              </button>
            </div>
          </div>
        )}
        <div className="mt-3">
            <Select label={t('ticketDetail.updateStatusLabel')} id="ticketStatus" value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)} options={statusOptions} className="bg-slate-600 border-slate-500 text-white focus:ring-sky-500 focus:border-sky-500 text-sm py-1.5 w-full sm:w-auto"/>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 items-center justify-start border-t border-slate-600 pt-3">
            {browserSupportsTextToSpeech && (<Button onClick={toggleAutoRead} variant="outline" size="sm" className="!py-1.5 !px-2 !border-slate-400 hover:!bg-slate-600 focus:!ring-sky-500" title={isAutoReadEnabled ? t('ticketDetail.autoRead.disableTitle') : t('ticketDetail.autoRead.enableTitle')}>{isAutoReadEnabled ? <SpeakerLoudIcon className="w-5 h-5 text-sky-300 me-1.5" /> : <SpeakerOffIcon className="w-5 h-5 text-slate-300 me-1.5" />}{isAutoReadEnabled ? t('ticketDetail.autoRead.disableButton') : t('ticketDetail.autoRead.enableButton')}</Button>)}
            <Button onClick={handleRepeatLastMessage} variant="outline" size="sm" className="!py-1.5 !px-2 !border-slate-400 hover:!bg-slate-600 focus:!ring-sky-500" disabled={!canRepeatLastMessage || isSpeaking || isListeningChatInput} title={t('ticketDetail.repeatButton.title')}><ReplayIcon className="w-5 h-5 text-slate-300 me-1.5" />{t('ticketDetail.repeatButton.label')}</Button>
            {user.role === UserRole.USER && <Button onClick={handleContactAgent} variant="outline" size="sm" className="!py-1.5 !px-2 !border-amber-400 !text-amber-300 hover:!bg-amber-600 hover:!text-white focus:!ring-amber-500" disabled={isTicketClosedOrResolved} title={t('ticketDetail.contactAgent.buttonTitle')}><HeadsetIcon className="w-5 h-5 me-1.5" />{t('ticketDetail.contactAgent.buttonLabel')}</Button>}
        </div>
      </header>
      
      {renderAppointmentSection()}

      <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-slate-50 border-b border-t border-slate-200">
        {speechErrorText && <p className="text-xs text-red-600 text-center mb-2">{speechErrorText}</p>}
        {ttsErrorText && <p className="text-xs text-red-600 text-center mb-2">{t('ticketDetail.speechPlaybackError', {error: ttsErrorText})}</p>}
        {ticket.chat_history.map(msg => (<ChatMessageComponent key={msg.id} message={msg} userFullName={user.full_name} onSpeak={(text, id) => handleSpeakMessage(text, id, msg.sender === 'ai')} onCancelSpeak={handleCancelCurrentlySpeaking} isCurrentlySpeaking={speakingMessageId === msg.id && isSpeaking} browserSupportsTextToSpeech={browserSupportsTextToSpeech}/>))}
        {isLoadingAi && user.role === UserRole.USER && ticket.chat_history.length > 0 && ticket.chat_history[ticket.chat_history.length -1].sender === 'user' && !ticket.assigned_agent_id && (
          <div className="flex justify-start mb-4">
             <div className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow bg-slate-200 text-slate-800 rounded-bl-none">
                <div className="flex items-center"><p className="font-semibold text-sm me-2">{t('ticketDetail.aiAssistantName')}</p><LoadingSpinner size="sm" className="!p-0" /></div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 sm:p-6 bg-slate-100 border-t border-slate-200">
        <div className="flex items-start space-x-2 sm:space-x-3 rtl:space-x-reverse">
          <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={isListeningChatInput ? t('ticketDetail.chatPlaceholder.listening') : (isTicketClosedOrResolved ? t('ticketDetail.chatPlaceholder.closed') : t('ticketDetail.chatPlaceholder.default'))} rows={2} className="flex-grow resize-none focus:ring-2" disabled={isLoadingAi || isListeningChatInput || isTicketClosedOrResolved} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); }}}/>
          {browserSupportsSpeechRecognition && (<Button type="button" onClick={handleChatMicButtonClick} variant={isListeningChatInput ? 'danger' : 'secondary'} size="md" className="h-full px-3 sm:px-4 self-stretch !py-0" aria-label={isListeningChatInput ? t('ticketDetail.micButton.stopRecording') : t('ticketDetail.micButton.startRecording')} disabled={isLoadingAi || isTicketClosedOrResolved} title={isListeningChatInput ? t('ticketDetail.micButton.stopRecording') : t('ticketDetail.micButton.startRecording')}><MicrophoneIcon className={`w-5 h-5`} /></Button>)}
          <Button type="submit" variant="primary" size="md" className="h-full px-3 sm:px-5 self-stretch !py-0" disabled={(user.role === UserRole.USER && isLoadingAi && !!newMessage.trim() && !ticket.assigned_agent_id) || !newMessage.trim() || isListeningChatInput || isTicketClosedOrResolved} isLoading={user.role === UserRole.USER && isLoadingAi && !!newMessage.trim() && !ticket.assigned_agent_id}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg><span className="ms-1 sm:ms-2 hidden sm:inline">{ (user.role === UserRole.USER && isLoadingAi && !!newMessage.trim() && !ticket.assigned_agent_id) ? t('ticketDetail.sendMessageButtonLoading') : t('ticketDetail.sendMessageButton')}</span></Button>
        </div>
        {isTicketClosedOrResolved && <p className="text-xs text-center text-orange-600 mt-2">{t('ticketDetail.ticketClosedWarning', {status: t(`ticketStatus.${ticket.status}`)})}</p>}
        {!browserSupportsSpeechRecognition && !speechErrorText && (<p className="text-xs text-slate-500 mt-2 text-center">{t('ticketDetail.voiceInputForChatNotSupported')}</p>)}
      </form>
      </div>
    </>
  );
};

export default TicketDetailPage;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../App';
import ChatMessageComponent from '../components/ChatMessage';
import { Button, Textarea, Select, Input } from '../components/FormElements'; // Added Input
import { TicketStatus, ChatMessage as ChatMessageType, TicketPriority, UserRole, AppointmentDetails } from '../types';
import { TICKET_STATUS_KEYS, TICKET_PRIORITY_KEYS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabaseClient';



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

type CaseStage = 'INTAKE' | 'DOCUMENTS' | 'FILED' | 'HEARING' | 'NEGOTIATION' | 'CLOSED';

type CaseTask = {
  id: string;
  label: string;
  done: boolean;
  created_by?: string;
  created_at?: string;
  due_at?: string | null;
};

type InternalNoteEntry = {
  id: string;
  author_id?: string;
  author_name?: string;
  body: string;
  created_at: string;
};


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
    restoreAppointment
  } = useApp();
  const { t, getBCP47Locale, language } = useLanguage();
  const { t: i18nT } = useTranslation(['appointment', 'common']);

  const ticket = ticketId ? getTicketById(ticketId) : undefined;

  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
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
  const [apptDateTime, setApptDateTime] = useState('');
  const [apptNotes, setApptNotes] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState<string | null>(null);

  const [ticketDetails, setTicketDetails] = useState<Record<string, any>>({});
  const [caseStage, setCaseStage] = useState<CaseStage>('INTAKE');
  const [isSavingStage, setIsSavingStage] = useState(false);
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [isSavingTasks, setIsSavingTasks] = useState(false);
  const [internalNotes, setInternalNotes] = useState<InternalNoteEntry[]>([]);
  const [newInternalNote, setNewInternalNote] = useState('');
  const [activeTab, setActiveTab] = useState<'client' | 'internal'>('client');


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

  useEffect(() => {
    if (!ticket) return;
    const detailsSource = (ticket as any).details ?? ticket.metadata ?? {};
    const safeDetails = detailsSource && typeof detailsSource === 'object' ? detailsSource : {};
    setTicketDetails(safeDetails);
    const stageValue = (safeDetails.case_stage as CaseStage) || 'INTAKE';
    setCaseStage(stageValue);
    setTasks(Array.isArray(safeDetails.tasks) ? safeDetails.tasks : []);
    setInternalNotes(Array.isArray(safeDetails.internal_notes) ? safeDetails.internal_notes : []);
  }, [ticket]);

  const loadAppointments = useCallback(async () => {
    if (!ticket) return;
    setAppointmentsLoading(true);
    setAppointmentError(null);
    const { data, error } = await supabase
      .from('appointment_details')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('starts_at', { ascending: false });

    if (error) {
      console.error('Error loading appointments for ticket', error);
      setAppointmentError('Unable to load appointments for this ticket.');
      setAppointmentsLoading(false);
      return;
    }

    setAppointments(data || []);
    setAppointmentsLoading(false);
  }, [ticket]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);


  const persistCaseDetails = useCallback(
    async (nextDetails: Record<string, any>) => {
      if (!ticket) return false;
      const columnKey = 'metadata';
      const { error } = await supabase
        .from('tickets')
        .update({ [columnKey]: nextDetails })
        .eq('id', ticket.id);

      if (error) {
        console.error('Error updating ticket details', error);
        return false;
      }

      setTicketDetails(nextDetails);
      return true;
    },
    [ticket]
  );


  const handleSpeakMessage = (text: string, messageId: string, isAiMsg: boolean) => {
    if (isListeningChatInput) stopChatListening();
    if (isSpeaking && speakingMessageId === messageId) {
      cancelSpeech(); setSpeakingMessageId(null);
    } else {
      if (isSpeaking) cancelSpeech();
      if (isAiMsg) setLastSpokenAiMessage({ text, id: messageId });
      setTimeout(() => {
        speak(text, () => setSpeakingMessageId(null));
        setSpeakingMessageId(messageId);
      }, 50);
    }
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
    
    if (isSpeaking) { cancelSpeech(); setSpeakingMessageId(null); }

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
  
  const handleCancelCurrentlySpeaking = () => { cancelSpeech(); setSpeakingMessageId(null); };

  const handleChatMicButtonClick = () => {
    if (isSpeaking) { cancelSpeech(); setSpeakingMessageId(null); }
    if (isListeningChatInput) stopChatListening(); else startChatListening();
  };

  const handleStageChange = async (nextStage: CaseStage) => {
    if (!isAgentOrManager) return;
    setIsSavingStage(true);
    const nextDetails = { ...ticketDetails, case_stage: nextStage };
    await persistCaseDetails(nextDetails);
    setCaseStage(nextStage);
    setIsSavingStage(false);
  };

  const handleAddTask = async () => {
    if (!isAgentOrManager || !newTaskLabel.trim()) return;
    setIsSavingTasks(true);
    const newTask: CaseTask = {
      id: crypto.randomUUID(),
      label: newTaskLabel.trim(),
      done: false,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };
    const nextTasks = [...tasks, newTask];
    const nextDetails = { ...ticketDetails, tasks: nextTasks };
    const ok = await persistCaseDetails(nextDetails);
    if (ok) {
      setTasks(nextTasks);
      setNewTaskLabel('');
    }
    setIsSavingTasks(false);
  };

  const handleToggleTask = async (taskId: string) => {
    if (!isAgentOrManager) return;
    setIsSavingTasks(true);
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    const nextDetails = { ...ticketDetails, tasks: nextTasks };
    const ok = await persistCaseDetails(nextDetails);
    if (ok) {
      setTasks(nextTasks);
    }
    setIsSavingTasks(false);
  };

  const handleAddInternalNote = async () => {
    if (!isAgentOrManager || !newInternalNote.trim()) return;
    const nextNote: InternalNoteEntry = {
      id: crypto.randomUUID(),
      author_id: user.id,
      author_name: user.full_name,
      body: newInternalNote.trim(),
      created_at: new Date().toISOString(),
    };
    const nextNotes = [...internalNotes, nextNote];
    const nextDetails = { ...ticketDetails, internal_notes: nextNotes };
    const ok = await persistCaseDetails(nextDetails);
    if (ok) {
      setInternalNotes(nextNotes);
      setNewInternalNote('');
    }
  };

  const handleRepeatLastMessage = () => {
    let messageToSpeak = lastSpokenAiMessage;
    if (!messageToSpeak && ticket?.chat_history) {
        const lastAiMsgInHistory = ticket.chat_history.filter(m => m.sender === 'ai').pop();
        if (lastAiMsgInHistory) messageToSpeak = { text: lastAiMsgInHistory.text, id: lastAiMsgInHistory.id };
    }
    if (messageToSpeak && browserSupportsTextToSpeech) {
        if (isSpeaking && speakingMessageId !== messageToSpeak.id) cancelSpeech();
        else if (isSpeaking && speakingMessageId === messageToSpeak.id) cancelSpeech();
        setTimeout(() => {
            speak(messageToSpeak!.text, () => setSpeakingMessageId(null));
            setSpeakingMessageId(messageToSpeak!.id);
            setLastSpokenAiMessage(messageToSpeak);
        }, 50);
    }
  };

  const handleContactAgent = () => {
    alert(t('ticketDetail.contactAgent.alertMessage'));
  };

  const handleDeleteAppointment = async (appointmentId?: string) => {
    const currentAppointmentId = appointmentId || appointments[0]?.id;
    if (!currentAppointmentId) {
      return;
    }
    setIsDeletingAppointment(true);
    const { error } = await supabase.from('appointment_details').delete().eq('id', currentAppointmentId);
    if (error) {
      console.error('Error deleting appointment', error);
      setAppointmentError('Unable to delete this appointment.');
    } else {
      setAppointments((prev) => prev.filter((appt) => appt.id !== currentAppointmentId));
      setAppointmentSuccess('Appointment deleted.');
    }
    setIsDeletingAppointment(false);
  };

  const handleProposeAppointment = async () => {
    if (!ticket || !ticketId || (user.role !== UserRole.AGENT && user.role !== UserRole.MANAGER)) return;
    if (!apptDateTime) return;
    setAppointmentError(null);
    setAppointmentSuccess(null);

    const startsAt = new Date(apptDateTime);
    if (Number.isNaN(startsAt.getTime())) {
      setAppointmentError('Please provide a valid date and time.');
      return;
    }

    const status = user.role === UserRole.MANAGER ? 'confirmed' : 'proposed';
    const payload = {
      ticket_id: ticket.id,
      company_id: user.company_id,
      created_by: user.id,
      proposed_by: user.role,
      status,
      starts_at: startsAt.toISOString(),
      ends_at: startsAt.toISOString(),
      notes: apptNotes || null,
    };

    const { data, error } = await supabase
      .from('appointment_details')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error proposing appointment', error);
      setAppointmentError('Unable to propose this appointment right now.');
      return;
    }

    setAppointments((prev) => [data, ...prev].sort(
      (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    ));
    setAppointmentSuccess('Appointment proposal saved.');
    setShowAppointmentForm(false);
    setApptDateTime('');
    setApptNotes('');
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    setAppointmentError(null);
    const { data, error } = await supabase
      .from('appointment_details')
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment status', error);
      setAppointmentError('Unable to update appointment right now.');
      return null;
    }

    setAppointments((prev) => prev.map((appt) => (appt.id === appointmentId ? data : appt)).sort(
      (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    ));
    setAppointmentSuccess('Appointment updated.');
    return data;
  };

  const handleUserAcceptAppointment = () => {
    const appointmentId = appointments[0]?.id;
    if (!appointmentId) return;
    updateAppointmentStatus(appointmentId, 'confirmed');
  };

  const handleUserSuggestDifferentAppointment = () => {
    const appointmentId = appointments[0]?.id;
    if (!appointmentId) return;
    updateAppointmentStatus(appointmentId, 'cancelled');
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

  const stageOptions: { value: CaseStage; label: string }[] = [
    { value: 'INTAKE', label: 'Intake / Première analyse' },
    { value: 'DOCUMENTS', label: 'Collecte de pièces' },
    { value: 'FILED', label: 'Dossier déposé' },
    { value: 'HEARING', label: 'Audience programmée' },
    { value: 'NEGOTIATION', label: 'Négociation / Transaction' },
    { value: 'CLOSED', label: 'Dossier clôturé' },
  ];

  const renderAppointmentSection = () => {
    if (!isAgentOrManager) return null;

    return (
      <div className="my-4 rounded-md border border-slate-300 bg-slate-100 p-3 space-y-3">
        {appointmentError && (
          <div className="rounded-md bg-red-100 px-3 py-2 text-xs text-red-700">{appointmentError}</div>
        )}
        {appointmentSuccess && (
          <div className="rounded-md bg-emerald-100 px-3 py-2 text-xs text-emerald-700">{appointmentSuccess}</div>
        )}
        {!showAppointmentForm ? (
          <Button onClick={() => setShowAppointmentForm(true)} variant="secondary" size="sm">
            <CalendarIcon className="me-2 h-4 w-4" />
            {t('appointment.proposeButtonLabel')}
          </Button>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">{t('appointment.form.title')}</h4>
            <Input
              type="datetime-local"
              label={t('appointment.form.dateLabel')}
              value={apptDateTime}
              onChange={(e) => setApptDateTime(e.target.value)}
            />
            <Textarea
              label={t('appointment.form.locationMethodLabel')}
              placeholder={t('appointment.form.locationMethodPlaceholder')}
              value={apptNotes}
              onChange={(e) => setApptNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleProposeAppointment} variant="primary" size="sm" disabled={!apptDateTime}>
                {t('appointment.form.submitButton')}
              </Button>
              <Button onClick={() => setShowAppointmentForm(false)} variant="outline" size="sm">
                {t('appointment.form.cancelButton')}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {appointmentsLoading ? (
            <LoadingSpinner text={t('appointment.loading', { defaultValue: 'Chargement…' })} />
          ) : appointments.length === 0 ? (
            <p className="text-xs text-slate-600">No appointments yet for this ticket.</p>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id} className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {new Date(appt.starts_at).toLocaleString()} – {appt.status}
                    </p>
                    {appt.notes && <p className="text-slate-600">{appt.notes}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.role === UserRole.MANAGER && (
                      <>
                        <Button size="xs" variant="secondary" onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}>
                          {i18nT('appointment.actions.confirm', { defaultValue: 'Confirmer' }) || 'Confirmer'}
                        </Button>
                        <Button size="xs" variant="danger" onClick={() => updateAppointmentStatus(appt.id, 'cancelled')}>
                          {i18nT('appointment.actions.cancel', { defaultValue: 'Annuler' }) || 'Annuler'}
                        </Button>
                      </>
                    )}
                    {user.role === UserRole.AGENT && appt.proposed_by === 'agent' && appt.status === 'proposed' && (
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => handleDeleteAppointment(appt.id)}
                        disabled={isDeletingAppointment}
                      >
                        {i18nT('appointment.delete_button')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  const renderCurrentAppointmentInfo = () => null;



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

      <div className="space-y-4 p-4 sm:p-6 bg-white border-b border-slate-200">
        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Étape du dossier</p>
              <p className="text-sm text-slate-700">Suivez l'avancement du pipeline.</p>
            </div>
            {isAgentOrManager ? (
              <select
                value={caseStage}
                onChange={(e) => handleStageChange(e.target.value as CaseStage)}
                disabled={isSavingStage}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-60"
              >
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                {stageOptions.find((s) => s.value === caseStage)?.label || 'Intake / Première analyse'}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Checklist du dossier</p>
              <p className="text-sm text-slate-700">Assurez-vous que toutes les tâches sont suivies.</p>
            </div>
            {!isAgentOrManager && (
              <span className="text-[11px] text-slate-500">Lecture seule</span>
            )}
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-600">Aucune tâche pour ce dossier.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <label key={task.id} className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={task.done}
                    onChange={() => handleToggleTask(task.id)}
                    disabled={!isAgentOrManager || isSavingTasks}
                  />
                  <span className={task.done ? 'line-through text-slate-500' : ''}>{task.label}</span>
                </label>
              ))}
            </div>
          )}
          {isAgentOrManager && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={newTaskLabel}
                onChange={(e) => setNewTaskLabel(e.target.value)}
                placeholder="Ajouter une tâche"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                disabled={isSavingTasks}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddTask}
                disabled={!newTaskLabel.trim() || isSavingTasks}
                isLoading={isSavingTasks}
              >
                Ajouter
              </Button>
            </div>
          )}
        </div>
      </div>

      {renderAppointmentSection()}

      <div className="border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'client' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => setActiveTab('client')}
            type="button"
          >
            Messages client
          </button>
          {isAgentOrManager && (
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'internal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setActiveTab('internal')}
              type="button"
            >
              Notes internes
            </button>
          )}
        </div>
      </div>

      {activeTab === 'client' ? (
        <>
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
        </>
      ) : (
        <div className="flex-grow overflow-y-auto bg-slate-50 border-b border-t border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            {internalNotes.length === 0 ? (
              <p className="text-sm text-slate-600">Aucune note interne pour ce dossier.</p>
            ) : (
              internalNotes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{note.author_name || 'Équipe'}</span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{note.body}</p>
                </div>
              ))
            )}
          </div>

          {isAgentOrManager && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-900">Ajouter une note interne</p>
              <Textarea
                value={newInternalNote}
                onChange={(e) => setNewInternalNote(e.target.value)}
                rows={3}
                placeholder="Partager une note pour l'équipe"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddInternalNote}
                disabled={!newInternalNote.trim()}
              >
                Ajouter la note
              </Button>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default TicketDetailPage;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../App';
import Layout from '../components/Layout';
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
  const [activeTab, setActiveTab] = useState<'messages' | 'internal'>('messages');


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

  const canRepeatLastMessage = (lastSpokenAiMessage || ticket.chat_history.some(m => m.sender === 'ai')) && browserSupportsTextToSpeech;
  const isTicketClosedOrResolved = ticket.status === TICKET_STATUS_KEYS.RESOLVED || ticket.status === TICKET_STATUS_KEYS.CLOSED;
  const isAgentOrManager = user.role === UserRole.AGENT || user.role === UserRole.MANAGER;
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
    if (!isAgentOrManager && appointments.length === 0) return null;

    const isManager = user.role === UserRole.MANAGER;

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">{t('ticket.sidebar.appointments.title')}</h3>
          <p className="text-xs text-slate-600">{t('ticket.sidebar.appointments.description')}</p>
        </div>

        {appointmentError && (
          <div className="rounded-md bg-red-100 px-3 py-2 text-xs text-red-700">{appointmentError}</div>
        )}
        {appointmentSuccess && (
          <div className="rounded-md bg-emerald-100 px-3 py-2 text-xs text-emerald-700">{appointmentSuccess}</div>
        )}

        {isAgentOrManager && (
          !showAppointmentForm ? (
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
          )
        )}

        <div className="space-y-2">
          {appointmentsLoading ? (
            <LoadingSpinner text={t('appointment.loading', { defaultValue: 'Chargement…' })} />
          ) : appointments.length === 0 ? (
            <p className="text-sm text-slate-600">{t('ticket.sidebar.appointments.empty')}</p>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id} className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {new Date(appt.starts_at).toLocaleString(getBCP47Locale())} – {appt.status}
                    </p>
                    {appt.notes && <p className="text-slate-600">{appt.notes}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isManager && (
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
      </section>
    );
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-6 lg:py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-4 lg:space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 lg:p-5 shadow-sm space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  {ticket.company_name || user.company_name || t('ticket.header.companyLabel')}
                </p>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                  {ticket.title}
                </h1>
                <p className="text-xs text-slate-600">
                  #{ticket.id.slice(0, 8)} • {new Date(ticket.created_at).toLocaleString(getBCP47Locale())}
                </p>
                {ticket.workstation_id && (
                  <p className="text-xs text-slate-600">
                    {t('newTicket.form.workstationIdLabel')}: {ticket.workstation_id}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColorsTag[ticket.status]}`}>
                  {t(`ticketStatus.${ticket.status}`)}
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {t(`ticketPriority.${ticket.priority}`)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={user.role === UserRole.USER ? '/dashboard' : (user.role === UserRole.AGENT ? '/agent/dashboard' : '/manager/dashboard')}>
                <Button variant="outline" size="sm">
                  {t('ticketDetail.backToDashboardButton')}
                </Button>
              </Link>
              {isAgentOrManager && (
                <Select
                  label={t('ticket.header.status')}
                  id="ticketStatus"
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  options={statusOptions}
                  className="bg-white text-slate-800"
                />
              )}
              {browserSupportsTextToSpeech && (
                <Button
                  onClick={toggleAutoRead}
                  variant="outline"
                  size="sm"
                  className="!py-1.5"
                  title={isAutoReadEnabled ? t('ticketDetail.autoRead.disableTitle') : t('ticketDetail.autoRead.enableTitle')}
                >
                  {isAutoReadEnabled ? (
                    <SpeakerLoudIcon className="w-5 h-5 text-sky-600" />
                  ) : (
                    <SpeakerOffIcon className="w-5 h-5 text-slate-500" />
                  )}
                </Button>
              )}
              <Button
                onClick={handleRepeatLastMessage}
                variant="outline"
                size="sm"
                disabled={!canRepeatLastMessage || isSpeaking || isListeningChatInput}
                title={t('ticketDetail.repeatButton.title')}
              >
                <ReplayIcon className="w-5 h-5 text-slate-700" />
              </Button>
              {user.role === UserRole.USER && (
                <Button
                  onClick={handleContactAgent}
                  variant="secondary"
                  size="sm"
                  disabled={isTicketClosedOrResolved}
                >
                  <HeadsetIcon className="w-5 h-5 me-1" />
                  {t('ticketDetail.contactAgent.buttonLabel')}
                </Button>
              )}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(280px,1fr)] items-start">
            <div className="space-y-4">
              <section className="rounded-3xl border border-slate-200 bg-white p-4 lg:p-5 shadow-sm h-full">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'messages' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    onClick={() => setActiveTab('messages')}
                    type="button"
                  >
                    {t('ticket.tabs.messages')}
                  </button>
                  {isAgentOrManager && (
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'internal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      onClick={() => setActiveTab('internal')}
                      type="button"
                    >
                      {t('ticket.tabs.internalNotes')}
                    </button>
                  )}
                </div>

                {activeTab === 'messages' ? (
                  <>
                    <div className="max-h-[60vh] overflow-y-auto py-4 space-y-3">
                      {speechErrorText && <p className="text-xs text-red-600 text-center">{speechErrorText}</p>}
                      {ttsErrorText && <p className="text-xs text-red-600 text-center">{t('ticketDetail.speechPlaybackError', { error: ttsErrorText })}</p>}
                      {ticket.chat_history.map((msg) => (
                        <ChatMessageComponent
                          key={msg.id}
                          message={msg}
                          userFullName={user.full_name}
                          onSpeak={(text, id) => handleSpeakMessage(text, id, msg.sender === 'ai')}
                          onCancelSpeak={handleCancelCurrentlySpeaking}
                          isCurrentlySpeaking={speakingMessageId === msg.id && isSpeaking}
                          browserSupportsTextToSpeech={browserSupportsTextToSpeech}
                        />
                      ))}
                      {isLoadingAi &&
                        user.role === UserRole.USER &&
                        ticket.chat_history.length > 0 &&
                        ticket.chat_history[ticket.chat_history.length - 1].sender === 'user' &&
                        !ticket.assigned_agent_id && (
                          <div className="flex justify-start">
                            <div className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow bg-slate-200 text-slate-800 rounded-bl-none">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm">{t('ticketDetail.aiAssistantName')}</p>
                                <LoadingSpinner size="sm" className="!p-0" />
                              </div>
                            </div>
                          </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="mt-4 space-y-2">
                      <div className="flex items-start space-x-2 sm:space-x-3 rtl:space-x-reverse">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={
                            isListeningChatInput
                              ? t('ticketDetail.chatPlaceholder.listening')
                              : isTicketClosedOrResolved
                                ? t('ticketDetail.chatPlaceholder.closed')
                                : t('ticketDetail.chatPlaceholder.default')
                          }
                          rows={2}
                          className="flex-grow resize-none focus:ring-2"
                          disabled={isLoadingAi || isListeningChatInput || isTicketClosedOrResolved}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e as any);
                            }
                          }}
                        />
                        {browserSupportsSpeechRecognition && (
                          <Button
                            type="button"
                            onClick={handleChatMicButtonClick}
                            variant={isListeningChatInput ? 'danger' : 'secondary'}
                            size="md"
                            className="h-full px-3 sm:px-4 self-stretch !py-0"
                            aria-label={
                              isListeningChatInput
                                ? t('ticketDetail.micButton.stopRecording')
                                : t('ticketDetail.micButton.startRecording')
                            }
                            disabled={isLoadingAi || isTicketClosedOrResolved}
                            title={
                              isListeningChatInput
                                ? t('ticketDetail.micButton.stopRecording')
                                : t('ticketDetail.micButton.startRecording')
                            }
                          >
                            <MicrophoneIcon className="w-5 h-5" />
                          </Button>
                        )}
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          className="h-full px-3 sm:px-5 self-stretch !py-0"
                          disabled={
                            (user.role === UserRole.USER && isLoadingAi && !!newMessage.trim() && !ticket.assigned_agent_id) ||
                            !newMessage.trim() ||
                            isListeningChatInput ||
                            isTicketClosedOrResolved
                          }
                          isLoading={user.role === UserRole.USER && isLoadingAi && !!newMessage.trim() && !ticket.assigned_agent_id}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                          </svg>
                          <span className="ms-1 sm:ms-2 hidden sm:inline">
                            {user.role === UserRole.USER && isLoadingAi && !!newMessage.trim() && !ticket.assigned_agent_id
                              ? t('ticketDetail.sendMessageButtonLoading')
                              : t('ticketDetail.sendMessageButton')}
                          </span>
                        </Button>
                      </div>
                      {isTicketClosedOrResolved && (
                        <p className="text-xs text-center text-orange-600">
                          {t('ticketDetail.ticketClosedWarning', { status: t(`ticketStatus.${ticket.status}`) })}
                        </p>
                      )}
                      {!browserSupportsSpeechRecognition && !speechErrorText && (
                        <p className="text-xs text-slate-500 text-center">
                          {t('ticketDetail.voiceInputForChatNotSupported')}
                        </p>
                      )}
                    </form>
                  </>
                ) : (
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      {internalNotes.length === 0 ? (
                        <p className="text-sm text-slate-600">{t('ticket.internalNotes.empty')}</p>
                      ) : (
                        internalNotes.map((note) => (
                          <div key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span className="font-semibold text-slate-800">{note.author_name || t('ticket.internalNotes.unknownAuthor')}</span>
                              <span>{new Date(note.created_at).toLocaleString(getBCP47Locale())}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{note.body}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {isAgentOrManager && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                        <p className="text-sm font-semibold text-slate-900">{t('ticket.internalNotes.addLabel')}</p>
                        <Textarea
                          value={newInternalNote}
                          onChange={(e) => setNewInternalNote(e.target.value)}
                          rows={3}
                          placeholder={t('ticket.internalNotes.placeholder')}
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleAddInternalNote}
                          disabled={!newInternalNote.trim()}
                        >
                          {t('ticket.internalNotes.addButton')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-4">
              {isAgentOrManager && (
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900">{t('ticket.sidebar.caseStage.title')}</h3>
                  <p className="text-xs text-slate-600">{t('ticket.sidebar.caseStage.description')}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    {isSavingStage && <LoadingSpinner size="sm" />}
                  </div>
                </section>
              )}

              {isAgentOrManager && (
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900">{t('ticket.sidebar.checklist.title')}</h3>
                      <p className="text-xs text-slate-600">{t('ticket.sidebar.checklist.description')}</p>
                    </div>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="text-sm text-slate-600">{t('ticket.sidebar.checklist.empty')}</p>
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={newTaskLabel}
                      onChange={(e) => setNewTaskLabel(e.target.value)}
                      placeholder={t('ticket.sidebar.checklist.addPlaceholder')}
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
                      {t('ticket.sidebar.checklist.addButton')}
                    </Button>
                  </div>
                </section>
              )}

              {renderAppointmentSection()}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">{t('ticket.sidebar.info.title')}</h3>
                <p className="text-xs text-slate-600">{t('ticket.sidebar.info.description')}</p>
                <div className="space-y-1 text-sm text-slate-800">
                  <p>
                    <span className="font-semibold">{t('ticket.sidebar.info.owner')} </span>
                    {user.full_name}
                  </p>
                  <p>
                    <span className="font-semibold">Email: </span>{user.email}
                  </p>
                  <p>
                    <span className="font-semibold">{t('ticket.sidebar.info.language')} </span>{t(`language.${language}`)}
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetailPage;

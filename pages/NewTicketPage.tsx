import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useApp } from '../App';
import { Button, Input, Textarea, Select } from '../components/FormElements';
import { TicketPriority, UserRole, ChatMessage, TicketStatus } from '../types';
import { TICKET_CATEGORY_KEYS, TICKET_PRIORITY_KEYS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { summarizeAndCategorizeChat } from '../services/geminiService';

const NewTicketPage: React.FC = () => {
  const { addTicket, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [workstationId, setWorkstationId] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  const chatHistoryRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    let isMounted = true;

    const processChatHistory = async () => {
      const state = location.state as { chatHistory?: ChatMessage[] };

      if (!state || !state.chatHistory || state.chatHistory.length === 0) {
        console.error('NewTicketPage loaded without chat history. Redirecting.');
        navigate('/help');
        return;
      }

      chatHistoryRef.current = state.chatHistory;

      try {
        const summary = await summarizeAndCategorizeChat(state.chatHistory, language);

        if (!isMounted) return;

        setTitle(summary.title);
        setDescription(summary.description);
        setCategory(summary.category);
        setPriority(summary.priority);
        setAiSummary(summary.description); 

      } catch (e: any) {
        if (!isMounted) return;
        console.error('Failed to get summary from AI:', e);

        setErrors({
          form: t('newTicket.error.summaryFailed', {
            default: `Failed to get AI summary: ${e.message}. Please fill out the form manually.`
          })
        });

        const fallbackDescription = state.chatHistory
          .map(m => `[${m.sender}] ${m.text}`)
          .join('\n');

        setDescription(fallbackDescription);
        setAiSummary(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    processChatHistory();

    return () => {
      isMounted = false;
    };
  }, [location.state, navigate, language, t]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = t('newTicket.form.error.titleRequired');
    if (title.trim().length > 100) newErrors.title = t('newTicket.form.error.titleMaxLength');
    if (!description.trim()) newErrors.description = t('newTicket.form.error.descriptionRequired');
    if (description.trim().length < 10) newErrors.description = t('newTicket.form.error.descriptionMinLength');
    if (!category) newErrors.category = t('newTicket.form.error.categoryRequired');
    if (!priority) newErrors.priority = t('newTicket.form.error.priorityRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsLoading(true);

    // On prépare les données en utilisant les infos déjà présentes dans 'user'
    // sans refaire d'appel Supabase direct ici pour éviter le bug 406
    const ticketData = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: TicketStatus.OPEN,
      workstation_id: workstationId.trim() || undefined,
      summary: aiSummary?.trim() || null,
      summary_updated_at: new Date().toISOString(),
      user_id: user.id,
      company_id: user.company_id,
      company_name: user.company_name
    };

    const newTicket = await addTicket(ticketData, chatHistoryRef.current);

    setIsLoading(false);

    if (newTicket) {
      let dashboardPath = '/dashboard';

      if (user.role === UserRole.AGENT) {
        dashboardPath = '/agent/dashboard';
      } else if (user.role === UserRole.MANAGER) {
        dashboardPath = '/manager/dashboard';
      }

      navigate(dashboardPath, { replace: true });
    } else {
      setErrors(prev => ({
        ...prev,
        form: t('newTicket.error.failedToCreate')
      }));
    }
  };

  // Affichage du chargement (ton code original)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner
          size="lg"
          text={t('newTicket.loadingMessageSummary', {
            default: 'Analyzing conversation and preparing your ticket...'
          })}
        />
        <p className="mt-4 text-slate-600">
          {t('newTicket.loadingSubMessage')}
        </p>
      </div>
    );
  }

  const priorityOptions = Object.values(TICKET_PRIORITY_KEYS).map(prioKey => ({
    value: prioKey,
    label: t(`ticketPriority.${prioKey}`)
  }));

  const categoryOptions = TICKET_CATEGORY_KEYS.map(catKey => ({
    value: catKey,
    label: t(catKey)
  }));

  const inputStyle = { backgroundColor: 'white', color: 'black' };

  return (
    <div className="max-w-2xl mx-auto bg-surface p-6 sm:p-8 rounded-xl shadow-xl">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-textPrimary">
          {t('newTicket.titleFinalize', { default: 'Finalize Your Support Ticket' })}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={t('newTicket.form.ticketTitleLabel')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          style={inputStyle}
          required
        />

        <Textarea
          label={t('newTicket.form.detailedDescriptionLabel')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          rows={8}
          style={inputStyle}
          required
        />

        <Input
          label={t('newTicket.form.workstationIdLabel', { default: 'Workstation ID' })}
          value={workstationId}
          onChange={(e) => setWorkstationId(e.target.value)}
          style={inputStyle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('newTicket.form.categoryLabel')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
            required
          />
          <Select
            label={t('newTicket.form.priorityLabel')}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            options={priorityOptions}
            required
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {t('newTicket.form.submitButtonFinal')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewTicketPage;
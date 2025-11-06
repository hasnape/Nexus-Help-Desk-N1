

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useApp } from '@/contexts/AppContext';
import { Button, Input, Textarea, Select } from '../components/FormElements';
import { TicketPriority, UserRole, ChatMessage, TicketStatus } from '@/types';
import { TICKET_CATEGORY_KEYS, TICKET_PRIORITY_KEYS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  
  useEffect(() => {
    let isMounted = true; // Cleanup flag

    const processChatHistory = async () => {
      const state = location.state as { chatHistory?: ChatMessage[] };
      if (!state || !state.chatHistory || state.chatHistory.length === 0) {
        console.error("NewTicketPage loaded without chat history. Redirecting.");
        navigate('/help');
        return;
      }
      chatHistoryRef.current = state.chatHistory;

      try {
        const summary = await summarizeAndCategorizeChat(state.chatHistory, language);
        if (isMounted) {
          setTitle(summary.title);
          setDescription(summary.description);
          setCategory(summary.category);
          setPriority(summary.priority);
        }
      } catch (e: any) {
        if (isMounted) {
          console.error("Failed to get summary from AI:", e);
          setErrors({ form: t('newTicket.error.summaryFailed', { default: `Failed to get AI summary: ${e.message}. Please fill out the form manually.` }) });
          // Set a default description so user knows what happened
          const fallbackDescription = state.chatHistory.map(m => `[${m.sender}] ${m.text}`).join('\n');
          setDescription(fallbackDescription);
        }
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
    if (workstationId.trim().length > 50) newErrors.workstationId = t('newTicket.form.error.workstationIdMaxLength', { default: 'Workstation ID must be 50 characters or less.'});

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReturnToDashboard = () => {
    let dashboardPath = '/dashboard';
    if (user?.role === UserRole.AGENT) {
        dashboardPath = '/agent/dashboard';
    } else if (user?.role === UserRole.MANAGER) {
        dashboardPath = '/manager/dashboard';
    }
    navigate(dashboardPath, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsLoading(true);
    const ticketData = { 
        title, 
        description, 
        category, 
        priority, 
        status: TicketStatus.OPEN,
        workstation_id: workstationId.trim() || undefined
    };
    
    // The initial chat history is now passed to addTicket
    const newTicket = await addTicket(ticketData, chatHistoryRef.current);
    setIsLoading(false);

    if (newTicket) {
      // Navigate to the user's main dashboard after successful ticket creation
      let dashboardPath = '/dashboard';
      if (user.role === UserRole.AGENT) {
        dashboardPath = '/agent/dashboard';
      } else if (user.role === UserRole.MANAGER) {
        dashboardPath = '/manager/dashboard';
      }
      navigate(dashboardPath, { replace: true });
    } else {
      setErrors(prev => ({ ...prev, form: t('newTicket.error.failedToCreate') }));
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text={t('newTicket.loadingMessageSummary', { default: 'Analyzing conversation and preparing your ticket...' })} />
        <p className="mt-4 text-slate-600">{t('newTicket.loadingSubMessage')}</p>
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


  return (
    <div className="max-w-2xl mx-auto bg-surface p-6 sm:p-8 rounded-xl shadow-xl">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-textPrimary">{t('newTicket.titleFinalize', {default: "Finalize Your Support Ticket"})}</h1>
        <p className="text-sm text-textSecondary mt-1">{t('newTicket.subtitleFinalize', {default: "Your conversation has been summarized by our AI. Please review and edit the details below before submitting."})}</p>
      </div>
      
      {errors.form && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{errors.form}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={t('newTicket.form.ticketTitleLabel')}
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('newTicket.form.ticketTitlePlaceholder')}
          error={errors.title}
          maxLength={100}
          required
        />
        <Textarea
          label={t('newTicket.form.detailedDescriptionLabel')}
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('newTicket.form.detailedDescriptionPlaceholder')}
          rows={8}
          error={errors.description}
          minLength={10}
          required
        />
        <Input
          label={t('newTicket.form.workstationIdLabel', { default: 'Workstation ID / Poste (Optional)' })}
          id="workstationId"
          value={workstationId}
          onChange={(e) => setWorkstationId(e.target.value)}
          placeholder={t('newTicket.form.workstationIdPlaceholder', { default: 'e.g., COMP-123, Asset Tag' })}
          error={errors.workstationId}
          maxLength={50}
        />
        <Select
          label={t('newTicket.form.categoryLabel')}
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
          error={errors.category}
          required
        />
        <Select
          label={t('newTicket.form.priorityLabel')}
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority)}
          options={priorityOptions}
          error={errors.priority}
          required
          placeholder={t('formElements.select.placeholderDefault')}
        />
        <div className="flex justify-end pt-4 space-x-3 rtl:space-x-reverse">
          <Button type="button" variant="outline" onClick={handleReturnToDashboard}>
            {t('newTicket.form.returnToDashboardButton', {default: "Return to Dashboard"})}
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isLoading ? t('newTicket.form.submitButtonLoading') : t('newTicket.form.submitButtonFinal')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewTicketPage;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useApp } from '../App';
import { Button, Input, Textarea, Select } from '../components/FormElements';
import { TicketPriority, UserRole, ChatMessage, TicketStatus } from '../types';
import { TICKET_CATEGORY_KEYS, TICKET_PRIORITY_KEYS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { summarizeAndCategorizeChat } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

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

  // --- EFFET : RÉCUPÉRATION DE L'HISTORIQUE ET RÉSUMÉ IA ---
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
            default: `Failed to get AI summary. Please fill out the form manually.`
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

  // --- VALIDATION DU FORMULAIRE ---
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

  const handleReturnToDashboard = () => {
    const dashboardPath = user?.role === UserRole.AGENT ? '/agent/dashboard' : 
                         user?.role === UserRole.MANAGER ? '/manager/dashboard' : '/dashboard';
    navigate(dashboardPath, { replace: true });
  };

  // --- SOUMISSION DU TICKET ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsLoading(true);

    try {
      // 1. RÉCUPÉRATION DU PROFIL (CORRECTION ERREUR 406)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*') 
        .eq('auth_uid', user.id)
        .maybeSingle();

      if (userError) throw new Error(`Erreur de connexion: ${userError.message}`);

      // Utilisation des données récupérées ou fallback sur le contexte
      const finalCompanyId = userData?.company_id || user.company_id;
      const finalCompanyName = userData?.company_name || user.company_name;

      if (!finalCompanyId) {
        throw new Error("Impossible de valider votre organisation.");
      }

      // 2. Préparation des données
      const ticketData = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: TicketStatus.OPEN,
        workstation_id: workstationId.trim() || undefined,
        summary: aiSummary?.trim() || undefined,
        summary_updated_at: new Date().toISOString(),
        user_id: user.id, 
        company_id: finalCompanyId, 
        company_name: finalCompanyName
      };

      // 3. Enregistrement
      const newTicket = await addTicket(ticketData, chatHistoryRef.current);

      if (newTicket) {
        const dashboardPath = user.role === UserRole.AGENT ? '/agent/dashboard' : 
                            user.role === UserRole.MANAGER ? '/manager/dashboard' : '/dashboard';
        navigate(dashboardPath, { replace: true });
      } else {
        throw new Error(t('newTicket.error.failedToCreate'));
      }
    } catch (err: any) {
      console.error('Submit Error:', err);
      setErrors(prev => ({
        ...prev,
        form: err.message || "Une erreur est survenue lors de la création du ticket."
      }));
    } finally {
      setIsLoading(false);
    }
  };

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
        <p className="text-sm text-textSecondary mt-1">
          {t('newTicket.subtitleFinalize', {
            default: 'Your conversation has been summarized by our AI. Please review and edit the details below.'
          })}
        </p>
      </div>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {errors.form}
        </div>
      )}

      {isLoading && !aiSummary ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('newTicket.form.ticketTitleLabel')}
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            maxLength={100}
            required
            style={inputStyle} 
          />

          <Textarea
            label={t('newTicket.form.detailedDescriptionLabel')}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            error={errors.description}
            required
            style={inputStyle} 
          />

          <Input
            label={t('newTicket.form.workstationIdLabel', { default: 'Workstation ID' })}
            id="workstationId"
            value={workstationId}
            onChange={(e) => setWorkstationId(e.target.value)}
            style={inputStyle} 
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
          />

          <div className="flex justify-end pt-4 space-x-3">
            <Button type="button" variant="outline" onClick={handleReturnToDashboard}>
              {t('newTicket.form.returnToDashboardButton', { default: 'Return' })}
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {t('newTicket.form.submitButtonFinal')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NewTicketPage;
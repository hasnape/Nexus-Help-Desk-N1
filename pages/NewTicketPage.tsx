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
        setAiSummary(summary.summary ?? summary.description);

      } catch (e: any) {
        if (!isMounted) return;

        console.error('Failed to get summary from AI:', e);

        // Provide more helpful error messages based on error type
        let errorMessage = t('newTicket.error.summaryFailed', {
          default: `Failed to get AI summary: ${e.message}. Please fill out the form manually.`
        });

        if (e.message.includes('configuration')) {
          errorMessage = t('newTicket.error.aiConfigurationError', {
            default: 'AI summary service is temporarily unavailable (configuration error). Please fill out the form manually.'
          });
        } else if (e.message.includes('rate limit')) {
          errorMessage = t('newTicket.error.aiRateLimitError', {
            default: 'AI request limit reached. Please fill out the form manually or try again in a few minutes.'
          });
        } else if (e.message.includes('timeout')) {
          errorMessage = t('newTicket.error.aiTimeoutError', {
            default: 'AI service is taking too long to respond. Please fill out the form manually.'
          });
        } else if (e.message.includes('network') || e.message.includes('fetch')) {
          errorMessage = t('newTicket.error.aiNetworkError', {
            default: 'Network error connecting to AI service. Please fill out the form manually.'
          });
        }

        setErrors({
          form: errorMessage
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
    if (workstationId.trim().length > 50) {
      newErrors.workstationId = t(
        'newTicket.form.error.workstationIdMaxLength',
        { default: 'Workstation ID must be 50 characters or less.' }
      );
    }

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

    try {
      let companyId = (user as any)?.company_id?.trim();
      let companyName = (user as any)?.company_name ?? null;

      if (!companyId) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id, company_name') 
          .eq('id', user.id)
          .maybeSingle();

        if (userError) {
          console.error('Supabase Error:', userError);
          throw new Error(`Erreur de connexion à la base de données: ${userError.message}. Veuillez réessayer.`);
        }

        companyId = userData?.company_id?.trim();
        companyName = userData?.company_name ?? companyName;
      }

      if (!companyId) {
        throw new Error(
          t('newTicket.error.companyMissing', {
            default:
              "Impossible de valider votre organisation (profil incomplet). Veuillez vous déconnecter/reconnecter ou contacter le support.",
          })
        );
      }

      // 2. Préparation des données du ticket
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
        company_id: companyId, 
        company_name: companyName
      };

      // 3. Ajout via le contexte App
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
      
      // Provide user-friendly error message
      let errorMessage = "Une erreur est survenue lors de la création du ticket.";
      if (err.message) {
        errorMessage = err.message;
      }
      
      setErrors(prev => ({
        ...prev,
        form: errorMessage
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

  // Style pour l'écriture noire
  const inputStyle = { backgroundColor: 'white', color: 'black' };

  return (
    <div className="max-w-2xl mx-auto bg-surface p-6 sm:p-8 rounded-xl shadow-xl">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-textPrimary">
          {t('newTicket.titleFinalize', { default: 'Finalize Your Support Ticket' })}
        </h1>
        <p className="text-sm text-textSecondary mt-1">
          {t('newTicket.subtitleFinalize', {
            default: 'Your conversation has been summarized by our AI. Please review and edit the details below before submitting.'
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
            placeholder={t('newTicket.form.ticketTitlePlaceholder')}
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
            placeholder={t('newTicket.form.detailedDescriptionPlaceholder')}
            rows={8}
            error={errors.description}
            minLength={10}
            required
            style={inputStyle} 
          />

          <Input
            label={t('newTicket.form.workstationIdLabel', {
              default: 'Workstation ID / Poste (Optional)'
            })}
            id="workstationId"
            value={workstationId}
            onChange={(e) => setWorkstationId(e.target.value)}
            placeholder={t('newTicket.form.workstationIdPlaceholder', {
              default: 'e.g., COMP-123, Asset Tag'
            })}
            error={errors.workstationId}
            maxLength={50}
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
            placeholder={t('formElements.select.placeholderDefault')}
          />

          <div className="flex justify-end pt-4 space-x-3 rtl:space-x-reverse">
            <Button type="button" variant="outline" onClick={handleReturnToDashboard}>
              {t('newTicket.form.returnToDashboardButton', {
                default: 'Return to Dashboard'
              })}
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isLoading
                ? t('newTicket.form.submitButtonLoading')
                : t('newTicket.form.submitButtonFinal')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NewTicketPage;

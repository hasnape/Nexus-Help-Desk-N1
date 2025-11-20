import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../App";
import { useLanguage } from "../contexts/LanguageContext";
import { Button, Input, Textarea } from "../components/FormElements";
import LoadingSpinner from "../components/LoadingSpinner";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useTextToSpeech from "../hooks/useTextToSpeech";
import {
  CompanyFaqEntry,
  createCompanyFaqEntry,
  deleteCompanyFaqEntry,
  fetchCompanyFaqsForManager,
  updateCompanyFaqEntry,
} from "../services/companyKnowledgeService";

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
    <path fillRule="evenodd" d="M5.5 8.5A.5.5 0 016 8h1v1.167a5.006 5.006 0 004 0V8h1a.5.5 0 01.5.5v.167A5.003 5.003 0 0013 12.5V14.5h.5a.5.5 0 010 1h-7a.5.5 0 010-1H7v-2a5.003 5.003 0 00.5-3.833V8.5z" clipRule="evenodd" />
  </svg>
);

const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h-1.5a.75.75 0 00-.75.75v6a.75.75 0 00.75.75h1.5L9 19.5h1.5v-15H9l-3.75 3.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25a4.5 4.5 0 010 7.5M18.75 6.75a7.5 7.5 0 010 10.5" />
  </svg>
);

const StopSpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h-1.5a.75.75 0 00-.75.75v6a.75.75 0 00.75.75h1.5L9 19.5h1.5v-15H9l-3.75 3.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25l4.5 7.5M20.25 8.25l-4.5 7.5" />
  </svg>
);

type DictationTarget = "search" | "question" | "answer" | null;

const ManagerFaqPage: React.FC = () => {
  const { user } = useApp();
  const { t, language } = useLanguage();
  const companyId = user?.company_id;

  const [faqs, setFaqs] = useState<CompanyFaqEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formState, setFormState] = useState({
    question: "",
    answer: "",
    tags: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dictationTarget, setDictationTarget] = useState<DictationTarget>(null);
  const [speakingEntryId, setSpeakingEntryId] = useState<string | null>(null);

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
    browserSupportsTextToSpeech,
    error: ttsError,
  } = useTextToSpeech();

  const loadFaqs = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCompanyFaqsForManager(companyId, language);
      setFaqs(data);
    } catch (err) {
      console.error("Failed to load FAQs", err);
      setError(t("managerFaq.loadError", { default: "Impossible de charger la FAQ." }));
    } finally {
      setLoading(false);
    }
  }, [companyId, language, t]);

  useEffect(() => {
    if (companyId) {
      loadFaqs();
    } else {
      setLoading(false);
    }
  }, [companyId, language, loadFaqs]);

  useEffect(() => {
    if (!transcript || !dictationTarget) return;

    setDictationTarget(null);
    if (dictationTarget === "search") {
      setSearchQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
    } else if (dictationTarget === "question") {
      setFormState((prev) => ({ ...prev, question: prev.question ? `${prev.question} ${transcript}` : transcript }));
    } else if (dictationTarget === "answer") {
      setFormState((prev) => ({ ...prev, answer: prev.answer ? `${prev.answer} ${transcript}` : transcript }));
    }
  }, [transcript, dictationTarget]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter((entry) => {
      const tags = entry.tags?.join(" ") || "";
      return (
        entry.question.toLowerCase().includes(query) ||
        entry.answer.toLowerCase().includes(query) ||
        tags.toLowerCase().includes(query)
      );
    });
  }, [faqs, searchQuery]);

  const resetForm = () => {
    setFormState({ question: "", answer: "", tags: "", isActive: true });
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!companyId) return;
    if (!formState.question.trim() || !formState.answer.trim()) {
      return;
    }
    setIsSaving(true);
    const tags = formState.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      if (editingId) {
        const updated = await updateCompanyFaqEntry({
          id: editingId,
          companyId,
          question: formState.question,
          answer: formState.answer,
          tags,
          isActive: formState.isActive,
          lang: language,
        });
        setFaqs((prev) => prev.map((faq) => (faq.id === updated.id ? updated : faq)));
      } else {
        const created = await createCompanyFaqEntry({
          companyId,
          question: formState.question,
          answer: formState.answer,
          tags,
          isActive: formState.isActive,
          lang: language,
        });
        setFaqs((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error("Failed to persist FAQ", err);
      setError(t("managerFaq.saveError", { default: "Impossible d'enregistrer l'entrée." }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entry: CompanyFaqEntry) => {
    if (!companyId) return;
    const confirmation = window.confirm(
      t("managerFaq.deleteConfirm", { default: "Supprimer cette entrée de FAQ ?" })
    );
    if (!confirmation) return;

    setDeletingId(entry.id);
    try {
      await deleteCompanyFaqEntry({ id: entry.id, companyId });
      setFaqs((prev) => prev.filter((faq) => faq.id !== entry.id));
    } catch (err) {
      console.error("Failed to delete FAQ", err);
      setError(t("managerFaq.deleteError", { default: "Impossible de supprimer l'entrée." }));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (entry: CompanyFaqEntry) => {
    setEditingId(entry.id);
    setFormState({
      question: entry.question,
      answer: entry.answer,
      tags: entry.tags?.join(", ") || "",
      isActive: entry.is_active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleDictation = (target: DictationTarget) => {
    if (!browserSupportsSpeechRecognition) return;
    if (isListening && dictationTarget === target) {
      stopListening();
      setDictationTarget(null);
    } else {
      if (isListening) {
        stopListening();
      }
      setDictationTarget(target);
      startListening();
    }
  };

  const handleSpeakEntry = (entry: CompanyFaqEntry) => {
    if (!browserSupportsTextToSpeech) return;
    if (speakingEntryId === entry.id && isSpeaking) {
      cancelSpeech();
      setSpeakingEntryId(null);
      return;
    }
    setSpeakingEntryId(entry.id);
    speak(`${entry.question}. ${entry.answer}`, () => setSpeakingEntryId(null));
  };

  if (!companyId) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white shadow rounded-xl p-8 text-center">
          <p className="text-lg text-slate-700">
            {t("managerFaq.noCompany", { default: "Nous n'avons pas pu trouver votre entreprise." })}
          </p>
          <Link to="/manager/dashboard" className="inline-block mt-6">
            <Button>{t("managerFaq.backToDashboard", { default: "Retour au tableau de bord" })}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-sm text-slate-500">
            <Link to="/manager/dashboard" className="text-primary hover:underline">
              {t("managerFaq.backToDashboard", { default: "Retour au tableau de bord" })}
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="font-medium text-slate-700">{t("managerFaq.title", { default: "Gestion FAQ entreprise" })}</span>
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{t("managerFaq.title", { default: "Gestion FAQ entreprise" })}</h1>
          <p className="text-slate-600 max-w-3xl">
            {t("managerFaq.subtitle", {
              default:
                "Centralisez vos questions-réponses internes, activez la recherche et synchronisez l'assistant Nexus en temps réel.",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <section className="bg-white shadow rounded-2xl p-6 lg:col-span-2" aria-labelledby="faq-form-title">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  {editingId
                    ? t("managerFaq.editingLabel", { default: "Modification" })
                    : t("managerFaq.creationLabel", { default: "Nouvelle entrée" })}
                </p>
                <h2 id="faq-form-title" className="text-2xl font-semibold text-slate-900">
                  {editingId
                    ? t("managerFaq.editTitle", { default: "Mettre à jour la FAQ" })
                    : t("managerFaq.createTitle", { default: "Ajouter une question" })}
                </h2>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Input
                    label={t("managerFaq.questionLabel", { default: "Question" })}
                    value={formState.question}
                    onChange={(e) => setFormState((prev) => ({ ...prev, question: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => toggleDictation("question")}
                    className="ms-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                    aria-label={t("managerFaq.voiceQuestion", { default: "Dicter la question" })}
                    disabled={!browserSupportsSpeechRecognition}
                  >
                    <MicrophoneIcon className={`h-5 w-5 ${dictationTarget === "question" && isListening ? "text-primary" : ""}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {browserSupportsSpeechRecognition
                    ? t("managerFaq.voiceHelper", { default: "Cliquez sur le micro pour dicter." })
                    : t("managerFaq.voiceUnavailable", { default: "Dictée vocale non supportée par ce navigateur." })}
                </p>
              </div>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <Textarea
                    label={t("managerFaq.answerLabel", { default: "Réponse" })}
                    value={formState.answer}
                    rows={5}
                    onChange={(e) => setFormState((prev) => ({ ...prev, answer: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => toggleDictation("answer")}
                    className="mt-7 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                    aria-label={t("managerFaq.voiceAnswer", { default: "Dicter la réponse" })}
                    disabled={!browserSupportsSpeechRecognition}
                  >
                    <MicrophoneIcon className={`h-5 w-5 ${dictationTarget === "answer" && isListening ? "text-primary" : ""}`} />
                  </button>
                </div>
              </div>
              <Input
                label={t("managerFaq.tagsLabel", { default: "Tags (séparés par des virgules)" })}
                placeholder={t("managerFaq.tagsPlaceholder", { default: "Onboarding, paiement, SLA" })}
                value={formState.tags}
                onChange={(e) => setFormState((prev) => ({ ...prev, tags: e.target.value }))}
              />
              <label className="inline-flex items-center gap-3 text-slate-700 text-sm">
                <input
                  type="checkbox"
                  checked={formState.isActive}
                  onChange={(e) => setFormState((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                {t("managerFaq.isActiveLabel", { default: "Activer l'entrée" })}
              </label>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" isLoading={isSaving} className="min-w-[180px]">
                  {editingId
                    ? t("managerFaq.updateButton", { default: "Mettre à jour" })
                    : t("managerFaq.createButton", { default: "Ajouter à la FAQ" })}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t("managerFaq.cancelEdit", { default: "Annuler" })}
                  </Button>
                )}
              </div>
              {(speechError || ttsError) && (
                <p className="text-xs text-red-500">
                  {speechError || ttsError || ""}
                </p>
              )}
            </form>
          </section>

          <section className="bg-white shadow rounded-2xl p-6" aria-labelledby="faq-search-title">
            <h2 id="faq-search-title" className="text-xl font-semibold text-slate-900">
              {t("managerFaq.searchTitle", { default: "Recherche & options" })}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t("managerFaq.searchSubtitle", { default: "Filtrez vos entrées par mot-clé ou par tag." })}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Input
                label={t("managerFaq.searchLabel", { default: "Recherche" })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("managerFaq.searchPlaceholder", { default: "Rechercher une question..." })}
              />
              <button
                type="button"
                onClick={() => toggleDictation("search")}
                className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label={t("managerFaq.voiceSearch", { default: "Recherche vocale" })}
                disabled={!browserSupportsSpeechRecognition}
              >
                <MicrophoneIcon className={`h-5 w-5 ${dictationTarget === "search" && isListening ? "text-primary" : ""}`} />
              </button>
            </div>
            <div className="mt-6 text-sm text-slate-600">
              <p className="font-semibold">
                {t("managerFaq.totalCount", { count: faqs.length, defaultValue: "{{count}} entrées" })}
              </p>
              <p className="text-slate-500">
                {t("managerFaq.filteredCount", {
                  count: filteredFaqs.length,
                  defaultValue: "{{count}} résultats après filtrage",
                })}
              </p>
            </div>
            <div className="mt-6">
              <Button variant="outline" onClick={loadFaqs} className="w-full">
                {t("managerFaq.refreshButton", { default: "Actualiser" })}
              </Button>
            </div>
          </section>
        </div>

        <section className="bg-white shadow rounded-2xl p-6" aria-labelledby="faq-list-title">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 id="faq-list-title" className="text-2xl font-semibold text-slate-900">
                {t("managerFaq.listTitle", { default: "FAQ de l'entreprise" })}
              </h2>
              <p className="text-sm text-slate-500">
                {t("managerFaq.listSubtitle", { default: "Synchronisé automatiquement avec l'assistant Nexus." })}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16">
              <LoadingSpinner text={t("managerFaq.loading", { default: "Chargement des données..." })} />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <p className="text-center text-slate-500 py-10">
              {searchQuery
                ? t("managerFaq.noResults", { default: "Aucun résultat pour cette recherche." })
                : t("managerFaq.emptyState", { default: "Aucune entrée pour le moment. Ajoutez votre première question." })}
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredFaqs.map((entry) => (
                <li key={entry.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {entry.is_active
                            ? t("managerFaq.statusActive", { default: "Actif" })
                            : t("managerFaq.statusInactive", { default: "Désactivé" })}
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900">{entry.question}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {browserSupportsTextToSpeech && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSpeakEntry(entry)}
                          >
                            {speakingEntryId === entry.id && isSpeaking
                              ? t("managerFaq.stopSpeaking", { default: "Stop" })
                              : t("managerFaq.speakAnswer", { default: "Lire" })}
                            <span className="ms-2">
                              {speakingEntryId === entry.id && isSpeaking ? (
                                <StopSpeakerIcon className="h-4 w-4" />
                              ) : (
                                <SpeakerIcon className="h-4 w-4" />
                              )}
                            </span>
                          </Button>
                        )}
                        <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                          {t("managerFaq.editButton", { default: "Modifier" })}
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(entry)}
                          isLoading={deletingId === entry.id}
                        >
                          {t("managerFaq.deleteButton", { default: "Supprimer" })}
                        </Button>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{entry.answer}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      {entry.tags?.length ? (
                        entry.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-white border border-slate-200 rounded-full text-xs">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span>{t("managerFaq.noTags", { default: "Aucun tag" })}</span>
                      )}
                      <span className="text-xs text-slate-400">
                        {t("managerFaq.lastUpdated", { default: "Maj" })}: {new Date(entry.updated_at || entry.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        </section>
      </div>
    </div>
  );
};

export default ManagerFaqPage;

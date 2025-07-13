import React, { useState, useEffect, useRef, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input, Textarea, Select } from "../components/FormElements";
import { TicketPriority, UserRole, ChatMessage, TicketStatus } from "../types";
import { TICKET_CATEGORY_KEYS } from "../constants";
import LoadingSpinner from "../components/LoadingSpinner";
import { summarizeAndCategorizeChat } from "../services/geminiService";

const NewTicketPage: React.FC = () => {
  const { addTicket, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const chatHistory =
    (location.state as { chatHistory?: ChatMessage[] })?.chatHistory || [];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<TicketPriority>(
    TicketPriority.MEDIUM
  );
  const [workstationId, setWorkstationId] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chatHistoryRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    let isMounted = true;

    const processChatHistory = async () => {
      if (!chatHistory || chatHistory.length === 0) {
        console.error(
          "Nouvelle page ticket chargée sans historique de chat. Redirection."
        );
        navigate("/help");
        return;
      }
      chatHistoryRef.current = chatHistory;

      try {
        const summary = await summarizeAndCategorizeChat(chatHistory);
        if (isMounted) {
          setTitle(summary.title);
          setDescription(summary.description);
          setCategory(summary.category);
          setPriority(summary.priority);
        }
      } catch (e: any) {
        if (isMounted) {
          console.error("Échec de la récupération du résumé IA:", e);
          setErrors({
            form: `Échec du résumé IA : ${e.message}. Veuillez remplir le formulaire manuellement.`,
          });
          const fallbackDescription = chatHistory
            .map((m) => `[${m.sender}] ${m.message}`)
            .join("\n");
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
  }, [location.state, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Le titre est requis.";
    } else if (title.trim().length > 100) {
      newErrors.title = "Le titre ne doit pas dépasser 100 caractères.";
    }

    if (!description.trim()) {
      newErrors.description = "La description est requise.";
    } else if (description.trim().length < 10) {
      newErrors.description =
        "La description doit contenir au moins 10 caractères.";
    }

    if (!category) {
      newErrors.category = "La catégorie est requise.";
    }

    if (!priority) {
      newErrors.priority = "La priorité est requise.";
    }

    if (workstationId.trim().length > 50) {
      newErrors.workstationId =
        "L'identifiant du poste ne doit pas dépasser 50 caractères.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReturnToDashboard = () => {
    let dashboardPath = "/dashboard";
    if (user?.role === UserRole.AGENT) {
      dashboardPath = "/agent/dashboard";
    } else if (user?.role === UserRole.MANAGER) {
      dashboardPath = "/manager/dashboard";
    }
    navigate(dashboardPath, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    const ticketData = {
      title: title.trim(),
      detailed_description: description.trim(),
      category,
      priority,
      status: "open" as TicketStatus,
      workstation_id: workstationId.trim() || undefined,
      chat_messages: chatHistoryRef.current,
    };

    try {
      const result = await addTicket(ticketData, chatHistoryRef.current);

      if (typeof result === "string") {
        setErrors({ form: result });
      } else if (result) {
        navigate(`/ticket/${result.id}`, {
          replace: true,
          state: {
            message: "Ticket créé avec succès !",
            type: "success",
          },
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de la création du ticket:", error);
      setErrors({
        form: "Échec de la création du ticket. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = TICKET_CATEGORY_KEYS.map((key) => ({
    value: key.split(".")[1],
    label: key.split(".")[1],
  }));

  const priorityOptions = Object.values(TicketPriority).map((priority) => ({
    value: priority,
    label:
      priority.toUpperCase() === "HIGH"
        ? "Haute"
        : priority.toUpperCase() === "URGENT"
        ? "Urgente"
        : priority.toUpperCase() === "MEDIUM"
        ? "Moyenne"
        : priority.toUpperCase() === "LOW"
        ? "Basse"
        : priority,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Génération du résumé IA..." />
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8">
            <button
              onClick={handleReturnToDashboard}
              className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              ← Retour au tableau de bord
            </button>
            {/* Info résumé IA */}
            {chatHistoryRef.current.length > 0 && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Résumé IA
                </h3>
                <p className="text-sm text-blue-700">
                  Un résumé automatique a été généré à partir de la
                  conversation.
                </p>
              </div>
            )}

            {/* Formulaire */}
            <div className="bg-white shadow rounded-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Erreur générale */}
                {errors.form && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{errors.form}</div>
                  </div>
                )}

                {/* Titre */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre du ticket"
                    error={errors.title}
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre problème ou demande"
                    rows={6}
                    error={errors.description}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Catégorie et priorité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Catégorie */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      options={[
                        { value: "", label: "Sélectionner une catégorie" },
                        ...categoryOptions,
                      ]}
                      error={errors.category}
                    />
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Priorité */}
                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Priorité <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="priority"
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as TicketPriority)
                      }
                      options={priorityOptions}
                      error={errors.priority}
                    />
                    {errors.priority && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.priority}
                      </p>
                    )}
                  </div>
                </div>

                {/* Identifiant du poste */}
                <div>
                  <label
                    htmlFor="workstationId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Identifiant du poste
                  </label>
                  <Input
                    id="workstationId"
                    type="text"
                    value={workstationId}
                    onChange={(e) => setWorkstationId(e.target.value)}
                    placeholder="Ex : PC-12345"
                    maxLength={50}
                    error={errors.workstationId}
                  />
                  {errors.workstationId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.workstationId}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReturnToDashboard}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="min-w-32"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" text="" />
                        <span className="ml-2">Créer le ticket</span>
                      </div>
                    ) : (
                      "Créer le ticket"
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Conseils */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">
                Conseils pour un ticket efficace
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Soyez précis dans la description du problème.</li>
                <li>• Indiquez la catégorie la plus pertinente.</li>
                <li>• Ajoutez l'identifiant du poste si nécessaire.</li>
                <li>• Choisissez la priorité adaptée à l'urgence.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default NewTicketPage;

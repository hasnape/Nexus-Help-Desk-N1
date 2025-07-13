import React, { useState, useEffect, useRef, Suspense } from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation(["newTicket", "common", "enums"]);

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
      const state = location.state as { chatHistory?: ChatMessage[] };
      if (!state || !state.chatHistory || state.chatHistory.length === 0) {
        console.error(
          "NewTicketPage loaded without chat history. Redirecting."
        );
        navigate("/help");
        return;
      }
      chatHistoryRef.current = state.chatHistory;

      try {
        const summary = await summarizeAndCategorizeChat(
          state.chatHistory,
          i18n.language as any // Correction du typage si la fonction attend un type 'Locale'
        );
        if (isMounted) {
          setTitle(summary.title);
          setDescription(summary.description);
          setCategory(summary.category);
          setPriority(summary.priority);
        }
      } catch (e: any) {
        if (isMounted) {
          console.error("Failed to get summary from AI:", e);
          setErrors({
            form: t("errors.summaryFailed", {
              error: e.message,
              defaultValue: `Failed to get AI summary: ${e.message}. Please fill out the form manually.`,
            }),
          });
          const fallbackDescription = state.chatHistory
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
  }, [location.state, navigate, i18n.language, t]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = t("validation.titleRequired");
    } else if (title.trim().length > 100) {
      newErrors.title = t("validation.titleMaxLength");
    }

    if (!description.trim()) {
      newErrors.description = t("validation.descriptionRequired");
    } else if (description.trim().length < 10) {
      newErrors.description = t("validation.descriptionMinLength");
    }

    if (!category) {
      newErrors.category = t("validation.categoryRequired");
    }

    if (!priority) {
      newErrors.priority = t("validation.priorityRequired");
    }

    if (workstationId.trim().length > 50) {
      newErrors.workstationId = t("validation.workstationIdMaxLength");
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
      status: "Open" as TicketStatus,
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
            message: t("success.created"),
            type: "success",
          },
        });
      }
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      setErrors({
        form: t("errors.createFailed", {
          defaultValue: "Failed to create ticket. Please try again.",
        }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = TICKET_CATEGORY_KEYS.map((key) => ({
    value: key.split(".")[1], // Extract the category name from the key
    label: t(key, { ns: "enums", defaultValue: key.split(".")[1] }),
  }));

  const priorityOptions = Object.values(TicketPriority).map((priority) => ({
    value: priority,
    label: t(`priorities.${priority.toLowerCase()}`, {
      defaultValue: t(`ticketPriority.${priority}`, { ns: "enums" }),
    }),
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text={t("aiSummary.generating")} />
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleReturnToDashboard}
              className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              ← {t("backToDashboard")}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
            <p className="mt-2 text-gray-600">{t("subtitle")}</p>
          </div>

          {/* AI Summary Info */}
          {chatHistoryRef.current.length > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                {t("aiSummary.title")}
              </h3>
              <p className="text-sm text-blue-700">
                {t("aiSummary.generated")}
              </p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.form && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{errors.form}</div>
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("form.title")} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("form.titlePlaceholder")}
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
                  {t("form.description")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("form.descriptionPlaceholder")}
                  rows={6}
                  error={errors.description}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Category and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("form.category")} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[
                      { value: "", label: t("form.categoryPlaceholder") },
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

                {/* Priority */}
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("form.priority")} <span className="text-red-500">*</span>
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

              {/* Workstation ID */}
              <div>
                <label
                  htmlFor="workstationId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("form.workstationId")}
                </label>
                <Input
                  id="workstationId"
                  type="text"
                  value={workstationId}
                  onChange={(e) => setWorkstationId(e.target.value)}
                  placeholder={t("form.workstationIdPlaceholder")}
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
                  {t("actions.cancel")}
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
                      <span className="ml-2">{t("actions.submit")}</span>
                    </div>
                  ) : (
                    t("actions.submit")
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              {t("tips.title")}
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t("tips.tip1")}</li>
              <li>• {t("tips.tip2")}</li>
              <li>• {t("tips.tip3")}</li>
              <li>• {t("tips.tip4")}</li>
            </ul>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default NewTicketPage;

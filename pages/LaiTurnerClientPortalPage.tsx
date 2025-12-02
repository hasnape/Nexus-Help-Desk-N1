import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select, Textarea } from "../components/FormElements";
import TicketCard from "../components/TicketCard";
import { useApp } from "../App";
import { supabase } from "../services/supabaseClient";
import { ChatMessage, Ticket, TicketPriority, TicketStatus } from "../types";
import {
  findLatestLaiTurnerIntake,
  getAgeDisplay,
  getDisplayNameFromIntake,
  getLegalStatusDisplay,
  getLocationDisplay,
  getPracticeAreaDisplay,
  getPrimaryGoalDisplay,
  getUrgencyDisplay,
  IntakePayload,
} from "@/utils/laiTurnerIntake";

const practiceAreaCopy: Record<string, string> = {
  "Family Law": "Work through custody, support, and visitation with updates in plain English.",
  "Personal Injury": "Explain what happened, share photos or bills, and track demand letters and negotiations.",
  "Criminal Defense": "Know the next deadline, hear what to expect at each court date, and get ready like we’re going to trial.",
  "Business Immigration": "Get a checklist for visas, entity setup, and cross-border hiring with clear timelines.",
};

const LaiTurnerClientPortalPage: React.FC = () => {
  const { user, tickets, addTicket } = useApp();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationMessage, setCreationMessage] = useState<string | null>(null);
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);
  const [intakeForm, setIntakeForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    preferredLanguage: "en",
    practiceArea: "",
    urgency: "medium",
    story: "",
    objective: "",
  });

  useEffect(() => {
    let active = true;
    const loadCompany = async () => {
      if (!user?.company_id) {
        setCompanyName(null);
        return;
      }
      setCompanyLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select("id,name")
        .eq("id", user.company_id)
        .single();
      if (!active) return;
      setCompanyName(!error ? data?.name ?? null : null);
      setCompanyId(!error ? data?.id ?? null : null);
      setCompanyLoading(false);
    };

    loadCompany();
    return () => {
      active = false;
    };
  }, [user?.company_id]);

  const isLaiTurner = (companyName || "").toLowerCase() === "lai & turner";

  const buildClientSummary = (payload: IntakePayload) => {
    const summary: { label: string; value: string }[] = [];
    const displayName = getDisplayNameFromIntake(payload);
    const practiceArea = getPracticeAreaDisplay(payload);
    const goal = getPrimaryGoalDisplay(payload);
    const urgency = getUrgencyDisplay(payload);
    const age = getAgeDisplay(payload);
    const location = getLocationDisplay(payload);
    const legalStatus = getLegalStatusDisplay(payload);

    if (displayName) summary.push({ label: "Name", value: displayName });
    if (age) summary.push({ label: "Age", value: age });
    if (practiceArea) summary.push({ label: "Practice area", value: practiceArea });
    if (goal) summary.push({ label: "Goal", value: goal });
    if (location) summary.push({ label: "Current location", value: location });
    if (legalStatus) summary.push({ label: "Legal status", value: legalStatus });
    if (urgency) summary.push({ label: "Urgency", value: urgency });

    return summary;
  };

  const userTickets: Ticket[] = useMemo(() => {
    if (!user || !isLaiTurner) return [];
    return tickets
      .filter((ticket) => ticket.user_id === user.id)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [tickets, user, isLaiTurner]);

  const handlePracticeAreaSelect = (area: keyof typeof practiceAreaCopy) => {
    setIntakeForm((prev) => ({ ...prev, practiceArea: area }));
    const intakeFormElement = document.getElementById("laiTurnerIntakeForm");
    if (intakeFormElement) {
      intakeFormElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const submitIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreationError(null);
    setCreationMessage(null);
    if (!intakeForm.fullName || !intakeForm.email || !intakeForm.practiceArea || !intakeForm.story || !intakeForm.objective) {
      setCreationError("Please complete the required fields before submitting.");
      return;
    }

    setIsSubmittingIntake(true);
    try {
      const intakeUnavailableMessage =
        "L’AI intake Lai & Turner est momentanément indisponible. Merci de réessayer ou de contacter directement le cabinet.";

      const { data: aiJson, error: aiError } = await supabase.functions.invoke("nexus-ai", {
        body: {
          context: "lai_turner_intake",
          mode: "intake_first_contact",
          full_name: intakeForm.fullName,
          email: intakeForm.email,
          phone: intakeForm.phone,
          preferred_language: intakeForm.preferredLanguage,
          practice_area_raw: intakeForm.practiceArea,
          urgency_raw: intakeForm.urgency,
          story: intakeForm.story,
          objective: intakeForm.objective,
        },
      });

      if (aiError) {
        console.error("Nexus AI intake error", aiError);
        setCreationError(intakeUnavailableMessage);
        return;
      }

      const aiResponse = (aiJson || {}) as {
        ok?: boolean;
        intakeData?: IntakePayload | null;
        userFacingError?: string;
      };

      if (aiResponse.ok === false || aiResponse.userFacingError) {
        setCreationError(aiResponse.userFacingError || intakeUnavailableMessage);
        return;
      }

      if (aiResponse.ok !== true) {
        setCreationError(intakeUnavailableMessage);
        return;
      }

      const intakePayload: IntakePayload | null = (aiResponse?.intakeData as IntakePayload) ?? null;
      const normalizedPracticeArea =
        getPracticeAreaDisplay(intakePayload, intakeForm.practiceArea) || intakeForm.practiceArea || "Other";
      const normalizedUrgency = getUrgencyDisplay(intakePayload) || intakeForm.urgency;
      const priorityMap: Record<string, TicketPriority> = {
        low: TicketPriority.LOW,
        medium: TicketPriority.MEDIUM,
        high: TicketPriority.HIGH,
        emergency: TicketPriority.HIGH,
      };
      const title = `New intake – ${normalizedPracticeArea} – ${intakeForm.fullName}`;
      const combinedStory = `${intakeForm.story}\n\nObjective: ${intakeForm.objective}`;
      const contactLine = `Contact: ${intakeForm.email}${intakeForm.phone ? ` • ${intakeForm.phone}` : ""}`;

      const initialMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "user",
        text: `${combinedStory}\n${contactLine}`,
        timestamp: new Date(),
      };

      const aiCaptureMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: `AI intake captured for Lai & Turner. Practice area: ${normalizedPracticeArea}. Urgency: ${
          normalizedUrgency || "n/a"
        }. Preferred language: ${intakeForm.preferredLanguage}.`,
        timestamp: new Date(),
        ai_profile_key: "lai_turner_intake",
        intake_payload: {
          ...intakePayload,
          submitted_form: {
            full_name: intakeForm.fullName,
            email: intakeForm.email,
            phone: intakeForm.phone,
            preferred_language: intakeForm.preferredLanguage,
            practice_area: intakeForm.practiceArea,
            urgency: intakeForm.urgency,
            story: intakeForm.story,
            objective: intakeForm.objective,
          },
        },
      };

      const intakeMetadata = {
        context: "lai_turner_intake",
        company_id: companyId,
        intake_payload: aiJson?.intakeData ?? null,
        submitted_form: {
          full_name: intakeForm.fullName,
          email: intakeForm.email,
          phone: intakeForm.phone || null,
          preferred_language: intakeForm.preferredLanguage,
          practice_area: intakeForm.practiceArea,
          urgency: intakeForm.urgency,
          story: intakeForm.story,
          objective: intakeForm.objective,
        },
      };

      const newTicket = await addTicket(
        {
          title,
          description: `${combinedStory}\n\n${contactLine}`,
          category: normalizedPracticeArea,
          priority: priorityMap[normalizedUrgency] || TicketPriority.MEDIUM,
          status: TicketStatus.OPEN,
          chat_history: [],
          internal_notes: [],
          metadata: intakeMetadata,
        },
        [initialMessage, aiCaptureMessage]
      );

      if (!newTicket) {
        setCreationError("Unable to create Lai & Turner ticket. Please try again.");
      } else {
        const displayName = getDisplayNameFromIntake(intakePayload) || intakeForm.fullName;
        setCreationMessage(
          `Your request has been received${displayName ? `, ${displayName}` : ""}. A Lai & Turner coordinator will follow up shortly.`
        );
        setIntakeForm({
          fullName: "",
          email: "",
          phone: "",
          preferredLanguage: intakeForm.preferredLanguage,
          practiceArea: "",
          urgency: "medium",
          story: "",
          objective: "",
        });
      }
    } catch (err: any) {
      console.error("Intake submission error", err);
      setCreationError(
        "Une erreur est survenue lors de l’envoi de votre demande. Merci de réessayer ou de contacter directement le cabinet.",
      );
    } finally {
      setIsSubmittingIntake(false);
    }
  };

  // 🔒 Garde : pas connecté
  if (!user) {
    return (
      <div className="page-container section-stack">
        <section className="surface-card p-6 lg:p-8 space-y-4 text-center">
          <p className="section-eyebrow mx-auto">Lai & Turner Law</p>
          <h1 className="section-title">Authentication required</h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            To access this Lai & Turner client portal, please sign in from the Lai & Turner entry page using the Nexus login
            and the company name "Lai & Turner".
          </p>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/lai-turner-law")}>Back to Lai & Turner</Button>
          </div>
        </section>
      </div>
    );
  }

  // 🔒 Garde : pas un compte Lai & Turner
  if (!companyLoading && !isLaiTurner) {
    return (
      <div className="page-container section-stack">
        <section className="surface-card p-6 lg:p-8 space-y-4 text-center">
          <p className="section-eyebrow mx-auto">Lai & Turner Law</p>
          <h1 className="section-title">This client portal is reserved for Lai & Turner accounts.</h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            Please log in through the Nexus login screen with the company name "Lai & Turner" to continue.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate("/lai-turner-law")}>
              Return to Lai & Turner
            </Button>
            <Button onClick={() => navigate("/login")}>Go to Nexus login</Button>
          </div>
        </section>
      </div>
    );
  }

  // Vue principale client
  return (
    <div className="page-container section-stack">
        <section className="surface-card p-6 lg:p-8 space-y-4 text-center">
          <p className="section-eyebrow mx-auto">Lai & Turner Law</p>
          <h1 className="section-title">Lai & Turner – Client Portal</h1>
          <p className="section-subtitle max-w-3xl mx-auto">
            Premium legal support for Family Law, Personal Injury, Criminal Defense, and Business Immigration. Use this secure
            space to launch a confidential intake, share documents, and follow updates with your legal team.
          </p>
          <p className="text-sm text-slate-300">Signed in as {user.email}</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div
            id="laiTurnerIntakeForm"
            className="surface-card-soft lg:col-span-2 p-5 lg:p-6 space-y-4"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">New clients</p>
              <h3 className="text-xl font-bold text-white">Start a confidential intake</h3>
              <p className="text-sm text-slate-200">
                Share your situation for a tailored case evaluation. A coordinator will guide you through next steps—this is not a
                Nexus SaaS signup, but a direct request for representation.
              </p>
            </div>
            {creationMessage && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {creationMessage}
              </div>
            )}
            {creationError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {creationError}
              </div>
            )}
            <form onSubmit={submitIntake} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-semibold text-slate-100">
                    Full name
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={intakeForm.fullName}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Your name"
                    required
                    className="bg-white text-slate-900 placeholder:text-slate-500 border border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-100">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={intakeForm.email}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                    className="bg-white text-slate-900 placeholder:text-slate-500 border border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-100">
                    Phone (optional)
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={intakeForm.phone}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 555-1234"
                    className="bg-white text-slate-900 placeholder:text-slate-500 border border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="preferredLanguage" className="block text-sm font-semibold text-slate-100">
                    Preferred language
                  </label>
                  <Select
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={intakeForm.preferredLanguage}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, preferredLanguage: e.target.value }))}
                    options={[
                      { value: "en", label: "English" },
                      { value: "fr", label: "Français" },
                    ]}
                    className="bg-white text-slate-900 border border-slate-300"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="practiceArea" className="block text-sm font-semibold text-slate-100">
                    Practice area
                  </label>
                  <Select
                    id="practiceArea"
                    name="practiceArea"
                    value={intakeForm.practiceArea}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, practiceArea: e.target.value }))}
                    options={Object.keys(practiceAreaCopy).map((area) => ({ value: area, label: area }))}
                    placeholder="Select a practice area"
                    required
                    className="bg-white text-slate-900 border border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="urgency" className="block text-sm font-semibold text-slate-100">
                    Urgency
                  </label>
                  <Select
                    id="urgency"
                    name="urgency"
                    value={intakeForm.urgency}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, urgency: e.target.value }))}
                    options={[
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                      { value: "emergency", label: "Emergency" },
                    ]}
                    className="bg-white text-slate-900 border border-slate-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="story" className="block text-sm font-semibold text-slate-100">
                  Describe what happened
                </label>
                <Textarea
                  id="story"
                  name="story"
                  value={intakeForm.story}
                  onChange={(e) => setIntakeForm((prev) => ({ ...prev, story: e.target.value }))}
                  placeholder="Tell us the timeline, who is involved, and any deadlines."
                  rows={4}
                  required
                  className="bg-white text-slate-900 placeholder:text-slate-500 border border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="objective" className="block text-sm font-semibold text-slate-100">
                  Your main objective
                </label>
                <Textarea
                  id="objective"
                  name="objective"
                  value={intakeForm.objective}
                  onChange={(e) => setIntakeForm((prev) => ({ ...prev, objective: e.target.value }))}
                  placeholder="Example: custody, settlement, visa approval, dismissal, etc."
                  rows={3}
                  required
                  className="bg-white text-slate-900 placeholder:text-slate-500 border border-slate-300"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" isLoading={isSubmittingIntake} disabled={isSubmittingIntake}>
                  Submit confidential intake
                </Button>
                <p className="text-xs text-slate-400">Secure intake. No marketing emails.</p>
              </div>
            </form>
          </div>
          <div className="surface-card-soft p-5 lg:p-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Existing clients & team</p>
            <h3 className="text-xl font-bold text-white">Access through Nexus login</h3>
            <p className="text-sm text-slate-200">
              If you already have access or are part of the Lai & Turner team, continue through the Nexus login screen using the
              company name "Lai & Turner" to reach your matters.
            </p>
            <Button className="w-full md:w-auto" variant="secondary" onClick={() => navigate("/login")}>
              Go to Nexus login
            </Button>
          </div>
        </section>

        <section className="surface-card p-5 lg:p-6 space-y-4">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Practice areas</p>
            <h3 className="text-xl font-bold text-white">Choose your path</h3>
            <p className="text-sm text-slate-200">
              Select the practice area closest to your matter to pre-fill the intake below.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(practiceAreaCopy).map(([area, description]) => (
              <div
                key={area}
                className="surface-card-soft h-full flex flex-col justify-between p-4"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">{area}</p>
                  <p className="text-sm text-slate-200">{description}</p>
                </div>
                <Button
                  className="mt-4"
                  variant="secondary"
                  onClick={() => handlePracticeAreaSelect(area as keyof typeof practiceAreaCopy)}
                >
                  {area === "Family Law"
                    ? "Start a family law request"
                    : area === "Personal Injury"
                    ? "Report an injury case"
                    : area === "Criminal Defense"
                    ? "Ask about a criminal charge"
                    : "Start a business immigration request"}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-6 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Your cases</p>
              <h3 className="text-xl font-bold text-white">Track your cases</h3>
            </div>
            {companyLoading && (
              <span className="text-xs font-semibold text-slate-400">Confirming Lai & Turner access…</span>
            )}
          </div>
          {creationMessage && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {creationMessage}
            </div>
          )}
          {creationError && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{creationError}</div>
          )}
          {userTickets.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 text-sm text-slate-200">
              No active tickets yet. Use the buttons above to start a request and your updates will appear here in real time.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userTickets.map((ticket) => (
                <div key={ticket.id} className="space-y-3">
                  <TicketCard ticket={ticket} />
                  {(() => {
                    const intakePayload = findLatestLaiTurnerIntake(ticket);
                    if (!intakePayload) return null;
                    const summary = buildClientSummary(intakePayload);
                    if (summary.length === 0) return null;
                    return (
                      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-slate-50 shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">What we captured so far</p>
                          <span className="text-[10px] font-semibold text-indigo-200">AI intake</span>
                        </div>
                        <dl className="space-y-1">
                          {summary.map((item) => (
                            <div key={item.label} className="flex gap-2 text-xs text-slate-200">
                              <dt className="w-28 shrink-0 font-semibold text-slate-300">{item.label}</dt>
                              <dd className="text-slate-50">{item.value}</dd>
                            </div>
                          ))}
                        </dl>
                        <p className="mt-2 text-[11px] text-slate-300">
                          Your attorney will confirm these details and ask follow-up questions if needed.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="surface-card-soft p-6 space-y-3">
          <h3 className="text-xl font-bold text-white">What this portal does for you</h3>
          <ul className="list-disc space-y-2 pl-5 text-slate-200">
            <li>Plain-language updates (we speak English, not legalese).</li>
            <li>Document requests and reminders so you don’t miss deadlines.</li>
            <li>A clear timeline so you always know what happens next.</li>
          </ul>
        </section>
      </div>
    );
};

export default LaiTurnerClientPortalPage;

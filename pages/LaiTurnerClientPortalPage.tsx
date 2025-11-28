import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/FormElements";
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
  const [companyLoading, setCompanyLoading] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationMessage, setCreationMessage] = useState<string | null>(null);
  const [creatingArea, setCreatingArea] = useState<string | null>(null);

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
        .select("name")
        .eq("id", user.company_id)
        .single();
      if (!active) return;
      setCompanyName(!error ? data?.name ?? null : null);
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

  const createLaiTurnerTicket = async (area: keyof typeof practiceAreaCopy) => {
    if (!user) return;
    setCreationError(null);
    setCreationMessage(null);
    setCreatingArea(area);
    const category = area;
    const titleMap: Record<string, string> = {
      "Family Law": "Family law consultation",
      "Personal Injury": "Injury claim – intake",
      "Criminal Defense": "Criminal defense request",
      "Business Immigration": "Business immigration intake",
    };
    const descriptionMap: Record<string, string> = {
      "Family Law": "I need guidance on custody, support, or visitation and want to know my next deadlines.",
      "Personal Injury": "I was injured and need help with medical bills, insurance timelines, and negotiations.",
      "Criminal Defense": "I’m facing criminal charges and need a defense strategy plus a timeline for hearings.",
      // Example user message for business immigration testing (do NOT auto-send):
      // "I live in LA, I am from France, I don’t have a work visa and I want to work. What can I do?"
      "Business Immigration": "Business immigration intake – please share your situation so we can tailor the intake.",
    };

    const initialMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: descriptionMap[area],
      timestamp: new Date(),
    };

    try {
      const newTicket = await addTicket(
        {
          title: titleMap[area],
          description: descriptionMap[area],
          category,
          priority: area === "Criminal Defense" ? TicketPriority.HIGH : TicketPriority.MEDIUM,
          status: TicketStatus.OPEN,
        },
        [initialMessage]
      );
      if (newTicket) {
        setCreationMessage("Your request has been created. You can follow it below.");
        navigate(`/ticket/${newTicket.id}`);
      } else {
        setCreationError("We couldn’t create this request right now. Please try again.");
      }
    } catch (error: any) {
      setCreationError(error?.message || "We couldn’t create this request right now. Please try again.");
    } finally {
      setCreatingArea(null);
    }
  };

  // 🔒 Garde : pas connecté
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12">
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">Authentication required</h1>
          <p className="text-slate-700">
            To access this Lai & Turner client portal, please sign in from the Lai & Turner entry page using the Nexus login and
            the company name "Lai & Turner".
          </p>
          <Button onClick={() => navigate("/lai-turner-law")}>Back to Lai & Turner</Button>
        </div>
      </div>
    );
  }

  // 🔒 Garde : pas un compte Lai & Turner
  if (!companyLoading && !isLaiTurner) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12">
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">
            This client portal is reserved for Lai & Turner accounts.
          </h1>
          <p className="text-slate-700">
            Please log in through the Nexus login screen with the company name "Lai & Turner" to continue.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/lai-turner-law")}>
              Return to Lai & Turner
            </Button>
            <Button onClick={() => navigate("/login")}>Go to Nexus login</Button>
          </div>
        </div>
      </div>
    );
  }

  // Vue principale client
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Lai & Turner Law</p>
          <h1 className="text-3xl font-bold text-slate-900">Lai & Turner – Client Portal</h1>
          <p className="max-w-3xl text-lg text-slate-700">
            Premium legal support for Family Law, Personal Injury, Criminal Defense, and Business Immigration. Use this secure
            space to launch a confidential intake, share documents, and follow updates with your legal team.
          </p>
          <p className="text-sm text-slate-600">Signed in as {user.email}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">New clients</p>
            <h3 className="text-xl font-bold text-slate-900">Start a confidential intake</h3>
            <p className="mt-2 text-sm text-slate-700">
              Share your situation for a tailored case evaluation. A coordinator will guide you through next steps—this is not a
              Nexus SaaS signup, but a direct request for representation.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Existing clients & team</p>
            <h3 className="text-xl font-bold text-slate-900">Access through Nexus login</h3>
            <p className="mt-2 text-sm text-slate-700">
              If you already have access or are part of the Lai & Turner team, continue through the Nexus login screen using the
              company name "Lai & Turner" to reach your matters.
            </p>
            <Button className="mt-3" variant="secondary" onClick={() => navigate("/login")}>
              Go to Nexus login
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(practiceAreaCopy).map(([area, description]) => (
            <div
              key={area}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{area}</p>
                <p className="text-sm text-slate-700">{description}</p>
              </div>
              <Button
                className="mt-4"
                variant="secondary"
                onClick={() => createLaiTurnerTicket(area as keyof typeof practiceAreaCopy)}
                isLoading={creatingArea === area}
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
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Your cases</p>
              <h3 className="text-xl font-bold text-slate-900">Track your cases</h3>
            </div>
            {companyLoading && (
              <span className="text-xs font-semibold text-slate-500">
                Confirming Lai & Turner access…
              </span>
            )}
          </div>
          {creationMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {creationMessage}
            </div>
          )}
          {creationError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {creationError}
            </div>
          )}
          {userTickets.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-700">
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
                      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-900 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                            What we captured so far
                          </p>
                          <span className="text-[10px] font-semibold text-indigo-600">AI intake</span>
                        </div>
                        <dl className="space-y-1">
                          {summary.map((item) => (
                            <div key={item.label} className="flex gap-2 text-xs text-slate-800">
                              <dt className="w-28 shrink-0 font-semibold text-slate-700">{item.label}</dt>
                              <dd className="text-slate-900">{item.value}</dd>
                            </div>
                          ))}
                        </dl>
                        <p className="mt-2 text-[11px] text-slate-600">
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

        <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">What this portal does for you</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>Plain-language updates (we speak English, not legalese).</li>
            <li>Document requests and reminders so you don’t miss deadlines.</li>
            <li>A clear timeline so you always know what happens next.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default LaiTurnerClientPortalPage;

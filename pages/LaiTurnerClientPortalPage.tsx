import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "../components/FormElements";
import TicketCard from "../components/TicketCard";
import { useApp } from "../App";
import { supabase } from "../services/supabaseClient";
import { ChatMessage, Ticket, TicketPriority, TicketStatus } from "../types";

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
      "Business Immigration": "I’m hiring or relocating talent across borders and need a visa and entity plan.",
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

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">Authentication required</h1>
          <p className="text-slate-700">
            To access this LAI & TURNER client portal, please sign in from the Lai & Turner entry page.
          </p>
          <Button onClick={() => navigate("/lai-turner-law")}>Back to Lai & Turner</Button>
        </div>
      </Layout>
    );
  }

  if (!companyLoading && !isLaiTurner) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">This client portal is reserved for Lai & Turner accounts.</h1>
          <Button onClick={() => navigate("/lai-turner-law")}>Return to Lai & Turner</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl space-y-10 px-4">
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Lai & Turner Law</p>
            <h1 className="text-3xl font-bold text-slate-900">Your Lai & Turner client portal</h1>
            <p className="max-w-3xl text-lg text-slate-700">
              This is your live Lai & Turner client space. Use it to start new cases, share documents, and follow updates with your team.
            </p>
            <p className="text-sm text-slate-600">Signed in as {user.email}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(practiceAreaCopy).map(([area, description]) => (
              <div key={area} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                <span className="text-xs font-semibold text-slate-500">Confirming Lai & Turner access…</span>
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
                  <TicketCard key={ticket.id} ticket={ticket} />
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
    </Layout>
  );
};

export default LaiTurnerClientPortalPage;

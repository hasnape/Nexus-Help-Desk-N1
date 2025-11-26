import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "../components/FormElements";
import { useApp } from "../App";
import { supabase } from "../services/supabaseClient";
import { Ticket } from "../types";

const practiceAreaCopy: Record<string, string> = {
  "Family Law": "Work through custody, support, and visitation with updates in plain English.",
  "Personal Injury": "Explain what happened, share photos or bills, and track demand letters and negotiations.",
  "Criminal Defense": "Know the next deadline, hear what to expect at each court date, and get ready like we’re going to trial.",
  "Business Immigration": "Get a checklist for visas, entity setup, and cross-border hiring with clear timelines.",
};

const LaiTurnerClientPortalPage: React.FC = () => {
  const { user, tickets } = useApp();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

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
    if (!user) return [];
    return tickets.filter((ticket) => ticket.user_id === user.id);
  }, [tickets, user]);

  const renderCaseCard = (ticket: Ticket) => (
    <div
      key={ticket.id}
      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{ticket.category}</p>
        <h4 className="text-lg font-bold text-slate-900">{ticket.title}</h4>
        <p className="text-sm text-slate-700">Status: {ticket.status}</p>
        <p className="text-xs text-slate-500">
          Updated {ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : "recently"}
        </p>
      </div>
      <Button className="mt-4" variant="secondary" onClick={() => navigate(`/ticket/${ticket.id}`)}>
        View updates
      </Button>
    </div>
  );

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">Authentication required</h1>
          <p className="text-slate-700">
            To access this LAI & TURNER client portal, please sign in from the Lai & Turner demo page.
          </p>
          <Button onClick={() => navigate("/lai-turner-law")}>Back to Lai & Turner demo</Button>
        </div>
      </Layout>
    );
  }

  if (!companyLoading && !isLaiTurner) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">This client portal is reserved for Lai & Turner demo accounts.</h1>
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
              Most lawyers chase verdicts. We chase justice for your family, your future, and your business.
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
                  onClick={() => alert("Demo only. In production this would open a new ticket form.")}
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
            {userTickets.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-700">
                No active tickets yet. Use the buttons above to start a request and see how updates would appear here.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userTickets.map((ticket) => renderCaseCard(ticket))}
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

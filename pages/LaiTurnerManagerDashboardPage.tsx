import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { Button } from "../components/FormElements";
import { useApp } from "../App";
import { supabase } from "../services/supabaseClient";
import { Ticket, TicketStatus, User } from "../types";

const LaiTurnerManagerDashboardPage: React.FC = () => {
  const { user, tickets, getAllUsers } = useApp();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const allUsers: User[] = getAllUsers();

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

  const laiTickets: Ticket[] = useMemo(() => {
    if (!user) return [];
    return tickets.filter((ticket) => {
      const ticketOwner = allUsers.find((u) => u.id === ticket.user_id);
      return ticketOwner?.company_id && ticketOwner.company_id === user.company_id;
    });
  }, [tickets, allUsers, user]);

  const openFights = laiTickets.filter(
    (ticket) => ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED
  ).length;

  const practiceBreakdown = laiTickets.reduce<Record<string, number>>((acc, ticket) => {
    const key = ticket.category || "Other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const isLaiTurner = (companyName || "").toLowerCase() === "lai & turner";

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">Authentication required</h1>
          <Button onClick={() => (window.location.href = "#/lai-turner-law")}>Back to Lai & Turner</Button>
        </div>
      </Layout>
    );
  }

  if (user.role !== "manager" || (!companyLoading && !isLaiTurner)) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">This view is reserved for Lai & Turner managers in this demo.</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4">
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Lai & Turner Law</p>
            <h1 className="text-3xl font-bold text-slate-900">Lai & Turner – Manager Overview</h1>
            <p className="max-w-3xl text-lg text-slate-700">
              Most firms chase verdicts. This dashboard helps you chase justice AND run a healthy practice.
            </p>
          </section>

          <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-4">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Open fights</p>
              <p className="text-3xl font-bold text-slate-900">{openFights}</p>
              <p className="text-xs text-slate-600">Open or in-progress matters for Lai & Turner.</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Average first response (demo)</p>
              <p className="text-3xl font-bold text-slate-900">32m</p>
              <p className="text-xs text-slate-600">Based on recent demo conversations.</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">AI-handled first replies (demo)</p>
              <p className="text-3xl font-bold text-slate-900">68%</p>
              <p className="text-xs text-slate-600">First touch handled by AI before handoff.</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Human-led first replies (demo)</p>
              <p className="text-3xl font-bold text-slate-900">32%</p>
              <p className="text-xs text-slate-600">Escalated directly to attorneys or staff.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Practice areas</p>
                <h3 className="text-xl font-bold text-slate-900">Ticket distribution</h3>
              </div>
              {companyLoading && (
                <span className="text-xs font-semibold text-slate-500">Loading Lai & Turner metrics…</span>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.keys(practiceBreakdown).length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 md:col-span-2">
                  No tickets yet for Lai & Turner. Intake data will populate this view once cases start.
                </div>
              ) : (
                Object.entries(practiceBreakdown).map(([area, count]) => (
                  <div key={area} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{area}</p>
                      <p className="text-xs text-slate-600">Prepared like every case is going to trial.</p>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{count}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["Family Law", "Personal Injury", "Criminal Defense", "Business Immigration"].map((area) => (
              <div key={area} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{area}</p>
                  <p className="text-sm text-slate-700">
                    {area === "Family Law"
                      ? "Review family workflows and checklists tailored to the next hearing."
                      : area === "Personal Injury"
                      ? "Tune intake scripts and negotiation playbooks for injury cases."
                      : area === "Criminal Defense"
                      ? "Review defense workflows and trial preparation habits."
                      : "Review business immigration pipeline and global hiring milestones."}
                  </p>
                </div>
                <Button className="mt-4" variant="secondary">
                  {area === "Family Law"
                    ? "Review family law flows"
                    : area === "Personal Injury"
                    ? "Tune injury intake script"
                    : area === "Criminal Defense"
                    ? "Review defense workflows"
                    : "Review business immigration pipeline"}
                </Button>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Firm promise configuration</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Transparent pricing</p>
                <p className="mt-2 text-sm text-slate-700">Organise matter categories and flat-fee options without adding payment links.</p>
                <Button className="mt-3" variant="secondary">
                  Review pricing categories
                </Button>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Human communication</p>
                <p className="mt-2 text-sm text-slate-700">Keep templates in plain language and guide AI away from legalese.</p>
                <Button className="mt-3" variant="secondary">
                  Edit communication tone
                </Button>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Relentless advocacy</p>
                <p className="mt-2 text-sm text-slate-700">Checklists and workflows assume every matter could go to trial.</p>
                <Button className="mt-3" variant="secondary">
                  Review trial-prep checklists
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default LaiTurnerManagerDashboardPage;

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { Button } from "../components/FormElements";
import { useApp } from "../App";
import { supabase } from "../services/supabaseClient";
import { Ticket, TicketPriority, TicketStatus, User } from "../types";

const practiceAreas = ["Family", "Personal Injury", "Criminal Defense", "Business Immigration"] as const;

const LaiTurnerAgentInboxPage: React.FC = () => {
  const { user, tickets, getAllUsers } = useApp();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);

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

  const filteredTickets = laiTickets.filter((ticket) => {
    const matchesArea =
      areaFilter === "all" || (ticket.category || "").toLowerCase().includes(areaFilter.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesUrgency = !urgentOnly || ticket.priority === TicketPriority.HIGH;
    return matchesArea && matchesStatus && matchesUrgency;
  });

  const isLaiTurner = (companyName || "").toLowerCase() === "lai & turner";

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">Authentication required</h1>
          <p className="text-slate-700">Please log in from the Lai & Turner demo page.</p>
          <Button onClick={() => (window.location.href = "#/lai-turner-law")}>Back to Lai & Turner</Button>
        </div>
      </Layout>
    );
  }

  if (user.role !== "agent" || (!companyLoading && !isLaiTurner)) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">This inbox is reserved for Lai & Turner agents in this demo.</h1>
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
            <h1 className="text-3xl font-bold text-slate-900">Lai & Turner – Agent Inbox</h1>
            <p className="max-w-3xl text-lg text-slate-700">
              Triage client stories by practice area and fight for justice, not just case numbers.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Work queue</p>
                <h3 className="text-xl font-bold text-slate-900">Open matters for Lai & Turner</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Button
                  variant={areaFilter === "all" ? "primary" : "secondary"}
                  onClick={() => setAreaFilter("all")}
                  className="px-3"
                >
                  All areas
                </Button>
                {practiceAreas.map((area) => (
                  <Button
                    key={area}
                    variant={areaFilter === area ? "primary" : "secondary"}
                    onClick={() => setAreaFilter(area)}
                    className="px-3"
                  >
                    {area}
                  </Button>
                ))}
                <Button
                  variant={statusFilter === "all" ? "primary" : "secondary"}
                  onClick={() => setStatusFilter("all")}
                  className="px-3"
                >
                  All status
                </Button>
                {[TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED].map((statusKey) => (
                  <Button
                    key={statusKey}
                    variant={statusFilter === statusKey ? "primary" : "secondary"}
                    onClick={() => setStatusFilter(statusKey)}
                    className="px-3"
                  >
                    {statusKey}
                  </Button>
                ))}
                <Button
                  variant={urgentOnly ? "primary" : "secondary"}
                  onClick={() => setUrgentOnly((prev) => !prev)}
                  className="px-3"
                >
                  Only today’s urgent cases
                </Button>
              </div>
            </div>

            {companyLoading && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                Confirming Lai & Turner agent access…
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTickets.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 md:col-span-2 lg:col-span-3">
                  No tickets match the current filters. Switch filters or refresh the inbox.
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{ticket.category}</p>
                      <h4 className="text-lg font-bold text-slate-900">{ticket.title}</h4>
                      <p className="text-sm text-slate-700">Priority: {ticket.priority}</p>
                      <p className="text-sm text-slate-700">Status: {ticket.status}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => (window.location.href = `#/ticket/${ticket.id}`)}>
                        Open conversation
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => console.log("Request documents checklist for", ticket.id)}
                      >
                        Request documents checklist
                      </Button>
                      {ticket.category?.toLowerCase().includes("criminal") && (
                        <Button
                          variant="secondary"
                          onClick={() => alert("Demo: would open trial prep template for this criminal defense case.")}
                        >
                          Prepare for trial
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Family Law</p>
              <p className="mt-2 text-sm text-slate-700">Prioritise safety planning, temporary orders, and clarity on next court dates.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Personal Injury</p>
              <p className="mt-2 text-sm text-slate-700">Flag medical updates, insurance deadlines, and negotiation posture for each matter.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Criminal Defense</p>
              <p className="mt-2 text-sm text-slate-700">Surface speedy trial timelines, discovery status, and preparation for hearings.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Business Immigration</p>
              <p className="mt-2 text-sm text-slate-700">Track petitions, RFE reminders, and business milestones for cross-border teams.</p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default LaiTurnerAgentInboxPage;

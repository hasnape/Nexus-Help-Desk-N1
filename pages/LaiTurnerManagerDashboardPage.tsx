import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "../components/FormElements";
import { useApp } from "../App";
import { supabase } from "../services/supabaseClient";
import { Ticket, TicketStatus, User } from "../types";
import ManagerInviteUserCard from "../components/ManagerInviteUserCard";
import PlanLimits from "../components/PlanLimits";
import {
  findLatestLaiTurnerIntake,
  getDisplayNameFromIntake,
  getPracticeAreaDisplay,
  getUrgencyDisplay,
} from "@/utils/laiTurnerIntake";
import { useNavigate } from "react-router-dom";

const LaiTurnerManagerDashboardPage: React.FC = () => {
  const { user, tickets, getAllUsers, deleteTicket, proposeOrUpdateAppointment } = useApp();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string | null>(null);
  const [ticketActionMessage, setTicketActionMessage] = useState<string | null>(null);
  const [ticketActionError, setTicketActionError] = useState<string | null>(null);
  const [ticketActionLoading, setTicketActionLoading] = useState<string | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<Ticket | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    location: "",
  });
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

  const laiTicketsWithIntake = useMemo(
    () =>
      laiTickets.map((ticket) => {
        const intake = findLatestLaiTurnerIntake(ticket);
        const practiceArea = getPracticeAreaDisplay(intake, ticket.category || undefined) || ticket.category || "Other";
        const urgency = getUrgencyDisplay(intake);
        return { ticket, intake, practiceArea, urgency };
      }),
    [laiTickets]
  );

  const recentTickets = useMemo(
    () =>
      [...laiTicketsWithIntake]
        .sort((a, b) => new Date(b.ticket.created_at).getTime() - new Date(a.ticket.created_at).getTime())
        .slice(0, 20),
    [laiTicketsWithIntake]
  );

  const focusTickets = useMemo(
    () =>
      selectedPracticeArea
        ? laiTicketsWithIntake.filter((item) => item.practiceArea === selectedPracticeArea)
        : [],
    [selectedPracticeArea, laiTicketsWithIntake]
  );

  const openFights = laiTickets.filter(
    (ticket) => ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS
  ).length;

  const now = new Date();
  const ticketsLast7Days = laiTickets.filter((ticket) => {
    const createdAt = new Date(ticket.created_at);
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  const ticketsLast30Days = laiTickets.filter((ticket) => {
    const createdAt = new Date(ticket.created_at);
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  const practiceBreakdown30 = laiTicketsWithIntake.reduce<Record<string, number>>((acc, item) => {
    const createdAt = new Date(item.ticket.created_at);
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 30) {
      const key = item.practiceArea || "Other";
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const intakeCount30 = laiTicketsWithIntake.filter((item) => {
    const createdAt = new Date(item.ticket.created_at);
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30 && !!item.intake;
  }).length;

  const recentIntakes = laiTicketsWithIntake
    .filter((item) => item.intake)
    .sort(
      (a, b) => new Date(b.ticket.created_at).getTime() - new Date(a.ticket.created_at).getTime()
    )
    .slice(0, 5);

  const isLaiTurner = (companyName || "").toLowerCase() === "lai & turner";

  const handleViewTicket = (ticketId: string) => {
    navigate(`/ticket/${ticketId}`);
  };

  const handleDeleteTicket = async (ticket: Ticket) => {
    if (!window.confirm("Delete this ticket for Lai & Turner?")) return;
    setTicketActionError(null);
    setTicketActionMessage(null);
    setTicketActionLoading(ticket.id);
    try {
      await deleteTicket(ticket.id);
      setTicketActionMessage("Ticket deleted successfully.");
    } catch (err) {
      console.error("Delete ticket error", err);
      setTicketActionError("Unable to delete this ticket. Please try again.");
    } finally {
      setTicketActionLoading(null);
    }
  };

  const handleScheduleAppointment = (ticket: Ticket) => {
    setScheduleTarget(ticket);
    setScheduleForm({
      date: ticket.current_appointment?.proposedDate || "",
      time: ticket.current_appointment?.proposedTime || "",
      location: ticket.current_appointment?.locationOrMethod || "",
    });
    setTicketActionError(null);
    setTicketActionMessage(null);
  };

  const submitSchedule = async () => {
    if (!scheduleTarget) return;
    if (!scheduleForm.date || !scheduleForm.time || !scheduleForm.location) {
      setTicketActionError("Please provide date, time, and location/method to schedule.");
      return;
    }
    setTicketActionLoading(scheduleTarget.id);
    setTicketActionError(null);
    setTicketActionMessage(null);
    try {
      await proposeOrUpdateAppointment(
        scheduleTarget.id,
        {
          proposedDate: scheduleForm.date,
          proposedTime: scheduleForm.time,
          locationOrMethod: scheduleForm.location,
        },
        "agent",
        "pending_user_approval"
      );
      setTicketActionMessage("Appointment proposal sent to the client.");
      setScheduleTarget(null);
      setScheduleForm({ date: "", time: "", location: "" });
    } catch (err) {
      console.error("Schedule appointment error", err);
      setTicketActionError("Unable to schedule this appointment right now.");
    } finally {
      setTicketActionLoading(null);
    }
  };

  if (!user) {
    return (
      
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">Authentication required</h1>
          <Button onClick={() => (window.location.href = "#/lai-turner-law")}>Back to Lai & Turner</Button>
        </div>
      
    );
  }

  if (user.role !== "manager" || (!companyLoading && !isLaiTurner)) {
    return (
     
        <div className="mx-auto max-w-3xl space-y-4 py-16 px-4">
          <h1 className="text-3xl font-bold text-slate-900">This view is reserved for Lai & Turner managers.</h1>
          <p className="text-slate-700">If you need access, please sign in with a manager account for the firm.</p>
        </div>
      
    );
  }

  return (
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4">
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Lai & Turner Law</p>
            <h1 className="text-3xl font-bold text-slate-900">Lai & Turner – Manager Overview</h1>
            <p className="max-w-3xl text-lg text-slate-700">
              Track every fight across family, injury, criminal defense, and business immigration while keeping the Lai & Turner promise visible.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Recent structured intakes</p>
                <h3 className="text-xl font-bold text-slate-900">Quick view</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">Last 5 with intake payload</span>
            </div>
            {recentIntakes.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                No structured intakes yet. As soon as AI captures details, they will surface here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentIntakes.map(({ ticket, practiceArea, urgency }) => (
                  <div key={ticket.id} className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{ticket.title}</p>
                      <p className="text-xs text-slate-600">
                        {practiceArea} • Created {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {urgency && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
                        Urgency: {urgency}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-4">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Open matters</p>
              <p className="text-3xl font-bold text-slate-900">{openFights}</p>
              <p className="text-xs text-slate-600">Open or in-progress files for Lai & Turner.</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">New in last 7 days</p>
              <p className="text-3xl font-bold text-slate-900">{ticketsLast7Days}</p>
              <p className="text-xs text-slate-600">Intake volume this week.</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">New in last 30 days</p>
              <p className="text-3xl font-bold text-slate-900">{ticketsLast30Days}</p>
              <p className="text-xs text-slate-600">Rolling monthly intake across all practice areas.</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Structured intakes (30d)</p>
              <p className="text-3xl font-bold text-slate-900">{intakeCount30}</p>
              <p className="text-xs text-slate-600">Tickets with AI intake payload in the last 30 days.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Practice areas</p>
                <h3 className="text-xl font-bold text-slate-900">Ticket distribution (last 30 days)</h3>
              </div>
              {companyLoading && (
                <span className="text-xs font-semibold text-slate-500">Loading Lai & Turner metrics…</span>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.keys(practiceBreakdown30).length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 md:col-span-2">
                  No tickets yet for Lai & Turner. Intake data will populate this view once cases start.
                </div>
              ) : (
                Object.entries(practiceBreakdown30).map(([area, count]) => (
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

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Tickets</p>
                <h3 className="text-xl font-bold text-slate-900">Review, reply, schedule, or delete matters for Lai & Turner.</h3>
                <p className="text-sm text-slate-700">Latest 20 tickets with intake context.</p>
              </div>
              {ticketActionLoading && (
                <span className="text-xs font-semibold text-slate-500">Working…</span>
              )}
            </div>
            {ticketActionMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {ticketActionMessage}
              </div>
            )}
            {ticketActionError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {ticketActionError}
              </div>
            )}
            {recentTickets.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                No tickets yet. New intakes will appear here for quick actions.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTickets.map(({ ticket, practiceArea, intake, urgency }) => {
                  const clientName = getDisplayNameFromIntake(intake);
                  return (
                    <div key={ticket.id} className="grid gap-2 py-4 md:grid-cols-12 md:items-center">
                      <div className="md:col-span-5">
                        <p className="text-sm font-semibold text-slate-900">{ticket.title}</p>
                        <p className="text-xs text-slate-600">
                          {practiceArea} • Created {new Date(ticket.created_at).toLocaleString()}
                        </p>
                        {clientName && <p className="text-xs text-slate-500">Client: {clientName}</p>}
                      </div>
                      <div className="md:col-span-3 flex flex-wrap items-center gap-2 text-xs text-slate-700">
                        <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-800">Status: {ticket.status}</span>
                        {urgency && (
                          <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-800">Urgency: {urgency}</span>
                        )}
                      </div>
                      <div className="md:col-span-4 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => handleViewTicket(ticket.id)}>
                          View / Reply
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleScheduleAppointment(ticket)}>
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteTicket(ticket)}
                          isLoading={ticketActionLoading === ticket.id}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {scheduleTarget && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Schedule appointment</p>
                    <h4 className="text-sm font-bold text-slate-900">{scheduleTarget.title}</h4>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setScheduleTarget(null)}>
                    Cancel
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    label="Date"
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, time: e.target.value }))}
                  />
                  <Input
                    label="Location or method"
                    placeholder="Zoom, phone, office..."
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={submitSchedule}
                    isLoading={ticketActionLoading === scheduleTarget.id}
                    disabled={ticketActionLoading === scheduleTarget.id}
                  >
                    Send proposal
                  </Button>
                  <p className="text-xs text-slate-600">Client will see this in their secure thread.</p>
                </div>
              </div>
            )}
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
                <Button className="mt-4 text-xs" variant="secondary" onClick={() => setSelectedPracticeArea(area)}>
                  View {area} tickets
                </Button>
              </div>
            ))}
          </section>

          {selectedPracticeArea && (
            <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Practice area focus</p>
                  <h3 className="text-xl font-bold text-slate-900">{selectedPracticeArea} – recent tickets</h3>
                  <p className="text-sm text-slate-700">
                    Manager view of recent files in this practice area. Use it to review caseload, urgency, and intake quality.
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setSelectedPracticeArea(null)}>
                  Clear focus
                </Button>
              </div>
              {focusTickets.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                  No tickets found for this practice area yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {focusTickets.map(({ ticket, practiceArea, urgency }) => (
                    <div key={ticket.id} className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{ticket.title}</p>
                        <p className="text-xs text-slate-600">
                          {practiceArea} • Created {new Date(ticket.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {urgency && (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
                            Urgency: {urgency}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">Status: {ticket.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Firm promise in action</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Transparent pricing</p>
                <p className="mt-2 text-sm text-slate-700">Flat-fee visibility per practice area and quota tracking without any payment links.</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Human communication</p>
                <p className="mt-2 text-sm text-slate-700">Message templates stay in plain English so clients never feel like case numbers.</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Relentless advocacy</p>
                <p className="mt-2 text-sm text-slate-700">Workflows assume every file goes to trial, keeping discovery, deadlines, and prep visible.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Invite your team</h3>
              <p className="text-sm text-slate-700">Add agents or client accounts directly into the Lai & Turner workspace.</p>
              <div className="mt-4">
                <ManagerInviteUserCard companyId={user.company_id} />
              </div>
            </div>
            {user.company_id && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Plan limits</h3>
                <p className="text-sm text-slate-700">Monitor ticket and agent limits for this firm.</p>
                <div className="mt-4">
                  <PlanLimits companyId={user.company_id} />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
  );
};

export default LaiTurnerManagerDashboardPage;

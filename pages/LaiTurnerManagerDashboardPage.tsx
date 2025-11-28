import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const { user, tickets, getAllUsers, deleteTicket } = useApp();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string | null>(null);
  const [ticketActionMessage, setTicketActionMessage] = useState<string | null>(null);
  const [ticketActionError, setTicketActionError] = useState<string | null>(null);
  const [ticketActionLoading, setTicketActionLoading] = useState<string | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<Ticket | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    datetime: "",
    notes: "",
  });
  const [appointmentsByTicket, setAppointmentsByTicket] = useState<Record<string, any[]>>({});
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
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
      if (ticket.company_id && ticket.company_id === user.company_id) {
        return true;
      }

      const ticketOwner = allUsers.find((u) => u.id === ticket.user_id);
      if (ticketOwner?.company_id && ticketOwner.company_id === user.company_id) {
        return true;
      }

      return false;
    });
  }, [tickets, allUsers, user]);

  const laiTicketsWithIntake = useMemo(
    () =>
      laiTickets.map((ticket) => {
        const intake = findLatestLaiTurnerIntake(ticket);
        const practiceArea = getPracticeAreaDisplay(intake, ticket.category || undefined) || ticket.category || "Other";
        const urgency = getUrgencyDisplay(intake);
        const details = (ticket as any).metadata || {};
        const tasks = Array.isArray(details.tasks) ? details.tasks : [];
        const openTasksCount = tasks.filter((task: any) => !task?.done).length;
        const caseStage: string | undefined = details.case_stage;
        return { ticket, intake, practiceArea, urgency, openTasksCount, caseStage };
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
    if (user?.role !== "manager") return;
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
      datetime: "",
      notes: "",
    });
    setTicketActionError(null);
    setTicketActionMessage(null);
  };

  const submitSchedule = async () => {
    if (!scheduleTarget || !user) return;
    if (!scheduleForm.datetime) {
      setTicketActionError("Please choose a date and time for the appointment.");
      return;
    }

    const startsAt = new Date(scheduleForm.datetime);
    if (Number.isNaN(startsAt.getTime())) {
      setTicketActionError("Invalid date or time provided.");
      return;
    }

    setTicketActionLoading(scheduleTarget.id);
    setTicketActionError(null);
    setTicketActionMessage(null);
    try {
      const appointmentPayload = {
        ticket_id: scheduleTarget.id,
        company_id: user.company_id,
        created_by: user.id,
        proposed_by: "manager",
        status: "confirmed",
        starts_at: startsAt.toISOString(),
        ends_at: startsAt.toISOString(),
        notes: scheduleForm.notes || null,
      };

      const { data, error } = await supabase
        .from("appointment_details")
        .insert([appointmentPayload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setAppointmentsByTicket((prev) => {
        const next = { ...prev };
        const existing = next[scheduleTarget.id] || [];
        next[scheduleTarget.id] = [data, ...existing].sort(
          (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
        );
        return next;
      });

      setTicketActionMessage("Appointment scheduled successfully.");
      setScheduleTarget(null);
      setScheduleForm({ datetime: "", notes: "" });
    } catch (err) {
      console.error("Schedule appointment error", err);
      setTicketActionError("Unable to schedule this appointment right now.");
    } finally {
      setTicketActionLoading(null);
    }
  };

  const loadAppointments = useCallback(async () => {
    if (!user) return;
    const ids = recentTickets.map(({ ticket }) => ticket.id);
    if (ids.length === 0) {
      setAppointmentsByTicket({});
      return;
    }
    setAppointmentsLoading(true);
    const { data, error } = await supabase
      .from("appointment_details")
      .select("*")
      .in("ticket_id", ids)
      .order("starts_at", { ascending: false });

    if (error) {
      console.error("Error loading Lai & Turner appointments", error);
      setAppointmentsLoading(false);
      return;
    }

    const grouped = (data || []).reduce<Record<string, any[]>>((acc, appt) => {
      if (!acc[appt.ticket_id]) acc[appt.ticket_id] = [];
      acc[appt.ticket_id].push(appt);
      return acc;
    }, {});

    Object.keys(grouped).forEach((key) => {
      grouped[key] = grouped[key].sort(
        (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
      );
    });

    setAppointmentsByTicket(grouped);
    setAppointmentsLoading(false);
  }, [recentTickets, user]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const updateAppointmentStatus = async (appointmentId: string, ticketId: string, status: string) => {
    setTicketActionLoading(ticketId);
    setTicketActionError(null);
    setTicketActionMessage(null);
    const { data, error } = await supabase
      .from("appointment_details")
      .update({ status })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating appointment status", error);
      setTicketActionError("Unable to update appointment status.");
      setTicketActionLoading(null);
      return;
    }

    setAppointmentsByTicket((prev) => {
      const next = { ...prev };
      const updated = (next[ticketId] || []).map((appt) => (appt.id === appointmentId ? data : appt));
      next[ticketId] = updated.sort(
        (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
      );
      return next;
    });
    setTicketActionMessage("Appointment updated.");
    setTicketActionLoading(null);
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Dossiers Lai &amp; Turner</p>
                <h3 className="text-xl font-bold text-slate-900">Files overview</h3>
                <p className="text-sm text-slate-700">Review stage, urgency and tasks before diving into the file.</p>
              </div>
              {(ticketActionLoading || appointmentsLoading) && (
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
              <div className="space-y-3">
                {recentTickets.map(({ ticket, practiceArea, intake, urgency, openTasksCount, caseStage }) => {
                  const clientName = getDisplayNameFromIntake(intake);
                  const latestAppointment = (appointmentsByTicket[ticket.id] || [])[0];
                  const remainingLabel = openTasksCount > 0 ? `${openTasksCount} tâches à traiter` : 'Checklist à jour';
                  return (
                    <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">{ticket.title}</p>
                          <p className="text-xs text-slate-600">
                            {practiceArea} • {new Date(ticket.created_at).toLocaleString()}
                          </p>
                          {clientName && <p className="text-xs text-slate-500">Client: {clientName}</p>}
                          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-800">Status: {ticket.status}</span>
                            {urgency && <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Urgence: {urgency}</span>}
                            {caseStage && (
                              <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-800">Étape: {caseStage}</span>
                            )}
                            <span className={`rounded-full px-2 py-1 ${openTasksCount > 0 ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {remainingLabel}
                            </span>
                          </div>
                          {latestAppointment && (
                            <p className="text-xs text-slate-600">Prochain RDV: {new Date(latestAppointment.starts_at).toLocaleString()} ({latestAppointment.status})</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => handleViewTicket(ticket.id)}>
                            View / Reply
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleScheduleAppointment(ticket)}>
                            Planifier un RDV
                          </Button>
                          {user?.role === "manager" && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteTicket(ticket)}
                              isLoading={ticketActionLoading === ticket.id}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          {scheduleTarget && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4">
              <div className="w-full max-w-lg rounded-2xl border border-indigo-100 bg-white p-6 shadow-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Planifier un rendez-vous</p>
                    <p className="text-xs text-slate-600">Envoyé au client et aux équipes internes.</p>
                  </div>
                  <button className="text-xs text-slate-500 underline" onClick={() => setScheduleTarget(null)}>
                    Fermer
                  </button>
                </div>
                <div className="grid gap-3">
                  <Input
                    label="Date & time"
                    type="datetime-local"
                    value={scheduleForm.datetime}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, datetime: e.target.value }))}
                  />
                  <Input
                    label="Notes"
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
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
            </div>
          )}

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

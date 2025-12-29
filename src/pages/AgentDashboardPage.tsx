# AgentDashboardPage.tsx (Complètement à jour)

Voici le fichier **complet et corrigé** à copier intégralement dans `src/pages/AgentDashboardPage.tsx`:

import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "../../App";
import { Ticket, TicketPriority, TicketStatus } from "../../types";
import { Button } from "../../components/FormElements";
import { useLanguage } from "../../contexts/LanguageContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import FloatingActionButton from "../../components/FloatingActionButton";
import { supabase } from "../../services/supabaseClient";

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

// ✅ FONCTION CORRIGÉE: Récupérer le résumé du ticket
const getAssignedSummary = (ticket: Ticket): string | null => {
  // 1. Chercher dans metadata.assignedsummary
  const metadataSummary = (ticket as any)?.metadata?.assignedsummary;
  if (metadataSummary && typeof metadataSummary === "string" && metadataSummary.trim()) {
    return metadataSummary;
  }

  // 2. Chercher dans details.assignedsummary (fallback)
  const detailsSummary = (ticket as any)?.details?.assignedsummary;
  if (detailsSummary && typeof detailsSummary === "string" && detailsSummary.trim()) {
    return detailsSummary;
  }

  // 3. Chercher dans chat_history (message system_summary)
  if (ticket.chat_history && Array.isArray(ticket.chat_history)) {
    const systemMessage = ticket.chat_history.find(
      (m) => m.sender === "system_summary"
    );
    if (systemMessage && systemMessage.text) {
      return systemMessage.text;
    }
  }

  return null;
};

// ✅ Type guard pour validation
const isValidTicket = (ticket: any): ticket is Ticket => {
  return ticket && ticket.id && ticket.title;
};

interface AgentTicketRowProps {
  ticket: Ticket;
  onTakeCharge?: (ticketId: string) => void;
  isUnassigned?: boolean;
}

const AgentTicketRow: React.FC<AgentTicketRowProps> = ({ ticket, onTakeCharge, isUnassigned }) => {
  const { t, getBCP47Locale } = useLanguage();
  const { getAllUsers } = useApp();

  // ✅ Validation du ticket
  if (!isValidTicket(ticket)) {
    return (
      <tr>
        <td colSpan={7} className="p-3 text-center text-slate-500">
          Ticket invalide
        </td>
      </tr>
    );
  }

  // ✅ STATE: Gestion de l'affichage du résumé
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const summary = getAssignedSummary(ticket);

  const clientUser = getAllUsers().find((u) => u.id === ticket.user_id);
  const clientName = clientUser ? clientUser.full_name : t("agentDashboard.notApplicableShort");

  const handleAssignToSelf = () => {
    if (onTakeCharge) {
      onTakeCharge(ticket.id);
    }
  };

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      {/* Colonne: Titre */}
      <td className="p-2 sm:p-3 text-slate-700">
        <Link
          to={`/ticket/${ticket.id}`}
          className="text-primary hover:underline font-medium block"
        >
          {ticket.title}
        </Link>
      </td>

      {/* Colonne: Client */}
      <td className="p-3 text-sm text-slate-600">{clientName}</td>

      {/* ✅ COLONNE: RÉSUMÉ */}
      <td className="p-2 sm:p-3 text-slate-700 max-w-xs">
        {summary ? (
          <div>
            <button
              type="button"
              onClick={() => setIsSummaryOpen((v) => !v)}
              className="text-xs text-indigo-600 hover:underline font-medium whitespace-nowrap"
            >
              {isSummaryOpen ? "↑ Masquer" : "↓ Voir résumé"}
            </button>

            {isSummaryOpen && (
              <div className="mt-2 p-3 text-xs bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {summary}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">-</span>
        )}
      </td>

      {/* Colonnes: Workstation, Date, Status, Action */}
      <td className="p-3 text-sm text-slate-600">
        {ticket.workstation_id || t("agentDashboard.notApplicableShort")}
      </td>
      <td className="p-3 text-sm text-slate-500">
        {new Date(ticket.created_at).toLocaleDateString(getBCP47Locale())}
      </td>
      <td className="p-3 text-sm text-slate-500">{t(`ticketStatus.${ticket.status}`)}</td>
      <td className="p-3 text-sm">
        {isUnassigned && onTakeCharge ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAssignToSelf}
            className="!text-xs !py-1 !px-2"
          >
            {t("agentDashboard.takeChargeButton")}
          </Button>
        ) : (
          <Link to={`/ticket/${ticket.id}`}>
            <Button variant="outline" size="sm" className="!text-xs !py-1 !px-2">
              {t("agentDashboard.viewTicketButton")}
            </Button>
          </Link>
        )}
      </td>
    </tr>
  );
};

const AgentDashboardPage: React.FC = () => {
  const { tickets, user, agentTakeTicket, isLoading } = useApp();
  const { t } = useLanguage();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user?.company_id) {
      setCompanyName(null);
      return () => {
        cancelled = true;
      };
    }

    const loadCompany = async () => {
      setCompanyLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select("name")
        .eq("id", user.company_id)
        .single();

      if (!cancelled) {
        setCompanyName(!error ? data?.name ?? null : null);
        setCompanyLoading(false);
      }
    };

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, [user?.company_id]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const unassignedTickets = useMemo(
    () =>
      tickets
        .filter((ticket) => !ticket.assigned_agent_id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [tickets]
  );

  const myTickets = useMemo(
    () =>
      tickets
        .filter((ticket) => ticket.assigned_agent_id === user.id)
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ),
    [tickets, user.id]
  );

  const assignedCount = myTickets.length;
  const openCount = myTickets.filter(
    (ticket) =>
      ticket.status === TicketStatus.OPEN ||
      ticket.status === TicketStatus.IN_PROGRESS
  ).length;
  const highPriorityCount = myTickets.filter(
    (ticket) => ticket.priority === TicketPriority.HIGH
  ).length;
  const resolvedCount = myTickets.filter(
    (ticket) => ticket.status === TicketStatus.RESOLVED
  ).length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              {t("dashboard.agent.badge")}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              {t("dashboard.agent.title")}
            </h1>
            <p className="text-base text-slate-600">
              {t("dashboard.agent.subtitle")}
            </p>
            {user.company_id && (
              <p className="text-sm text-slate-500">
                {companyLoading
                  ? t("dashboard.company.loading", { default: "Chargement…" })
                  : companyName ??
                    t("dashboard.company.unknown", { default: "Société" })}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/help">
              <Button variant="primary" size="md" className="shadow-md">
                <PlusIcon className="w-5 h-5 me-2" />
                {t("agentDashboard.createTicketButton")}
              </Button>
            </Link>
          </div>
        </div>

        {isLoading && (
          <LoadingSpinner text={t("agentDashboard.loadingTickets")} />
        )}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {t("dashboard.agent.stats.assigned")}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {assignedCount}
            </p>
            <p className="text-xs text-slate-600">
              {t("dashboard.agent.stats.assignedHelp")}
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {t("dashboard.agent.stats.open")}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{openCount}</p>
            <p className="text-xs text-slate-600">
              {t("dashboard.agent.stats.openHelp")}
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {t("dashboard.agent.stats.priority")}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {highPriorityCount}
            </p>
            <p className="text-xs text-slate-600">
              {t("dashboard.agent.stats.priorityHelp")}
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {t("dashboard.agent.stats.resolved")}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {resolvedCount}
            </p>
            <p className="text-xs text-slate-600">
              {t("dashboard.agent.stats.resolvedHelp")}
            </p>
          </div>
        </section>

        {/* MY TICKETS SECTION */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {t("dashboard.agent.myTickets.title")}
              </h2>
              <p className="text-sm text-slate-600">
                {t("dashboard.agent.myTickets.subtitle")}
              </p>
            </div>
          </div>
          {myTickets.length === 0 ? (
            <p className="text-slate-500">
              {t("agentDashboard.noMyTickets")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.title")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.client")}
                    </th>
                    {/* ✅ NOUVELLE COLONNE: RÉSUMÉ */}
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.summary", {
                        default: "Résumé",
                      })}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.workstation")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.lastUpdated")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.status")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {myTickets.map((ticket) => (
                    <AgentTicketRow key={ticket.id} ticket={ticket} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* UNASSIGNED TICKETS SECTION */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {t("dashboard.agent.unassigned.title")}
              </h2>
              <p className="text-sm text-slate-600">
                {t("dashboard.agent.unassigned.subtitle")}
              </p>
            </div>
          </div>
          {unassignedTickets.length === 0 ? (
            <p className="text-slate-500">
              {t("agentDashboard.noUnassignedTickets")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.title")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.client")}
                    </th>
                    {/* ✅ NOUVELLE COLONNE: RÉSUMÉ */}
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.summary", {
                        default: "Résumé",
                      })}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.workstation")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.created")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.status")}
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("agentDashboard.tableHeader.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {unassignedTickets.map((ticket) => (
                    <AgentTicketRow
                      key={ticket.id}
                      ticket={ticket}
                      onTakeCharge={agentTakeTicket}
                      isUnassigned
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            {t("dashboard.agent.tools.title")}
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            {t("dashboard.agent.tools.subtitle")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to="/help"
              className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800 hover:border-indigo-200"
            >
              {t("dashboard.agent.tools.newTicket")}
            </Link>
            <Link
              to="/help"
              className="rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-200"
            >
              {t("dashboard.agent.tools.knowledge")}
            </Link>
            <Link
              to="/manager/faq"
              className="rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-200"
            >
              {t("dashboard.agent.tools.faq")}
            </Link>
          </div>
        </section>

        <FloatingActionButton
          to="/help"
          title={t("agentDashboard.createTicketButton")}
        />
      </div>
    </div>
  );
};

export default AgentDashboardPage;

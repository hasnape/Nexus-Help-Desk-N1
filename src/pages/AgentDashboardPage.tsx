import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "@/App";
import { Ticket } from "@/types";
import { Button } from "@/components/FormElements";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import FloatingActionButton from "@/components/FloatingActionButton";
import { supabase } from "@/services/supabaseClient";

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

interface AgentTicketRowProps {
  ticket: Ticket;
  onTakeCharge?: (ticketId: string) => void;
  isUnassigned?: boolean;
}

const AgentTicketRow: React.FC<AgentTicketRowProps> = ({ ticket, onTakeCharge, isUnassigned }) => {
  const { t, getBCP47Locale } = useLanguage();
  const { getAllUsers } = useApp();

  const clientUser = getAllUsers().find((u) => u.id === ticket.user_id);
  const clientName = clientUser ? clientUser.full_name : t("agentDashboard.notApplicableShort");

  const handleAssignToSelf = () => {
    if (onTakeCharge) {
      onTakeCharge(ticket.id);
    }
  };

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td className="p-3 text-sm text-slate-700 truncate max-w-xs" title={ticket.title}>
        <Link to={`/ticket/${ticket.id}`} className="text-primary hover:underline font-medium">
          {ticket.title}
        </Link>
      </td>
      <td className="p-3 text-sm text-slate-600">{clientName}</td>
      <td className="p-3 text-sm text-slate-600">{ticket.workstation_id || t("agentDashboard.notApplicableShort")}</td>
      <td className="p-3 text-sm text-slate-500">{new Date(ticket.created_at).toLocaleDateString(getBCP47Locale())}</td>
      <td className="p-3 text-sm text-slate-500">{t(`ticketStatus.${ticket.status}`)}</td>
      <td className="p-3 text-sm">
        {isUnassigned && onTakeCharge ? (
          <Button variant="primary" size="sm" onClick={handleAssignToSelf} className="!text-xs !py-1 !px-2">
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
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [tickets]
  );

  const myTickets = useMemo(
    () =>
      tickets
        .filter((ticket) => ticket.assigned_agent_id === user.id)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [tickets, user.id]
  );

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-textPrimary">
            {t("agentDashboard.title", { username: user.full_name })}
          </h1>
          {user.company_id && (
            <p className="text-lg text-slate-500 font-medium">
              {companyLoading
                ? t("dashboard.company.loading", { default: "Chargement…" })
                : companyName ?? t("dashboard.company.unknown", { default: "Société" })}
            </p>
          )}
          <p className="text-sm text-slate-600 mt-1">{t("agentDashboard.subtitle")}</p>
        </div>
        <div className="flex-shrink-0">
          <Link to="/help">
            <Button variant="primary" size="md">
              <PlusIcon className="w-5 h-5 me-2" />
              {t("agentDashboard.createTicketButton")}
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && <LoadingSpinner text={t("agentDashboard.loadingTickets")} />}

      <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">{t("agentDashboard.unassignedTicketsTitle")}</h2>
        {unassignedTickets.length === 0 ? (
          <p className="text-slate-500">{t("agentDashboard.noUnassignedTickets")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("agentDashboard.tableHeader.title")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("agentDashboard.tableHeader.client")}
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
                  <AgentTicketRow key={ticket.id} ticket={ticket} onTakeCharge={agentTakeTicket} isUnassigned />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">{t("agentDashboard.myTicketsTitle")}</h2>
        {myTickets.length === 0 ? (
          <p className="text-slate-500">{t("agentDashboard.noMyTickets")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("agentDashboard.tableHeader.title")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("agentDashboard.tableHeader.client")}
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

      <FloatingActionButton to="/help" title={t("agentDashboard.createTicketButton")} />
    </div>
  );
};

export default AgentDashboardPage;


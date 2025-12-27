import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../App";
import { Ticket, TicketStatus } from "../../types";
import { Button } from "../../components/FormElements";
import { useLanguage } from "../../contexts/LanguageContext";
import FloatingActionButton from "../../components/FloatingActionButton";
import { supabase } from "../../services/supabaseClient";

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.061 1.06l-3.329-3.328A7 7 0 012 9z"
      clipRule="evenodd"
    />
  </svg>
);

// ✅ FONCTION: Récupérer le résumé assigné du ticket
const getAssignedSummary = (ticket: Ticket): string | null => {
  const metadataSummary = (ticket as any)?.metadata?.assigned_summary;
  if (metadataSummary) return metadataSummary;

  const systemMessage = ticket.chat_history?.find(
    (m) => m.sender === 'system_summary'
  );

  return systemMessage?.text || null;
};

interface ClientTicketRowProps {
  ticket: Ticket;
}

const ClientTicketRow: React.FC<ClientTicketRowProps> = ({ ticket }) => {
  const { t, getBCP47Locale } = useLanguage();

  // ✅ STATE: Gestion de l'affichage du résumé
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const summary = getAssignedSummary(ticket);

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td className="p-2 sm:p-3 text-slate-700">
        <Link
          to={`/ticket/${ticket.id}`}
          className="text-primary hover:underline font-medium block"
        >
          {ticket.title}
        </Link>

        {/* ✅ AFFICHAGE: Résumé assigné avec bouton toggle */}
        {summary && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setIsSummaryOpen(v => !v)}
              className="text-xs text-indigo-600 hover:underline"
            >
              {isSummaryOpen ? 'Masquer le résumé' : 'Voir le résumé'}
            </button>

            {isSummaryOpen && (
              <div className="mt-2 p-3 text-xs bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 whitespace-pre-wrap">
                {summary}
              </div>
            )}
          </div>
        )}
      </td>
      <td className="p-3 text-sm text-slate-600">{ticket.workstation_id || t("agentDashboard.notApplicableShort")}</td>
      <td className="p-3 text-sm text-slate-500">{new Date(ticket.created_at).toLocaleDateString(getBCP47Locale())}</td>
      <td className="p-3 text-sm text-slate-500">{t(`ticketStatus.${ticket.status}`)}</td>
      <td className="p-3 text-sm">
        <Link to={`/ticket/${ticket.id}`}>
          <Button variant="outline" size="sm" className="!text-xs !py-1 !px-2">
            {t("agentDashboard.viewTicketButton")}
          </Button>
        </Link>
      </td>
    </tr>
  );
};

const ClientDashboardPage: React.FC = () => {
  const { tickets, user } = useApp();
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

  const sortedTickets = useMemo(() => {
    if (!user) return [];
    return tickets
      .filter((ticket) => ticket.user_id === user.id)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [tickets, user]);

  const totalTickets = sortedTickets.length;
  const openTickets = sortedTickets.filter((ticket) => ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS).length;
  const resolvedTickets = sortedTickets.filter((ticket) => ticket.status === TicketStatus.RESOLVED).length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">{t("dashboard.user.badge")}</p>
              <h1 className="text-3xl font-bold text-slate-900">{t("dashboard.user.title", { username: user?.full_name || "User" })}</h1>
              <p className="text-base text-slate-600">{t("dashboard.user.subtitle")}</p>
              {user?.company_id && (
                <p className="text-sm text-slate-500">
                  {companyLoading
                    ? t("dashboard.company.loading", { default: "Chargement…" })
                    : companyName ?? t("dashboard.company.unknown", { default: "Société" })}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link to="/help">
                <Button variant="primary" size="md" className="w-full sm:w-auto shadow-md">
                  <PlusIcon className="w-5 h-5 me-2" />
                  {t("dashboard.createNewTicketButton")}
                </Button>
              </Link>
              <Link
                to="/help"
                state={{
                  initialMessage: t("helpChat.prefilled.materialInvestigation", {
                    default: "I'd like to start an investigation on a piece of equipment.",
                  }),
                }}
              >
                <Button variant="secondary" size="md" className="w-full sm:w-auto">
                  <MagnifyingGlassIcon className="w-5 h-5 me-2" />
                  {t("dashboard.requestMaterialInvestigationButton")}
                </Button>
              </Link>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("dashboard.user.stats.total")}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totalTickets}</p>
              <p className="text-xs text-slate-600">{t("dashboard.user.stats.totalHelp")}</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("dashboard.user.stats.open")}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{openTickets}</p>
              <p className="text-xs text-slate-600">{t("dashboard.user.stats.openHelp")}</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("dashboard.user.stats.resolved")}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{resolvedTickets}</p>
              <p className="text-xs text-slate-600">{t("dashboard.user.stats.resolvedHelp")}</p>
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t("dashboard.user.recent.title")}</h2>
                <p className="text-sm text-slate-600">{t("dashboard.user.recent.subtitle")}</p>
              </div>
            </div>
            {sortedTickets.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-lg text-slate-700">{t("dashboard.noTicketsTitle")}</p>
                <p className="text-sm text-slate-500">{t("dashboard.noTicketsSubtitle")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {t("agentDashboard.tableHeader.title")}
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
                    {sortedTickets.map((ticket) => (
                      <ClientTicketRow key={ticket.id} ticket={ticket} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t("dashboard.user.cta.title")}</h2>
                <p className="text-sm text-slate-600">{t("dashboard.user.cta.subtitle")}</p>
              </div>
              <Link to="/help">
                <Button variant="primary" size="md">
                  <PlusIcon className="w-5 h-5 me-2" />
                  {t("dashboard.user.cta.button")}
                </Button>
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link to="/help" className="rounded-xl border bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800 hover:border-indigo-200">
                {t("dashboard.user.cta.tips")}
              </Link>
              <Link to="/help" className="rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-200">
                {t("dashboard.user.cta.knowledge")}
              </Link>
              <Link to="/manager/faq" className="rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-200">
                {t("dashboard.user.cta.faq")}
              </Link>
            </div>
        </section>

        <FloatingActionButton to="/help" title={t("dashboard.createNewTicketButton")} />
      </div>
    </div>
  );
};

export default ClientDashboardPage;

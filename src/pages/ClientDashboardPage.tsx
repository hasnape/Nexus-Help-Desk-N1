import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import TicketCard from "../../components/TicketCard";
import { Button } from "../../components/FormElements";
import { useLanguage } from "@/contexts/LanguageContext";
import FloatingActionButton from "../../components/FloatingActionButton";
import { supabase } from "@/services/supabaseClient";

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

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-textPrimary">
              {t("dashboard.welcomeMessage", { username: user?.full_name || "User" })}
            </h1>
            {user?.company_id && (
              <p className="text-lg text-slate-500 font-medium">
                {companyLoading
                  ? t("dashboard.company.loading", { default: "Chargement…" })
                  : companyName ?? t("dashboard.company.unknown", { default: "Société" })}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link to="/help">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
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

        <p className="text-sm text-slate-600 mt-1">{t("dashboard.headerSubtitle")}</p>
      </div>

      {sortedTickets.length === 0 ? (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 mx-auto text-slate-400 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
          <p className="text-xl text-textSecondary">{t("dashboard.noTicketsTitle")}</p>
          <p className="text-sm text-slate-500 mt-1">{t("dashboard.noTicketsSubtitle")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      <FloatingActionButton to="/help" title={t("dashboard.createNewTicketButton")} />
    </div>
  );
};

export default ClientDashboardPage;


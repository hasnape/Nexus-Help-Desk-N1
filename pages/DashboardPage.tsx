import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useApp } from "../App";
import TicketCard from "../components/TicketCard";
import { Button } from "../components/FormElements";
import FloatingActionButton from "../components/FloatingActionButton";
import { usePlanLimits } from "../hooks/usePlanLimits";
import PlanLimitAlert from "../components/PlanLimitAlert";
import LoadingSpinner from "../components/LoadingSpinner";

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
      clipRule="evenodd"
    />
  </svg>
);

const DashboardPage: React.FC = () => {
  const { tickets, user } = useApp();
  const { t } = useTranslation(["dashboard", "common"]);
  const { checkTicketCreation } = usePlanLimits();

  const myTickets = user ? tickets.filter((t) => t.user_id === user.id) : [];
  const sortedTickets = [...myTickets].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const ticketCreationCheck = checkTicketCreation();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="space-y-8">
        <div className="pb-4 border-b border-slate-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-textPrimary">
                {t("user.welcomeMessage", {
                  username: user?.full_name || "User",
                })}
              </h1>
              {user?.company_id && (
                <p className="text-lg text-slate-500 font-medium">
                  {user.company_id}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link to="/help">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  disabled={!ticketCreationCheck.allowed}
                  title={
                    !ticketCreationCheck.allowed
                      ? ticketCreationCheck.warningMessage
                      : undefined
                  }
                >
                  <PlusIcon className="w-5 h-5 me-2" />
                  {t("user.createNewTicketButton")}
                </Button>
              </Link>
              <Link
                to="/help"
                state={{
                  initialMessage: t("prefilled.materialInvestigation", {
                    ns: "helpChat",
                    default:
                      "J'aimerais commencer une enquête sur un équipement.",
                  }),
                }}
              >
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                  disabled={!ticketCreationCheck.allowed}
                  title={
                    !ticketCreationCheck.allowed
                      ? ticketCreationCheck.warningMessage
                      : undefined
                  }
                >
                  <MagnifyingGlassIcon className="w-5 h-5 me-2" />
                  {t("user.investigateEquipmentButton")}
                </Button>
              </Link>
            </div>
          </div>

          {!ticketCreationCheck.allowed && (
            <PlanLimitAlert
              message={ticketCreationCheck.warningMessage}
              type="warning"
            />
          )}
        </div>

        <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">
            {t("user.myTicketsTitle")}
          </h2>

          {sortedTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-lg mb-2">
                {t("user.noTicketsMessage")}
              </p>
              <p className="text-slate-400">{t("user.noTicketsSubtitle")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  showAssigneeInfo={false}
                  showClientInfo={false}
                />
              ))}
            </div>
          )}
        </section>

        <FloatingActionButton
          onClick={() => (window.location.href = "/help")}
          disabled={!ticketCreationCheck.allowed}
          tooltip={t("user.getAiHelpButton")}
        />
      </div>
    </Suspense>
  );
};

export default DashboardPage;

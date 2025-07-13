import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "../App";
import { Ticket } from "../types";
import { Button } from "../components/FormElements";
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

const AgentTicketRow: React.FC<{
  ticket: Ticket;
  onTakeCharge?: (ticketId: string) => void;
  isUnassigned?: boolean;
}> = ({ ticket, onTakeCharge, isUnassigned }) => {
  const { getAllUsers } = useApp();

  const clientUser = getAllUsers().find((u) => u.id === ticket.user_id);
  const clientName = clientUser ? clientUser.full_name : "Non applicable";

  const handleAssignToSelf = () => {
    if (onTakeCharge) {
      onTakeCharge(ticket.id);
    }
  };

  // Traduction statique française pour le statut
  const statusLabels: Record<string, string> = {
    open: "Ouvert",
    in_progress: "En cours",
    resolved: "Résolu",
    closed: "Fermé",
  };

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td
        className="p-3 text-sm text-slate-700 truncate max-w-xs"
        title={ticket.title}
      >
        <Link
          to={`/ticket/${ticket.id}`}
          className="text-primary hover:underline font-medium"
        >
          {ticket.title}
        </Link>
      </td>
      <td className="p-3 text-sm text-slate-600">{clientName}</td>
      <td className="p-3 text-sm text-slate-600">
        {ticket.workstation_id || "Non applicable"}
      </td>
      <td className="p-3 text-sm text-slate-500">
        {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
      </td>
      <td className="p-3 text-sm text-slate-500">
        {statusLabels[ticket.status] || ticket.status}
      </td>
      <td className="p-3 text-sm">
        {isUnassigned && onTakeCharge && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAssignToSelf}
            className="!text-xs !py-1 !px-2"
          >
            Prendre en charge
          </Button>
        )}
        {!isUnassigned && (
          <Link to={`/ticket/${ticket.id}`}>
            <Button
              variant="secondary"
              size="sm"
              className="!text-xs !py-1 !px-2"
            >
              Voir le ticket
            </Button>
          </Link>
        )}
      </td>
    </tr>
  );
};

const AgentDashboardPage: React.FC = () => {
  const { tickets, user, agentTakeTicket, isLoading } = useApp();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const unassignedTickets = tickets
    .filter((ticket) => !ticket.assigned_agent_id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const myTickets = tickets
    .filter((ticket) => ticket.assigned_agent_id === user.id)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-textPrimary">
            Espace agent : {user.full_name}
          </h1>
          {user.company_id && (
            <p className="text-lg text-slate-500 font-medium">
              {user.company_id}
            </p>
          )}
          <p className="text-sm text-slate-600 mt-1">
            Liste des tickets à traiter et tickets assignés.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link to="/help">
            <Button variant="primary" size="md">
              <PlusIcon className="w-5 h-5 me-2" />
              Nouveau ticket
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && <LoadingSpinner text="Chargement des tickets..." />}

      <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">
          Tickets non assignés
        </h2>
        {unassignedTickets.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            Aucun ticket non assigné.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Titre
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Client
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Poste
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Créé le
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Statut
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {unassignedTickets.map((ticket) => (
                  <AgentTicketRow
                    key={ticket.id}
                    ticket={ticket}
                    onTakeCharge={agentTakeTicket}
                    isUnassigned={true}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">
          Mes tickets assignés
        </h2>
        {myTickets.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            Aucun ticket assigné.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Titre
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Client
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Poste
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Créé le
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Statut
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {myTickets.map((ticket) => (
                  <AgentTicketRow
                    key={ticket.id}
                    ticket={ticket}
                    isUnassigned={false}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AgentDashboardPage;

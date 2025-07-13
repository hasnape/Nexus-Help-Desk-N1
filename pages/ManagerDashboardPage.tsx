import React, { useState, useMemo, Suspense } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "../App";
import { UserRole } from "../types";
import { Button, Select, Input } from "../components/FormElements";
import LoadingSpinner from "../components/LoadingSpinner";
import FloatingActionButton from "../components/FloatingActionButton";
import PlanUsageWidget from "../components/PlanUsageWidget";

// Icons
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

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.576l.84-10.518.149.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
      clipRule="evenodd"
    />
  </svg>
);

interface StatCardProps {
  title: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-md ${color}`}></div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">
            {title}
          </dt>
          <dd className="text-lg font-medium text-gray-900">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
);

const ManagerDashboardPage: React.FC = () => {
  const {
    tickets,
    user,
    company,
    isLoading,
    assignTicket,
    getAllUsers,
    getAgents,
    deleteTicket,
    updateUserRole,
    deleteUserById,
    updateCompanyName,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  // const [assigneeFilter, setAssigneeFilter] = useState<string>("all"); // supprimé car non utilisé
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "ticket" | "user";
    id: string;
  } | null>(null);
  const [newCompanyName, setNewCompanyName] = useState(company?.name || "");

  if (!user || user.role !== UserRole.MANAGER) {
    return <Navigate to="/login" />;
  }

  const allUsers = getAllUsers();
  const agents = getAgents();

  // Statistics
  const stats = useMemo(() => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status === "open").length;
    const resolvedTickets = tickets.filter(
      (t) => t.status === "resolved"
    ).length;
    const priorityTickets = tickets.filter(
      (t) => t.priority === "high" || t.priority === "urgent"
    ).length;
    const unassignedTickets = tickets.filter(
      (t) => !t.assigned_agent_id
    ).length;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      priorityTickets,
      unassignedTickets,
    };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesSearch =
        searchTerm === "" ||
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.detailed_description &&
          ticket.detailed_description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, searchTerm]);

  const handleAssignTicket = async (
    ticketId: string,
    agentId: string | null
  ) => {
    await assignTicket(ticketId, agentId);
    setShowAssignModal(null);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    await deleteTicket(ticketId);
    setShowDeleteConfirm(null);
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUserById(userId);
    setShowDeleteConfirm(null);
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole);
  };

  const handleUpdateCompanyName = async () => {
    if (newCompanyName.trim() && newCompanyName !== company?.name) {
      const success = await updateCompanyName(newCompanyName.trim());
      if (!success) {
        setNewCompanyName(company?.name || "");
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Chargement..." />;
  }

  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-slate-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-textPrimary">
                Tableau de bord manager : {user.full_name}
              </h1>
              {company && (
                <p className="text-lg text-slate-500 font-medium">
                  {company.name}
                </p>
              )}
              <p className="text-sm text-slate-600 mt-1">
                Gestion des tickets et des utilisateurs
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
        </div>

        {/* Company Info */}
        <section className="bg-surface shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">
            Informations sur l'entreprise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise
              </label>
              <div className="flex">
                <Input
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleUpdateCompanyName}
                  variant="secondary"
                  size="sm"
                  className="ml-2"
                  disabled={
                    !newCompanyName.trim() || newCompanyName === company?.name
                  }
                >
                  Mettre à jour
                </Button>
              </div>
            </div>
            <div className="flex items-center">
              <PlanUsageWidget />
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section>
          <h2 className="text-xl font-semibold text-textPrimary mb-4">
            Statistiques
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Tickets totaux"
              value={stats.totalTickets}
              color="bg-blue-500"
            />
            <StatCard
              title="Tickets ouverts"
              value={stats.openTickets}
              color="bg-yellow-500"
            />
            <StatCard
              title="Tickets résolus"
              value={stats.resolvedTickets}
              color="bg-green-500"
            />
            <StatCard
              title="Tickets prioritaires"
              value={stats.priorityTickets}
              color="bg-red-500"
            />
            <StatCard
              title="Tickets non assignés"
              value={stats.unassignedTickets}
              color="bg-gray-500"
            />
          </div>
        </section>

        {/* Ticket Management */}
        <section className="bg-surface shadow-lg rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-textPrimary mb-4 sm:mb-0">
              Gestion des tickets
            </h2>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "Tous" },
                  { value: "open", label: "Ouvert" },
                  { value: "inProgress", label: "En cours" },
                  { value: "resolved", label: "Résolu" },
                  { value: "closed", label: "Fermé" },
                ]}
              />
            </div>
          </div>

          {/* Tickets Table */}
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
                    Assigné à
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Créé le
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Priorité
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
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Aucun ticket trouvé
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const client = allUsers.find(
                      (u) => u.id === ticket.user_id
                    );
                    const assignee = ticket.assigned_agent_id
                      ? allUsers.find((u) => u.id === ticket.assigned_agent_id)
                      : null;

                    // Harmonisation de la casse pour priority et status
                    const priority = (ticket.priority || "").toLowerCase();
                    const status = (ticket.status || "").toLowerCase();

                    return (
                      <tr
                        key={ticket.id}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-3 text-sm text-slate-700">
                          <Link
                            to={`/ticket/${ticket.id}`}
                            className="text-primary hover:underline"
                          >
                            {ticket.title}
                          </Link>
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {client?.full_name || "Non assigné"}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {assignee?.full_name || "Non assigné"}
                        </td>
                        <td className="p-3 text-sm text-slate-500">
                          {new Date(ticket.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </td>
                        <td className="p-3 text-sm text-slate-500">
                          {priority === "high"
                            ? "Haute"
                            : priority === "urgent"
                            ? "Urgente"
                            : priority === "medium"
                            ? "Moyenne"
                            : priority === "low"
                            ? "Basse"
                            : ticket.priority}
                        </td>
                        <td className="p-3 text-sm text-slate-500">
                          {status === "open"
                            ? "Ouvert"
                            : status === "inprogress"
                            ? "En cours"
                            : status === "resolved"
                            ? "Résolu"
                            : status === "closed"
                            ? "Fermé"
                            : ticket.status}
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setShowAssignModal(ticket.id)}
                            >
                              Assigner
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setShowDeleteConfirm({
                                  type: "ticket",
                                  id: ticket.id,
                                })
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* User Management */}
        <section className="bg-surface shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">
            Gestion des utilisateurs
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Nom
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Email
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Rôle
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Inscrit le
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  allUsers.map((currentUser) => (
                    <tr
                      key={currentUser.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-3 text-sm text-slate-700">
                        {currentUser.full_name}
                        {currentUser.id === user.id && (
                          <span className="ml-2 text-xs text-blue-600">
                            (Vous)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {currentUser.email}
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {currentUser.role === UserRole.MANAGER
                          ? "Manager"
                          : currentUser.role === UserRole.AGENT
                          ? "Agent"
                          : currentUser.role === UserRole.USER
                          ? "Utilisateur"
                          : currentUser.role}
                      </td>
                      <td className="p-3 text-sm text-slate-500">
                        {/* La propriété 'created_at' n'existe pas sur User, afficher '-' */}
                        {"-"}
                      </td>
                      <td className="p-3 text-sm">
                        {currentUser.id !== user.id && (
                          <div className="flex space-x-2">
                            {currentUser.role !== UserRole.AGENT && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  handleUpdateUserRole(
                                    currentUser.id,
                                    UserRole.AGENT
                                  )
                                }
                              >
                                Promouvoir agent
                              </Button>
                            )}
                            {currentUser.role === UserRole.AGENT && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  handleUpdateUserRole(
                                    currentUser.id,
                                    UserRole.USER
                                  )
                                }
                              >
                                Rétrograder utilisateur
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                setShowDeleteConfirm({
                                  type: "user",
                                  id: currentUser.id,
                                })
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={() => (window.location.href = "/help")}
          tooltip="Nouveau ticket"
        />

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Assigner un agent</h3>
              <div className="space-y-4">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleAssignTicket(showAssignModal, null)}
                >
                  Non assigné
                </Button>
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="secondary"
                    className="w-full"
                    onClick={() =>
                      handleAssignTicket(showAssignModal, agent.id)
                    }
                  >
                    {agent.full_name}
                  </Button>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowAssignModal(null)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {showDeleteConfirm.type === "ticket"
                  ? "Supprimer le ticket"
                  : "Supprimer l'utilisateur"}
              </h3>
              <p className="text-gray-600 mb-6">
                {showDeleteConfirm.type === "ticket"
                  ? "Êtes-vous sûr de vouloir supprimer ce ticket ?"
                  : "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"}
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (showDeleteConfirm.type === "ticket") {
                      handleDeleteTicket(showDeleteConfirm.id);
                    } else {
                      handleDeleteUser(showDeleteConfirm.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default ManagerDashboardPage;

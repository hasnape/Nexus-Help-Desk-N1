import React, { useState, useMemo, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "../App";
import {
  Ticket,
  User,
  UserRole,
  TicketPriority,
  Locale,
  TicketStatus,
} from "../types";
import { Button, Select, Input } from "../components/FormElements";
import { useLanguage } from "../contexts/LanguageContext";
import LoadingSpinner from "../components/LoadingSpinner";
import FloatingActionButton from "../components/FloatingActionButton";
import { supabase } from "../services/supabaseClient";
import PlanUsageWidget from "../components/PlanUsageWidget";

// --- ICONS ---
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

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);

const StatCardIcon: React.FC<{
  icon: "total" | "open" | "resolved" | "priority" | "unassigned";
}> = ({ icon }) => {
  const icons = {
    total: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m9.75 9.75h4.875c.621 0 1.125-.504 1.125-1.125v-9.75c0-.621-.504-1.125-1.125-1.125h-3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
      />
    ),
    open: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    resolved: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    priority: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
      />
    ),
    unassigned: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
      />
    ),
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      {icons[icon]}
    </svg>
  );
};

const ClipboardDocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a1.125 1.125 0 011.125 1.125v3.375c0 .621.504 1.125 1.125 1.125h9.75a1.125 1.125 0 001.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H13.5A2.25 2.25 0 0111.25 6V3.75A2.25 2.25 0 0113.5 1.5h2.25a2.25 2.25 0 012.25 2.25v15A2.25 2.25 0 0115.75 21.75h-9.75a2.25 2.25 0 01-2.25-2.25V7.875a2.25 2.25 0 012.25-2.25H6.75"
    />
  </svg>
);

const UserManagementRow: React.FC<{
  userToManage: User;
  onUpdateRole: (id: string, role: UserRole) => void;
  onDelete: (id: string) => void;
}> = ({ userToManage, onUpdateRole, onDelete }) => {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<UserRole>(userToManage.role);

  const roleOptions = [
    { value: UserRole.USER, label: t("userRole.user") },
    { value: UserRole.AGENT, label: t("userRole.agent") },
  ];

  useEffect(() => {
    setSelectedRole(userToManage.role);
  }, [userToManage.role]);

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td className="p-3 text-sm text-slate-700">
        <div className="font-medium text-slate-800">
          {userToManage.full_name}
        </div>
        <div className="text-xs text-slate-500">{userToManage.email}</div>
      </td>
      <td className="p-3 text-sm text-slate-600">
        {userToManage.language_preference.toUpperCase()}
      </td>
      <td className="p-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Select
            options={roleOptions}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="py-1 min-w-[100px]"
          />
          <Button
            size="sm"
            onClick={() => onUpdateRole(userToManage.id, selectedRole)}
            disabled={selectedRole === userToManage.role}
            className="!text-xs !py-1 !px-2"
          >
            {t("managerDashboard.updateRoleButton")}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(userToManage.id)}
            className="!text-xs !py-1 !px-2"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const ManagerTicketRow: React.FC<{
  ticket: Ticket;
  agents: User[];
  onAssign: (ticketId: string, agentId: string | null) => void;
  onDelete: (ticketId: string) => void;
}> = ({ ticket, agents, onAssign, onDelete }) => {
  const { t, getBCP47Locale } = useLanguage();
  const { getAllUsers } = useApp();

  const clientUser = getAllUsers().find((u) => u.id === ticket.user_id);
  const clientName = clientUser
    ? clientUser.full_name
    : t("managerDashboard.notApplicableShort");
  const [selectedAgent, setSelectedAgent] = useState<string>(
    ticket.assigned_agent_id || "unassigned"
  );

  const agentOptions = [
    { value: "unassigned", label: t("managerDashboard.unassigned") },
    ...agents.map((agent) => ({ value: agent.id, label: agent.full_name })),
  ];

  const handleAssign = () => {
    onAssign(ticket.id, selectedAgent === "unassigned" ? null : selectedAgent);
  };

  const handleDelete = () => {
    if (window.confirm(t("managerDashboard.deleteTicketConfirm"))) {
      onDelete(ticket.id);
    }
  };

  const priorityClasses: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: "text-green-700 bg-green-100",
    [TicketPriority.MEDIUM]: "text-yellow-700 bg-yellow-100",
    [TicketPriority.HIGH]: "text-red-700 bg-red-100",
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
      <td className="p-3 text-sm text-slate-500">
        {t(`ticketStatus.${ticket.status}`)}
      </td>
      <td className="p-3 text-sm">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            priorityClasses[ticket.priority]
          }`}
        >
          {t(`ticketPriority.${ticket.priority}`)}
        </span>
      </td>
      <td className="p-3 text-sm text-slate-500">
        {new Date(ticket.created_at).toLocaleDateString(getBCP47Locale())}
      </td>
      <td className="p-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Select
            options={agentOptions}
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="py-1 min-w-[120px]"
          />
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={
              selectedAgent === (ticket.assigned_agent_id || "unassigned")
            }
            className="!text-xs !py-1 !px-2"
          >
            {ticket.assigned_agent_id
              ? t("managerDashboard.reassignButton")
              : t("managerDashboard.assignButton")}
          </Button>
        </div>
      </td>
      <td className="p-3 text-sm">
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          className="!p-1.5"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
};

const ManagerDashboardPage: React.FC = () => {
  const {
    tickets,
    user,
    company,
    assignTicket,
    getAgents,
    getAllUsers,
    deleteTicket,
    isLoading,
    updateUserRole,
    deleteUserById,
    newlyCreatedCompanyName,
    setNewlyCreatedCompanyName,
    updateCompanyName,
  } = useApp();
  const { t, getBCP47Locale } = useLanguage();

  // State for filtering
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const allCompanyUsers = getAllUsers();

  // State for company name editing
  const [companyNameInput, setCompanyNameInput] = useState(company?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (newlyCreatedCompanyName) {
      setShowWelcomeModal(true);
    }
  }, [newlyCreatedCompanyName]);

  useEffect(() => {
    if (company) {
      setCompanyNameInput(company.name);
    }
  }, [company]);

  const handleSaveCompanyName = async () => {
    if (!companyNameInput.trim() || companyNameInput.trim() === company?.name)
      return;
    setIsUpdatingName(true);
    const success = await updateCompanyName(companyNameInput.trim());
    if (success) {
      setIsEditingName(false);
    } else {
      // Revert input to original name on failure
      setCompanyNameInput(company?.name || "");
    }
    setIsUpdatingName(false);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setCompanyNameInput(company?.name || "");
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleUpdateUserRole = async (userId: string, role: UserRole) => {
    const result = await updateUserRole(userId, role);
    if (typeof result === "string") {
      // error message was returned
      alert(result);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm(t("managerDashboard.deleteUserConfirm"))) {
      deleteUserById(userId);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(
        (ticket) => statusFilter === "all" || ticket.status === statusFilter
      )
      .filter((ticket) => userFilter === "all" || ticket.user_id === userFilter)
      .filter((ticket) => {
        if (!startDateFilter) return true;
        return new Date(ticket.created_at) >= new Date(startDateFilter);
      })
      .filter((ticket) => {
        if (!endDateFilter) return true;
        const endDate = new Date(endDateFilter);
        endDate.setHours(23, 59, 59, 999); // Include the whole day
        return new Date(ticket.created_at) <= endDate;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [tickets, statusFilter, userFilter, startDateFilter, endDateFilter]);

  const stats = useMemo(() => {
    const source = filteredTickets;
    return {
      total: source.length,
      open: source.filter(
        (t) =>
          t.status === TicketStatus.OPEN ||
          t.status === TicketStatus.IN_PROGRESS
      ).length,
      resolved: source.filter((t) => t.status === TicketStatus.RESOLVED).length,
      highPriority: source.filter((t) => t.priority === TicketPriority.HIGH)
        .length,
      unassigned: source.filter((t) => !t.assigned_agent_id).length,
    };
  }, [filteredTickets]);

  if (!user) return <Navigate to="/login" />;

  const agents = getAgents();
  const statusOptions = [
    { value: "all", label: t("managerDashboard.filters.all") },
    ...Object.values(TicketStatus).map((s) => ({
      value: s,
      label: t(`ticketStatus.${s}`),
    })),
  ];
  const userOptions = [
    { value: "all", label: t("managerDashboard.filters.all") },
    ...allCompanyUsers.map((u) => ({ value: u.id, label: u.full_name })),
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">
              {t("managerDashboard.welcomeModal.title")}
            </h2>
            <p className="text-lg font-semibold text-slate-700">
              {t("managerDashboard.welcomeModal.congratulations", {
                username: user.full_name,
              })}
            </p>
            <p className="text-slate-600 mt-4">
              {t("managerDashboard.welcomeModal.body")}
            </p>
            <div className="mt-6 p-3 bg-slate-100 border border-slate-300 rounded-md flex items-center justify-between">
              <span className="font-mono text-slate-800">{company?.name}</span>
              <Button
                size="sm"
                onClick={() => handleCopyToClipboard(company?.name || "")}
              >
                {copied
                  ? t("managerDashboard.welcomeModal.copiedButton")
                  : t("managerDashboard.welcomeModal.copyButton")}
              </Button>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-6"
              onClick={() => {
                setShowWelcomeModal(false);
                setNewlyCreatedCompanyName(null); // Clear the trigger
              }}
            >
              {t("managerDashboard.welcomeModal.closeButton")}
            </Button>
          </div>
        </div>
      )}

      <div className="pb-4 border-b border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-textPrimary">
            {t("managerDashboard.title", { username: user.full_name })}
          </h1>
          {user.company_id && (
            <p className="text-lg text-slate-500 font-medium">
              {user.company_id}
            </p>
          )}
          <p className="text-sm text-slate-600 mt-1">
            {t("managerDashboard.subtitle")}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link to="/help">
            <Button variant="primary" size="md">
              <PlusIcon className="w-5 h-5 me-2" />
              {t("managerDashboard.createNewTicketButton")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Widget d'utilisation du plan */}
      <PlanUsageWidget className="max-w-md" />

      {isLoading && (
        <LoadingSpinner text={t("managerDashboard.loadingTickets")} />
      )}

      {/* Stats Section */}
      <section>
        <h2 className="text-xl font-semibold text-textPrimary mb-3">
          {t("managerDashboard.stats.title")}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {t("managerDashboard.stats.description")}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-surface shadow rounded-lg p-4 flex items-center">
            <StatCardIcon icon="total" />
            <div className="ms-3">
              <p className="text-sm font-medium text-slate-500">
                {t("managerDashboard.stats.totalTickets")}
              </p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-surface shadow rounded-lg p-4 flex items-center">
            <StatCardIcon icon="open" />
            <div className="ms-3">
              <p className="text-sm font-medium text-slate-500">
                {t("managerDashboard.stats.openTickets")}
              </p>
              <p className="text-2xl font-bold text-slate-800">{stats.open}</p>
            </div>
          </div>
          <div className="bg-surface shadow rounded-lg p-4 flex items-center">
            <StatCardIcon icon="resolved" />
            <div className="ms-3">
              <p className="text-sm font-medium text-slate-500">
                {t("managerDashboard.stats.resolvedTickets")}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {stats.resolved}
              </p>
            </div>
          </div>
          <div className="bg-surface shadow rounded-lg p-4 flex items-center">
            <StatCardIcon icon="priority" />
            <div className="ms-3">
              <p className="text-sm font-medium text-slate-500">
                {t("managerDashboard.stats.highPriority")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.highPriority}
              </p>
            </div>
          </div>
          <div className="bg-surface shadow rounded-lg p-4 flex items-center">
            <StatCardIcon icon="unassigned" />
            <div className="ms-3">
              <p className="text-sm font-medium text-slate-500">
                {t("managerDashboard.stats.unassigned")}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {stats.unassigned}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-textPrimary mb-4">
          {t("managerDashboard.filters.title")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            label={t("managerDashboard.filters.statusLabel")}
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Select
            label={t("managerDashboard.filters.userLabel")}
            options={userOptions}
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
          <Input
            label={t("managerDashboard.filters.dateStartLabel")}
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
          />
          <Input
            label={t("managerDashboard.filters.dateEndLabel")}
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setStatusFilter("all");
                setUserFilter("all");
                setStartDateFilter("");
                setEndDateFilter("");
              }}
              className="w-full"
            >
              {t("managerDashboard.filters.resetButton")}
            </Button>
          </div>
        </div>
      </section>

      {/* Tickets Table */}
      <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">
          {statusFilter === "all" &&
          userFilter === "all" &&
          !startDateFilter &&
          !endDateFilter
            ? t("managerDashboard.allTicketsTitle")
            : t("managerDashboard.filteredTicketsTitle")}
        </h2>
        {filteredTickets.length === 0 ? (
          <p className="text-slate-500">
            {statusFilter === "all" &&
            userFilter === "all" &&
            !startDateFilter &&
            !endDateFilter
              ? t("managerDashboard.noTicketsSystem")
              : t("managerDashboard.noTicketsFiltered")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.tableHeader.title")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.tableHeader.client")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.tableHeader.status")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.tableHeader.priority")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.tableHeader.created")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.tableHeader.assignedAgent")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.tableHeader.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTickets.map((ticket) => (
                  <ManagerTicketRow
                    key={ticket.id}
                    ticket={ticket}
                    agents={agents}
                    onAssign={assignTicket}
                    onDelete={deleteTicket}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* User Management Section */}
        <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">
            {t("managerDashboard.userManagementTitle")}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.userTableHeader.username")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.userTableHeader.language")}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t("managerDashboard.userTableHeader.roleActions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {allCompanyUsers
                  .filter((u) => u.id !== user.id)
                  .map((userToManage) => (
                    <UserManagementRow
                      key={userToManage.id}
                      userToManage={userToManage}
                      onUpdateRole={handleUpdateUserRole}
                      onDelete={handleDeleteUser}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Company Info Section */}
        <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">
            {t("managerDashboard.companyInfo.title", {
              default: "Company Information",
            })}
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {t("managerDashboard.companyInfo.nameLabel")}
              </label>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <>
                    <Input
                      id="companyName"
                      value={companyNameInput}
                      onChange={(e) => setCompanyNameInput(e.target.value)}
                      className="max-w-xs"
                      disabled={isUpdatingName}
                    />
                    <Button
                      onClick={handleSaveCompanyName}
                      size="sm"
                      disabled={
                        isUpdatingName ||
                        !companyNameInput.trim() ||
                        companyNameInput.trim() === company?.name
                      }
                    >
                      {isUpdatingName ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        t("managerDashboard.companyInfo.saveButton")
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelEditName}
                      size="sm"
                      variant="secondary"
                      className="!bg-slate-200 !text-slate-700 hover:!bg-slate-300"
                      disabled={isUpdatingName}
                    >
                      {t("managerDashboard.companyInfo.cancelButton")}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium text-slate-800 bg-slate-100 px-3 py-1.5 rounded-md flex-grow">
                      {company?.name}
                    </p>
                    <Button
                      onClick={() => setIsEditingName(true)}
                      size="sm"
                      variant="secondary"
                    >
                      <PencilIcon className="w-4 h-4 me-1" />
                      {t("managerDashboard.companyInfo.editButton")}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">
                {t("managerDashboard.companyInfo.onboardingInstructions")}
              </p>
              <div className="mt-2 p-3 bg-slate-100 border border-slate-300 rounded-md flex items-center justify-between">
                <span className="font-mono text-slate-800">
                  {company?.name}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleCopyToClipboard(company?.name || "")}
                  variant="secondary"
                >
                  {copied
                    ? t("managerDashboard.companyInfo.copiedButton")
                    : t("managerDashboard.companyInfo.copyNameButton")}
                  <ClipboardDocumentIcon className="w-4 h-4 ms-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <FloatingActionButton
        to="/help"
        title={t("managerDashboard.createNewTicketButton")}
      />
    </div>
  );
};

export default ManagerDashboardPage;

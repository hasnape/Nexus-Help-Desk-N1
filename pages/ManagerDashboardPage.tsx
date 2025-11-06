import ManagerInviteUserCard from '@/components/ManagerInviteUserCard';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useApp } from '../App';
import { Ticket, User, UserRole, TicketPriority, Locale, TicketStatus } from '../types';
import { Button, Select, Input } from '../components/FormElements';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FloatingActionButton from '../components/FloatingActionButton';
import { formatQuota } from '@/utils/formatQuota';
import { supabase } from '@/services/supabaseClient';


const isAbortFetchError = (error: unknown): boolean => {
  if (!error) return false;
  if (typeof error === 'string') {
    return error.toLowerCase().includes('abort');
  }

  const anyError = error as { name?: unknown; message?: unknown };
  if (typeof anyError.name === 'string' && anyError.name.toLowerCase() === 'aborterror') {
    return true;
  }
  if (typeof anyError.message === 'string' && anyError.message.toLowerCase().includes('abort')) {
    return true;
  }
  return false;
};

// --- ICONS ---
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.576l.84-10.518.149.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);


const StatCardIcon: React.FC<{ icon: 'total' | 'open' | 'resolved' | 'priority' | 'unassigned' }> = ({ icon }) => {
    const icons = {
        total: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m9.75 9.75h4.875c.621 0 1.125-.504 1.125-1.125v-9.75c0-.621-.504-1.125-1.125-1.125h-3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />,
        open: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
        resolved: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        priority: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />,
        unassigned: <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    };
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">{icons[icon]}</svg>;
};

const ClipboardDocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const PartyPopperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 1 3.09-3.09L12 5.25l2.846.813a4.5 4.5 0 0 1 3.09 3.09L21.75 12l-2.846.813a4.5 4.5 0 0 1-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.452-2.452L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.452-2.452L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.452 2.452L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.452 2.452ZM6.75 8.25 7.5 6l.75 2.25a2.25 2.25 0 0 0 1.5 1.5L12 10.5l-2.25.75a2.25 2.25 0 0 0-1.5 1.5L7.5 15l-.75-2.25a2.25 2.25 0 0 0-1.5-1.5L3 10.5l2.25-.75a2.25 2.25 0 0 0 1.5-1.5Z" />
    </svg>
);

const DEFAULT_TIME_ZONE = 'Europe/Paris';

type QuotaSeverity = 'normal' | 'near' | 'blocked' | 'none';

interface QuotaMetadata {
    limit: number | null;
    isUnlimited: boolean;
    planKey: string | null;
    rawPlanLabel: string | null;
    timezone: string | null;
    used: number | null;
}

const normalizePlanKey = (plan: string | null | undefined): string | null => {
    if (!plan) {
        return null;
    }
    const normalized = plan.trim().toLowerCase();
    if (normalized.includes('unlimit') || normalized.includes('illimit') || normalized.includes('enterprise')) {
        return 'unlimited';
    }
    if (normalized.includes('pro')) {
        return 'pro';
    }
    if (normalized.includes('standard') || normalized.includes('team')) {
        return 'standard';
    }
    if (normalized.includes('free') || normalized.includes('freemium') || normalized.includes('trial') || normalized.includes('sandbox')) {
        return 'freemium';
    }
    return normalized || null;
};

const getDatePartsInTimeZone = (date: Date, timeZone: string) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const lookup = (type: Intl.DateTimeFormatPartTypes): number => {
        const found = parts.find((part) => part.type === type);
        return found ? Number(found.value) : 0;
    };
    return {
        year: lookup('year'),
        month: lookup('month'),
        day: lookup('day'),
    };
};

const isDateInCurrentMonth = (date: Date, timeZone: string): boolean => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return false;
    }
    const nowParts = getDatePartsInTimeZone(new Date(), timeZone);
    const dateParts = getDatePartsInTimeZone(date, timeZone);
    return nowParts.year === dateParts.year && nowParts.month === dateParts.month;
};


// --- SUB-COMPONENTS ---
const StatCard: React.FC<{ title: string; value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-surface p-4 rounded-lg shadow-md flex items-center">
    <div className="bg-primary/10 text-primary p-3 rounded-full me-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const priorityColors: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: 'text-green-600',
  [TicketPriority.MEDIUM]: 'text-yellow-600',
  [TicketPriority.HIGH]: 'text-red-600',
};

interface QuotaState {
    loading: boolean;
    error: boolean;
    limit: number | null;
    isUnlimited: boolean;
    planKey: string | null;
    rawPlanLabel: string | null;
    timezone: string;
}

interface ManagerTicketRowProps {
    ticket: Ticket;
    agents: User[];
    allUsers: User[];
    onAssignTicket: (ticketId: string, agentId: string | null) => void;
    onDeleteTicket: (ticketId: string) => void;
}

const ManagerTicketRow: React.FC<ManagerTicketRowProps> = ({ ticket, agents, allUsers, onAssignTicket, onDeleteTicket }) => {
    const { t } = useLanguage();
    const [selectedAgent, setSelectedAgent] = useState<string>(ticket.assigned_agent_id || '');

    const clientUser = allUsers.find(u => u.id === ticket.user_id);
    const clientName = clientUser ? clientUser.full_name : t('managerDashboard.notApplicableShort');

    const agentOptions = agents.map(agent => ({
        value: agent.id,
        label: agent.full_name,
    }));

    const handleAssign = () => {
        onAssignTicket(ticket.id, selectedAgent || null); 
    };
    
    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50 text-sm">
            <td className="p-2 sm:p-3 text-slate-700 truncate max-w-[100px] sm:max-w-xs" title={ticket.title}>
                <Link to={`/ticket/${ticket.id}`} className="text-primary hover:underline font-medium">
                    {ticket.title}
                </Link>
            </td>
            <td className="p-2 sm:p-3 text-slate-600">{clientName}</td>
            <td className="p-2 sm:p-3 text-slate-500">{t(`ticketStatus.${ticket.status}`)}</td>
            <td className={`p-2 sm:p-3 font-medium ${priorityColors[ticket.priority]}`}>{t(`ticketPriority.${ticket.priority}`)}</td>
            <td className="p-2 sm:p-3">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {agents.length > 0 ? (
                        <>
                            <Select
                                value={selectedAgent}
                                onChange={(e) => setSelectedAgent(e.target.value)}
                                options={agentOptions}
                                placeholder={t('managerDashboard.selectAgentPlaceholder')}
                                className="!text-xs !py-1 !min-w-[100px] sm:!min-w-[120px]"
                            />
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={handleAssign} 
                                className="!text-xs !py-1 !px-2"
                                disabled={selectedAgent === (ticket.assigned_agent_id || '')} 
                            >
                                {ticket.assigned_agent_id && selectedAgent !== '' ? t('managerDashboard.reassignButton') : t('managerDashboard.assignButton')}
                            </Button>
                        </>
                    ) : (
                        <span className="text-xs text-slate-500 italic">{t('managerDashboard.noAgentsAvailable', { default: 'No agents available' })}</span>
                    )}
                </div>
            </td>
            <td className="p-2 sm:p-3">
                 <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => onDeleteTicket(ticket.id)} 
                    className="!text-xs !py-1 !px-2"
                    title={t('managerDashboard.deleteTicketButton')}
                 >
                    <TrashIcon className="w-4 h-4"/>
                </Button>
            </td>
        </tr>
    );
};

interface UserManagementRowProps {
    userToManage: User;
    currentUser: User;
    onUpdateRole: (userId: string, newRole: UserRole) => void;
    onDeleteUser: (userId: string) => void;
}

const UserManagementRow: React.FC<UserManagementRowProps> = ({ userToManage, currentUser, onUpdateRole, onDeleteUser }) => {
    const { t } = useLanguage();
    const [selectedRole, setSelectedRole] = useState<UserRole>(userToManage.role);
    const [isLoading, setIsLoading] = useState(false);

    const languageNames: Record<Locale, string> = {
        en: t('language.english'),
        fr: t('language.french'),
        ar: t('language.arabic'),
    };
    
    const roleOptions = [
        { value: UserRole.USER, label: t('userRole.user')},
        { value: UserRole.AGENT, label: t('userRole.agent')},
    ];

    const handleUpdateRole = async () => {
        setIsLoading(true);
        await onUpdateRole(userToManage.id, selectedRole);
        setIsLoading(false);
    };
    
    const handleDeleteUser = () => {
        const confirmation = window.confirm(t('managerDashboard.deleteUserConfirm'));
        if (confirmation) {
            onDeleteUser(userToManage.id);
        }
    }

    const isProtectedUser = userToManage.id === currentUser.id || userToManage.role === UserRole.MANAGER;

    return (
        <tr className="hover:bg-slate-50">
            <td className="p-3 font-medium text-slate-800">{userToManage.full_name} <span className="text-slate-500 text-xs">({userToManage.email})</span></td>
            <td className="p-3 text-slate-600">{languageNames[userToManage.language_preference || 'en']}</td>
            <td className="p-3">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {!isProtectedUser ? (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                options={roleOptions}
                                className="!text-xs !py-1 !min-w-[100px]"
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleUpdateRole}
                                isLoading={isLoading}
                                disabled={isLoading || selectedRole === userToManage.role}
                                className="!text-xs !py-1 !px-2"
                            >
                                {t('managerDashboard.updateRoleButton')}
                            </Button>
                        </div>
                    ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-800">
                        {t(`userRole.${userToManage.role}`)}
                    </span>
                    )}
                </div>
            </td>
            <td className="p-3">
                {!isProtectedUser && (
                     <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={handleDeleteUser} 
                        className="!text-xs !py-1 !px-2"
                        title={t('managerDashboard.deleteUserButton')}
                    >
                        <TrashIcon className="w-4 h-4"/>
                    </Button>
                )}
            </td>
        </tr>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const ManagerDashboardPage: React.FC = () => {
    const { 
        tickets, user, assignTicket, getAgents, getAllUsers, isLoading, deleteTicket, 
        updateUserRole, deleteUserById, newlyCreatedCompanyName, setNewlyCreatedCompanyName,
        updateCompanyName
    } = useApp();
    const { t, getBCP47Locale } = useLanguage();

    const [company, setCompany] = useState<{ id: string; name: string } | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [isUpdatingName, setIsUpdatingName] = useState(false);

    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [userFilter, setUserFilter] = useState<string>('All');
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [isCopied, setIsCopied] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [quotaState, setQuotaState] = useState<QuotaState>({
        loading: true,
        error: false,
        limit: null,
        isUnlimited: false,
        planKey: null,
        rawPlanLabel: null,
        timezone: DEFAULT_TIME_ZONE,
    });
    const [rpcUsed, setRpcUsed] = useState<number | null>(null);

    const localeTag = getBCP47Locale();

    const resolveCompanyQuota = useCallback(
        async (_companyId: string, signal: AbortSignal): Promise<QuotaMetadata> => {
            const { data, error } = await supabase.rpc('get_my_company_month_quota').abortSignal(signal);
            if (error) throw error;

            return {
                limit: data?.limit ?? null,
                isUnlimited: !!data?.unlimited,
                planKey: normalizePlanKey(data?.plan_name ?? null),
                rawPlanLabel: data?.plan_name ?? null,
                timezone: data?.timezone ?? DEFAULT_TIME_ZONE,
                used: data?.used ?? null,
            };
        },
        []
    );
    
    useEffect(() => {
        const controller = new AbortController();

        const fetchCompanyDetails = async () => {
            if (user?.role === UserRole.MANAGER && user.company_id) {
                try {
                    const { data: companies, error } = await supabase
                        .from('companies')
                        .select('id, name')
                        .eq('id', user.company_id)
                        .abortSignal(controller.signal)
                        .limit(1);

                    if (error) {
                        if (!isAbortFetchError(error)) {
                            console.error("Error fetching company details:", JSON.stringify(error, null, 2));
                        }
                    } else if (companies && companies.length > 0) {
                        const companyData = companies[0];
                        setCompany(companyData);
                        setNewCompanyName(companyData.name);
                    } else {
                        console.error(`Data integrity issue: No company found with id "${user.company_id}" for manager ${user.id}`);
                    }
                } catch (e: any) {
                    if (!isAbortFetchError(e)) {
                        console.error("Critical error fetching company details:", JSON.stringify(e, null, 2));
                    }
                }
            }
        };

        fetchCompanyDetails();
        
        return () => {
            controller.abort();
        };
    }, [user]);

    useEffect(() => {
        if (!user?.company_id || user.role !== UserRole.MANAGER) {
            setQuotaState({
                loading: false,
                error: false,
                limit: null,
                isUnlimited: false,
                planKey: null,
                rawPlanLabel: null,
                timezone: DEFAULT_TIME_ZONE,
            });
            setRpcUsed(null);
            return;
        }

        let isMounted = true;
        const controller = new AbortController();

        setQuotaState((previous) => ({
            ...previous,
            loading: true,
            error: false,
        }));
        setRpcUsed(null);

        resolveCompanyQuota(user.company_id, controller.signal)
            .then((metadata) => {
                if (!isMounted) {
                    return;
                }
                const timezone = metadata.timezone || DEFAULT_TIME_ZONE;
                if (metadata.limit === null && !metadata.isUnlimited) {
                    console.warn('[quota] Ticket limit not resolved for company', user.company_id, metadata.rawPlanLabel);
                }
                setRpcUsed(metadata.used ?? null);
                setQuotaState({
                    loading: false,
                    error: false,
                    limit: metadata.limit,
                    isUnlimited: metadata.isUnlimited,
                    planKey: metadata.planKey,
                    rawPlanLabel: metadata.rawPlanLabel,
                    timezone,
                });
            })
            .catch((error) => {
                if (!isMounted) {
                    return;
                }
                if (isAbortFetchError(error)) {
                    return;
                }
                console.error('[quota] Failed to load quota metadata', error);
                setRpcUsed(null);
                setQuotaState((previous) => ({
                    ...previous,
                    loading: false,
                    error: true,
                }));
            });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [resolveCompanyQuota, user]);

    useEffect(() => {
        if (newlyCreatedCompanyName) {
            setShowWelcomeModal(true);
            setTimeout(() => setIsModalVisible(true), 50); // For entry animation
        }
    }, [newlyCreatedCompanyName]);

    const handleCloseWelcomeModal = () => {
        setIsModalVisible(false); // Start exit animation
        setTimeout(() => {
            setShowWelcomeModal(false);
            setNewlyCreatedCompanyName(null);
        }, 300); // Wait for animation to finish
    };

    const allAgents = getAgents();
    const allUsers = getAllUsers();
    
    const handleCopyName = () => {
        if (company?.name) {
            navigator.clipboard.writeText(company.name);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }
    };
    
    const handleSaveCompanyName = async () => {
        if (!newCompanyName.trim() || !company) return;
        setIsUpdatingName(true);
        const success = await updateCompanyName(newCompanyName.trim());
        if (success) {
            setCompany({ ...company, name: newCompanyName.trim() });
            setIsEditingName(false);
        }
        setIsUpdatingName(false);
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            if (statusFilter !== 'All' && ticket.status !== statusFilter) return false;
            if (userFilter !== 'All' && ticket.user_id !== userFilter) return false;
            if (dateFilter.start) {
                const startDate = new Date(dateFilter.start);
                startDate.setHours(0, 0, 0, 0);
                if (new Date(ticket.created_at) < startDate) return false;
            }
            if (dateFilter.end) {
                const endDate = new Date(dateFilter.end);
                endDate.setHours(23, 59, 59, 999);
                if (new Date(ticket.created_at) > endDate) return false;
            }
            return true;
        }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }, [tickets, statusFilter, userFilter, dateFilter]);

    const stats = useMemo(() => {
        const data = filteredTickets;
        return {
            total: data.length,
            open: data.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS).length,
            resolved: data.filter(t => t.status === TicketStatus.RESOLVED).length,
            highPriority: data.filter(t => t.priority === TicketPriority.HIGH).length,
            unassigned: data.filter(t => !t.assigned_agent_id).length
        };
    }, [filteredTickets]);

    const ticketsUsedThisMonth = useMemo(() => {
        if (rpcUsed !== null) return rpcUsed;
        // fallback: if RPC returned nothing, keep old local computation
        const tz = quotaState.timezone || DEFAULT_TIME_ZONE;
        return tickets.reduce((count, ticketItem) => {
            const createdAt = ticketItem.created_at instanceof Date ? ticketItem.created_at : new Date(ticketItem.created_at);
            if (isDateInCurrentMonth(createdAt, tz)) {
                return count + 1;
            }
            return count;
        }, 0);
    }, [rpcUsed, quotaState.timezone, tickets]);

    const normalizedQuota = useMemo(
        () =>
            formatQuota(
                {
                    used: ticketsUsedThisMonth,
                    limit: quotaState.limit,
                    unlimited: quotaState.isUnlimited,
                    timezone: quotaState.timezone,
                },
                localeTag,
            ),
        [localeTag, quotaState.isUnlimited, quotaState.limit, quotaState.timezone, ticketsUsedThisMonth]
    );

    const quotaSeverity = useMemo<QuotaSeverity>(() => {
        if (normalizedQuota.unlimited || normalizedQuota.limit === null || normalizedQuota.percent === null) {
            return 'none';
        }
        if (normalizedQuota.percent >= 100) {
            return 'blocked';
        }
        if (normalizedQuota.percent >= 80) {
            return 'near';
        }
        return 'normal';
    }, [normalizedQuota]);

    const quotaStyles = useMemo(() => {
        switch (quotaSeverity) {
            case 'blocked':
                return {
                    container: 'bg-red-50 border-red-300',
                    message: 'text-red-700',
                };
            case 'near':
                return {
                    container: 'bg-amber-50 border-amber-300',
                    message: 'text-amber-700',
                };
            case 'normal':
                return {
                    container: 'bg-surface border-slate-200',
                    message: 'text-slate-600',
                };
            case 'none':
            default:
                return {
                    container: 'bg-surface border-slate-200',
                    message: 'text-slate-600',
                };
        }
    }, [quotaSeverity]);

    const quotaValueLabel = useMemo(() => {
        if (quotaState.loading) {
            return '…';
        }

        const percentChunk = normalizedQuota.percent !== null
            ? t('dashboard.quota.percentChunk', {
                default: ' ({{percent}}% utilisé)',
                values: { percent: normalizedQuota.percent },
                percent: normalizedQuota.percent,
            })
            : '';

        return t('dashboard.quota.remaining', {
            default: '{{remaining}} / {{limit}}{{percentChunk}}',
            values: {
                remaining: normalizedQuota.remainingLabel,
                limit: normalizedQuota.limitLabel,
                percentChunk,
            },
            remaining: normalizedQuota.remainingLabel,
            limit: normalizedQuota.limitLabel,
            percentChunk,
        });
    }, [normalizedQuota, quotaState.loading, t]);

    const quotaMessage = useMemo(() => {
        if (quotaState.loading || normalizedQuota.unlimited || normalizedQuota.limit === null) {
            return null;
        }
        if (quotaSeverity === 'near') {
            return t('dashboard.quota.near_limit');
        }
        if (quotaSeverity === 'blocked') {
            return t('dashboard.quota.blocked');
        }
        return null;
    }, [normalizedQuota.limit, normalizedQuota.unlimited, quotaSeverity, quotaState.loading, t]);

    const showUpgradeCta = quotaSeverity === 'blocked' && !normalizedQuota.unlimited;


    if (!user || user.role !== UserRole.MANAGER) {
        return <Navigate to="/login" />;
    }

    const handleDeleteTicket = (ticketId: string) => {
        const confirmation = window.confirm(t('managerDashboard.deleteTicketConfirm'));
        if (confirmation) {
            deleteTicket(ticketId);
        }
    };
    
    const handleResetFilters = () => {
        setStatusFilter('All');
        setUserFilter('All');
        setDateFilter({ start: '', end: '' });
    };

    const statusOptionsForFilter = [{ value: 'All', label: t('managerDashboard.filters.all', { default: "All"}) }, ...Object.values(TicketStatus).map(s => ({ value: s, label: t(`ticketStatus.${s}`) }))];
    const userOptionsForFilter = [{ value: 'All', label: t('managerDashboard.filters.all', { default: "All"}) }, ...allUsers.map(u => ({ value: u.id, label: u.full_name }))];
    const filtersAreActive = statusFilter !== 'All' || userFilter !== 'All' || dateFilter.start !== '' || dateFilter.end !== '';


    return (
        <div className="space-y-8">
            {showWelcomeModal && (
                <div className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isModalVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-lg w-full text-center transform transition-all duration-300 ${isModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                        <PartyPopperIcon className="w-16 h-16 mx-auto text-accent mb-4"/>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('managerDashboard.welcomeModal.title')}</h2>
                        <p className="text-slate-600 mb-4">{t('managerDashboard.welcomeModal.congratulations', { username: user.full_name })}</p>
                        <p className="text-slate-600 mb-6">{t('managerDashboard.welcomeModal.body')}</p>
                        
                        <div className="bg-slate-100 p-4 rounded-md mb-6 text-start">
                             <label className="text-sm font-semibold text-slate-700 block mb-1">{t('managerDashboard.companyInfo.nameLabel')}</label>
                             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <p className="text-lg font-mono bg-slate-200 text-slate-800 p-2 rounded select-all flex-grow text-center sm:text-start">
                                    {newlyCreatedCompanyName}
                                </p>
                            </div>
                        </div>

                        <Button variant="primary" size="lg" onClick={handleCloseWelcomeModal}>
                           {t('managerDashboard.welcomeModal.closeButton')}
                        </Button>
                    </div>
                </div>
            )}
            <div className="pb-4 border-b border-slate-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                     <div className="mb-4 sm:mb-0">
                        <h1 className="text-3xl font-bold text-textPrimary">
                            {t('managerDashboard.title', { username: user.full_name })}
                        </h1>
                         {user.company_id && (
                            <p className="text-lg text-slate-500 font-medium">{user.company_id}</p>
                        )}
                        <p className="text-sm text-slate-600 mt-1">{t('managerDashboard.subtitle')}</p>
                    </div>
                    <div className="flex-shrink-0 mt-4 sm:mt-0">
                        <Link to="/help">
                            <Button variant="primary" size="md">
                                <PlusIcon className="w-5 h-5 me-2"/>
                                {t('managerDashboard.createNewTicketButton')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {isLoading && <LoadingSpinner text={t('managerDashboard.loadingTickets')} />}

            <section
                className={`border shadow-lg rounded-lg p-4 sm:p-6 transition-colors ${quotaStyles.container}`}
                aria-live="polite"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                            {t('dashboard.quota.title')}
                        </p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{quotaValueLabel}</p>
                        {quotaMessage && (
                            <p className={`mt-2 text-sm ${quotaStyles.message}`}>{quotaMessage}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 sm:self-end">
                        {showUpgradeCta && (
                            <Link to="/pricing" className="flex-shrink-0">
                                <Button variant="primary" size="sm">
                                    {t('dashboard.quota.upgrade_cta')}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-textPrimary mb-4">{t('managerDashboard.companyInfo.title', {default: "Company Information"})}</h2>
                <div className="bg-slate-100 p-4 rounded-md space-y-4">
                    {company && (
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">{t('managerDashboard.companyInfo.nameLabel', {default: "Company Name"})}</label>
                            {!isEditingName ? (
                                <div className="flex items-center gap-4">
                                    <p className="text-lg text-slate-800 font-medium flex-grow">{company.name}</p>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditingName(true)}>
                                        <PencilIcon className="w-4 h-4 me-2"/>
                                        {t('managerDashboard.companyInfo.editButton', {default: "Edit Name"})}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Input 
                                        value={newCompanyName}
                                        onChange={e => setNewCompanyName(e.target.value)}
                                        className="flex-grow"
                                        disabled={isUpdatingName}
                                    />
                                    <Button variant="primary" size="sm" onClick={handleSaveCompanyName} isLoading={isUpdatingName} disabled={isUpdatingName}>
                                        {t('managerDashboard.companyInfo.saveButton', {default: "Save"})}
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => setIsEditingName(false)} disabled={isUpdatingName}>
                                         {t('managerDashboard.companyInfo.cancelButton', {default: "Cancel"})}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                         <div className="mt-4 bg-slate-200 p-3 rounded text-sm">
                            <p className="text-slate-600 mb-2">
                                {t('managerDashboard.companyInfo.onboardingInstructions')}
                            </p>
                            <div className="flex items-center gap-3">
                                <p className="text-base font-mono bg-slate-300 text-slate-800 p-2 rounded select-all flex-grow text-center">
                                    {company?.name || '...'}
                                </p>
                                 <Button
                                    variant="outline"
                                    size="md"
                                    onClick={handleCopyName}
                                    className={`!py-2 ${isCopied ? '!border-green-500 !text-green-600 hover:!bg-green-50' : ''}`}
                                    title={t('managerDashboard.companyInfo.copyNameButton')}
                                >
                                    {isCopied ? (
                                        <CheckIcon className="w-5 h-5" />
                                    ) : (
                                        <ClipboardDocumentIcon className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {user?.role === UserRole.MANAGER && user?.company_id && (
                <section className="mt-6">
                    <ManagerInviteUserCard companyId={user.company_id} />
                </section>
            )}

            <section>
                <h2 className="text-xl font-semibold text-textPrimary mb-2">{t('managerDashboard.stats.title')}</h2>
                <p className="text-sm text-slate-500 mb-4">{t('managerDashboard.stats.description')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard title={t('managerDashboard.stats.totalTickets')} value={stats.total} icon={<StatCardIcon icon="total"/>} />
                    <StatCard title={t('managerDashboard.stats.openTickets')} value={stats.open} icon={<StatCardIcon icon="open"/>} />
                    <StatCard title={t('managerDashboard.stats.resolvedTickets')} value={stats.resolved} icon={<StatCardIcon icon="resolved"/>} />
                    <StatCard title={t('managerDashboard.stats.highPriority')} value={stats.highPriority} icon={<StatCardIcon icon="priority"/>} />
                    <StatCard title={t('managerDashboard.stats.unassigned')} value={stats.unassigned} icon={<StatCardIcon icon="unassigned"/>} />
                </div>
            </section>
            
            <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
                 <h2 className="text-xl font-semibold text-textPrimary mb-4">{t('managerDashboard.filters.title')}</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                     <Select label={t('managerDashboard.filters.statusLabel')} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptionsForFilter} />
                     <Select label={t('managerDashboard.filters.userLabel')} value={userFilter} onChange={e => setUserFilter(e.target.value)} options={userOptionsForFilter} />
                     <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:flex lg:items-end lg:gap-2">
                         <Input label={t('managerDashboard.filters.dateStartLabel')} type="date" value={dateFilter.start} onChange={e => setDateFilter(p => ({...p, start: e.target.value}))} className="w-full"/>
                         <Input label={t('managerDashboard.filters.dateEndLabel')} type="date" value={dateFilter.end} onChange={e => setDateFilter(p => ({...p, end: e.target.value}))} className="w-full"/>
                         <Button variant="outline" onClick={handleResetFilters} className="w-full lg:w-auto mt-4 sm:mt-0">{t('managerDashboard.filters.resetButton')}</Button>
                     </div>
                 </div>
            </section>

            <section className="bg-surface shadow-lg rounded-lg p-2 sm:p-4 md:p-6">
                <h2 className="text-xl font-semibold text-textPrimary mb-4">{t('managerDashboard.filteredTicketsTitle')}</h2>
                {filteredTickets.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">{filtersAreActive ? t('managerDashboard.noTicketsFiltered') : t('managerDashboard.noTicketsSystem')}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.tableHeader.title')}</th>
                                    <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.tableHeader.client')}</th>
                                    <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.tableHeader.status')}</th>
                                    <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.tableHeader.priority')}</th>
                                    <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.tableHeader.assignedAgent')}</th>
                                    <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.tableHeader.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200 text-sm">
                                {filteredTickets.map(ticket => (
                                    <ManagerTicketRow 
                                        key={ticket.id} 
                                        ticket={ticket} 
                                        agents={allAgents}
                                        allUsers={allUsers}
                                        onAssignTicket={assignTicket} 
                                        onDeleteTicket={handleDeleteTicket}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
            
            <section className="bg-surface shadow-lg rounded-lg p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-textPrimary mb-4">{t('managerDashboard.userManagementTitle')}</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.userTableHeader.username')}</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.userTableHeader.language')}</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.userTableHeader.roleActions')}</th>
                                <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('managerDashboard.tableHeader.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200 text-sm">
                            {allUsers.map((userToManage) => (
                                <UserManagementRow 
                                    key={userToManage.id}
                                    userToManage={userToManage}
                                    currentUser={user}
                                    onUpdateRole={updateUserRole}
                                    onDeleteUser={deleteUserById}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <FloatingActionButton to="/help" title={t('managerDashboard.createNewTicketButton')} />
        </div>
    );
};

export default ManagerDashboardPage;

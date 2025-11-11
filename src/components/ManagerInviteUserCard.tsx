// src/components/ManagerInviteUserCard.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { invokeWithFallback } from '@/utils/invokeWithFallback';

type Mode = 'invite' | 'create';
type Role = 'agent' | 'user';
type Lang = 'fr' | 'en' | 'ar';

interface Props {
  companyId: string; // affichage/info seulement
}

type EdgeSuccess = { ok: true; mode: Mode; user_id: string };
type EdgeError = { error: string; details?: string; inviteLink?: string };

export default function ManagerInviteUserCard({ companyId }: Props) {
  const { t, language } = useLanguage();
  const preferredLanguage: Lang = (language as Lang) ?? 'fr';

  const [mode, setMode] = useState<Mode>('invite'); // par défaut: invite (plus simple UX)
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('agent');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [agentLimit, setAgentLimit] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Charger quota agents (count + plan.max_agents)
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      // count agents
      const { count, error: cntErr } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('role', 'agent');

      if (!controller.signal.aborted && isMounted.current) {
        if (cntErr) setErr(t('manager.invite.errors.countAgents'));
        setAgentCount(count ?? 0);
      }

      // plan.max_agents
      const { data: comp, error: compErr } = await supabase
        .from('companies')
        .select('plan_id')
        .eq('id', companyId)
        .single();

      if (controller.signal.aborted || !isMounted.current) return;

      if (compErr || !comp?.plan_id) {
        setErr(t('manager.invite.errors.planLimit'));
        return;
      }

      const { data: plan, error: planErr } = await supabase
        .from('plans')
        .select('max_agents')
        .eq('id', comp.plan_id)
        .single();

      if (!controller.signal.aborted && isMounted.current) {
        if (planErr || !plan) setErr(t('manager.invite.errors.planLimit'));
        else setAgentLimit(plan.max_agents ?? 0);
      }
    })();

    return () => controller.abort();
  }, [companyId, t]);

  // Reset passwords quand on repasse en "invite"
  useEffect(() => {
    if (mode === 'invite') {
      setPassword('');
      setPasswordConfirm('');
    }
  }, [mode]);

  const atLimit = useMemo(
    () =>
      role === 'agent' &&
      agentLimit !== null &&
      agentCount !== null &&
      agentCount >= agentLimit,
    [role, agentLimit, agentCount]
  );

  function translateApiError(code?: string, details?: string | null): string {
    if (!code) return details ?? t('manager.invite.errors.generic');
    switch (code) {
      case 'missing_fields': return t('manager.invite.errors.required');
      case 'agent_limit_reached': return t('manager.invite.errors.agentCap');
      case 'company_not_found':
      case 'plan_not_found': return t('manager.invite.errors.planLimit');
      case 'count_failed': return t('manager.invite.errors.countAgents');
      case 'weak_password': return t('manager.invite.errors.weakPassword');
      case 'password_mismatch': return t('manager.invite.errors.passwordMismatch');
      case 'profile_not_found':
      case 'invalid_role':
        return t('manager.invite.errors.generic');
      case 'unauthorized':
      case 'forbidden':
        return t('manager.invite.errors.generic');
      case 'invite_failed':
      case 'create_failed':
      case 'profile_insert_failed': return details ?? t('manager.invite.errors.generic');
      case 'ORIGIN_NOT_ALLOWED':
        return t('auth.errors.ORIGIN_NOT_ALLOWED', {
          default: t('manager.invite.errors.generic'),
        });
      default: return details ?? t('manager.invite.errors.generic');
    }
  }

  async function refreshAgentCount() {
    const { count, error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('role', 'agent');

    if (isMounted.current) {
      if (!error) setAgentCount(count ?? agentCount ?? 0);
      else setErr(t('manager.invite.errors.countAgents'));
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isMounted.current) return;

    setMsg(null);
    setErr(null);

    const _email = email.trim().toLowerCase();
    const _fullName = fullName.trim();
    if (!_email || !_fullName) {
      setErr(t('manager.invite.errors.required'));
      return;
    }

    if (role === 'agent' && atLimit) {
      setErr(t('manager.invite.errors.agentCap'));
      return;
    }

    if (mode === 'create') {
      if (password.length < 8) return setErr(t('manager.invite.errors.weakPassword'));
      if (password !== passwordConfirm) return setErr(t('manager.invite.errors.passwordMismatch'));
    }

    setLoading(true);

    const payload: Record<string, unknown> = {
      mode,
      email: _email,
      full_name: _fullName,
      role,
      language_preference: preferredLanguage,
      // NOTE: on n'envoie PAS companyId : l’Edge Function le déduit du manager
    };
    if (mode === 'create') {
      payload.password = password;
      payload.password_confirm = passwordConfirm;
    }

    try {
      const result = await invokeWithFallback<EdgeSuccess | EdgeError>('manager-create-user', payload);

      if (!isMounted.current) return;

      if (result.error) {
        const { context, message } = result.error;
        const errorCode =
          (typeof context?.error === 'string' && context.error) ||
          (typeof context?.code === 'string' && context.code) ||
          (typeof message === 'string' && message) ||
          'generic';
        const detailFromContext = (() => {
          if (typeof context?.details === 'string') return context.details;
          const body = context?.body as unknown;
          if (body && typeof body === 'object' && 'details' in body && typeof (body as any).details === 'string') {
            return (body as any).details as string;
          }
          return undefined;
        })();

        if (errorCode === 'network_error' || errorCode === 'aborted') {
          setErr(t('manager.invite.errors.timeout'));
          return;
        }

        setErr(translateApiError(errorCode, detailFromContext));
        return;
      }

      const payloadResponse = result.data;
      if (!payloadResponse) {
        setMsg(mode === 'invite' ? t('manager.invite.success') : t('manager.invite.created'));
      } else if ('error' in payloadResponse) {
        setErr(translateApiError(payloadResponse.error, 'details' in payloadResponse ? payloadResponse.details : undefined));
        return;
      } else {
        setMsg(mode === 'invite' ? t('manager.invite.success') : t('manager.invite.created'));
      }

      setEmail('');
      setFullName('');
      if (mode === 'create') {
        setPassword('');
        setPasswordConfirm('');
      }
      if (role === 'agent') await refreshAgentCount();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e ?? '');
      setErr(message || t('manager.invite.errors.generic'));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{t('manager.invite.title')}</h3>
      <p className="text-sm text-slate-600 mb-4">{t('manager.invite.subtitle2')}</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <fieldset>
          <legend className="block text-sm font-medium mb-1">
            {t('manager.invite.mode')}
          </legend>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="invite"
                checked={mode === 'invite'}
                onChange={() => setMode('invite')}
              />
              {t('manager.invite.modeInvite')}
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="create"
                checked={mode === 'create'}
                onChange={() => setMode('create')}
              />
              {t('manager.invite.modeCreate')}
            </label>
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('manager.invite.fullName')}
          </label>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            aria-required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('manager.invite.email')}
          </label>
          <input
            type="email"
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required
          />
        </div>

        <div>
          <span className="block text-sm font-medium mb-1">{t('manager.invite.role')}</span>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="agent"
                checked={role === 'agent'}
                onChange={() => setRole('agent')}
              />
              {t('role.agent')}
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === 'user'}
                onChange={() => setRole('user')}
              />
              {t('role.user')}
            </label>
          </div>

          {agentLimit !== null && agentCount !== null && (
            <p className="text-xs text-slate-500 mt-1">
              {t('manager.invite.agentCapInfo', { count: agentCount, limit: agentLimit })}
            </p>
          )}
          {role === 'agent' && atLimit && (
            <p className="text-xs text-red-600">{t('manager.invite.errors.agentCap')}</p>
          )}
        </div>

        {mode === 'create' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('manager.invite.password')}
              </label>
              <input
                type="password"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                aria-required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('manager.invite.passwordConfirm')}
              </label>
              <input
                type="password"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                minLength={8}
                required
                aria-required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (role === 'agent' && atLimit)}
          className="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading
            ? mode === 'invite'
              ? t('manager.invite.btnLoading')
              : t('manager.invite.btnCreating')
            : mode === 'invite'
            ? t('manager.invite.btn')
            : t('manager.invite.btnCreate')}
        </button>
      </form>

      {msg && <p className="mt-3 text-sm text-emerald-700">{msg}</p>}
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

      {companyId
        ? <p className="mt-3 text-xs text-slate-500">Société: {companyId}</p>
        : <p className="mt-3 text-xs text-amber-600">⚠️ Votre profil manager n’a pas de company_id — la création échouera.</p>}
    </div>
  );
}

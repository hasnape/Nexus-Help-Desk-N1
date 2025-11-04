import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  companyId: string;
}

type Mode = "invite" | "create";

type FunctionSuccess = {
  ok: true;
  mode: Mode;
  user_id: string;
};

type FunctionErrorPayload = {
  error: string;
  details?: string;
};

type InvokeResponse<T> = Awaited<ReturnType<typeof supabase.functions.invoke<T>>>;

const ManagerInviteUserCard: React.FC<Props> = ({ companyId }) => {
  const { t, i18n } = useLanguage();
  const [mode, setMode] = useState<Mode>("create");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"agent" | "user">("agent");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [agentLimit, setAgentLimit] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      const tErrorAgent = t("manager.invite.errors.countAgents");
      const tErrorPlan = t("manager.invite.errors.planLimit");

      const { count, error } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("role", "agent")
        .abortSignal(controller.signal);

      if (!controller.signal.aborted && isMounted.current) {
        if (error) {
          setErr(tErrorAgent);
        }
        setAgentCount(count ?? 0);
      }

      const { data: comp, error: companyError } = await supabase
        .from("companies")
        .select("plan_id")
        .eq("id", companyId)
        .single()
        .abortSignal(controller.signal);

      if (controller.signal.aborted || !isMounted.current) {
        return;
      }

      if (companyError || !comp?.plan_id) {
        setErr(tErrorPlan);
        return;
      }

      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("max_agents")
        .eq("id", comp.plan_id)
        .single()
        .abortSignal(controller.signal);

      if (!controller.signal.aborted && isMounted.current) {
        if (planError || !plan) {
          setErr(tErrorPlan);
        } else {
          setAgentLimit(plan.max_agents ?? 0);
        }
      }
    };

    void load();
    return () => {
      controller.abort();
    };
  }, [companyId, t]);

  useEffect(() => {
    if (mode === "invite") {
      setPassword("");
      setPasswordConfirm("");
    }
  }, [mode]);

  const atLimit = useMemo(
    () => role === "agent" && agentLimit !== null && agentCount !== null && agentCount >= agentLimit,
    [role, agentLimit, agentCount]
  );

  const translateApiError = (code: string, details?: string | null): string => {
    switch (code) {
      case "missing_fields":
        return t("manager.invite.errors.required");
      case "agent_limit_reached":
        return t("manager.invite.errors.agentCap");
      case "company_not_found":
      case "plan_not_found":
        return t("manager.invite.errors.planLimit");
      case "count_failed":
        return t("manager.invite.errors.countAgents");
      case "weak_password":
        return t("manager.invite.errors.weakPassword");
      case "password_mismatch":
        return t("manager.invite.errors.passwordMismatch");
      case "invite_failed":
      case "create_failed":
      case "profile_insert_failed":
        return details ?? t("manager.invite.errors.generic");
      default:
        return details ?? t("manager.invite.errors.generic");
    }
  };

  const invokeWithTimeout = async <T,>(body: Record<string, unknown>): Promise<InvokeResponse<T>> => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      return await supabase.functions.invoke<T>("manager-create-user", {
        body,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("timeout");
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  };

  const refreshAgentCount = async () => {
    const { count, error } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("role", "agent");

    if (isMounted.current) {
      if (!error) {
        setAgentCount(count ?? agentCount ?? 0);
      } else {
        setErr(t("manager.invite.errors.countAgents"));
      }
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isMounted.current) return;

    setMsg(null);
    setErr(null);

    if (!email || !fullName) {
      setErr(t("manager.invite.errors.required"));
      return;
    }

    if (role === "agent" && atLimit) {
      setErr(t("manager.invite.errors.agentCap"));
      return;
    }

    if (mode === "create") {
      if (password.length < 8) {
        setErr(t("manager.invite.errors.weakPassword"));
        return;
      }
      if (password !== passwordConfirm) {
        setErr(t("manager.invite.errors.passwordMismatch"));
        return;
      }
    }

    setLoading(true);
    const payload: Record<string, unknown> = {
      mode,
      email,
      full_name: fullName,
      role,
      language_preference: i18n.language || "fr",
    };

    if (mode === "create") {
      payload.password = password;
      payload.password_confirm = passwordConfirm;
    }

    const handleSuccess = async () => {
      setMsg(mode === "invite" ? t("manager.invite.success") : t("manager.invite.created"));
      setEmail("");
      setFullName("");
      if (mode === "create") {
        setPassword("");
        setPasswordConfirm("");
      }

      if (role === "agent") {
        await refreshAgentCount();
      }
    };

    try {
      const response = await invokeWithTimeout<FunctionSuccess | FunctionErrorPayload>(payload);
      if (!isMounted.current) {
        return;
      }

      const { data, error } = response;
      if (error) {
        const apiErrorCode = typeof error.message === "string" ? error.message : null;
        const translated = apiErrorCode ? translateApiError(apiErrorCode) : t("manager.invite.errors.generic");
        setErr(error.message ?? translated);
        return;
      }

      if (!data) {
        await handleSuccess();
        return;
      }

      if ("error" in data) {
        setErr(translateApiError(data.error, "details" in data ? data.details : undefined));
        return;
      }

      await handleSuccess();
    } catch (error) {
      if (!isMounted.current) return;
      if (error instanceof Error && error.message === "timeout") {
        setErr(t("manager.invite.errors.timeout"));
        return;
      }
      if (error instanceof Error && error.name === "AbortError") {
        setErr(t("manager.invite.errors.timeout"));
        return;
      }
      const message = error instanceof Error ? error.message : String(error ?? "");
      setErr(message || t("manager.invite.errors.generic"));
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{t("manager.invite.title")}</h3>
      <p className="text-sm text-slate-600 mb-4">{t("manager.invite.subtitle2")}</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <fieldset>
          <legend className="block text-sm font-medium mb-1">{t("manager.invite.mode")}</legend>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="invite"
                checked={mode === "invite"}
                onChange={() => setMode("invite")}
              />
              {t("manager.invite.modeInvite")}
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="create"
                checked={mode === "create"}
                onChange={() => setMode("create")}
              />
              {t("manager.invite.modeCreate")}
            </label>
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium mb-1">{t("manager.invite.fullName")}</label>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            aria-required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("manager.invite.email")}</label>
          <input
            type="email"
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            aria-required
          />
        </div>

        <div>
          <span className="block text-sm font-medium mb-1">{t("manager.invite.role")}</span>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="agent"
                checked={role === "agent"}
                onChange={() => setRole("agent")}
              />
              {t("role.agent")}
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
              />
              {t("role.user")}
            </label>
          </div>
          {agentLimit !== null && agentCount !== null && (
            <p className="text-xs text-slate-500 mt-1">
              {t("manager.invite.agentCapInfo", { count: agentCount, limit: agentLimit })}
            </p>
          )}
          {role === "agent" && atLimit && (
            <p className="text-xs text-red-600">{t("manager.invite.errors.agentCap")}</p>
          )}
        </div>

        {mode === "create" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">{t("manager.invite.password")}</label>
              <input
                type="password"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                aria-required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("manager.invite.passwordConfirm")}</label>
              <input
                type="password"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                required
                aria-required
                minLength={8}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading || (role === "agent" && atLimit)}
          className="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading
            ? mode === "invite"
              ? t("manager.invite.btnLoading")
              : t("manager.invite.btnCreating")
            : mode === "invite"
            ? t("manager.invite.btn")
            : t("manager.invite.btnCreate")}
        </button>
      </form>

      {msg && <p className="mt-3 text-sm text-emerald-700">{msg}</p>}
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
};

export default ManagerInviteUserCard;

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  companyId: string;
}

const ManagerInviteUserCard: React.FC<Props> = ({ companyId }) => {
  const { t, i18n } = useLanguage();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"agent" | "user">("agent");
  const [loading, setLoading] = useState(false);
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [agentLimit, setAgentLimit] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr(null);
      const { count, error: cErr } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("role", "agent");
      if (!cancelled) {
        if (cErr) {
          setErr(t("manager.invite.errors.countAgents", { default: "Impossible de compter les agents." }));
        }
        setAgentCount(count ?? 0);
      }
      const { data: comp } = await supabase
        .from("companies")
        .select("plan_id")
        .eq("id", companyId)
        .single();
      if (!cancelled && comp?.plan_id != null) {
        const { data: plan, error: planErr } = await supabase
          .from("plans")
          .select("max_agents")
          .eq("id", comp.plan_id)
          .single();
        if (planErr || !plan) {
          setErr(t("manager.invite.errors.planLimit", { default: "Limite d’agents du plan introuvable." }));
        } else {
          setAgentLimit(plan.max_agents ?? 0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId, t]);

  const atLimit = useMemo(
    () => role === "agent" && agentLimit !== null && agentCount !== null && agentCount >= agentLimit,
    [role, agentLimit, agentCount]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (!email || !fullName) {
      setErr(t("manager.invite.errors.required", { default: "Nom complet et email requis." }));
      return;
    }
    if (atLimit) {
      setErr(t("manager.invite.errors.agentCap", { default: "Plafond d’agents atteint pour votre plan." }));
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("manager-create-user", {
      body: { email, full_name: fullName, role, language_preference: i18n.language || "fr" },
    });
    setLoading(false);
    if (error || data?.error) {
      setErr(
        error?.message || data?.error || t("manager.invite.errors.generic", { default: "Échec de l’invitation." })
      );
      return;
    }
    setMsg(
      t("manager.invite.success", {
        default: "Invitation envoyée. L’utilisateur recevra un email pour finaliser son compte.",
      })
    );
    setEmail("");
    setFullName("");
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("role", "agent");
    setAgentCount(count ?? agentCount);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{t("manager.invite.title", { default: "Inviter un membre" })}</h3>
      <p className="text-sm text-slate-600 mb-4">
        {t("manager.invite.subtitle", {
          default: "Créez un compte et envoyez une invitation email (agent ou utilisateur).",
        })}
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("manager.invite.fullName", { default: "Nom complet" })}
          </label>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            aria-required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("manager.invite.email", { default: "Email" })}
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
          <span className="block text-sm font-medium mb-1">{t("manager.invite.role", { default: "Rôle" })}</span>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="agent"
                checked={role === "agent"}
                onChange={() => setRole("agent")}
              />
              {t("role.agent", { default: "Agent" })}
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
              />
              {t("role.user", { default: "Utilisateur" })}
            </label>
          </div>
          {agentLimit !== null && agentCount !== null && (
            <p className="text-xs text-slate-500 mt-1">
              {t("manager.invite.agentCapInfo", {
                default: "Agents : {{count}} / {{limit}}",
                count: agentCount,
                limit: agentLimit,
              })}
            </p>
          )}
          {atLimit && (
            <p className="text-xs text-red-600">
              {t("manager.invite.errors.agentCap", { default: "Plafond d’agents atteint pour votre plan." })}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || (role === "agent" && atLimit)}
          className="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading
            ? t("manager.invite.btnLoading", { default: "Invitation en cours…" })
            : t("manager.invite.btn", { default: "Inviter" })}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm text-emerald-700">{msg}</p>}
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
};

export default ManagerInviteUserCard;

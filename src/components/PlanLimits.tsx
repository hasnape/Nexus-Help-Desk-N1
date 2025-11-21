import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../services/supabaseClient";
import { formatQuota } from "@/utils/formatQuota";

interface PlanLimitsProps {
  companyId: string;
}

type QuotaRPC = {
  used: number;
  limit: number | null;
  unlimited: boolean;
  timezone: string | null;
  plan_name?: string | null;
};

type PlanRow = {
  id: string;
  name: string;
  max_agents: number | null;
  ticket_limit?: number | null;
};

type ViewModel = {
  loading: boolean;
  error: string | null;
  planLabel: string;
  agentLimit: number | null;
  ticketLimit: number | null;
  agentCount: number | null;
  ticketUsed: number;
  unlimited: boolean;
  timezone: string;
};

const DEFAULT_TZ = "Europe/Paris";

const normalizePlanKey = (label?: string | null): string | null => {
  if (!label) return null;
  const s = label.trim().toLowerCase();
  if (s.includes("unlimit") || s.includes("illimit") || s.includes("enterprise")) return "unlimited";
  if (s.includes("pro")) return "pro";
  if (s.includes("standard") || s.includes("team")) return "standard";
  if (s.includes("free") || s.includes("freemium") || s.includes("trial") || s.includes("sandbox")) return "freemium";
  return s || null;
};

const severityBarClass = (percent: number | null) => {
  if (percent == null) return "bg-slate-200";
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  return "bg-emerald-500";
};

const PlanLimits: React.FC<PlanLimitsProps> = ({ companyId }) => {
  const { t: translateHook, getBCP47Locale } = useLanguage();

  const [vm, setVm] = useState<ViewModel>({
    loading: true,
    error: null,
    planLabel: "—",
    agentLimit: null,
    ticketLimit: null,
    agentCount: null,
    ticketUsed: 0,
    unlimited: false,
    timezone: DEFAULT_TZ,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!companyId) {
        if (mounted) setVm((v) => ({ ...v, loading: false, error: "Aucune société détectée." }));
        return;
      }

      try {
        // 1) Quota via RPC
        const { data: quota, error: quotaErr } = await supabase.rpc("get_my_company_month_quota");
        if (quotaErr) throw quotaErr;
        const q = (quota || {}) as QuotaRPC;

        const planLabel = q.plan_name || "—";
        const normalized = normalizePlanKey(q.plan_name);

        // 2) plans: match by name (case-insensitive)
        let planRow: PlanRow | null = null;
        if (planLabel && planLabel !== "—") {
          const { data: byName, error } = await supabase
            .from("plans")
            .select("id,name,max_agents,ticket_limit")
            .ilike("name", planLabel);
          if (!error && byName && byName.length > 0) {
            planRow = byName[0] as PlanRow;
          }
        }
        // fallback canonical
        if (!planRow && normalized) {
          const canon = normalized === "freemium" ? "Freemium" : normalized === "standard" ? "Standard" : normalized === "pro" ? "Pro" : null;
          if (canon) {
            const { data: byCanon } = await supabase
              .from("plans")
              .select("id,name,max_agents,ticket_limit")
              .ilike("name", canon);
            if (byCanon && byCanon.length > 0) {
              planRow = byCanon[0] as PlanRow;
            }
          }
        }

        // 3) count agents
        let agentCount: number | null = null;
        {
          const { count, error } = await supabase
            .from("users")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .eq("role", "agent");
          if (!error && typeof count === "number") agentCount = count;
        }

        if (!mounted) return;

        setVm({
          loading: false,
          error: null,
          planLabel,
          agentLimit: planRow?.max_agents ?? null,
          ticketLimit: q.unlimited ? null : q.limit ?? null,
          agentCount,
          ticketUsed: q.used ?? 0,
          unlimited: !!q.unlimited,
          timezone: q.timezone || DEFAULT_TZ,
        });
      } catch (e: any) {
        if (!mounted) return;
        setVm((v) => ({
          ...v,
          loading: false,
          error: e?.message || "Erreur de chargement des limites du plan.",
        }));
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [companyId]);

  const localeTag = getBCP47Locale();

  const normalizedQuota = useMemo(
    () =>
      formatQuota(
        {
          used: vm.ticketUsed,
          limit: vm.ticketLimit,
          unlimited: vm.unlimited,
          timezone: vm.timezone,
        },
        localeTag
      ),
    [localeTag, vm.ticketLimit, vm.ticketUsed, vm.timezone, vm.unlimited]
  );

  const percent = normalizedQuota.percent;

  const percentChunk =
    percent !== null
      ? translateHook("dashboard.quota.percentChunk", {
          default: " ({{percent}}% utilisé)",
          values: { percent },
          percent,
        })
      : "";

  const remainingText = translateHook("dashboard.quota.remaining", {
    default: "{{remaining}} / {{limit}}{{percentChunk}}",
    values: {
      remaining: normalizedQuota.remainingLabel,
      limit: normalizedQuota.limitLabel,
      percentChunk,
    },
    remaining: normalizedQuota.remainingLabel,
    limit: normalizedQuota.limitLabel,
    percentChunk,
  });

  const infinityLabel = translateHook("dashboard.quota.unlimitedBadge", {
    default: "Illimité",
    values: {},
  });

  const quotaTimezoneHint = translateHook("dashboard.quota.tzHint", {
    default: "Calculé sur le fuseau {tz}",
    values: { tz: normalizedQuota.timezone },
    tz: normalizedQuota.timezone,
  });

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(localeTag, { maximumFractionDigits: 0 }),
    [localeTag]
  );

  const usedLabel = numberFormatter.format(normalizedQuota.used);
  const limitDisplay = normalizedQuota.limitLabel;
  const limitNode = normalizedQuota.unlimited || normalizedQuota.limit === null
    ? (
        <span aria-label={infinityLabel} title={infinityLabel}>
          ∞
        </span>
      )
    : limitDisplay;

  if (vm.loading) {
    return (
      <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg mb-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-48 mb-3" />
        <div className="h-3 bg-slate-200 rounded w-64 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-56 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-72" />
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-lg mb-6">
        <p className="font-semibold mb-1">Limites du plan</p>
        <p className="text-sm">{vm.error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-2">Votre plan actuel</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <p>
          Plan : <strong>{vm.planLabel}</strong>
          {vm.unlimited && (
            <span
              className="ml-2 text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700"
              aria-label={infinityLabel}
              title={infinityLabel}
            >
              {infinityLabel}
            </span>
          )}
        </p>

        <p>
          Agents :{" "}
          <strong>
            {vm.agentCount ?? "—"} {vm.agentLimit != null ? `/ ${vm.agentLimit}` : "/ —"}
          </strong>
        </p>

        <div className="md:col-span-2">
          <p className="mb-1">
            Tickets ce mois :{" "}
            <strong>
              {usedLabel} / {limitNode}
            </strong>
          </p>
          <p className="mb-1">{remainingText}</p>

          <div className="w-full h-2 rounded bg-slate-200 overflow-hidden">
            <div
              className={`h-2 ${severityBarClass(percent)}`}
              style={{ width: `${percent ?? 100}%` }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent ?? 100}
              role="progressbar"
            />
          </div>

          {!normalizedQuota.unlimited && normalizedQuota.limit !== null && percent !== null && (
            <p className={`mt-2 text-sm ${percent >= 100 ? "text-red-700" : percent >= 80 ? "text-amber-700" : "text-slate-500"}`}>
              {percent >= 100
                ? "Quota mensuel atteint. Mettez à niveau votre plan pour créer de nouveaux tickets."
                : percent >= 80
                ? "Attention : vous approchez de votre limite mensuelle."
                : "Consommation mensuelle en cours."}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">{quotaTimezoneHint}</p>
        </div>
      </div>
    </div>
  );
};

export default PlanLimits;

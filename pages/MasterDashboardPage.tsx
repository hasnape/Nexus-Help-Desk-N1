import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useApp } from "../App";
import { supabase } from "../services/supabaseClient";
import { baseFieldClasses } from "../components/FormElements";

type MasterCompanyRow = {
  company_id: string;
  company_name: string;
  plan_tier: string | null;
  plan_max_tickets_month: number | null;
  unlimited: boolean | null;
  total_users: number;
  total_tickets: number;
  ai_default_profile_key: string | null;
};

type AiSettingsRow = {
  company_id: string;
  default_profile_key: string | null;
  profile_overrides: Record<string, unknown>;
  updated_at: string | null;
};

const MasterDashboardPage: React.FC = () => {
  const { user } = useApp();
  const [companies, setCompanies] = useState<MasterCompanyRow[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [aiSettings, setAiSettings] = useState<AiSettingsRow | null>(null);
  const [defaultProfileKey, setDefaultProfileKey] = useState("");
  const [profileOverridesText, setProfileOverridesText] = useState("{}");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.global_role !== "super_admin") return;

    const loadCompanies = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: rpcError } = await supabase.rpc("admin_list_companies_with_stats");
      if (rpcError) {
        setError(rpcError.message || "Failed to load companies");
        setCompanies([]);
        setIsLoading(false);
        return;
      }
      const companyRows = data || [];
      setCompanies(companyRows as MasterCompanyRow[]);
      if (companyRows.length > 0) {
        setSelectedCompanyId((current) => current ?? (companyRows[0] as MasterCompanyRow).company_id);
      }
      setIsLoading(false);
    };

    loadCompanies();
  }, [user]);

  useEffect(() => {
    if (!selectedCompanyId || !user || user.global_role !== "super_admin") {
      setAiSettings(null);
      setDefaultProfileKey("");
      setProfileOverridesText("{}");
      return;
    }

    const loadAiSettings = async () => {
      setIsLoadingAi(true);
      setError(null);
      const { data, error: rpcError } = await supabase.rpc("admin_get_company_ai_settings", {
        p_company_id: selectedCompanyId,
      });

      if (rpcError) {
        setError(rpcError.message || "Failed to load AI settings");
        setAiSettings(null);
        setDefaultProfileKey("");
        setProfileOverridesText("{}");
      } else {
        const row = (data && (data as AiSettingsRow[])[0]) || null;
        const normalizedRow: AiSettingsRow | null = row
          ? {
              ...row,
              profile_overrides: row.profile_overrides ?? {},
            }
          : null;
        setAiSettings(normalizedRow);
        setDefaultProfileKey(normalizedRow?.default_profile_key || "");
        setProfileOverridesText(JSON.stringify(normalizedRow?.profile_overrides ?? {}, null, 2));
      }
      setIsLoadingAi(false);
    };

    loadAiSettings();
  }, [selectedCompanyId, user]);

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  const handleSaveAiSettings = async () => {
    if (!selectedCompanyId) return;

    let parsedOverrides: Record<string, unknown> = {};
    const trimmed = profileOverridesText.trim();
    if (trimmed.length) {
      try {
        parsedOverrides = JSON.parse(profileOverridesText);
      } catch (err) {
        alert("Invalid JSON for profile overrides");
        return;
      }
    }

    setIsSavingAi(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("admin_upsert_company_ai_settings", {
      p_company_id: selectedCompanyId,
      p_default_profile_key: defaultProfileKey || null,
      p_profile_overrides: parsedOverrides,
    });

    if (rpcError) {
      setError(rpcError.message || "Failed to save AI settings");
    } else {
      const updatedRow: AiSettingsRow = {
        company_id: selectedCompanyId,
        default_profile_key: defaultProfileKey || null,
        profile_overrides: parsedOverrides,
        updated_at: new Date().toISOString(),
      };
      setAiSettings(updatedRow);
      setCompanies((prev) =>
        prev.map((c) =>
          c.company_id === selectedCompanyId
            ? { ...c, ai_default_profile_key: defaultProfileKey || null }
            : c
        )
      );
    }

    setIsSavingAi(false);
  };

  const filteredCompanies = useMemo(() => {
    const term = filter.toLowerCase();
    return companies.filter((c) => (c.company_name || "").toLowerCase().includes(term));
  }, [companies, filter]);

  const selectedCompany = useMemo(
    () => companies.find((c) => c.company_id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId]
  );

  if (!user || user.global_role !== "super_admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Master Dashboard</h1>
        <p className="text-sm text-red-600">
          Access denied. This area is reserved for super admin users.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Master Dashboard</h1>
          <p className="text-sm text-gray-600">Multi-tenant control center</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter companies by name"
              className={baseFieldClasses}
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
              Companies
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <LoadingSpinner size="sm" text="Loading companies..." />
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-500">No companies found.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredCompanies.map((company) => (
                  <li
                    key={company.company_id}
                    className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 ${
                      selectedCompanyId === company.company_id ? "bg-indigo-50" : ""
                    }`}
                    onClick={() => handleSelectCompany(company.company_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{company.company_name}</p>
                        <p className="text-xs text-gray-500">Plan: {company.plan_tier || "-"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Tickets: {company.total_tickets}</p>
                        <p className="text-xs text-gray-600">Users: {company.total_users}</p>
                        <p className="text-xs text-gray-600">
                          AI: {company.ai_default_profile_key || "(none)"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {isLoadingAi && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LoadingSpinner size="sm" /> Loading AI settings...
            </div>
          )}

          {!selectedCompanyId && !isLoading && (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-gray-600 bg-white shadow-sm">
              Select a company on the left to edit its AI profile.
            </div>
          )}

          {selectedCompanyId && !isLoading && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Company overview</h2>
                {aiSettings && (
                  <dl className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <div>
                      <dt className="text-gray-500">Name</dt>
                      <dd className="font-medium">
                        {selectedCompany?.company_name || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Plan</dt>
                      <dd className="font-medium">
                        {selectedCompany?.plan_tier || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Ticket quota</dt>
                      <dd className="font-medium">
                        {selectedCompany?.unlimited
                          ? "Unlimited"
                          : selectedCompany?.plan_max_tickets_month || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Total tickets</dt>
                      <dd className="font-medium">
                        {selectedCompany?.total_tickets ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Total users</dt>
                      <dd className="font-medium">
                        {selectedCompany?.total_users ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Current AI profile</dt>
                      <dd className="font-medium">{aiSettings?.default_profile_key || "(none)"}</dd>
                    </div>
                  </dl>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">AI profile</h2>
                <div className="space-y-3">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default profile key
                  </label>
                  <input
                    type="text"
                    value={defaultProfileKey}
                    onChange={(e) => setDefaultProfileKey(e.target.value)}
                    className={baseFieldClasses}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile overrides (JSON)</label>
                  <textarea
                    value={profileOverridesText}
                    onChange={(e) => setProfileOverridesText(e.target.value)}
                    rows={12}
                    className={`${baseFieldClasses} font-mono`}
                  />
                </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveAiSettings}
                      disabled={isSavingAi}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {isSavingAi ? "Saving..." : "Save AI settings"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterDashboardPage;

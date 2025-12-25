// src/components/RoleSelector.tsx
import React from "react";
import { UserRole } from "../types";
import { useTranslation } from "react-i18next";

interface RoleSelectorProps {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation();

  const roles: { value: UserRole; labelKey: string; descriptionKey: string }[] = [
    { value: UserRole.MANAGER, labelKey: "roles.manager.label", descriptionKey: "roles.manager.description" },
    { value: UserRole.AGENT, labelKey: "roles.agent.label", descriptionKey: "roles.agent.description" },
    { value: UserRole.END_USER, labelKey: "roles.endUser.label", descriptionKey: "roles.endUser.description" },
  ];

  return (
    <div className="surface-card-soft p-4 text-sm text-slate-200 space-y-3">
      <p className="font-semibold text-white">
        {t("signup.roleSection.title", { defaultValue: "Choisissez votre rôle" })}
      </p>
      <p className="text-slate-200">
        {t("signup.roleSection.description", {
          defaultValue: "Sélectionnez le rôle qui correspond à votre utilisation de Nexus Support Hub.",
        })}
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        {roles.map((role) => {
          const selected = value === role.value;
          return (
            <button
              key={role.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(role.value)}
              className={`text-left rounded-lg border px-3 py-3 transition focus:outline-none focus:ring-2 focus:ring-primary ${
                selected
                  ? "border-primary bg-primary/20 text-white"
                  : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-primary/70 hover:bg-slate-900"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">
                  {t(role.labelKey, { defaultValue: role.value })}
                </span>
                {selected && (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                    ✓
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-300">
                {t(role.descriptionKey, { defaultValue: "" })}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;

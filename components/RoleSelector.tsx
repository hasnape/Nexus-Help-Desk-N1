// components/RoleSelector.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { UserRole } from "../types";

interface RoleSelectorProps {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation();

  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: UserRole.MANAGER,
      label: t("roleHelp.manager.title", { defaultValue: "Manager" }),
      description: t("roleHelp.manager.description", {
        defaultValue: "Crée l’espace entreprise et gère les paramètres.",
      }),
    },
    {
      value: UserRole.AGENT,
      label: t("roleHelp.agent.title", { defaultValue: "Agent" }),
      description: t("roleHelp.agent.description", {
        defaultValue: "Traite les tickets et assiste les clients.",
      }),
    },
    {
      value: UserRole.USER, // <--- même valeur que NewUserPage
      label: t("roleHelp.user.title", { defaultValue: "Utilisateur" }),
      description: t("roleHelp.user.description", {
        defaultValue: "Crée des tickets et suit les réponses.",
      }),
    },
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
                <span className="font-semibold text-sm">{role.label}</span>
                {selected && (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                    ✓
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-300">{role.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;

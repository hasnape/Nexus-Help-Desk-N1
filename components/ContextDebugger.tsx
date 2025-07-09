import React from "react";
import { useLanguageSafe } from "../contexts/LanguageContext";
import { useSidebarSafe } from "../contexts/SidebarContext";
import { usePlanSafe } from "../contexts/PlanContext";
import { useApp } from "../App";

const ContextDebugger: React.FC = () => {
  const language = useLanguageSafe();
  const sidebar = useSidebarSafe();
  const app = useApp();
  const plan = usePlanSafe();

  // ✅ Seulement en développement
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-0 left-0 bg-black/90 text-white p-3 text-xs z-[9999] max-w-sm border-r border-t border-gray-600">
      <div className="font-bold mb-2">🔧 Debug Contextes</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>🌐 Langue:</span>
          <span
            className={
              language.isLoadingLang ? "text-yellow-400" : "text-green-400"
            }
          >
            {language.language} {language.isLoadingLang ? "⏳" : "✅"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>📱 Sidebar:</span>
          <span>{sidebar.isExpanded ? "📖 Ouverte" : "📕 Fermée"}</span>
        </div>
        <div className="flex justify-between">
          <span>👤 Utilisateur:</span>
          <span className={app.user ? "text-green-400" : "text-red-400"}>
            {app.user?.full_name || "Aucun"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>💼 Plan:</span>
          <span>{plan.currentPlan}</span>
        </div>
        <div className="flex justify-between">
          <span>⏳ App:</span>
          <span
            className={app.isLoading ? "text-yellow-400" : "text-green-400"}
          >
            {app.isLoading ? "Chargement" : "Prêt"}
          </span>
        </div>
        {language.isLoadingLang && (
          <button
            onClick={language.forceResolveLoading}
            className="w-full mt-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
          >
            🚨 Forcer résolution
          </button>
        )}
      </div>
    </div>
  );
};

export default ContextDebugger;

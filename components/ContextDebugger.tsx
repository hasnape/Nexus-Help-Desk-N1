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

  const handleClearCache = () => {
    if (
      confirm("🧹 Voulez-vous vider tout le cache ? La page va se recharger.")
    ) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleClearAuthOnly = () => {
    if (
      confirm("🔐 Voulez-vous vider uniquement le cache d'authentification ?")
    ) {
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("sb-") || key.includes("supabase")) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.includes("sb-") || key.includes("supabase")) {
          sessionStorage.removeItem(key);
        }
      });
    }
  };

  const handleShowCacheInfo = () => {
    const info = {
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length,
      supabaseKeys: Object.keys(localStorage).filter((k) => k.includes("sb-"))
        .length,
    };
    console.log("📋 Informations du cache:", info);
    alert("📋 Informations du cache affichées dans la console (F12)");
  };

  // ✅ NOUVEAU - Déconnexion d'urgence
  const handleForceLogout = () => {
    if (confirm("🚪 Forcer la déconnexion complète ?")) {
      console.log("🚪 DÉCONNEXION FORCÉE");
      // Nettoyer tout
      localStorage.clear();
      sessionStorage.clear();
      // Aller directement à la page de login
      window.location.href = "/login";
    }
  };

  return (
    <div className="fixed bottom-0 left-0 bg-black/90 text-white p-3 text-xs z-[9999] max-w-sm border-r border-t border-gray-600">
      <div className="font-bold mb-2">🔧 Debug Contextes</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>🌐 Langue:</span>
          <span className="text-green-400">{language.language} ✅</span>
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
          <span>⚡ App:</span>
          <span className="text-green-400">Prêt ✅</span>
        </div>

        <div className="mt-3 border-t border-gray-600 pt-2">
          <div className="font-bold mb-1">🧹 Gestion Cache</div>
          <div className="space-y-1">
            <button
              onClick={handleShowCacheInfo}
              className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              📋 Voir Cache
            </button>
            <button
              onClick={handleClearAuthOnly}
              className="w-full px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs"
            >
              🔐 Vider Auth
            </button>
            <button
              onClick={handleClearCache}
              className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
            >
              🧹 Tout Vider
            </button>
          </div>
        </div>

        {/* ✅ NOUVEAU - Bouton de déconnexion d'urgence */}
        {app.user && (
          <button
            onClick={handleForceLogout}
            className="w-full mt-2 px-2 py-1 bg-red-800 hover:bg-red-900 text-white rounded text-xs font-bold"
          >
            🚪 DÉCONNEXION FORCÉE
          </button>
        )}
      </div>
    </div>
  );
};

export default ContextDebugger;

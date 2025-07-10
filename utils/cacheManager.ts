/**
 * Utilitaire pour la gestion du cache de l'application Nexus Help Desk
 */

export const clearNexusCache = (): void => {
  console.log("🧹 Nettoyage du cache Nexus...");

  // Supprimer tout le localStorage lié à l'app
  const nexusKeys = [
    'aiHelpDeskLang', 
    'aiHelpDeskAutoRead', 
    'cookieConsent',
    'nexus-help-desk-session',
    'nexus-user-preferences'
  ];

  nexusKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Supprimé: ${key}`);
    }
  });

  // Supprimer sessionStorage
  console.log("🗑️ Nettoyage sessionStorage...");
  sessionStorage.clear();

  // Vider le cache Supabase si présent
  console.log("🗑️ Nettoyage cache Supabase...");
  Object.keys(localStorage).forEach(key => {
    if (key.includes('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
      console.log(`🗑️ Supprimé Supabase: ${key}`);
    }
  });

  console.log("✅ Cache nettoyé complètement!");
};

export const clearNexusCacheAndReload = (): void => {
  clearNexusCache();
  console.log("🔄 Rechargement de la page...");
  window.location.reload();
};

export const clearAuthCacheOnly = (): void => {
  console.log("🧹 Nettoyage du cache d'authentification...");
  
  // Supprimer uniquement les données d'auth
  Object.keys(localStorage).forEach(key => {
    if (key.includes('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
      console.log(`🗑️ Supprimé auth: ${key}`);
    }
  });

  // Nettoyer aussi sessionStorage des données d'auth
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('sb-') || key.includes('supabase')) {
      sessionStorage.removeItem(key);
      console.log(`🗑️ Supprimé session auth: ${key}`);
    }
  });

  console.log("✅ Cache d'authentification nettoyé!");
};

export const getCacheInfo = (): { [key: string]: any } => {
  const cacheInfo: { [key: string]: any } = {};
  
  // Informations localStorage
  cacheInfo.localStorage = {};
  Object.keys(localStorage).forEach(key => {
    if (key.includes('aiHelpDesk') || key.includes('sb-') || key.includes('supabase') || key.includes('nexus') || key.includes('cookieConsent')) {
      try {
        const value = localStorage.getItem(key);
        cacheInfo.localStorage[key] = value && value.length > 100 ? `${value.substring(0, 100)}...` : value;
      } catch (e) {
        cacheInfo.localStorage[key] = '[Erreur lecture]';
      }
    }
  });

  // Informations sessionStorage
  cacheInfo.sessionStorage = {};
  Object.keys(sessionStorage).forEach(key => {
    try {
      const value = sessionStorage.getItem(key);
      cacheInfo.sessionStorage[key] = value && value.length > 100 ? `${value.substring(0, 100)}...` : value;
    } catch (e) {
      cacheInfo.sessionStorage[key] = '[Erreur lecture]';
    }
  });

  // Statistiques
  cacheInfo.stats = {
    localStorageKeys: Object.keys(localStorage).length,
    sessionStorageKeys: Object.keys(sessionStorage).length,
    supabaseKeys: Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('supabase')).length,
    nexusKeys: Object.keys(localStorage).filter(k => k.includes('aiHelpDesk') || k.includes('nexus')).length,
    timestamp: new Date().toISOString()
  };

  return cacheInfo;
};

// Fonction pour forcer la déconnexion complète
export const forceLogout = (): void => {
  console.log("🚪 Déconnexion forcée...");
  
  // Nettoyer tout le cache
  clearNexusCache();
  
  // Rediriger vers la page de connexion
  window.location.href = '/login';
};

// Fonction pour diagnostiquer les problèmes de cache
export const diagnoseCacheIssues = (): string[] => {
  const issues: string[] = [];
  
  try {
    // Vérifier la disponibilité du localStorage
    if (typeof Storage === "undefined") {
      issues.push("❌ localStorage non supporté par ce navigateur");
    }
    
    // Vérifier l'espace disponible
    const testKey = 'test-storage';
    try {
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      issues.push("❌ localStorage plein ou indisponible");
    }
    
    // Vérifier les clés Supabase
    const supabaseKeys = Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('supabase'));
    if (supabaseKeys.length === 0) {
      issues.push("⚠️ Aucune session Supabase trouvée");
    } else if (supabaseKeys.length > 10) {
      issues.push("⚠️ Trop de sessions Supabase (cache possible)");
    }
    
    // Vérifier les clés de l'app
    const appKeys = Object.keys(localStorage).filter(k => k.includes('aiHelpDesk'));
    if (appKeys.length === 0) {
      issues.push("ℹ️ Aucune donnée app trouvée (première visite?)");
    }
    
    if (issues.length === 0) {
      issues.push("✅ Cache semble normal");
    }
    
  } catch (error) {
    issues.push(`❌ Erreur diagnostic: ${error}`);
  }
  
  return issues;
};
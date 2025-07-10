export const diagnoseVercelIssues = async () => {
  console.log('🔍 Diagnostic Vercel - Début');
  console.log('📍 URL actuelle:', window.location.href);
  console.log('🌐 Environnement:', import.meta.env.MODE || 'development');
  
  const locales = ['en', 'fr', 'ar'];
  const paths = [
    '/locales/',           // Chemin direct depuis la racine
    '/public/locales/',    // Chemin avec /public/
    './locales/',          // Chemin relatif
    './public/locales/',   // Chemin relatif avec /public/
  ];
  
  // Test de base - vérifier si on peut accéder à des fichiers publics
  console.log('\n🧪 Test d\'accès aux fichiers publics:');
  try {
    const faviconTest = await fetch('/favicon.ico');
    console.log(`  favicon.ico: ${faviconTest.status} ✅`);
  } catch (error) {
    // ✅ CORRECTION: Typage correct de l'erreur
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  favicon.ico: ❌ ${errorMessage}`);
  }

  console.log('\n📁 Test des chemins de traduction:');
  
  for (const locale of locales) {
    console.log(`\n🏷️  Langue: ${locale}`);
    
    for (const basePath of paths) {
      const fullPath = `${basePath}${locale}.json`;
      try {
        const start = performance.now();
        
        const response = await fetch(fullPath, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        const end = performance.now();
        const duration = Math.round(end - start);
        
        if (response.ok) {
          try {
            const data = await response.json();
            const keyCount = Object.keys(data).length;
            console.log(`  ✅ ${fullPath}: ${response.status} (${duration}ms) - ${keyCount} clés`);
            
            // Afficher quelques clés pour vérification
            const sampleKeys = Object.keys(data).slice(0, 3);
            console.log(`     📋 Exemples: ${sampleKeys.join(', ')}`);
          } catch (jsonError) {
            console.log(`  ⚠️  ${fullPath}: ${response.status} (${duration}ms) - JSON invalide`);
          }
        } else {
          console.log(`  ❌ ${fullPath}: ${response.status} ${response.statusText} (${duration}ms)`);
          
          // Logs supplémentaires pour les erreurs
          if (response.status === 404) {
            console.log(`     🔍 Fichier non trouvé - vérifier l'emplacement`);
          } else if (response.status === 403) {
            console.log(`     🚫 Accès refusé - vérifier les permissions`);
          }
        }
      } catch (error) {
        // ✅ CORRECTION: Typage correct de l'erreur
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  💥 ${fullPath}: Erreur réseau - ${errorMessage}`);
      }
    }
  }

  // Test de structure des dossiers
  console.log('\n📂 Test de structure:');
  const testPaths = [
    '/public/',
    '/locales/',
    '/public/locales/',
    '/assets/',
  ];
  
  for (const testPath of testPaths) {
    try {
      const response = await fetch(testPath);
      console.log(`  ${testPath}: ${response.status} ${response.statusText}`);
    } catch (error) {
      // ✅ CORRECTION: Typage correct de l'erreur
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ${testPath}: ❌ ${errorMessage}`);
    }
  }

  console.log('\n🏁 Diagnostic terminé');
};

// Fonction pour tester un chemin spécifique
export const testSpecificPath = async (path: string) => {
  console.log(`🎯 Test spécifique: ${path}`);
  try {
    const response = await fetch(path);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const text = await response.text();
      console.log(`Contenu (${text.length} caractères):`, text.substring(0, 200) + '...');
    }
  } catch (error) {
    // ✅ CORRECTION: Typage correct de l'erreur
    console.error(`Erreur:`, error instanceof Error ? error.message : String(error));
  }
};

// Appeler en développement ET en production pour debugging
if (typeof window !== 'undefined') {
  // Délai pour laisser l'app se charger
  setTimeout(() => {
    diagnoseVercelIssues();
  }, 1000);
}
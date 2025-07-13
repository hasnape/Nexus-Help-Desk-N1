export const diagnoseVercelIssues = async () => {
  console.log('🔍 Diagnostic Vercel - Début');
  console.log('📍 URL actuelle:', window.location.href);
  console.log('🌐 Environnement:', import.meta.env.MODE || 'development');
  

  // Test de base - vérifier si on peut accéder à des fichiers publics
  console.log('\n🧪 Test d\'accès aux fichiers publics:');
  try {
    const faviconTest = await fetch('/favicon.ico');
    console.log(`  favicon.ico: ${faviconTest.status} ✅`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  favicon.ico: ❌ ${errorMessage}`);
  }


  // Test de structure des dossiers
  console.log('\n📂 Test de structure:');
  const testPaths = [
    '/public/',
    '/assets/',
  ];
  for (const testPath of testPaths) {
    try {
      const response = await fetch(testPath);
      console.log(`  ${testPath}: ${response.status} ${response.statusText}`);
    } catch (error) {
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
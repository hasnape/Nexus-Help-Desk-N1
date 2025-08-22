import { createClient } from '@supabase/supabase-js';

// 1. Lire les variables d'environnement.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // <-- C'est la ligne qui manquait.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Vérifier que les clés ont bien été chargées.
// Si ce n'est pas le cas, l'application s'arrêtera avec une erreur claire.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL ou clé anonyme manquante. Vérifiez votre fichier .env et assurez-vous que les noms commencent par 'VITE_'.");
}

// 3. Créer et exporter le client Supabase.
// C'est cet objet 'supabase' qui sera utilisé dans toute votre application.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 4. (Optionnel) Exporter une variable pour confirmer la connexion.
export const isSupabaseConnected = true;
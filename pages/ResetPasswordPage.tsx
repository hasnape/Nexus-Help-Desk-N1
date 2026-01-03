import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient"; 
import { useNavigate } from "react-router-dom";
import { Button } from "../components/FormElements"; 
import { useLanguage } from "../contexts/LanguageContext";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // État de validation en temps réel pour l'interface
  const requirements = {
    length: password.length >= 8,
    case: /[A-Z]/.test(password) && /[a-z]/.test(password),
    numberAndSymbol: /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  useEffect(() => {
    /**
     * Vérification de la session au chargement.
     * Le lien de récupération crée une session temporaire via le token dans l'URL.
     */
    const checkInitialSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError("Session invalide ou expirée. Veuillez redemander un lien de récupération.");
      } else {
        setError(null);
      }
    };
    
    checkInitialSession();

    // Écouteur pour capturer les changements d'état (utile si le hash met du temps à être parsé)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setError(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validation de la force du mot de passe
    if (!requirements.length || !requirements.case || !requirements.numberAndSymbol) {
      setError("Le mot de passe ne respecte pas les critères de sécurité requis.");
      return;
    }

    // 2. Vérification de la correspondance
    if (password !== confirmPassword) {
      setError("Les mots de passe saisis ne sont pas identiques.");
      return;
    }

    setLoading(true);
    
    // Mise à jour du mot de passe dans Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate("/login");
      }, 3500);
    }
  };

  return (
    <div className="page-container flex justify-center items-center min-h-screen bg-slate-900 px-4">
      <div className="surface-card p-8 w-full max-w-md space-y-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Réinitialisation</h1>
          <p className="text-slate-400 text-sm mt-2">Définissez votre nouveau mot de passe</p>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-center text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Affichage du succès */}
        {success ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-center text-sm text-emerald-200 animate-pulse font-medium">
            ✅ Mot de passe mis à jour avec succès ! <br />
            Redirection vers la connexion...
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white ml-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded bg-white text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Confirmation */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white ml-1">
                Confirmez le mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 rounded bg-white text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Liste visuelle des critères */}
            <div className="text-[11px] text-slate-300 bg-slate-700/50 p-4 rounded-lg leading-relaxed border border-slate-600 shadow-inner">
              <p className="font-semibold mb-2 text-indigo-300 uppercase tracking-wider text-[10px]">Critères obligatoires :</p>
              <ul className="space-y-2 ml-1">
                <li className={`flex items-center transition-colors ${requirements.length ? 'text-emerald-400' : 'text-slate-400'}`}>
                   <span className="mr-2 text-sm font-bold">{requirements.length ? '✓' : '○'}</span>
                   Au moins 8 caractères
                </li>
                <li className={`flex items-center transition-colors ${requirements.case ? 'text-emerald-400' : 'text-slate-400'}`}>
                   <span className="mr-2 text-sm font-bold">{requirements.case ? '✓' : '○'}</span>
                   Une majuscule et une minuscule
                </li>
                <li className={`flex items-center transition-colors ${requirements.numberAndSymbol ? 'text-emerald-400' : 'text-slate-400'}`}>
                   <span className="mr-2 text-sm font-bold">{requirements.numberAndSymbol ? '✓' : '○'}</span>
                   Un chiffre et un symbole (!@#$...)
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full !mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50" 
              isLoading={loading}
              disabled={loading || !!error}
            >
              Enregistrer le mot de passe
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
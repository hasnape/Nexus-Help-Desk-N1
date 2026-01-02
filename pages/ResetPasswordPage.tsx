import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient"; 
import { useNavigate } from "react-router-dom";
import { Button } from "../components/FormElements"; // On garde le Button personnalisé
import { useLanguage } from "../contexts/LanguageContext";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Vérification de la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Session invalide ou expirée. Veuillez redemander un lien.");
      }
    });
  }, []);

  // Fonction de validation Regex
  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return minLength && hasUpper && hasLower && hasNumber && hasSymbol;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validation de la force du mot de passe
    if (!validatePassword(password)) {
      setError("Le mot de passe ne respecte pas les critères de sécurité.");
      return;
    }

    // 2. Validation de la correspondance
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  return (
    <div className="page-container flex justify-center items-center min-h-screen bg-slate-900">
      <div className="surface-card p-8 w-full max-w-md space-y-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Réinitialisation</h1>
          <p className="text-slate-400 text-sm mt-2">Choisissez votre nouveau mot de passe</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-center text-sm text-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-center text-sm text-emerald-200">
            ✅ Mot de passe mis à jour ! Redirection...
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            {/* Champ 1 */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white">Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded bg-white text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Champ 2 */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white">Confirmez le mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 rounded bg-white text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Instructions de sécurité */}
            <div className="text-[11px] text-slate-300 bg-slate-700/50 p-3 rounded-lg leading-relaxed border border-slate-600">
              <p className="font-semibold mb-1 text-indigo-300">Exigences de sécurité :</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Au moins 8 caractères</li>
                <li>Une majuscule et une minuscule</li>
                <li>Un chiffre et un caractère spécial (!@#$...)</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full !mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg" 
              isLoading={loading}
              disabled={loading || (!!error && error.includes("expirée"))}
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
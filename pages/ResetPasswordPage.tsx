import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient"; // ✅ Chemin corrigé pour votre projet
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../components/FormElements";
import { useLanguage } from "../contexts/LanguageContext";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ Ajout confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Vérifier si une session existe (le lien de mail connecte l'utilisateur temporairement)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Session invalide ou expirée. Veuillez redemander un lien.");
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

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
      }, 6000);
    }
  };

  return (
    <div className="page-container flex justify-center items-center min-h-screen">
      <div className="surface-card p-8 w-full max-w-md space-y-6">
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
            ✅ Mot de passe mis à jour ! Redirection vers la connexion...
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              type="password"
              label="Nouveau mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-slate-900"
            />
            <Input
              type="password"
              label="Confirmez le mot de passe"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="text-slate-900"
            />
            <Button 
              type="submit" 
              className="w-full !mt-6" 
              isLoading={loading}
              disabled={loading || !!error && error.includes("expirée")}
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
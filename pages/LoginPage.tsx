import React, { useState, useEffect } from "react";
// import supprimé : plus de gestion multilingue
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input } from "../components/FormElements";
// ...existing code...
import LoadingSpinner from "../components/LoadingSpinner";
import Logo from "../components/Logo";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  // Suppression de la logique i18n

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "" || password === "" || companyName.trim() === "") {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    setError("");
    const loginResult = await login(email.trim(), password, companyName.trim());

    setIsLoading(false);
    if (loginResult !== true) {
      setError(loginResult);
    }
  };

  // Suppression du menu de langue et de la logique associée

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      aria-label="Page de connexion"
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-2">
            <Logo size="xl" showText={false} />
          </div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold text-gray-900"
            aria-label="Titre de la page de connexion"
          >
            Connexion à Nexus Help Desk
          </h2>
          <p
            className="mt-2 text-center text-sm text-gray-600"
            aria-label="Accédez à votre espace support client."
          >
            Accédez à votre espace support client.
          </p>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          aria-label="Formulaire de connexion"
        >
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="sr-only"
                aria-label="Adresse e-mail"
              >
                Adresse e-mail
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail"
                aria-label="Adresse e-mail"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="sr-only"
                aria-label="Mot de passe"
              >
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                aria-label="Mot de passe"
              />
            </div>

            {/* Nom de l'entreprise */}
            <div>
              <label
                htmlFor="companyName"
                className="sr-only"
                aria-label="Nom de l'entreprise"
              >
                Nom de l'entreprise
              </label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                autoComplete="organization"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nom de votre entreprise"
                aria-label="Nom de l'entreprise"
              />
            </div>
          </div>

          {error && (
            <div
              className="rounded-md bg-red-50 p-4"
              aria-live="polite"
              aria-label="Erreur de connexion"
            >
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              variant="primary"
              size="lg"
              aria-label="Bouton de connexion"
              tabIndex={0}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                "Se connecter"
              )}
            </Button>
          </div>

          <div className="text-center">
            <p
              className="text-sm text-gray-600"
              aria-label="Lien vers l'inscription"
            >
              Pas de compte ?
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
                aria-label="S'inscrire"
                tabIndex={0}
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
    // ...
  );
};

export default LoginPage;

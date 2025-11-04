import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input } from "../components/FormElements";
import { useLanguage } from "../contexts/LanguageContext";
import Layout from "../components/Layout";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { login, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setError(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "" || password === "" || companyName.trim() === "") {
      showErrorToast(t("login.error.allFieldsRequired"));
      return;
    }

    setIsLoading(true);
    setError("");
    const loginResult = await login(email.trim(), password, companyName.trim());

    setIsLoading(false);
    if (loginResult !== true) {
      showErrorToast(loginResult);
    } else {
      setToastMessage(null);
    }
  };

  return (
    <Layout>
      {toastMessage && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div
            className="pointer-events-auto rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
            role="alert"
          >
            {toastMessage}
          </div>
        </div>
      )}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-6">
            {/* Ajouter votre logo ici */}
            <div className="flex justify-center items-center mb-4">
              <img
                src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
                alt="Nexus Support Hub Logo"
                className="w-16 h-16 rounded-full object-cover mr-3"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = "block";
                  }
                }}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-primary"
                style={{ display: "none" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-textPrimary">
              {t("login.title")}
            </h1>
            <p className="text-textSecondary mt-1">
              {t("login.subtitleSimple")}
            </p>
          </div>

          <div className="mb-6 text-sm bg-primary/5 border border-primary/20 text-slate-700 p-4 rounded-lg text-center">
            <p>{t("login.appDescription")}</p>
          </div>

          {error && (
            <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t("login.emailLabel")}
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPlaceholder")}
              autoFocus
              required
              disabled={isLoading}
            />
            <Input
              label={t("login.passwordLabel")}
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.passwordPlaceholder")}
              required
              disabled={isLoading}
            />
            <Input
              label={t("login.companyNameLabel", { default: "Company Name" })}
              id="companyName"
              type="text"
              name="companyName"
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t("login.companyNamePlaceholder", {
                default: "Enter your company's name",
              })}
              required
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="w-full !mt-8"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t("login.signInButton")}
            </Button>
          </form>
          <p className="mt-6 text-sm text-center text-slate-500">
            {t("login.noAccount")}{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary-dark"
            >
              {t("login.signUpLink")}
            </Link>
          </p>

          {/* Le "Back" style signUpPage */}
          <div className="mt-6 text-sm text-center text-slate-500 space-y-2">
            <p>
              <Link
                to="/landing"
                className="inline-flex items-center font-medium text-slate-600 hover:text-primary-dark"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 me-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("login.backToLanding", { default: "Back to Plans" })}
              </Link>
            </p>
          </div>

          {/* Le paragraphe avec la note démo */}
          <p className="mt-4 text-xs text-center text-slate-400">
            {t("login.demoNotes.supabase.production")}
          </p>

          {/* Footer legal */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <Link

                         to="/legal"
              className="text-xs text-slate-500 hover:text-primary hover:underline"
            >
              {t("footer.legalLink", { default: "Legal & Documentation" })}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;

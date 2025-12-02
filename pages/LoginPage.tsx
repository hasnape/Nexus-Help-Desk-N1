import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input } from "../components/FormElements";
import { useLanguage } from "../contexts/LanguageContext";
import { sendResetPassword } from "../services/authService";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { login, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

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
    setInfoMessage("");
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
      setInfoMessage("");
    }
  };

  const handlePasswordReset = async () => {
    const trimmedEmail = email.trim();
    if (trimmedEmail === "") {
      showErrorToast(t("login.error.emailRequiredForReset", { default: "Veuillez saisir votre email pour réinitialiser." }));
      return;
    }

    setIsSendingReset(true);
    setError("");
    setInfoMessage("");
    try {
      await sendResetPassword(trimmedEmail);
      setInfoMessage(
        t("login.resetPasswordSuccess", {
          default: "Un email de réinitialisation a été envoyé si cette adresse existe dans notre système.",
        })
      );
    } catch (resetError: any) {
      const readableError =
        resetError?.message ||
        t("login.resetPasswordError", {
          default: "Impossible d'envoyer l'email de réinitialisation. Veuillez réessayer.",
        });
      showErrorToast(readableError);
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <>
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
      <div className="page-container section-stack">
        <div className="flex justify-center">
          <div className="surface-card p-6 sm:p-8 w-full max-w-2xl space-y-8">
            <div className="text-center space-y-3">
              <div className="flex justify-center items-center gap-3">
                <img
                  src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
                  alt="Nexus Support Hub Logo"
                  className="w-14 h-14 rounded-full object-cover"
                  loading="lazy"
                  width={56}
                  height={56}
                />
                <div className="text-left">
                  <p className="text-xs uppercase tracking-wide text-slate-300">{t("appName")}</p>
                  <h1 className="text-3xl font-bold text-white">{t("login.title")}</h1>
                </div>
              </div>
              <p className="section-subtitle">{t("login.subtitleSimple")}</p>
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-slate-200">
                <p>{t("login.appDescription")}</p>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-center text-sm text-red-100">
                {error}
              </p>
            )}
            {infoMessage && (
              <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-sm text-emerald-100">
                {infoMessage}
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
                className="text-slate-900 placeholder:text-slate-500"
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
                className="text-slate-900 placeholder:text-slate-500"
              />
              <Input
                label={t("login.companyNameLabel", { defaultValue: "Company Name" })}
                id="companyName"
                type="text"
                name="companyName"
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t("login.companyNamePlaceholder", {
                  defaultValue: "Enter your company's name",
                })}
                required
                disabled={isLoading}
                className="text-slate-900 placeholder:text-slate-500"
              />
              <div
                className={`surface-card-soft px-4 py-3 text-xs text-slate-200 ${
                  language === "ar" ? "text-right" : ""
                }`}
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                <p className="font-semibold text-white mb-1">{t("auth.roles.title")}</p>
                <ul className={`space-y-1 ${language === "ar" ? "pr-3" : "pl-4"} list-disc`}>
                  <li>{t("auth.roles.user")}</li>
                  <li>{t("auth.roles.agent")}</li>
                  <li>{t("auth.roles.manager")}</li>
                </ul>
                <p className="mt-2 text-[11px] text-slate-300">{t("login.laiTurnerNote")}</p>
              </div>
              <div className={`${language === "ar" ? "text-left" : "text-right"} -mt-1`}>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm font-medium text-indigo-200 hover:text-white disabled:opacity-50"
                  disabled={isLoading || isSendingReset}
                >
                  {t("login.forgotPasswordLink", { defaultValue: "Mot de passe oublié ?" })}
                </button>
              </div>
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

            <section
              className={`surface-card-soft mt-6 rounded-2xl p-4 text-left ${language === "ar" ? "text-right" : ""}`}
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              <h2 className="text-sm font-semibold text-white mb-2">{t("roleHelp.title")}</h2>
              <p className="text-xs text-slate-200 mb-4">{t("roleHelp.subtitle")}</p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">{t("roleHelp.manager.title")}</h3>
                  <p className="text-xs text-slate-300">{t("roleHelp.manager.description")}</p>
                  <h4 className="text-xs font-semibold text-white mt-2">{t("roleHelp.manager.loginTitle")}</h4>
                  <ul
                    className={`list-disc space-y-1 text-xs text-slate-200 ${language === "ar" ? "pr-4" : "pl-4"}`}
                  >
                    <li>{t("roleHelp.manager.loginStep1")}</li>
                    <li>{t("roleHelp.manager.loginStep2")}</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">{t("roleHelp.agent.title")}</h3>
                  <p className="text-xs text-slate-300">{t("roleHelp.agent.description")}</p>
                  <h4 className="text-xs font-semibold text-white mt-2">{t("roleHelp.agent.loginTitle")}</h4>
                  <ul
                    className={`list-disc space-y-1 text-xs text-slate-200 ${language === "ar" ? "pr-4" : "pl-4"}`}
                  >
                    <li>{t("roleHelp.agent.loginStep1")}</li>
                    <li>{t("roleHelp.agent.loginStep2")}</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">{t("roleHelp.user.title")}</h3>
                  <p className="text-xs text-slate-300">{t("roleHelp.user.description")}</p>
                  <h4 className="text-xs font-semibold text-white mt-2">{t("roleHelp.user.loginTitle")}</h4>
                  <ul
                    className={`list-disc space-y-1 text-xs text-slate-200 ${language === "ar" ? "pr-4" : "pl-4"}`}
                  >
                    <li>{t("roleHelp.user.loginStep1")}</li>
                    <li>{t("roleHelp.user.loginStep2")}</li>
                  </ul>
                </div>
              </div>
            </section>

            <p className="text-sm text-center text-slate-300">
              {t("login.noAccount")} {" "}
              <Link to="/signup" className="font-medium text-indigo-200 hover:text-white">
                {t("login.signUpLink")}
              </Link>
            </p>

            <div className="text-sm text-center text-slate-400 space-y-2">
              <p>
                <Link to="/landing" className="inline-flex items-center font-medium text-indigo-200 hover:text-white">
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
                  {t("login.backToLanding", { defaultValue: "Back to Plans" })}
                </Link>
              </p>
            </div>

            <p className="text-xs text-center text-slate-500">{t("login.demoNotes.supabase.production")}</p>

            <div className="pt-4 border-t border-slate-800 text-center">
              <Link to="/legal" className="text-xs text-slate-400 hover:text-white hover:underline">
                {t("footer.legalLink", { defaultValue: "Legal & Documentation" })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

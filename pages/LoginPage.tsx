import React, { useState, useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input, Select } from "../components/FormElements";
import { UserRole } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(["auth", "common", "login"]);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "" || password === "" || companyName.trim() === "") {
      setError(t("login.validation.allFieldsRequired"));
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

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const languageOptions = [
    { value: "fr", label: t("language.french", { ns: "common" }) },
    { value: "en", label: t("language.english", { ns: "common" }) },
    { value: "ar", label: t("language.arabic", { ns: "common" }) },
  ];

  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t("login.title")}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t("login.subtitle")}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("login.language.label")}
                </label>
                <Select
                  value={i18n.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  options={languageOptions}
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="sr-only">
                  {t("login.form.email")}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.form.emailPlaceholder")}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="sr-only">
                  {t("login.form.password")}
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.form.passwordPlaceholder")}
                />
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="sr-only">
                  {t("login.form.companyName")}
                </label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t("login.form.companyNamePlaceholder")}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center"
                variant="primary"
                size="lg"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" text={false} />
                ) : (
                  t("login.form.loginButton")
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t("login.actions.noAccount")}{" "}
                <Link
                  to="/signup"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t("login.actions.signUp")}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Suspense>
  );
};

export default LoginPage;

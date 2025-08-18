import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input, Select } from "../components/FormElements";
import { useLanguage, Locale } from "../contexts/LanguageContext";
import { UserRole } from "../types";

const NewUserPage: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [language, setLanguage] = useState<Locale>("en");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "fr", label: "French" },
    { value: "ar", label: "Arabic" },
  ];

  useEffect(() => {
    if (!user || user.role !== UserRole.MANAGER) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      setError(t("newUser.error.requiredFields", { default: "Email and full name are required" }));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/inviteUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          full_name: fullName.trim(),
          role,
          language,
          company_id: user?.company_id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to invite user");

      navigate("/manager/dashboard");
    } catch (err: any) {
      setError(t("newUser.error.inviteFailed", { default: `Failed to invite user: ${err.message}` }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface p-6 sm:p-8 rounded-xl shadow-xl">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-textPrimary">
          {t("newUser.title", { default: "Invite New User" })}
        </h1>
        <p className="text-sm text-textSecondary mt-1">
          {t("newUser.subtitle", { default: "Invite a new user to your company" })}
        </p>
      </div>

      {error && (
        <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md text-sm">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={t("newUser.emailLabel", { default: "Email" })}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newUser.emailPlaceholder", { default: "Enter user's email" })}
          required
          disabled={isLoading}
        />
        <Input
          label={t("newUser.fullNameLabel", { default: "Full Name" })}
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t("newUser.fullNamePlaceholder", { default: "Enter user's full name" })}
          required
          disabled={isLoading}
        />
        <Select
          label={t("newUser.roleLabel", { default: "Role" })}
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { value: UserRole.USER, label: t("role.user", { default: "User" }) },
            { value: UserRole.AGENT, label: t("role.agent", { default: "Agent" }) },
          ]}
          required
          disabled={isLoading}
        />
        <Select
          label={t("newUser.languageLabel", { default: "Language Preference" })}
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Locale)}
          options={languageOptions.map((opt) => ({
            ...opt,
            label: t(`language.${opt.value}`, { default: opt.label }),
          }))}
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
          {t("newUser.inviteButton", { default: "Send Invitation" })}
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-slate-500">
        <Link
          to="/manager/dashboard"
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
          {t("newUser.backToDashboard", { default: "Back to Dashboard" })}
        </Link>
      </p>
    </div>
  );
};

export default NewUserPage;

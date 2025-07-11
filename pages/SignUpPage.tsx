import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input, Select } from "../components/FormElements";
import { UserRole, Plan } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import FreemiumPlanIcon from "../components/plan_images/FreemiumPlanIcon";
import StandardPlanIcon from "../components/plan_images/StandardPlanIcon";
import ProPlanIcon from "../components/plan_images/ProPlanIcon";
import { useTranslation } from "react-i18next";

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const SignUpPage: React.FC = () => {
  type Locale = "en" | "fr";

  const { t, i18n } = useTranslation(["signup", "pricing"]);
  const selectedLanguage = i18n.language as Locale;

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [companyName, setCompanyName] = useState("");
  const [plan, setPlan] = useState<Plan>("freemium");
  const [activationCode, setActivationCode] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, user, newlyCreatedCompanyName } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (newlyCreatedCompanyName) {
        // This is a new manager, show welcome modal/info
        // For now, just navigate
        navigate("/manager/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate, newlyCreatedCompanyName]);

  const roleOptions = [
    { value: UserRole.USER, label: t("roles.user") },
    { value: UserRole.AGENT, label: t("roles.agent") },
    { value: UserRole.MANAGER, label: t("roles.manager") },
  ];

  const pricingTiers = [
    {
      nameKey: "pricing.freemium.name",
      planValue: "freemium" as Plan,
      icon: <FreemiumPlanIcon className="w-8 h-8 text-slate-400" />,
      priceKey: "pricing.freemium.price",
      features: [
        "pricing.freemium.feature1",
        "pricing.freemium.feature2",
        "pricing.freemium.feature3",
      ],
    },
    {
      nameKey: "pricing.standard.name",
      planValue: "standard" as Plan,
      icon: <StandardPlanIcon className="w-8 h-8 text-primary" />,
      priceKey: "pricing.standard.price",
      features: [
        "pricing.standard.feature1",
        "pricing.standard.feature2",
        "pricing.standard.feature3",
        "pricing.standard.feature4",
      ],
    },
    {
      nameKey: "pricing.pro.name",
      planValue: "pro" as Plan,
      icon: <ProPlanIcon className="w-8 h-8 text-amber-500" />,
      priceKey: "pricing.pro.price",
      features: [
        "pricing.pro.feature1",
        "pricing.pro.feature2",
        "pricing.pro.feature3",
        "pricing.pro.feature4",
      ],
    },
  ];

  const validateDetails = (): boolean => {
    if (
      !email.trim() ||
      !fullName.trim() ||
      !password ||
      !confirmPassword ||
      !companyName.trim()
    ) {
      setError(t("error.allFieldsRequired"));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t("error.passwordsDoNotMatch"));
      return false;
    }
    if (password.length < 6) {
      setError(t("error.minCharsPassword"));
      return false;
    }
    if (
      role === UserRole.MANAGER &&
      (plan === "standard" || plan === "pro") &&
      !activationCode.trim()
    ) {
      setError(t("error.activationCodeRequired"));
      return false;
    }
    setError("");
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;

    if (role === UserRole.MANAGER) {
      if (plan === "standard" && activationCode.trim() !== "12345") {
        setError(t("error.invalidActivationCodeStandard"));
        return;
      }
      if (plan === "pro" && activationCode.trim() !== "123456") {
        setError(t("error.invalidActivationCodePro"));
        return;
      }
    }

    setIsLoading(true);
    setError("");

    const result = await signUp(email.trim(), fullName.trim(), password, {
      lang: selectedLanguage,
      role: role,
      companyName: companyName.trim(),
      plan: role === UserRole.MANAGER ? plan : undefined,
    });

    setIsLoading(false);

    if (result !== true) {
      setError(result);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <div className="bg-surface p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
          <LoadingSpinner size="lg" text={t("finalizing")} />
          <p className="mt-4 text-slate-500">{t("finalizingSubtitle")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 py-8 px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl">
        <>
          <div className="text-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-primary mb-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.5A5.625 5.625 0 0 1 15.75 21H8.25A5.625 5.625 0 0 1 2.25 15.375V8.625c0-1.062.31-2.073.856-2.922m1.025-.975A3.75 3.75 0 0 0 6 5.25v1.5c0 .621.504 1.125 1.125 1.125H9"
              />
            </svg>
            <h1 className="text-3xl font-bold text-textPrimary">
              {t("title")}
            </h1>
            <p className="text-textSecondary mt-1">{t("subtitle")}</p>
          </div>

          {error && (
            <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md">
              {error}
            </p>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t("emailLabel")}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label={t("fullNameLabel")}
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label={t("passwordLabel")}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label={t("confirmPasswordLabel")}
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Select
              label={t("roleLabel")}
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={roleOptions}
              required
            />

            <div>
              <Input
                label={
                  role === UserRole.MANAGER
                    ? t("companyNameLabel")
                    : t("existingCompanyNameLabel")
                }
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={
                  role === UserRole.MANAGER
                    ? t("companyNamePlaceholder")
                    : t("existingCompanyNamePlaceholder")
                }
                required
              />
              <p className="mt-1 text-xs text-slate-500 px-1">
                {role === UserRole.MANAGER
                  ? t("companyNameHelp.manager")
                  : t("companyNameHelp.employee")}
              </p>
            </div>

            {role === UserRole.MANAGER && (
              <div className="space-y-4 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("planLabel")}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.nameKey}
                      onClick={() => setPlan(tier.planValue)}
                      className={`cursor-pointer border rounded-xl p-4 flex flex-col text-center transition-all duration-200 bg-white ${
                        plan === tier.planValue
                          ? "border-primary ring-2 ring-primary ring-offset-2 shadow-lg"
                          : "border-slate-200 hover:border-primary/70 hover:shadow-md"
                      }`}
                    >
                      <div className="mx-auto mb-3">{tier.icon}</div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {t(tier.nameKey)}
                      </h3>
                      <div className="my-2">
                        <span className="text-3xl font-bold">
                          {t(tier.priceKey)}
                        </span>
                        <span className="text-slate-500 ms-1 text-sm">
                          {tier.planValue !== "freemium"
                            ? t("pricing.perAgentPerMonth")
                            : ""}
                        </span>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-slate-600 text-left flex-grow">
                        {tier.features.map((featureKey) => (
                          <li key={featureKey} className="flex items-start">
                            <CheckIcon className="w-4 h-4 text-green-500 me-2 mt-0.5 flex-shrink-0" />
                            <span>{t(featureKey)}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setPlan(tier.planValue)}
                        className="mt-4 font-semibold rounded-md px-6 py-2 text-base bg-primary text-white w-full"
                      >
                        {t("signup.selectButton", { default: "Commencer" })}
                      </button>
                      {/* PayPal et info activation uniquement pour les plans payants */}
                      {["standard", "pro"].includes(tier.planValue) && (
                        <>
                          <a
                            href={
                              tier.planValue === "standard"
                                ? "https://www.paypal.com/biz/fund?id=nexushelpdeskpro"
                                : "https://www.paypal.com/biz/fund?id=nexushelpdeskpremium"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block"
                          >
                            <button className="w-full py-2 px-4 rounded-lg font-semibold text-base bg-yellow-400 text-white">
                              {t("signup.payButton", {
                                default: "Payer avec PayPal",
                              })}
                            </button>
                          </a>
                          <p className="mt-2 text-xs text-slate-600">
                            {t(
                              "signup.activationInfo",
                              "Une fois le paiement confirmé, vous recevrez votre clé d’activation par email."
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {/* Activation code: une seule fois après sélection du plan */}
                {["standard", "pro"].includes(plan) && (
                  <div className="mt-4 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <Input
                      label={t("signup.activationCodeLabel", {
                        default: "Activation Code",
                      })}
                      id="activationCode"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder={t("signup.activationCodePlaceholder", {
                        default: "Enter code from support",
                      })}
                      required
                    />
                    <p className="text-xs text-slate-600">
                      {t("signup.activationCodeHelp.prefix", {
                        default: "You need a code to sign up for a paid plan.",
                      })}
                      <a
                        href={`mailto:hubnexusinfo@gmail.com?subject=${encodeURIComponent(
                          `Request for Activation Code - ${
                            plan.charAt(0).toUpperCase() + plan.slice(1)
                          } Plan`
                        )}&body=${encodeURIComponent(
                          `Hello,\n\nOur company, [YOUR COMPANY NAME HERE], would like to sign up for the ${plan} plan. Please provide us with an activation code.\n\nThank you.`
                        )}`}
                        className="ms-1 text-primary hover:underline font-semibold"
                      >
                        {t("signup.activationCodeHelp.link", {
                          default: "Request one via email.",
                        })}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full py-3 rounded-md text-lg font-semibold bg-primary text-white transition-all duration-200 hover:bg-primary/90"
              >
                {t("signup.submitButton", { default: "Créer mon compte" })}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {t("signup.alreadyHaveAccount", {
                default: "Already have an account?",
              })}{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                {t("signup.loginLink", { default: "Log in" })}
              </Link>
            </p>
          </div>
        </>
      </div>
    </div>
  );
};

export default SignUpPage;

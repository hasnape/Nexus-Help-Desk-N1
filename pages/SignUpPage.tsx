import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input, Select } from "../components/FormElements";
import { useLanguage, Locale } from "../contexts/LanguageContext";
import { UserRole, Plan } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import FreemiumPlanIcon from "../components/plan_images/FreemiumPlanIcon";
import StandardPlanIcon from "../components/plan_images/StandardPlanIcon";
import ProPlanIcon from "../components/plan_images/ProPlanIcon";

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
  // Form State
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>("en");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [companyName, setCompanyName] = useState("");
  const [plan, setPlan] = useState<Plan>("freemium");
  const [activationCode, setActivationCode] = useState("");

  // Logic State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, user } = useApp();
  const { t, language: currentAppLang } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setSelectedLanguage(currentAppLang);
  }, [currentAppLang]);

  const handlePayPalPayment = () => {
    // 🔥 URL PayPal pour Standard 5€
    const paypalUrl =
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0E515487AE797135CNBTRYKA";
    window.open(paypalUrl, "_blank");
  };

  const handlePayPalProPayment = () => {
    // 🔥 URL PayPal pour Pro 12€
    const paypalProUrl =
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-7HP75881LB3608938NBTBGUA";
    window.open(paypalProUrl, "_blank");
  };

  const roleOptions = [
    { value: UserRole.USER, label: t("userRole.user") },
    { value: UserRole.AGENT, label: t("userRole.agent") },
    { value: UserRole.MANAGER, label: t("userRole.manager") },
  ];

  const pricingTiers = [
    {
      nameKey: "pricing.freemium.name",
      planValue: "freemium" as Plan,
      icon: <FreemiumPlanIcon className="w-8 h-8 text-slate-400" />,
      priceKey: "pricing.freemium.price",
      features: [
        "Jusqu'à 3 agents inclus",
        "200 tickets par mois maximum",
        "Chat IA avec création de tickets",
        "Tableaux de bord de base",
        "Support par email",
      ],
    },
    {
      nameKey: "pricing.standard.name",
      planValue: "standard" as Plan,
      icon: <StandardPlanIcon className="w-8 h-8 text-primary" />,
      priceKey: "pricing.standard.price",
      features: [
        "Agents illimités",
        "Tickets illimités",
        "Chat IA avec historique complet",
        "Gestion avancée des tickets",
        "Support prioritaire",
        "Assignation d'agents",
        "Notes internes",
      ],
    },
    {
      nameKey: "pricing.pro.name",
      planValue: "pro" as Plan,
      icon: <ProPlanIcon className="w-8 h-8 text-amber-500" />,
      priceKey: "pricing.pro.price",
      features: [
        "Toutes les fonctionnalités Standard",
        "Commandes vocales (navigateurs compatibles)",
        "Planification de rendez-vous",
        "Rapports détaillés",
        "Support prioritaire 24/7",
        "Intégrations personnalisées",
        "Gestion des postes de travail",
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
      setError(t("signup.error.allFieldsRequired"));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t("signup.error.passwordsDoNotMatch"));
      return false;
    }
    if (password.length < 6) {
      setError(t("signup.error.minCharsPassword"));
      return false;
    }
    if (
      role === UserRole.MANAGER &&
      plan !== "freemium" &&
      !activationCode.trim()
    ) {
      setError(
        t("signup.error.activationCodeRequired", {
          default: "Activation code is required for Standard and Pro plans.",
        })
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;

    // Client-side activation code check for demo purposes
    if (role === UserRole.MANAGER) {
      if (
        plan === "standard" &&
        activationCode.trim() !== "STANDARD_SECRET_CODE"
      ) {
        setError(
          t("signup.error.invalidActivationCode", {
            default: "The activation code is not valid for the Standard plan.",
          })
        );
        return;
      }
      if (plan === "pro" && activationCode.trim() !== "PRO_SECRET_CODE") {
        setError(
          t("signup.error.invalidActivationCode", {
            default: "The activation code is not valid for the Pro plan.",
          })
        );
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
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center border border-gray-200">
          <LoadingSpinner
            size="lg"
            text={t("signup.finalizing", {
              default: "Finalizing your account...",
            })}
          />
          <p className="mt-4 text-gray-600">
            {t("signup.finalizingSubtitle", {
              default: "Please wait, you will be redirected shortly.",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8 px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-200">
        <>
          <div className="text-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-blue-600 mb-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.5A5.625 5.625 0 0 1 15.75 21H8.25A5.625 5.625 0 0 1 2.25 15.375V8.625c0-1.062.31-2.073.856-2.922m1.025-.975A3.75 3.75 0 0 0 6 5.25v1.5c0 .621.504 1.125 1.125 1.125H9"
              />
            </svg>
            <h1 className="text-3xl font-bold text-black">
              {t("signup.title")}
            </h1>
            <p className="text-gray-700 mt-1">{t("signup.subtitle")}</p>
          </div>

          {error && (
            <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md">
              {error}
            </p>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t("signup.emailLabel")}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label={t("signup.fullNameLabel")}
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label={t("signup.passwordLabel")}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label={t("signup.confirmPasswordLabel")}
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Select
              label={t("signup.roleLabel")}
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
                    ? t("signup.companyNameLabel")
                    : t("signup.existingCompanyNameLabel")
                }
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={
                  role === UserRole.MANAGER
                    ? t("signup.companyNamePlaceholder")
                    : t("signup.existingCompanyNamePlaceholder")
                }
                required
              />
              <p className="mt-1 text-xs text-gray-600 px-1">
                {role === UserRole.MANAGER
                  ? t("signup.companyNameHelp.manager")
                  : t("signup.companyNameHelp.employee")}
              </p>
            </div>

            {role === UserRole.MANAGER && (
              <div className="space-y-4 pt-4">
                <label className="block text-sm font-medium text-black mb-2">
                  {t("signup.planLabel", { default: "Subscription Plan" })}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.nameKey}
                      onClick={() => setPlan(tier.planValue)}
                      className={`cursor-pointer border rounded-xl p-4 flex flex-col text-center transition-all duration-200 ${
                        plan === tier.planValue
                          ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2 shadow-lg"
                          : "border-gray-200 hover:border-blue-400 hover:shadow-md"
                      }`}
                    >
                      <div className="mx-auto mb-3">{tier.icon}</div>
                      <h3 className="font-bold text-black text-lg">
                        {t(tier.nameKey)}
                      </h3>
                      <div className="my-2">
                        <span className="text-3xl font-bold text-blue-600">
                          {tier.planValue === "freemium"
                            ? "Gratuit"
                            : tier.planValue === "standard"
                            ? "5€/agent/mois" // 🔥 Était "10€/agent/mois"
                            : "12€/agent/mois"}{" "}
                          // 🔥 Était "20€/agent/mois"
                        </span>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-gray-700 text-left flex-grow">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckIcon className="w-4 h-4 text-green-500 me-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {plan !== "freemium" && (
                  <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Input
                      label="Code d'activation"
                      id="activationCode"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder="Saisissez votre code d'activation"
                      required
                    />

                    {plan === "standard" && (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handlePayPalPayment}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 6.408-7.986 6.408h-2.19c-.524 0-.968.382-1.05.9l-1.120 7.106-.32 2.027a.641.641 0 0 0 .633.74h4.42c.445 0 .823-.324.896-.762l.038-.212.723-4.578.046-.25c.073-.438.45-.762.896-.762h.564c3.60 0 6.418-1.462 7.236-5.69.342-1.77.166-3.24-.676-4.32z" />
                          </svg>
                          🔥 Payer 5€ avec PayPal - Premier mois à prix réduit !
                        </button>
                        <p className="text-xs text-gray-700 text-center">
                          <strong>💰 Offre spéciale :</strong> Premier mois à
                          5€/agent au lieu de 10€
                          <br />
                          Après paiement, vous recevrez votre code d'activation
                          par email sous 24h.
                        </p>
                      </div>
                    )}

                    {plan === "pro" && (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handlePayPalProPayment}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 6.408-7.986 6.408h-2.19c-.524 0-.968.382-1.05.9l-1.120 7.106-.32 2.027a.641.641 0 0 0 .633.74h4.42c.445 0 .823-.324.896-.762l.038-.212.723-4.578.046-.25c.073-.438.45-.762.896-.762h.564c3.60 0 6.418-1.462 7.236-5.69.342-1.77.166-3.24-.676-4.32z" />
                          </svg>
                          🔥 Payer 12€ avec PayPal - Première semaine à prix
                          réduit !
                        </button>
                        <p className="text-xs text-gray-700 text-center">
                          <strong>⚡ Offre flash :</strong> Première semaine à
                          12€/agent au lieu de 20€
                          <br />
                          Après paiement, vous recevrez votre code d'activation
                          par email sous 24h.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full !mt-6"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              {t("signup.signUpButton")}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t("signup.alreadyHaveAccount")}{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {t("signup.signInLink")}
              </Link>
            </p>
            <div className="mt-4 text-center">
              <Link
                to="/landing"
                className="font-bold text-gray-700 hover:text-blue-600 transition-colors text-sm"
              >
                &larr; {t("signup.backToHome", { default: "Back to Home" })}
              </Link>
            </div>
          </div>
          <footer className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} {t("appName")}.{" "}
              {t("footer.allRightsReserved", {
                default: "All Rights Reserved.",
              })}
            </p>
            <p className="mt-1">
              <Link to="/legal" className="hover:text-blue-600 hover:underline">
                {t("footer.legalLink", { default: "Legal & Documentation" })}
              </Link>
              <span className="mx-2 text-gray-400">|</span>
              <Link
                to="/user-manual"
                className="hover:text-blue-600 hover:underline"
              >
                {t("footer.userManualLink", { default: "User Manual" })}
              </Link>
              <span className="mx-2 text-gray-400">|</span>
              <Link
                to="/promotional"
                className="hover:text-blue-600 hover:underline"
              >
                {t("footer.promotionalLink", { default: "Presentation" })}
              </Link>
            </p>
          </footer>
        </>
      </div>
    </div>
  );
};

export default SignUpPage;

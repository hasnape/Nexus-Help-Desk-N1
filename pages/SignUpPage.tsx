import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input, Select } from "../components/FormElements";
import { UserRole, Plan } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import FreemiumPlanIcon from "../components/plan_images/FreemiumPlanIcon";
import StandardPlanIcon from "../components/plan_images/StandardPlanIcon";
import ProPlanIcon from "../components/plan_images/ProPlanIcon";
import Logo from "../components/Logo";
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

  // Récupérer les infos pricing depuis la traduction
  const pricingTiers = [
    {
      nameKey: "pricing.freemium.name",
      planValue: "freemium" as Plan,
      icon: <FreemiumPlanIcon className="w-8 h-8 text-slate-400" />,
      priceKey: "pricing.freemium.price",
      paypalLink: t("pricing.freemium.paypalLink"),
      features: [
        ...((t("pricing.freemium.features", {
          returnObjects: true,
        }) as string[]) ?? []),
      ],
    },
    {
      nameKey: "pricing.standard.name",
      planValue: "standard" as Plan,
      icon: <StandardPlanIcon className="w-8 h-8 text-primary" />,
      priceKey: "pricing.standard.price",
      paypalLink: t("pricing.standard.paypalLink"),
      features: [
        ...((t("pricing.standard.features", {
          returnObjects: true,
        }) as string[]) ?? []),
      ],
    },
    {
      nameKey: "pricing.pro.name",
      planValue: "pro" as Plan,
      icon: <ProPlanIcon className="w-8 h-8 text-amber-500" />,
      priceKey: "pricing.pro.price",
      paypalLink: t("pricing.pro.paypalLink"),
      features: [
        ...((t("pricing.pro.features", { returnObjects: true }) as string[]) ??
          []),
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
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 py-8 px-4"
      aria-label={t("signup.pageAria", "Page d'inscription")}
    >
      <div
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl"
        aria-label={t("signup.formAria", "Formulaire d'inscription")}
      >
        <>
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <Logo size="xl" showText={false} />
            </div>
            <h1
              className="text-3xl font-bold text-textPrimary"
              aria-label={t("signup.titleAria", "Titre d'inscription")}
            >
              {t("title")}
            </h1>
            <p
              className="text-textSecondary mt-1"
              aria-label={t("signup.subtitleAria", "Sous-titre d'inscription")}
            >
              {t("subtitle")}
            </p>
          </div>

          {error && (
            <p
              className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md"
              aria-live="polite"
              aria-label={t("signup.errorAria", "Erreur d'inscription")}
            >
              {error}
            </p>
          )}

          <form
            onSubmit={handleSignUp}
            className="space-y-4"
            aria-label={t("signup.formAria", "Formulaire d'inscription")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t("emailLabel")}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label={t("signup.emailAria", "Adresse email")}
              />
              <Input
                label={t("fullNameLabel")}
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                aria-label={t("signup.fullNameAria", "Nom complet")}
              />
              <Input
                label={t("passwordLabel")}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label={t("signup.passwordAria", "Mot de passe")}
              />
              <Input
                label={t("confirmPasswordLabel")}
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-label={t(
                  "signup.confirmPasswordAria",
                  "Confirmation du mot de passe"
                )}
              />
            </div>

            <Select
              label={t("roleLabel")}
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={roleOptions}
              required
              aria-label={t("signup.roleAria", "Rôle utilisateur")}
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
                aria-label={t("signup.companyNameAria", "Nom de la société")}
              />
              <p
                className="mt-1 text-xs text-slate-500 px-1"
                aria-label={t("signup.companyNameHelpAria", "Aide société")}
              >
                {role === UserRole.MANAGER
                  ? t("companyNameHelp.manager")
                  : t("companyNameHelp.employee")}
              </p>
            </div>

            {role === UserRole.MANAGER && (
              <div className="space-y-4 pt-4">
                <label
                  className="block text-sm font-medium text-slate-700 mb-2"
                  aria-label={t("signup.planAria", "Choix du plan")}
                >
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
                      aria-label={t(
                        `signup.planCardAria.${tier.planValue}`,
                        `Carte plan ${tier.planValue}`
                      )}
                      tabIndex={0}
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
                        className="mt-4 font-semibold rounded-md px-6 py-2 text-base bg-primary text-white w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={t(
                          `signup.selectButtonAria.${tier.planValue}`,
                          `Sélectionner le plan ${tier.planValue}`
                        )}
                        tabIndex={0}
                      >
                        {t("signup.selectButton", { default: "Commencer" })}
                      </button>
                      {/* PayPal et info activation uniquement pour les plans payants */}
                      {["standard", "pro"].includes(tier.planValue) &&
                        tier.paypalLink && (
                          <>
                            <a
                              href={tier.paypalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 block"
                              aria-label={t(
                                `signup.paypalAria.${tier.planValue}`,
                                `Payer le plan ${tier.planValue} avec PayPal`
                              )}
                              tabIndex={0}
                            >
                              <button className="w-full py-2 px-4 rounded-lg font-semibold text-base bg-yellow-400 text-white">
                                {t("payButton", {
                                  default: "Payer avec PayPal",
                                })}
                              </button>
                            </a>
                            <p
                              className="mt-2 text-xs text-slate-600"
                              aria-label={t(
                                `signup.activationInfoAria.${tier.planValue}`,
                                `Info activation ${tier.planValue}`
                              )}
                            >
                              {t(
                                "activationInfo",
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
                  <div
                    className="mt-4 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200"
                    aria-label={t(
                      "signup.activationCodeSectionAria",
                      "Section code d'activation"
                    )}
                  >
                    <Input
                      label={t("activationCodeLabel", {
                        default: "Activation Code",
                      })}
                      id="activationCode"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder={t("activationCodePlaceholder", {
                        default: "Enter code from support",
                      })}
                      required
                      aria-label={t(
                        "signup.activationCodeAria",
                        "Code d'activation"
                      )}
                    />
                    <p
                      className="text-xs text-slate-600"
                      aria-label={t(
                        "signup.activationCodeHelpAria",
                        "Aide code d'activation"
                      )}
                    >
                      {t("activationCodeHelp.prefix", {
                        default: `Pour souscrire au plan ${
                          plan === "standard" ? "Standard" : "Pro"
                        }, vous devez obtenir un code d'activation. Après avoir effectué le paiement via PayPal, contactez le support pour recevoir votre code personnalisé.`,
                      })}
                      <a
                        href={`mailto:hubnexusinfo@gmail.com?subject=${encodeURIComponent(
                          `Demande de code d'activation - ${
                            plan === "standard" ? "Standard" : "Pro"
                          }`
                        )}&body=${encodeURIComponent(
                          `Bonjour,\n\nNotre société, [NOM DE VOTRE SOCIÉTÉ], souhaite souscrire au plan ${
                            plan === "standard" ? "Standard" : "Pro"
                          }. Merci de nous transmettre le code d'activation après vérification du paiement.\n\nCordialement.`
                        )}`}
                        className="ms-1 text-primary hover:underline font-semibold"
                        aria-label={t(
                          "signup.activationCodeEmailAria",
                          "Demander le code d'activation par email"
                        )}
                        tabIndex={0}
                      >
                        {t("activationCodeHelp.link", {
                          default: "Demander votre code par email.",
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
                className="w-full py-3 rounded-md text-lg font-semibold bg-primary text-white transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t("signup.submitButtonAria", "Créer mon compte")}
                tabIndex={0}
              >
                {t("submitButton", { default: "Créer mon compte" })}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p
              className="text-sm text-slate-500"
              aria-label={t(
                "signup.alreadyHaveAccountAria",
                "Lien vers la connexion"
              )}
            >
              {t("alreadyHaveAccount", {
                default: "Already have an account?",
              })}{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
                aria-label={t("signup.loginLinkAria", "Se connecter")}
                tabIndex={0}
              >
                {t("loginLink", { default: "Log in" })}
              </Link>
            </p>
          </div>
        </>
      </div>
    </div>
  );
};

export default SignUpPage;

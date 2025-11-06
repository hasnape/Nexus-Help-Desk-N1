import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useApp } from "../App";
import { Button, Input, Select } from "../components/FormElements";
import type { Locale } from "../contexts/LanguageContext";
import { UserRole } from "../types";
import Layout from "../components/Layout";
import { getPricingPlans, type PricingPlan, type PricingPlanKey } from "@/utils/pricing";

const paypalLinks = {
  standard: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0E515487AE797135CNBTRYKA",
  pro: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-7HP75881LB3608938NBTBGUA",
};


const FreemiumModal = ({
  showFreemiumModal,
  setShowFreemiumModal,
  handleFreemiumPurchase,
  plan,
  t,
}: {
  showFreemiumModal: boolean;
  setShowFreemiumModal: (show: boolean) => void;
  handleFreemiumPurchase: () => void;
  plan: PricingPlan;
  t: (key: string, options?: { [key: string]: any }) => string;
}) => {
  if (!showFreemiumModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("signupPlans.Freemium.modal.title", {
                defaultValue: "Offre Freemium - Détails",
              })}
            </h2>
            <button onClick={() => setShowFreemiumModal(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{plan.price}</div>
              {plan.yearly ? <p className="text-gray-600 text-sm">{plan.yearly}</p> : null}
            </div>

            <ul className="space-y-2 text-left">
              {plan.features.map((feature) => (
                <li key={`${plan.name}-${feature}`} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-4">
              <Button onClick={() => setShowFreemiumModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600">
                {t("cta.cancel", {
                  defaultValue: t("signupPlans.Freemium.modal.buttons.cancel", { defaultValue: "Annuler" }),
                })}
              </Button>
              <Button onClick={handleFreemiumPurchase} className="flex-1 bg-primary hover:bg-primary-dark">
                {t("signupPlans.Freemium.modal.buttons.subscribe", { defaultValue: plan.cta })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProModal = ({
  showProModal,
  setShowProModal,
  handleProPurchase,
  plan,
  t,
}: {
  showProModal: boolean;
  setShowProModal: (show: boolean) => void;
  handleProPurchase: () => void;
  plan: PricingPlan;
  t: (key: string, options?: { [key: string]: any }) => string;
}) => {
  if (!showProModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("signupPlans.pro.modal.title", { defaultValue: "Offre Pro - Détails" })}
            </h2>
            <button onClick={() => setShowProModal(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{plan.price}</div>
              {plan.yearly ? <p className="text-gray-600 text-sm">{plan.yearly}</p> : null}
            </div>

            <ul className="space-y-2 text-left">
              {plan.features.map((feature) => (
                <li key={`${plan.name}-${feature}`} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-4">
              <Button onClick={() => setShowProModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600">
                {t("cta.cancel", {
                  defaultValue: t("signupPlans.pro.modal.buttons.cancel", { defaultValue: "Annuler" }),
                })}
              </Button>
              <a
                href={paypalLinks.pro}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleProPurchase}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t("signupPlans.pro.modal.buttons.subscribe", { defaultValue: plan.cta })}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StandardModal = ({
  showStandardModal,
  setShowStandardModal,
  handleStandardPurchase,
  plan,
  t,
}: {
  showStandardModal: boolean;
  setShowStandardModal: (show: boolean) => void;
  handleStandardPurchase: () => void;
  plan: PricingPlan;
  t: (key: string, options?: { [key: string]: any }) => string;
}) => {
  if (!showStandardModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("signupPlans.standard.modal.title", { defaultValue: "Offre Standard - Détails" })}
            </h2>
            <button onClick={() => setShowStandardModal(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{plan.price}</div>
              {plan.yearly ? <p className="text-gray-600 text-sm">{plan.yearly}</p> : null}
            </div>

            <ul className="space-y-2 text-left">
              {plan.features.map((feature) => (
                <li key={`${plan.name}-${feature}`} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-4">
              <Button onClick={() => setShowStandardModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600">
                {t("cta.cancel", {
                  defaultValue: t("signupPlans.standard.modal.buttons.cancel", { defaultValue: "Annuler" }),
                })}
              </Button>
              <a
                href={paypalLinks.standard}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleStandardPurchase}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t("signupPlans.standard.modal.buttons.subscribe", { defaultValue: plan.cta })}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanCard: React.FC<{
  planKey: PricingPlanKey;
  plan: PricingPlan;
  isSelected: boolean;
  onSelect: (plan: PricingPlanKey) => void;
  t: (key: string, options?: { [key: string]: any }) => string;
  badgeText?: string;
}> = ({
  planKey,
  plan,
  isSelected,
  onSelect,
  t,
  badgeText,
}) => {
  const isSelectable = planKey !== "pro";
  const buttonKey = isSelectable ? `pricing.select_${planKey}` : "pricing.view_pro_details";
  const buttonLabel = t(buttonKey, {
    defaultValue: t(`signupPlans.${planKey}.select`, {
      defaultValue: t("signupPlans.selectDefault", { defaultValue: "Sélectionner" }),
    }),
  });
  const planTitle = t(`pricing.${planKey}`, { defaultValue: plan.name });
  const actionButtonBase = "w-100 fw-semibold d-flex align-items-center justify-content-center gap-2";

  const handleSelectClick = () => {
    onSelect(planKey);
  };

  return (
    <div
      className={`relative p-6 rounded-xl border-2 bg-white transition-all duration-200 ${
        isSelected
          ? "border-success border-3 shadow-lg ring-2 ring-green-200/60"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
      role="group"
      aria-label={planTitle}
    >
      {isSelected ? (
        <span className="position-absolute top-0 end-0 translate-middle mt-4 me-4 rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
               fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      ) : null}

      {badgeText ? (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">{badgeText}</span>
        </div>
      ) : null}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2" data-i18n={`pricing.plans.${planKey}.name`}>
          {plan.name}
        </h3>
        <span className="visually-hidden" data-i18n={`pricing.${planKey}`}>
          {planTitle}
        </span>
        <div className="mb-2">
          <span className="visually-hidden" data-i18n="pricing.billed_monthly">
            {t("pricing.billed_monthly", { defaultValue: "Billed monthly" })}
          </span>
          <span className="text-3xl font-bold text-primary" data-i18n={`pricing.plans.${planKey}.price`}>
            {plan.price}
          </span>
        </div>
        {plan.yearly ? (
          <>
            <span className="visually-hidden" data-i18n="pricing.billed_yearly">
              {t("pricing.billed_yearly", { defaultValue: "Billed yearly" })}
            </span>
            <p className="text-gray-600 text-sm" data-i18n={`pricing.plans.${planKey}.yearly`}>
              {plan.yearly}
            </p>
          </>
        ) : null}
      </div>

      <span className="visually-hidden" data-i18n="pricing.features">
        {t("pricing.features", { defaultValue: "Fonctionnalités" })}
      </span>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={`${plan.name}-${feature}`} className="flex items-start">
            <svg className="w-5 h-5 text-success me-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700 text-sm" data-i18n={`pricing.plans.${planKey}.features.${index}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 d-flex flex-column gap-3">
        <button
          type="button"
          onClick={handleSelectClick}
          className={`btn btn-success btn-lg ${actionButtonBase} focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
            isSelectable && isSelected ? "shadow" : ""
          }`}
          {...(isSelectable ? { "data-plan": planKey, "aria-pressed": isSelected } : {})}
          data-i18n={buttonKey}
          aria-label={`${buttonLabel} - ${planTitle}`}
        >
          <span>{buttonLabel}</span>
          {isSelectable ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-5 h-5 transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : null}
        </button>
      </div>
    </div>
  );
};

const SignUpPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>(() => (i18n.language as Locale) || "en");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [secretCode, setSecretCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showFreemiumModal, setShowFreemiumModal] = useState(false);
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanKey | null>(null);
  const { signUp, user } = useApp();
  const pricingPlans = getPricingPlans(t);
  const popularBadge = t("pricing.badges.popular", { defaultValue: "Popular" });
  const navigate = useNavigate();

  const translateSignupApiError = useCallback(
    (raw: string): string => {
      const trimmed = typeof raw === "string" ? raw.trim() : "";
      if (!trimmed) {
        return t("signup.error.generic", { defaultValue: "Une erreur est survenue." });
      }

      const normalized = trimmed.toLowerCase().replace(/\s+/g, "_");
      const authTranslation = t(`auth.errors.${normalized.toUpperCase()}`, { defaultValue: "" });
      if (authTranslation) {
        return authTranslation;
      }
      const translation = t(`signup.apiErrors.${normalized}`, {
        companyName: companyName.trim(),
        defaultValue: "",
      });
      if (translation) {
        return translation;
      }

      switch (normalized) {
        case "company_conflict":
        case "company_name_taken":
          return t("signup.error.companyNameTaken", {
            defaultValue: "Ce nom d'entreprise est déjà pris.",
          });
        case "company_missing":
        case "company_not_found":
          return t("signup.error.companyNotFound", {
            companyName: companyName.trim(),
            defaultValue: `L'entreprise ${companyName.trim() || ""} est introuvable.`,
          });
        case "activation_required":
          return t("signup.error.secretCodeRequiredManager", {
            defaultValue: "Un code d'activation est requis.",
          });
        case "invalid_activation_code":
          return t("signup.error.invalidSecretCodeManager", {
            defaultValue: "Code secret invalide.",
          });
        case "user_create_failed":
        case "profile_insert_failed":
        case "company_create_failed":
        case "settings_insert_failed":
        case "plan_not_found":
        case "unexpected_error":
          return t("signup.error.generic", {
            defaultValue: "Une erreur est survenue.",
          });
        case "origin_not_allowed":
          return t("auth.errors.ORIGIN_NOT_ALLOWED", {
            defaultValue: t("signup.error.generic", { defaultValue: "Une erreur est survenue." }),
          });
        case "signup_failed":
          return t("signup.apiErrors.signup_failed", {
            defaultValue: t("signup.error.generic", { defaultValue: "Une erreur est survenue." }),
          });
        case "network_error":
          return t("signup.apiErrors.network_error", {
            defaultValue: t("signup.error.generic", { defaultValue: "Une erreur est survenue." }),
          });
        default:
          return trimmed;
      }
    },
    [companyName, t]
  );

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const languageOptions: { value: Locale; label: string }[] = [
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "ar", label: "العربية" },
  ];

  const roleOptions = [
    { value: UserRole.USER, label: t("userRole.user") },
    { value: UserRole.AGENT, label: t("userRole.agent") },
    { value: UserRole.MANAGER, label: t("userRole.manager") },
  ];

  useEffect(() => {
    const nextLanguage = (i18n.language as Locale) || "en";
    setSelectedLanguage(nextLanguage);

    const handleLanguageChanged = (lng: string) => {
      setSelectedLanguage((lng as Locale) || "en");
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);

    if (nextRole === UserRole.MANAGER) {
      setSelectedPlan((current) => current);
    } else {
      setSelectedPlan(null);
      setSecretCode("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 2. Les validations de base (champs vides, mots de passe) restent ici. C'est une bonne pratique.
    if (!email.trim() || !fullName.trim() || !password || !confirmPassword || !companyName.trim()) {
      setError(t("signup.error.allFieldsRequired"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("signup.error.passwordsDoNotMatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("signup.error.minCharsPassword"));
      return;
    }
    const effectivePlan: PricingPlanKey | undefined =
      role === UserRole.MANAGER && selectedPlan ? selectedPlan : undefined;
    // Si le rôle est Manager, on s'assure que le champ du code n'est pas vide.
    // La VRAIE validation (si le code est bon) se fera sur le serveur.
    if (
      role === UserRole.MANAGER &&
      effectivePlan &&
      effectivePlan !== "freemium" &&
      !secretCode.trim()
    ) {
      setError(t("signup.error.secretCodeRequiredManager"));
      return;
    }

    if (role === UserRole.MANAGER) {
      if (!effectivePlan) {
        setError(
          t("signup.error.planSelectionRequired", {
            defaultValue: "Veuillez sélectionner une offre pour votre entreprise.",
          })
        );
        return;
      }

    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    // 3. L'appel à signUp reste le même. C'est parfait.
    // On envoie toutes les données au serveur, y compris le plan et, si besoin, le secretCode.
    const result = await signUp(email.trim(), fullName.trim(), password, {
      lang: selectedLanguage,
      role: role,
      companyName: companyName.trim(),
      // On envoie le code SEULEMENT si le rôle est Manager sur un plan payant.
      secretCode:
        role === UserRole.MANAGER && effectivePlan && effectivePlan !== "freemium"
          ? secretCode.trim()
          : undefined,
      plan:
        role === UserRole.MANAGER && effectivePlan
          ? (effectivePlan as "freemium" | "standard" | "pro")
          : undefined,
    });

    setIsLoading(false);

    // 4. On fait confiance à la réponse du serveur.
    // Si le serveur dit que le code est mauvais, `result` contiendra un message d'erreur.
    if (result !== true) {
      // Le `result` contiendra le message d'erreur renvoyé par le serveur,
      // par exemple : "Code d'activation invalide ou déjà utilisé."
      setError(translateSignupApiError(result));
    } else {
      // Le serveur a tout validé, l'inscription est réussie !
      if (role === UserRole.MANAGER) {
        setSuccess(t("signup.success.emailSentManager", { email: email.trim() }));
      } else {
        setSuccess(t("signup.success.emailSent", { email: email.trim() }));
      }

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  const handlePlanSelect = (plan: PricingPlanKey) => {
    if (plan === "pro") {
      setShowProModal(true);
      setShowStandardModal(false);
      setShowFreemiumModal(false);
      return;
    }

    setSelectedPlan(plan);

    if (plan === "standard") {
      setShowStandardModal(true);
      setShowProModal(false);
      setShowFreemiumModal(false);
    } else if (plan === "freemium") {
      setSecretCode("");
      setShowFreemiumModal(true);
      setShowProModal(false);
      setShowStandardModal(false);
    } else {
      setShowProModal(false);
      setShowStandardModal(false);
      setShowFreemiumModal(false);
    }
  };

  const handleProPurchase = () => {
    setSelectedPlan("pro");
    setShowProModal(false);
    alert("✅ Abonnement Pro : Code envoyer par mail !");
  };

  const handleFreemiumPurchase = () => {
    setShowFreemiumModal(false);
    alert(
      "✅ Offre Freemium activée : votre compte sera créé sur nos serveurs et un email de bienvenue vous guidera pour la suite."
    );
  };

  const handleStandardPurchase = () => {
    setShowStandardModal(false);
    alert("✅ Abonnement Standard : Code envoyer par mail !");
  };

  const offersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role === UserRole.MANAGER && offersRef.current) {
      offersRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [role]);

  return (
    <Layout>
      {showProModal && (
        <ProModal
          showProModal={showProModal}
          setShowProModal={setShowProModal}
          handleProPurchase={handleProPurchase}
          plan={pricingPlans.pro}
          t={t}
        />
      )}

      {showFreemiumModal && (
        <FreemiumModal
          showFreemiumModal={showFreemiumModal}
          setShowFreemiumModal={setShowFreemiumModal}
          handleFreemiumPurchase={handleFreemiumPurchase}
          plan={pricingPlans.freemium}
          t={t}
        />
      )}

      {showStandardModal && (
        <StandardModal
          showStandardModal={showStandardModal}
          setShowStandardModal={setShowStandardModal}
          handleStandardPurchase={handleStandardPurchase}
          plan={pricingPlans.standard}
          t={t}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-surface rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <img
                  src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
                  alt="Nexus Support Hub Logo"
                  className="w-16 h-16 mx-auto mb-2 rounded-full object-cover"
                />
                <h1 className="text-3xl font-bold text-textPrimary">
                  {t("signup.title")}
                </h1>
                <p className="text-textSecondary mt-1">
                  {t("signup.subtitle")}
                </p>
              </div>

              {error && (
                <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md border border-red-200">
                  {error}
                </p>
              )}

              {success && (
                <div className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">Inscription réussie !</span>
                  </div>
                  <p className="text-sm">{success}</p>
                  <p className="text-xs mt-2 text-green-500">
                    Redirection vers la connexion...
                  </p>
                </div>
              )}

              {role === UserRole.MANAGER && !success && (
                <div className="mb-8" ref={offersRef}>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-textPrimary mb-2">
                      {t("signupPlans.title", {
                        defaultValue: "Choisissez votre plan",
                      })}
                    </h2>
                    <p className="text-textSecondary">
                      {t("signupPlans.subtitle", {
                        defaultValue:
                          "Sélectionnez le plan qui correspond le mieux aux besoins de votre équipe.",
                      })}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <PlanCard
                      planKey="freemium"
                      plan={pricingPlans.freemium}
                      isSelected={selectedPlan === "freemium"}
                      onSelect={handlePlanSelect}
                      t={t}
                      demoHref="/landing#demo"
                      buyLabel={t("signupPlans.freemium.modal.buttons.subscribe", { defaultValue: pricingPlans.freemium.cta })}
                      onBuy={() => {
                        setSelectedPlan("freemium");
                        setShowFreemiumModal(true);
                      }}
                    />
                    <PlanCard
                      planKey="standard"
                      plan={pricingPlans.standard}
                      isSelected={selectedPlan === "standard"}
                      onSelect={handlePlanSelect}
                      t={t}
                      badgeText={popularBadge}
                      demoHref="/landing#demo"
                      buyHref={paypalLinks.standard}
                      buyLabel={t("signupPlans.standard.modal.buttons.subscribe", { defaultValue: pricingPlans.standard.cta })}
                    />
                    <PlanCard
                      planKey="pro"
                      plan={pricingPlans.pro}
                      isSelected={selectedPlan === "pro"}
                      onSelect={handlePlanSelect}
                      t={t}
                      demoHref="/landing#demo"
                      buyHref={paypalLinks.pro}
                      buyLabel={t("signupPlans.pro.modal.buttons.subscribe", { defaultValue: pricingPlans.pro.cta })}
                    />
                  </div>

                  {selectedPlan === "freemium" && (
                    <div className="mb-8 rounded-lg border border-green-300 bg-green-50 p-5 text-left">
                      <h3 className="text-lg font-semibold text-green-900">
                        {t("signupPlans.freemium.autoSelected.title", {
                          defaultValue: "Freemium sélectionné automatiquement",
                        })}
                      </h3>
                      <p className="mt-2 text-sm text-green-800">
                        {t("signupPlans.freemium.autoSelected.description", {
                          defaultValue:
                            "Cette inscription active immédiatement votre espace Freemium hébergé sur le cloud Nexus.",
                        })}
                      </p>
                      <p className="mt-2 text-xs text-green-700">
                        {t("signupPlans.freemium.autoSelected.storageNotice", {
                          defaultValue:
                            "Accédez à vos utilisateurs et tickets depuis n'importe quel appareil connecté.",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!success && (
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                      label={t("signup.emailLabel")}
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                      placeholder={t("signup.emailPlaceholder")}
                      autoFocus
                      required
                      disabled={isLoading}
                    />
                    <Input
                      label={t("signup.fullNameLabel")}
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFullName(e.target.value)
                      }
                      placeholder={t("signup.fullNamePlaceholder")}
                      required
                      disabled={isLoading}
                    />
                    <Input
                      label={t("signup.passwordLabel")}
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                      placeholder={t("signup.passwordPlaceholder")}
                      required
                      disabled={isLoading}
                    />
                    <Input
                      label={t("signup.confirmPasswordLabel")}
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder={t("signup.confirmPasswordPlaceholder")}
                      required
                      disabled={isLoading}
                    />

                    <Select
                      label={t("signup.roleLabel")}
                      id="role"
                      value={role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleRoleChange(e.target.value as UserRole)
                      }
                      options={roleOptions}
                      required
                      disabled={isLoading}
                    />

                    {role === UserRole.MANAGER && selectedPlan !== "freemium" && (
                      <div>
                        <div className="flex items-center gap-2">
                          <Input
                            label={t("activationKeyLabel")}
                            id="activationKey"
                            type="text"
                            value={secretCode}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setSecretCode(e.target.value)}
                            placeholder={t("activationKeyPlaceholder")}
                            required
                            disabled={isLoading}
                          />
                          <div className="relative group">
                            <button
                              type="button"
                              className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold"
                              tabIndex={0}
                            >
                              ?
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-white border border-slate-200 rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition pointer-events-none group-hover:pointer-events-auto z-20">
                              {t("activationKey.help", {
                                defaultValue:
                                  "Pour obtenir le code d’activation, contactez le support Nexus ou consultez votre email de bienvenue après l’achat du plan.",
                              })}
                            </div>
                          </div>
                        </div>
                        <p
                          className={`mt-1 text-xs px-1 text-slate-500 ${
                            selectedLanguage === "ar" ? "text-right" : ""
                          }`}
                          dir={selectedLanguage === "ar" ? "rtl" : "ltr"}
                        >
                          {t("activationKeyInfo")}
                        </p>
                      </div>
                    )}

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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setCompanyName(e.target.value)
                        }
                        placeholder={
                          role === UserRole.MANAGER
                            ? t("signup.companyNamePlaceholder")
                            : t("signup.existingCompanyNamePlaceholder")
                        }
                        required
                        disabled={isLoading}
                      />
                      <p className="mt-1 text-xs text-slate-500 px-1">
                        {role === UserRole.MANAGER
                          ? t("signup.companyNameHelp.manager", {
                              defaultValue:
                                "This name must be unique. Your team will use it to sign up and log in.",
                            })
                          : t("signup.companyNameHelp.employee", {
                              defaultValue:
                                "Enter the exact company name provided by your manager.",
                            })}
                      </p>
                    </div>

                    <Select
                      label={t("signup.languageLabel")}
                      id="language"
                      value={selectedLanguage}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const nextLocale = e.target.value as Locale;
                        setSelectedLanguage(nextLocale);
                        void i18n.changeLanguage(nextLocale);
                      }}
                      options={languageOptions.map((opt) => ({
                        ...opt,
                        label: t(`language.${opt.value}`, {
                          defaultValue: opt.label,
                        }),
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
                      {t("signup.signUpButton")}
                    </Button>
                  </form>
                </div>
              )}
              <div className="mt-6 text-sm text-center text-slate-500 space-y-2">
                <p>
                  {t("signup.alreadyHaveAccount")}{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:text-primary-dark"
                  >
                    {t("signup.signInLink")}
                  </Link>
                </p>
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
                    {t("signup.backToHome", { defaultValue: "Back to Plans" })}
                  </Link>
                </p>
              </div>
              <p className="mt-4 text-xs text-center text-slate-400">
                {t("login.demoNotes.supabase.production")}
              </p>
              <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                <Link
                  to="/legal"
                  className="text-xs text-slate-500 hover:text-primary hover:underline"
                >
                  {t("footer.legalLink", { defaultValue: "Legal & Documentation" })}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

  export default SignUpPage;
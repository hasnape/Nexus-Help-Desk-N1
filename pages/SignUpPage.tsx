// src/pages/SignUpPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useApp } from "../App";
import { Button, Input, Select } from "../components/FormElements";
import type { Locale } from "../contexts/LanguageContext";
import { UserRole } from "../types";
import { getPricingPlans, type PricingPlan, type PricingPlanKey } from "@/utils/pricing";
import RoleSelector from "../components/RoleSelector"; // <--- nouveau

// ... (garde paypalLinks, passwordPolicyRegex, FreemiumModal, ProModal, StandardModal, PlanCard identiques)

const SignUpPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>(() => (i18n.language as Locale) || "en");

  // rôle désormais sélectionnable
  const [role, setRole] = useState<UserRole | null>(null);

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
  const offersRef = useRef<HTMLDivElement>(null);

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

  // scroll vers les offres uniquement si MANAGER
  useEffect(() => {
    if (role === UserRole.MANAGER && offersRef.current) {
      offersRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      setError(
        t("signup.error.roleRequired", {
          defaultValue: "Veuillez sélectionner un rôle pour continuer.",
        })
      );
      return;
    }

    if (!email.trim() || !fullName.trim() || !password || !confirmPassword || !companyName.trim()) {
      setError(t("signup.error.allFieldsRequired"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("signup.error.passwordsDoNotMatch"));
      return;
    }
    if (!passwordPolicyRegex.test(password)) {
      setError(
        t("signup.error.passwordNotSecure", {
          defaultValue:
            "Votre mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.",
        })
      );
      return;
    }

    // plan applicable uniquement pour les MANAGER
    const effectivePlan: PricingPlanKey | undefined =
      role === UserRole.MANAGER && selectedPlan ? selectedPlan : undefined;

    if (
      role === UserRole.MANAGER &&
      effectivePlan &&
      effectivePlan !== "freemium" &&
      !secretCode.trim()
    ) {
      setError(t("signup.error.secretCodeRequiredManager"));
      return;
    }

    if (role === UserRole.MANAGER && !effectivePlan) {
      setError(
        t("signup.error.planSelectionRequired", {
          defaultValue: "Veuillez sélectionner une offre pour votre entreprise.",
        })
      );
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    const result = await signUp(email.trim(), fullName.trim(), password, {
      lang: selectedLanguage,
      role: role,
      companyName: companyName.trim(),
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

    if (result !== true) {
      setError(result);
    } else {
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
    alert("✅ Abonnement Pro : code envoyé par email !");
  };

  const handleFreemiumPurchase = () => {
    setShowFreemiumModal(false);
    alert(
      "✅ Offre Freemium activée : votre compte sera créé sur nos serveurs et un email de bienvenue vous guidera pour la suite."
    );
  };

  const handleStandardPurchase = () => {
    setShowStandardModal(false);
    alert("✅ Abonnement Standard : code envoyé par email !");
  };

  return (
    <>
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

      <div className="page-container section-stack">
        <div className="surface-card shadow-2xl overflow-hidden p-6 lg:p-8 space-y-8">
          {/* header & messages d’erreur/succès identiques à ta version */}
          {/* ... garde tout ce bloc tel quel ... */}

          {/* Offres uniquement si MANAGER sélectionné */}
          {role === UserRole.MANAGER && !success && (
            <div className="mb-8" ref={offersRef}>
              {/* bloc des PlanCard identique */}
              {/* ... */}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder={t("signup.emailPlaceholder")}
                  autoFocus
                  required
                  disabled={isLoading}
                  className="text-slate-900 placeholder:text-slate-500"
                />

                <Input
                  label={t("signup.fullNameLabel")}
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  placeholder={t("signup.fullNamePlaceholder")}
                  required
                  disabled={isLoading}
                  className="text-slate-900 placeholder:text-slate-500"
                />

                <Input
                  label={t("signup.passwordLabel")}
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder={t("signup.passwordPlaceholder")}
                  required
                  disabled={isLoading}
                  className="text-slate-900 placeholder:text-slate-500"
                />

                {/* hint mot de passe identique */}
                {/* ... */}

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
                  className="text-slate-900 placeholder:text-slate-500"
                />

                {/* nouveau sélecteur de rôle */}
                <RoleSelector value={role} onChange={setRole} disabled={isLoading} />

                {/* champ code d’activation seulement si MANAGER + plan payant */}
                {role === UserRole.MANAGER && selectedPlan !== "freemium" && selectedPlan && (
                  // bloc secretCode identique à ta version, réutilisé
                  // ...
                  <div>
                    {/* garde ici ton bloc Input + tooltip + texte d’aide */}
                  </div>
                )}

                {/* companyName : label différent selon rôle */}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                    placeholder={
                      role === UserRole.MANAGER
                        ? t("signup.companyNamePlaceholder")
                        : t("signup.existingCompanyNamePlaceholder")
                    }
                    required
                    disabled={isLoading}
                    className="text-slate-900 placeholder:text-slate-500"
                  />
                  {/* texte d’aide identique à ta version */}
                </div>

                {/* Select langue + bouton submit identiques */}
                {/* ... */}
              </form>
            </div>
          )}

          {/* section roleHelp en bas : tu peux la garder telle quelle */}
        </div>
      </div>
    </>
  );
};

export default SignUpPage;

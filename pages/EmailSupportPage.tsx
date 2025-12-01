import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const EmailSupportPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="page-container section-stack">
        <header className="surface-card p-6 lg:p-8 space-y-3 text-center">
          <p className="section-eyebrow">
            {t("emailSupport.badge", { defaultValue: "Support par email" })}
          </p>
          <h1 className="section-title">{t("emailSupport.title", { defaultValue: "Support email Nexus" })}</h1>
          <p className="section-subtitle">
            {t("emailSupport.subtitle", {
              defaultValue:
                "Contact direct avec l’équipe Nexus pour l’onboarding, les incidents et les demandes produit.",
            })}
          </p>
        </header>

        <section className="surface-card-soft p-6 lg:p-8 space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {t("emailSupport.howItWorks.title", { defaultValue: "Comment nous contacter" })}
          </h2>
          <ul className="space-y-2 text-sm text-slate-200 list-disc list-inside">
            <li>
              {t("emailSupport.howItWorks.point1", {
                defaultValue: "Envoyez votre message à hubnexusinfo@gmail.com avec le contexte et l’urgence.",
              })}
            </li>
            <li>
              {t("emailSupport.howItWorks.point2", {
                defaultValue: "Incluez le nom de votre entreprise et, si possible, l’ID du ticket concerné.",
              })}
            </li>
            <li>
              {t("emailSupport.howItWorks.point3", {
                defaultValue: "Nous répondons sous 24h ouvrées avec des étapes concrètes ou une proposition de visio.",
              })}
            </li>
          </ul>
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">{t("emailSupport.contact", { defaultValue: "Adresse directe" })}</p>
            <p className="mt-2 select-all">hubnexusinfo@gmail.com</p>
            <p className="mt-2 text-slate-300">
              {t("emailSupport.details", {
                defaultValue: "Merci de préciser le fuseau horaire, les utilisateurs impactés et les captures d’écran si possible.",
              })}
            </p>
          </div>
        </section>

        <section className="surface-card p-6 lg:p-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("emailSupport.cta.title", { defaultValue: "Besoin d’une réponse immédiate ?" })}
              </h3>
              <p className="muted-copy">
                {t("emailSupport.cta.description", {
                  defaultValue: "Ouvrez un ticket, lancez le chat ou réservez une démonstration live avec l’équipe.",
                })}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link to="/help" className="pill-link">
                {t("emailSupport.cta.chat", { defaultValue: "Accéder au centre d’aide" })}
              </Link>
              <Link to="/demo" className="pill-link">
                {t("emailSupport.cta.demo", { defaultValue: "Planifier une démo" })}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EmailSupportPage;

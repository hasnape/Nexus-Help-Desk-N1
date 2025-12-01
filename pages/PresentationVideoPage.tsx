import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PresentationVideoPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="page-container section-stack">
        <header className="surface-card p-6 lg:p-8 space-y-3 text-center">
          <p className="section-eyebrow">
            {t("presentationVideo.badge", { defaultValue: "Démonstration vidéo" })}
          </p>
          <h1 className="section-title">
            {t("presentationVideo.title", { defaultValue: "Découvrez Nexus Support Hub en vidéo" })}
          </h1>
          <p className="section-subtitle">
            {t("presentationVideo.subtitle", {
              defaultValue:
                "Une présentation complète de l’expérience utilisateur, des fonctions AI et du portail multi-rôles.",
            })}
          </p>
        </header>

        <section className="surface-card-soft p-4 lg:p-6 space-y-4">
          <div className="aspect-video overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900">
            <iframe
              title={t("presentationVideo.iframeTitle", { defaultValue: "Vidéo de démonstration Nexus" })}
              src={
                t("presentationVideo.videoUrl", {
                  defaultValue: "https://www.youtube.com/embed/3k7ejwYJ_ZE",
                })
              }
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
              {t("presentationVideo.highlights.title", { defaultValue: "Ce que vous allez voir" })}
            </h2>
            <ul className="space-y-2 text-sm text-slate-200 list-disc list-inside">
              <li>
                {t("presentationVideo.highlights.point1", {
                  defaultValue: "Automatisation L1 et assistance L2 en 3 langues (FR / EN / AR).",
                })}
              </li>
              <li>
                {t("presentationVideo.highlights.point2", {
                  defaultValue: "Portail multi-rôles (utilisateur, agent, manager) et workflows sécurisés.",
                })}
              </li>
              <li>
                {t("presentationVideo.highlights.point3", {
                  defaultValue: "Cartes Nexus, analytics et intégrations Supabase avec RLS activé.",
                })}
              </li>
            </ul>
          </div>
        </section>

        <section className="surface-card p-6 lg:p-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("presentationVideo.cta.title", { defaultValue: "Aller plus loin" })}
              </h3>
              <p className="muted-copy">
                {t("presentationVideo.cta.description", {
                  defaultValue: "Planifiez une session live ou contactez-nous pour un accompagnement personnalisé.",
                })}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link to="/demo" className="pill-link">
                {t("presentationVideo.cta.scheduleDemo", { defaultValue: "Planifier une démo" })}
              </Link>
              <Link to="/contact" className="pill-link">
                {t("presentationVideo.cta.contact", { defaultValue: "Contacter l’équipe Nexus" })}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PresentationVideoPage;

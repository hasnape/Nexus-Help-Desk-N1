import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GuideOnboardingPage: React.FC = () => {
  const { t } = useTranslation();

  const pillars = useMemo(
    () => [
      {
        key: "agents",
        eyebrow: t("guideOnboarding.pillars.agents.eyebrow", { defaultValue: "Pilier 1" }),
        title: t("guideOnboarding.pillars.agents.title", { defaultValue: "Centralisez vos agents" }),
        description: t("guideOnboarding.pillars.agents.description", {
          defaultValue:
            "Invitez vos équipes, gérez les rôles et organisez les files de traitement sans friction.",
        }),
        bullets: [
          t("guideOnboarding.pillars.agents.points.0", {
            defaultValue: "Rôles Admin / Superviseur / Agent et permissions fines.",
          }),
          t("guideOnboarding.pillars.agents.points.1", {
            defaultValue: "Routage par files, compétences et règles d'escalade.",
          }),
          t("guideOnboarding.pillars.agents.points.2", {
            defaultValue: "Boîte partagée, mentions @, macros et réponses sauvegardées.",
          }),
        ],
      },
      {
        key: "ai",
        eyebrow: t("guideOnboarding.pillars.ai.eyebrow", { defaultValue: "Pilier 2" }),
        title: t("guideOnboarding.pillars.ai.title", { defaultValue: "Accélérez avec l'IA" }),
        description: t("guideOnboarding.pillars.ai.description", {
          defaultValue: "Classement automatique, résumés intelligents et traduction instantanée.",
        }),
        bullets: [
          t("guideOnboarding.pillars.ai.points.0", {
            defaultValue: "Détection d'intention/langue et priorisation automatique.",
          }),
          t("guideOnboarding.pillars.ai.points.1", {
            defaultValue: "Suggestions de réponses et résumés en un clic dans les tickets.",
          }),
          t("guideOnboarding.pillars.ai.points.2", {
            defaultValue: "Recherche augmentée dans votre base de connaissances.",
          }),
        ],
      },
      {
        key: "analytics",
        eyebrow: t("guideOnboarding.pillars.analytics.eyebrow", { defaultValue: "Pilier 3" }),
        title: t("guideOnboarding.pillars.analytics.title", { defaultValue: "Pilotez par les analyses" }),
        description: t("guideOnboarding.pillars.analytics.description", {
          defaultValue:
            "Suivez SLA, FCR, CSAT et temps de résolution avec exports et webhooks.",
        }),
        bullets: [
          t("guideOnboarding.pillars.analytics.points.0", {
            defaultValue: "Tableaux de bord par canal, file, agent.",
          }),
          t("guideOnboarding.pillars.analytics.points.1", {
            defaultValue: "Exports CSV/JSON et webhooks pour vos outils BI.",
          }),
          t("guideOnboarding.pillars.analytics.points.2", {
            defaultValue: "Alertes KPI : pics de volume, seuils SLA, non-réponses.",
          }),
        ],
      },
      {
        key: "accessibility",
        eyebrow: t("guideOnboarding.pillars.accessibility.eyebrow", { defaultValue: "Pilier 4" }),
        title: t("guideOnboarding.pillars.accessibility.title", {
          defaultValue: "Accessibilité & conformité RGAA",
        }),
        description: t("guideOnboarding.pillars.accessibility.description", {
          defaultValue: "Interface conçue selon le RGAA 4.1 AA avec focus visible et labels ARIA.",
        }),
        bullets: [
          t("guideOnboarding.pillars.accessibility.points.0", {
            defaultValue: "Navigation clavier, skip-links et ordre de tabulation maîtrisé.",
          }),
          t("guideOnboarding.pillars.accessibility.points.1", {
            defaultValue: "Contrastes ≥ 4,5:1, composants lisibles par lecteurs d'écran.",
          }),
          t("guideOnboarding.pillars.accessibility.points.2", {
            defaultValue: "Déclaration publiée + point de contact accessibilité.",
          }),
        ],
      },
    ],
    [t]
  );

  const steps = useMemo(
    () => [
      t("guideOnboarding.steps.0", {
        defaultValue: "Créez votre espace, invitez vos agents et définissez les rôles.",
      }),
      t("guideOnboarding.steps.1", {
        defaultValue: "Connectez un premier canal (Gmail/Outlook, WhatsApp, Messenger, chat web).",
      }),
      t("guideOnboarding.steps.2", {
        defaultValue: "Importez votre FAQ/KB (CSV/Markdown) et activez les réponses IA.",
      }),
    ],
    [t]
  );

  const accessibilityChecks = useMemo(
    () => [
      t("guideOnboarding.accessibilityChecklist.0", {
        defaultValue: "Focus visible, messages d'erreur reliés avec aria-describedby.",
      }),
      t("guideOnboarding.accessibilityChecklist.1", {
        defaultValue: "Alternatives textuelles pour les médias et icônes critiques.",
      }),
      t("guideOnboarding.accessibilityChecklist.2", {
        defaultValue: "Compatibilité clavier/lecteur d'écran vérifiée sur le tunnel critique.",
      }),
    ],
    [t]
  );

  return (
    <div className="bg-white text-slate-900">
      <header className="bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-primary font-semibold tracking-wide uppercase mb-3">
            {t("guideOnboarding.hero.eyebrow", {
              defaultValue: "Guide d'onboarding",
            })}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 text-slate-900">
            {t("guideOnboarding.hero.title", {
              defaultValue: "Déployez Nexus Support Hub en quelques minutes",
            })}
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-10">
            {t("guideOnboarding.hero.subtitle", {
              defaultValue:
                "Un parcours pas-à-pas pour aligner vos équipes, l'IA et les obligations RGAA dès le premier jour.",
            })}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4" role="group" aria-label={t("guideOnboarding.hero.ctaGroupLabel", { defaultValue: "Actions principales" }) || undefined}>
            <Link
              to="/demo"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white font-semibold shadow"
            >
              {t("guideOnboarding.hero.ctaDemo", { defaultValue: "Demander une démo" })}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-slate-900 font-semibold"
            >
              {t("guideOnboarding.hero.ctaContact", { defaultValue: "Contacter un expert" })}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section aria-labelledby="guide-pillars" className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 text-center">
              <p className="uppercase text-xs tracking-[0.3em] text-primary mb-3">
                {t("guideOnboarding.pillars.eyebrow", { defaultValue: "4 piliers" })}
              </p>
              <h2 id="guide-pillars" className="text-3xl font-semibold">
                {t("guideOnboarding.pillars.title", {
                  defaultValue: "Les fondations de Nexus Support Hub",
                })}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {pillars.map((pillar) => (
                <article
                  key={pillar.key}
                  className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm"
                >
                  <p className="text-primary text-sm font-semibold uppercase tracking-wider">
                    {pillar.eyebrow}
                  </p>
                  <h3 className="text-2xl font-semibold mt-2 mb-3">{pillar.title}</h3>
                  <p className="text-slate-600 mb-4">{pillar.description}</p>
                  <ul className="space-y-2 text-slate-700 list-disc pl-5">
                    {pillar.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="guide-steps" className="py-16 px-4 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 text-center">
              <p className="uppercase text-xs tracking-[0.3em] text-primary mb-3">
                {t("guideOnboarding.stepsEyebrow", { defaultValue: "Mise en route" })}
              </p>
              <h2 id="guide-steps" className="text-3xl font-semibold">
                {t("guideOnboarding.stepsTitle", { defaultValue: "3 étapes pour être opérationnel" })}
              </h2>
            </div>
            <ol className="space-y-6">
              {steps.map((step, index) => (
                <li key={index} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </span>
                    <p className="text-lg text-slate-700">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="guide-accessibility" className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <p className="uppercase text-xs tracking-[0.3em] text-primary mb-3">
                {t("guideOnboarding.accessibilityEyebrow", { defaultValue: "Conformité" })}
              </p>
              <h2 id="guide-accessibility" className="text-3xl font-semibold">
                {t("guideOnboarding.accessibilityTitle", { defaultValue: "Checklist RGAA 4.1 AA" })}
              </h2>
              <p className="text-slate-600 mt-3">
                {t("guideOnboarding.accessibilitySubtitle", {
                  defaultValue:
                    "Contrôlez ces points avant publication de votre Déclaration d'accessibilité.",
                })}
              </p>
            </div>
            <ul className="space-y-4">
              {accessibilityChecks.map((item, index) => (
                <li key={index} className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <span className="mt-1 h-3 w-3 rounded-full bg-primary" aria-hidden />
                  <p className="text-slate-700">{item}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 text-center">
              <p className="text-slate-600 mb-3">
                {t("guideOnboarding.accessibilityCallout", {
                  defaultValue: "Besoin d'un modèle de déclaration RGAA ou d'un audit ?",
                })}
              </p>
              <Link
                to="/accessibilite"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-primary text-primary font-semibold"
              >
                {t("guideOnboarding.accessibilityCta", { defaultValue: "Consulter notre déclaration" })}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GuideOnboardingPage;

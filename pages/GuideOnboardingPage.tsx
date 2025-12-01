import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const GuideOnboardingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="page-container section-stack">
        <header className="surface-card p-6 lg:p-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="section-eyebrow">{t("onboardingGuide.badge")}</p>
              <h1 className="text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
                {t("onboardingGuide.pageTitle")}
              </h1>
              <p className="section-subtitle">{t("onboardingGuide.pageSubtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link to="/landing" className="pill-link">
                {t("onboardingGuide.section.footer.ctaBack")}
              </Link>
              <a href="mailto:hubnexusinfo@gmail.com" className="pill-link">
                {t("onboardingGuide.section.footer.ctaDemo")}
              </a>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)] items-start">
          <div className="space-y-6">
            <section className="surface-card-soft p-5 lg:p-6 space-y-3">
              <h2 className="text-xl font-semibold text-white">
                {t("onboardingGuide.section.who.title")}
              </h2>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>• {t("onboardingGuide.section.who.manager")}</li>
                <li>• {t("onboardingGuide.section.who.it")}</li>
                <li>• {t("onboardingGuide.section.who.ceo")}</li>
              </ul>
            </section>

            {[1, 2, 3, 4].map((step) => (
              <section
                key={step}
                className="surface-card-soft p-5 lg:p-6 space-y-3 border-t border-slate-800/70"
                aria-labelledby={`onboarding-step${step}`}
              >
                <h2 id={`onboarding-step${step}`} className="text-lg md:text-xl font-semibold text-white">
                  {t(`onboardingGuide.section.step${step}.title`)}
                </h2>
                <div className="space-y-3 text-sm md:text-base text-slate-200">
                  <p>{t(`onboardingGuide.section.step${step}.p1`)}</p>
                  <p>{t(`onboardingGuide.section.step${step}.p2`)}</p>
                  <p>{t(`onboardingGuide.section.step${step}.p3`)}</p>
                </div>
              </section>
            ))}

            <section className="surface-card-soft p-5 lg:p-6 space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                {t("onboardingGuide.section.advanced.title")}
              </h2>
              <div className="space-y-3 text-sm md:text-base text-slate-200">
                <p>{t("onboardingGuide.section.advanced.p1")}</p>
                <p>{t("onboardingGuide.section.advanced.p2")}</p>
                <p>{t("onboardingGuide.section.advanced.p3")}</p>
              </div>
            </section>

            <section className="surface-card-soft p-5 lg:p-6 space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                {t("onboardingGuide.section.checklist.title")}
              </h2>
              <ul className="mt-2 space-y-2 text-sm md:text-base text-slate-200">
                <li>✅ {t("onboardingGuide.section.checklist.item1")}</li>
                <li>✅ {t("onboardingGuide.section.checklist.item2")}</li>
                <li>✅ {t("onboardingGuide.section.checklist.item3")}</li>
                <li>✅ {t("onboardingGuide.section.checklist.item4")}</li>
                <li>✅ {t("onboardingGuide.section.checklist.item5")}</li>
              </ul>
            </section>

            <section className="surface-card p-5 lg:p-6 space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                {t("onboardingGuide.section.footer.title")}
              </h2>
              <p className="text-sm md:text-base text-slate-200">
                {t("onboardingGuide.section.footer.p1")}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:hubnexusinfo@gmail.com"
                  className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-slate-950 hover:bg-primary/90"
                >
                  {t("onboardingGuide.section.footer.ctaDemo")}
                </a>
                <Link
                  to="/landing"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
                >
                  {t("onboardingGuide.section.footer.ctaBack")}
                </Link>
              </div>
            </section>
          </div>

          <aside className="surface-card p-5 lg:p-6 space-y-4">
            <h2 className="text-base md:text-lg font-semibold text-white">
              {t("onboardingGuide.section.overview.title")}
            </h2>
            <p className="text-sm text-slate-300">
              {t("onboardingGuide.section.overview.subtitle")}
            </p>
            <ol className="space-y-4 text-sm text-slate-100">
              {[1, 2, 3, 4].map((step) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                    {step}
                  </span>
                  <div>
                    <div className="font-medium">{t(`onboardingGuide.section.overview.step${step}.title`)}</div>
                    <div className="text-slate-300">{t(`onboardingGuide.section.overview.step${step}.desc`)}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
              <p>
                💡 Une fois ces 4 étapes terminées, vos utilisateurs peuvent déjà ouvrir des tickets dans Nexus, et vos agents
                disposent d’un portail complet pour les traiter.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default GuideOnboardingPage;

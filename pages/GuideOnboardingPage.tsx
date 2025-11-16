import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const GuideOnboardingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="container mx-auto px-4 py-10 lg:py-16">
        {/* HERO */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide">
            {t("onboardingGuide.badge")}
          </span>

          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            {t("onboardingGuide.pageTitle")}
          </h1>

          <p className="mt-4 text-base md:text-lg text-slate-300">
            {t("onboardingGuide.pageSubtitle")}
          </p>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)] items-start">
          {/* Colonne gauche : guide détaillé */}
          <div className="space-y-10">
            {/* À qui s’adresse ce guide */}
            <section aria-labelledby="onboarding-who">
              <h2
                id="onboarding-who"
                className="text-xl md:text-2xl font-semibold tracking-tight"
              >
                {t("onboardingGuide.section.who.title")}
              </h2>
              <ul className="mt-4 space-y-2 text-sm md:text-base text-slate-200">
                <li>• {t("onboardingGuide.section.who.manager")}</li>
                <li>• {t("onboardingGuide.section.who.it")}</li>
                <li>• {t("onboardingGuide.section.who.ceo")}</li>
              </ul>
            </section>

            {/* Étape 1 */}
            <section
              aria-labelledby="onboarding-step1"
              className="border-t border-slate-800 pt-6"
            >
              <h2
                id="onboarding-step1"
                className="text-lg md:text-xl font-semibold tracking-tight"
              >
                {t("onboardingGuide.section.step1.title")}
              </h2>
              <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200">
                <p>{t("onboardingGuide.section.step1.p1")}</p>
                <p>{t("onboardingGuide.section.step1.p2")}</p>
                <p>{t("onboardingGuide.section.step1.p3")}</p>
              </div>
            </section>

            {/* Étape 2 */}
            <section
              aria-labelledby="onboarding-step2"
              className="border-t border-slate-800 pt-6"
            >
              <h2
                id="onboarding-step2"
                className="text-lg md:text-xl font-semibold tracking-tight"
              >
                {t("onboardingGuide.section.step2.title")}
              </h2>
              <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200">
                <p>{t("onboardingGuide.section.step2.p1")}</p>
                <p>{t("onboardingGuide.section.step2.p2")}</p>
                <p>{t("onboardingGuide.section.step2.p3")}</p>
              </div>
            </section>

            {/* Étape 3 */}
            <section
              aria-labelledby="onboarding-step3"
              className="border-t border-slate-800 pt-6"
            >
              <h2
                id="onboarding-step3"
                className="text-lg md:text-xl font-semibold tracking-tight"
              >
                {t("onboardingGuide.section.step3.title")}
              </h2>
              <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200">
                <p>{t("onboardingGuide.section.step3.p1")}</p>
                <p>{t("onboardingGuide.section.step3.p2")}</p>
                <p>{t("onboardingGuide.section.step3.p3")}</p>
              </div>
            </section>

            {/* Étape 4 */}
            <section
              aria-labelledby="onboarding-step4"
              className="border-t border-slate-800 pt-6"
            >
              <h2
                id="onboarding-step4"
                className="text-lg md:text-xl font-semibold tracking-tight"
              >
                {t("onboardingGuide.section.step4.title")}
              </h2>
              <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200">
                <p>{t("onboardingGuide.section.step4.p1")}</p>
                <p>{t("onboardingGuide.section.step4.p2")}</p>
                <p>{t("onboardingGuide.section.step4.p3")}</p>
              </div>
            </section>

            {/* Option avancée */}
            <section
              aria-labelledby="onboarding-advanced"
              className="border-t border-slate-800 pt-6"
            >
              <h2
                id="onboarding-advanced"
                className="text-lg md:text-xl font-semibold tracking-tight"
              >
                {t("onboardingGuide.section.advanced.title")}
              </h2>
              <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200">
                <p>{t("onboardingGuide.section.advanced.p1")}</p>
                <p>{t("onboardingGuide.section.advanced.p2")}</p>
                <p>{t("onboardingGuide.section.advanced.p3")}</p>
              </div>
            </section>

            {/* Checklist */}
            <section
              aria-labelledby="onboarding-checklist"
              className="border-t border-slate-800 pt-6"
            >
              <h2
                id="onboarding-checklist"
                className="text-lg md:text-xl font-semibold tracking-tight"
              >
                {t("onboardingGuide.section.checklist.title")}
              </h2>
              <ul className="mt-3 space-y-2 text-sm md:text-base text-slate-200">
                <li>✅ {t("onboardingGuide.section.checklist.item1")}</li>
                <li>✅ {t("onboardingGuide.section.checklist.item2")}</li>
                <li>✅ {t("onboardingGuide.section.checklist.item3")}</li>
                <li>✅ {t("onboardingGuide.section.checklist.item4")}</li>
                <li>✅ {t("onboardingGuide.section.checklist.item5")}</li>
              </ul>
            </section>

            {/* Footer / CTA */}
            <section
              aria-labelledby="onboarding-footer"
              className="border-t border-slate-800 pt-6"
            >
              <h2
                id="onboarding-footer"
                className="text-lg md:text-xl font-semibold tracking-tight"
              >
                {t("onboardingGuide.section.footer.title")}
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("onboardingGuide.section.footer.p1")}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="mailto:hubnexusinfo@gmail.com"
                  className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-slate-950 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  {t("onboardingGuide.section.footer.ctaDemo")}
                </a>

                <Link
                  to="/landing"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  {t("onboardingGuide.section.footer.ctaBack")}
                </Link>
              </div>
            </section>
          </div>

          {/* Colonne droite : carte récap / vue d’ensemble */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg shadow-black/40">
            <h2 className="text-base md:text-lg font-semibold tracking-tight">
              {t("onboardingGuide.section.overview.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {t("onboardingGuide.section.overview.subtitle")}
            </p>

            <ol className="mt-5 space-y-4 text-sm text-slate-100">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  1
                </span>
                <div>
                  <div className="font-medium">
                    {t("onboardingGuide.section.overview.step1.title")}
                  </div>
                  <div className="text-slate-300">
                    {t("onboardingGuide.section.overview.step1.desc")}
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  2
                </span>
                <div>
                  <div className="font-medium">
                    {t("onboardingGuide.section.overview.step2.title")}
                  </div>
                  <div className="text-slate-300">
                    {t("onboardingGuide.section.overview.step2.desc")}
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  3
                </span>
                <div>
                  <div className="font-medium">
                    {t("onboardingGuide.section.overview.step3.title")}
                  </div>
                  <div className="text-slate-300">
                    {t("onboardingGuide.section.overview.step3.desc")}
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  4
                </span>
                <div>
                  <div className="font-medium">
                    {t("onboardingGuide.section.overview.step4.title")}
                  </div>
                  <div className="text-slate-300">
                    {t("onboardingGuide.section.overview.step4.desc")}
                  </div>
                </div>
              </li>
            </ol>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
              <p>
                💡 Une fois ces 4 étapes terminées, vos utilisateurs peuvent
                déjà ouvrir des tickets dans Nexus, et vos agents disposent
                d’un portail complet pour les traiter.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default GuideOnboardingPage;

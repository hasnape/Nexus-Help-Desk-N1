import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const ImplementationScenariosPage: React.FC = () => {
  const { t } = useLanguage();

  const scenarios = [
    {
      title: t("docs.implementationScenarios.sme.title"),
      context: t("docs.implementationScenarios.sme.context"),
      setup: t("docs.implementationScenarios.sme.setup"),
      benefits: t("docs.implementationScenarios.sme.benefits"),
    },
    {
      title: t("docs.implementationScenarios.education.title"),
      context: t("docs.implementationScenarios.education.context"),
      setup: t("docs.implementationScenarios.education.setup"),
      benefits: t("docs.implementationScenarios.education.benefits"),
    },
    {
      title: t("docs.implementationScenarios.public.title"),
      context: t("docs.implementationScenarios.public.context"),
      setup: t("docs.implementationScenarios.public.setup"),
      benefits: t("docs.implementationScenarios.public.benefits"),
    },
    {
      title: t("docs.implementationScenarios.bpo.title"),
      context: t("docs.implementationScenarios.bpo.context"),
      setup: t("docs.implementationScenarios.bpo.setup"),
      benefits: t("docs.implementationScenarios.bpo.benefits"),
    },
  ];

  return (
    <div className="bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-wide">
            {t("docs.implementationScenarios.title")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t("docs.implementationScenarios.title")}
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            {t("docs.implementationScenarios.subtitle")}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <section key={scenario.title} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">{scenario.title}</h2>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{t("landing.setup.s1.text", { defaultValue: "Contexte" })}</p>
                <p className="leading-relaxed">{scenario.context}</p>
                <p className="font-semibold text-slate-900">{t("landing.setup.s2.text", { defaultValue: "Mise en place" })}</p>
                <p className="leading-relaxed">{scenario.setup}</p>
                <p className="font-semibold text-slate-900">{t("landing.setup.s3.text", { defaultValue: "Gains attendus" })}</p>
                <p className="leading-relaxed">{scenario.benefits}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
          <p className="text-slate-700 text-sm leading-relaxed">
            {t("docs.implementationScenarios.gainsNotice")}
          </p>
          <p className="text-sm text-slate-500 mt-4">
            {t("docs.downloadHint")}
          </p>
          {/* Lien prêt pour futur PDF exporté depuis les .md (fichier non encore présent) */}
          <a
            href="/docs/scenarios-implementation.pdf"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {t("docs.downloadPdf")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ImplementationScenariosPage;

import React from "react";
import { useTranslation } from "react-i18next";

import Layout from "../components/Layout";

const ImplementationScenariosPage: React.FC = () => {
  const { t } = useTranslation();

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
    <Layout mainClassName="page-shell py-10 lg:py-14">
      <div className="page-container section-stack">
        <header className="surface-card p-6 lg:p-8 space-y-3">
          <p className="section-eyebrow">{t("docs.implementationScenarios.title")}</p>
          <h1 className="section-title">{t("docs.implementationScenarios.title")}</h1>
          <p className="section-subtitle">{t("docs.implementationScenarios.subtitle")}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <section key={scenario.title} className="surface-card p-6 space-y-3">
              <h2 className="text-xl font-semibold text-white">{scenario.title}</h2>
              <div className="space-y-2 text-sm text-slate-200">
                <p className="font-semibold text-white">
                  {t("landing.setup.s1.text", { defaultValue: "Contexte" })}
                </p>
                <p className="muted-copy">{scenario.context}</p>
                <p className="font-semibold text-white">
                  {t("landing.setup.s2.text", { defaultValue: "Mise en place" })}
                </p>
                <p className="muted-copy">{scenario.setup}</p>
                <p className="font-semibold text-white">
                  {t("landing.setup.s3.text", { defaultValue: "Gains attendus" })}
                </p>
                <p className="muted-copy">{scenario.benefits}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="surface-card-soft p-6 space-y-3">
          <p className="muted-copy">{t("docs.implementationScenarios.gainsNotice")}</p>
          <p className="text-sm text-slate-300">{t("docs.downloadHint")}</p>
          <a
            href="/docs/scenarios-implementation.pdf"
            className="pill-link"
          >
            {t("docs.downloadPdf")}
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default ImplementationScenariosPage;

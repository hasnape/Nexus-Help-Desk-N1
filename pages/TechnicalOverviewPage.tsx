import React from "react";
import { useTranslation } from "react-i18next";


const TechnicalOverviewPage: React.FC = () => {
  const { t } = useTranslation();

  const architecturePoints = [
    t("docs.technicalOverview.architecture.point1"),
    t("docs.technicalOverview.architecture.point2"),
    t("docs.technicalOverview.architecture.point3"),
  ];

  const securityPoints = [
    t("docs.technicalOverview.security.point1"),
    t("docs.technicalOverview.security.point2"),
    t("docs.technicalOverview.security.point3"),
  ];

  const accessibilityPoints = [
    t("docs.technicalOverview.accessibility.point1"),
    t("docs.technicalOverview.accessibility.point2"),
  ];

  return (
    <div className="page-container section-stack">
      <header className="surface-card p-6 lg:p-8 space-y-3">
        <p className="section-eyebrow">{t("docs.technicalOverview.title")}</p>
        <h1 className="section-title">{t("docs.technicalOverview.title")}</h1>
          <p className="section-subtitle">{t("docs.technicalOverview.subtitle")}</p>
        </header>

        <section className="surface-card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-white">
            {t("docs.technicalOverview.architecture.title")}
          </h2>
          <ul className="space-y-2 text-slate-200 text-sm">
            {architecturePoints.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-white">
            {t("docs.technicalOverview.security.title")}
          </h2>
          <ul className="space-y-2 text-slate-200 text-sm">
            {securityPoints.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-white">
            {t("docs.technicalOverview.accessibility.title")}
          </h2>
          <ul className="space-y-2 text-slate-200 text-sm">
            {accessibilityPoints.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-300 mt-4">{t("docs.downloadHint")}</p>
        <a href="/docs/aspects-techniques.pdf" className="pill-link">
          {t("docs.downloadPdf")}
        </a>
      </section>
    </div>
  );
};

export default TechnicalOverviewPage;

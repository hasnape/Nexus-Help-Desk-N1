import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const TechnicalOverviewPage: React.FC = () => {
  const { t } = useLanguage();

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
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-wide">
            {t("docs.technicalOverview.title")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t("docs.technicalOverview.title")}
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            {t("docs.technicalOverview.subtitle")}
          </p>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("docs.technicalOverview.architecture.title")}
          </h2>
          <ul className="space-y-2 text-slate-700 text-sm">
            {architecturePoints.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("docs.technicalOverview.security.title")}
          </h2>
          <ul className="space-y-2 text-slate-700 text-sm">
            {securityPoints.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("docs.technicalOverview.accessibility.title")}
          </h2>
          <ul className="space-y-2 text-slate-700 text-sm">
            {accessibilityPoints.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500 mt-4">
            {t("docs.downloadHint")}
          </p>
          {/* Lien prêt pour futur PDF exporté depuis les .md (fichier non encore présent) */}
          <a
            href="/docs/aspects-techniques.pdf"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {t("docs.downloadPdf")}
          </a>
        </section>
      </div>
    </div>
  );
};

export default TechnicalOverviewPage;

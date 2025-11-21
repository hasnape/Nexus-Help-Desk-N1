import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const RoadmapPage: React.FC = () => {
  const { t } = useLanguage();

  const phases = [
    {
      title: t("docs.roadmap.phase1.title"),
      points: [t("docs.roadmap.phase1.point1"), t("docs.roadmap.phase1.point2")],
    },
    {
      title: t("docs.roadmap.phase2.title"),
      points: [t("docs.roadmap.phase2.point1"), t("docs.roadmap.phase2.point2")],
    },
    {
      title: t("docs.roadmap.phase3.title"),
      points: [t("docs.roadmap.phase3.point1"), t("docs.roadmap.phase3.point2")],
    },
    {
      title: t("docs.roadmap.phase4.title"),
      points: [t("docs.roadmap.phase4.point1"), t("docs.roadmap.phase4.point2")],
    },
  ];

  return (
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-wide">
            {t("docs.roadmap.title")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t("docs.roadmap.title")}
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            {t("docs.roadmap.subtitle")}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {phases.map((phase) => (
            <section key={phase.title} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">{phase.title}</h2>
              <ul className="space-y-1 text-slate-700 text-sm">
                {phase.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
          <p className="text-slate-700 text-sm leading-relaxed">
            {t("docs.roadmap.notice")}
          </p>
          <p className="text-sm text-slate-500 mt-4">
            {t("docs.downloadHint")}
          </p>
          {/* Lien prêt pour futur PDF exporté depuis les .md (fichier non encore présent) */}
          <a
            href="/docs/roadmap.pdf"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {t("docs.downloadPdf")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;

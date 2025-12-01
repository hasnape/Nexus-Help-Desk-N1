import React from "react";
import { useTranslation } from "react-i18next";

const RoadmapPage: React.FC = () => {
  const { t } = useTranslation();

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
    <div className="page-container section-stack">
      <header className="surface-card p-6 lg:p-8 space-y-3">
        <p className="section-eyebrow">{t("docs.roadmap.title")}</p>
        <h1 className="section-title">{t("docs.roadmap.title")}</h1>
          <p className="section-subtitle">{t("docs.roadmap.subtitle")}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {phases.map((phase) => (
            <section key={phase.title} className="surface-card p-6 space-y-2">
              <h2 className="text-xl font-semibold text-white">{phase.title}</h2>
              <ul className="space-y-1 text-sm text-slate-200">
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

        <div className="surface-card-soft p-6 space-y-3">
          <p className="muted-copy">{t("docs.roadmap.notice")}</p>
          <p className="text-sm text-slate-300">{t("docs.downloadHint")}</p>
          <a href="/docs/roadmap.pdf" className="pill-link">
            {t("docs.downloadPdf")}
          </a>
        </div>
      </div>
  );
};

export default RoadmapPage;

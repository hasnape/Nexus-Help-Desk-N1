import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const DetailedDemoPage: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    t("docs.detailedDemo.steps.point1"),
    t("docs.detailedDemo.steps.point2"),
    t("docs.detailedDemo.steps.point3"),
    t("docs.detailedDemo.steps.point4"),
    t("docs.detailedDemo.steps.point5"),
  ];

  return (
    <div className="page-container section-stack">
      <header className="surface-card p-6 lg:p-8 space-y-3">
        <p className="section-eyebrow">{t("docs.detailedDemo.title")}</p>
        <h1 className="section-title">{t("docs.detailedDemo.title")}</h1>
        <p className="section-subtitle">{t("docs.detailedDemo.subtitle")}</p>
      </header>

      <section className="surface-card-soft p-6 lg:p-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">{t("docs.detailedDemo.steps.title")}</h2>
        <ol className="space-y-3 text-slate-200">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="surface-card p-6 lg:p-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">{t("docs.detailedDemo.useCase.title")}</h2>
        <p className="text-slate-200 text-sm leading-relaxed">
          {t("docs.detailedDemo.useCase.description")}
        </p>
        <p className="text-slate-200 text-sm leading-relaxed">{t("docs.detailedDemo.video")}</p>
      </section>
    </div>
  );
};

export default DetailedDemoPage;

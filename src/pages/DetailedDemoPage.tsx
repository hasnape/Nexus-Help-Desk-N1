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
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-wide">
            {t("docs.detailedDemo.title")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t("docs.detailedDemo.title")}
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            {t("docs.detailedDemo.subtitle")}
          </p>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {t("docs.detailedDemo.steps.title")}
          </h2>
          <ol className="space-y-3 text-slate-700">
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

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("docs.detailedDemo.useCase.title")}
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            {t("docs.detailedDemo.useCase.description")}
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">
            {t("docs.detailedDemo.video")}
          </p>
        </section>
      </div>
    </div>
  );
};

export default DetailedDemoPage;

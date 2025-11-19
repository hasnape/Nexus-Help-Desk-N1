import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const InvestorDeckPage: React.FC = () => {
  const { t } = useLanguage();

  const summaryPoints = [
    t("docs.investorDeck.summary.point1"),
    t("docs.investorDeck.summary.point2"),
    t("docs.investorDeck.summary.point3"),
    t("docs.investorDeck.summary.point4"),
    t("docs.investorDeck.summary.point5"),
  ];

  const problemPoints = [
    t("docs.investorDeck.problems.point1"),
    t("docs.investorDeck.problems.point2"),
    t("docs.investorDeck.problems.point3"),
  ];

  const valuePoints = [
    t("docs.investorDeck.value.point1"),
    t("docs.investorDeck.value.point2"),
    t("docs.investorDeck.value.point3"),
  ];

  return (
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-wide">
            {t("docs.investorDeck.title")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t("docs.investorDeck.title")}
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            {t("docs.investorDeck.subtitle")}
          </p>
          <div className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm font-medium">
            {t("landing.hero.betaBadge")}
          </div>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">
              {t("docs.investorDeck.summary.title")}
            </h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {summaryPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl bg-primary/5 text-slate-800 p-4 border border-primary/10"
              >
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  ✓
                </span>
                <span className="text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              {t("docs.investorDeck.problems.title")}
            </h2>
            <ul className="space-y-2 text-slate-700 text-sm">
              {problemPoints.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              {t("docs.investorDeck.value.title")}
            </h2>
            <ul className="space-y-2 text-slate-700 text-sm">
              {valuePoints.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("docs.investorDeck.vision.title")}
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            {t("docs.investorDeck.vision.point1")}
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">
            {t("docs.investorDeck.metricsNote")}
          </p>
          <p className="text-sm text-slate-500 mt-4">
            {t("docs.downloadHint")}
          </p>
          {/* Lien prêt pour futur PDF exporté depuis les .md (fichier non encore présent) */}
          <a
            href="/docs/investor-deck.pdf"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {t("docs.downloadPdf")}
          </a>
        </section>
      </div>
    </div>
  );
};

export default InvestorDeckPage;

import React from "react";
import { useTranslation } from "react-i18next";

const InvestorDeckPage: React.FC = () => {
  const { t } = useTranslation();

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
    <div className="page-container section-stack">
      <header className="surface-card p-6 lg:p-8 space-y-3">
        <p className="section-eyebrow">{t("docs.investorDeck.title")}</p>
        <h1 className="section-title">{t("docs.investorDeck.title")}</h1>
          <p className="section-subtitle">{t("docs.investorDeck.subtitle")}</p>
          <div className="inline-flex items-center rounded-full bg-amber-200/20 text-amber-100 px-3 py-1 text-sm font-medium">
            {t("docs.investorDeck.confidential")}
          </div>
        </header>

        <section className="surface-card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-white">{t("docs.investorDeck.summary.title")}</h2>
          <ul className="space-y-2 text-slate-200 text-sm">
            {summaryPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-white">{t("docs.investorDeck.problems.title")}</h2>
          <ul className="space-y-2 text-slate-200 text-sm">
            {problemPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-white">{t("docs.investorDeck.value.title")}</h2>
          <ul className="space-y-2 text-slate-200 text-sm">
            {valuePoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-300 mt-4">{t("docs.downloadHint")}</p>
        <a href="/docs/investor-deck.pdf" className="pill-link">
          {t("docs.downloadPdf")}
        </a>
      </section>
    </div>
  );
};

export default InvestorDeckPage;

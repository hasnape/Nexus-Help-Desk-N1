import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/FormElements";
import NexusSalesBotWidget from "../components/NexusSalesBotWidget";

const InvestorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
        <header className="space-y-4">
          <p className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {t("investor.badge")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t("investor.pageTitle")}
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            {t("investor.pageSubtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Deck%20investisseur"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {t("investor.hero.ctaDeck")}
            </a>
            <a
              href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Échange"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {t("investor.hero.ctaContact")}
            </a>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)] items-start">
          <div className="space-y-10">
            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("investor.section.problem.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.problem.p1")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.problem.p2")}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("investor.section.solution.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.solution.p1")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.solution.p2")}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("investor.section.market.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.market.p1")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.market.p2")}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("investor.section.model.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.model.p1")}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>{t("investor.section.model.list1")}</li>
                <li>{t("investor.section.model.list2")}</li>
                <li>{t("investor.section.model.list3")}</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.model.p2")}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("investor.section.traction.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.traction.p1")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.traction.p2")}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("investor.section.whyNow.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.whyNow.p1")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.whyNow.p2")}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("investor.section.edge.title")}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>{t("investor.section.edge.list1")}</li>
                <li>{t("investor.section.edge.list2")}</li>
                <li>{t("investor.section.edge.list3")}</li>
                <li>{t("investor.section.edge.list4")}</li>
              </ul>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("investor.section.contact.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.contact.p1")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t("investor.section.contact.p2")}
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Contact%20investisseur"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  {t("investor.section.contact.ctaMail")}
                </a>
                <a
                  href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Demande%20de%20d%C3%A9mo"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  {t("investor.section.contact.ctaDemo")}
                </a>
              </div>
            </section>
          </div>

          <aside className="space-y-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Synthèse en une minute
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li>
                • Produit : portail de support N1→N2, multi-entreprises, avec
                moteur d’automatisation Nexus.
              </li>
              <li>
                • Cible : PME/ETI, ESN, éditeurs SaaS avec équipes support
                structurées.
              </li>
              <li>
                • Stack : React/TypeScript, Supabase (PostgreSQL, Auth, RLS),
                technologies Gemini de Google, intégration PayPal, RGAA 4.1.
              </li>
              <li>
                • Modèle : SaaS par plan, extensible par volume et usage du
                moteur Nexus.
              </li>
            </ul>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
              <p>
                💡 Nexus se positionne entre les outils de ticketing
                traditionnels et les briques d’automatisation brutes : une
                solution prête à l’emploi pour des équipes qui veulent
                industrialiser leur support sans perdre la maîtrise des
                interactions.
              </p>
            </div>

            <div>
              <Button
                variant="outline"
                size="sm"
                className="!text-primary !border-primary !px-4 !py-2"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {t("navbar.investors", { defaultValue: "Investisseurs" })}
              </Button>
            </div>
          </aside>
        </div>
      </div>
      <NexusSalesBotWidget />
    </div>
  );
};

export default InvestorPage;

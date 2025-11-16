import React from "react";
import { useTranslation } from "react-i18next";

const InvestorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="container mx-auto px-4 py-10 lg:py-16">
        {/* HERO */}
        <header className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide">
            {t("investor.badge")}
          </span>

          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            {t("investor.pageTitle")}
          </h1>

          <p className="mt-4 text-base md:text-lg text-slate-300">
            {t("investor.pageSubtitle")}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Deck%20investisseur"
              className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-slate-950 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {t("investor.hero.ctaDeck")}
            </a>
            <a
              href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Échange"
              className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {t("investor.hero.ctaContact")}
            </a>
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)] items-start">
          {/* Colonne principale */}
          <div className="space-y-10">
            {/* Problème */}
            <section className="border-t border-slate-800 pt-6">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                {t("investor.section.problem.title")}
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.problem.p1")}
              </p>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.problem.p2")}
              </p>
            </section>

            {/* Solution */}
            <section className="border-t border-slate-800 pt-6">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                {t("investor.section.solution.title")}
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.solution.p1")}
              </p>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.solution.p2")}
              </p>
            </section>

            {/* Marché */}
            <section className="border-t border-slate-800 pt-6">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                {t("investor.section.market.title")}
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.market.p1")}
              </p>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.market.p2")}
              </p>
            </section>

            {/* Modèle économique */}
            <section className="border-t border-slate-800 pt-6">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                {t("investor.section.model.title")}
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.model.p1")}
              </p>
              <ul className="mt-3 space-y-2 text-sm md:text-base text-slate-200">
                <li>• {t("investor.section.model.list1")}</li>
                <li>• {t("investor.section.model.list2")}</li>
                <li>• {t("investor.section.model.list3")}</li>
              </ul>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.model.p2")}
              </p>
            </section>

            {/* Traction & roadmap */}
            <section className="border-t border-slate-800 pt-6">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                {t("investor.section.traction.title")}
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.traction.p1")}
              </p>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.traction.p2")}
              </p>
            </section>

            {/* Why now */}
            <section className="border-t border-slate-800 pt-6">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                {t("investor.section.whyNow.title")}
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.whyNow.p1")}
              </p>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.whyNow.p2")}
              </p>
            </section>

            {/* Différenciation */}
            <section className="border-t border-slate-800 pt-6">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                {t("investor.section.edge.title")}
              </h2>
              <ul className="mt-3 space-y-2 text-sm md:text-base text-slate-200">
                <li>• {t("investor.section.edge.list1")}</li>
                <li>• {t("investor.section.edge.list2")}</li>
                <li>• {t("investor.section.edge.list3")}</li>
                <li>• {t("investor.section.edge.list4")}</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="border-t border-slate-800 pt-6">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                {t("investor.section.contact.title")}
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.contact.p1")}
              </p>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                {t("investor.section.contact.p2")}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Contact%20investisseur"
                  className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-slate-950 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  {t("investor.section.contact.ctaMail")}
                </a>
                <a
                  href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Demande%20de%20d%C3%A9mo"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  {t("investor.section.contact.ctaDemo")}
                </a>
              </div>
            </section>
          </div>

          {/* Colonne droite : résumé investisseur */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg shadow-black/40">
            <h2 className="text-base md:text-lg font-semibold tracking-tight">
              Synthèse en une minute
            </h2>
            <ul className="mt-3 space-y-2 text-xs md:text-sm text-slate-200">
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

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
              <p>
                💡 Nexus se positionne entre les outils de ticketing
                traditionnels et les briques d’automatisation brutes : une
                solution prête à l’emploi pour des équipes qui veulent
                industrialiser leur support sans perdre la maîtrise des
                interactions.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default InvestorPage;

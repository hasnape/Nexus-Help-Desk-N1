import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/FormElements";
import NexusSalesBotWidget from "../components/NexusSalesBotWidget";
import Layout from "../components/Layout";

const InvestorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout mainClassName="page-shell py-10 lg:py-14">
      <div className="page-container section-stack">
        <section className="surface-card p-6 lg:p-8 space-y-4">
          <p className="section-eyebrow">{t("investor.badge")}</p>
          <div className="space-y-3">
            <h1 className="section-title">{t("investor.pageTitle")}</h1>
            <p className="section-subtitle">{t("investor.pageSubtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Deck%20investisseur"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {t("investor.hero.ctaDeck")}
            </a>
            <a
              href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Échange"
              className="inline-flex items-center justify-center rounded-xl border border-slate-500/60 px-5 py-3 text-sm font-semibold text-slate-50 shadow-sm transition hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {t("investor.hero.ctaContact")}
            </a>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr),minmax(0,0.9fr)] items-start">
          <div className="section-stack">
            <section className="surface-card p-6 lg:p-7 space-y-3">
              <h2 className="section-title text-2xl">{t("investor.section.problem.title")}</h2>
              <p className="muted-copy">{t("investor.section.problem.p1")}</p>
              <p className="muted-copy">{t("investor.section.problem.p2")}</p>
            </section>

            <section className="surface-card p-6 lg:p-7 space-y-3">
              <h2 className="section-title text-2xl">{t("investor.section.solution.title")}</h2>
              <p className="muted-copy">{t("investor.section.solution.p1")}</p>
              <p className="muted-copy">{t("investor.section.solution.p2")}</p>
            </section>

            <section className="surface-card p-6 lg:p-7 space-y-3">
              <h2 className="section-title text-2xl">{t("investor.section.market.title")}</h2>
              <p className="muted-copy">{t("investor.section.market.p1")}</p>
              <p className="muted-copy">{t("investor.section.market.p2")}</p>
            </section>

            <section className="surface-card p-6 lg:p-7 space-y-3">
              <h2 className="section-title text-2xl">{t("investor.section.model.title")}</h2>
              <p className="muted-copy">{t("investor.section.model.p1")}</p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-200">
                <li>{t("investor.section.model.list1")}</li>
                <li>{t("investor.section.model.list2")}</li>
                <li>{t("investor.section.model.list3")}</li>
              </ul>
              <p className="muted-copy">{t("investor.section.model.p2")}</p>
            </section>

            <section className="surface-card p-6 lg:p-7 space-y-3">
              <h2 className="section-title text-2xl">{t("investor.section.traction.title")}</h2>
              <p className="muted-copy">{t("investor.section.traction.p1")}</p>
              <p className="muted-copy">{t("investor.section.traction.p2")}</p>
            </section>

            <section className="surface-card p-6 lg:p-7 space-y-3">
              <h2 className="section-title text-2xl">{t("investor.section.whyNow.title")}</h2>
              <p className="muted-copy">{t("investor.section.whyNow.p1")}</p>
              <p className="muted-copy">{t("investor.section.whyNow.p2")}</p>
            </section>

            <section className="surface-card p-6 lg:p-7 space-y-3">
              <h2 className="section-title text-2xl">{t("investor.section.edge.title")}</h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-200">
                <li>{t("investor.section.edge.list1")}</li>
                <li>{t("investor.section.edge.list2")}</li>
                <li>{t("investor.section.edge.list3")}</li>
                <li>{t("investor.section.edge.list4")}</li>
              </ul>
            </section>

            <section className="surface-card p-6 lg:p-7 space-y-4">
              <h2 className="section-title text-2xl">{t("investor.section.contact.title")}</h2>
              <p className="muted-copy">{t("investor.section.contact.p1")}</p>
              <p className="muted-copy">{t("investor.section.contact.p2")}</p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Contact%20investisseur"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  {t("investor.section.contact.ctaMail")}
                </a>
                <a
                  href="mailto:hubnexusinfo@gmail.com?subject=Nexus%20Support%20Hub%20-%20Demande%20de%20d%C3%A9mo"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-500/60 px-5 py-3 text-sm font-semibold text-slate-50 shadow-sm transition hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  {t("investor.section.contact.ctaDemo")}
                </a>
              </div>
            </section>
          </div>

          <aside className="surface-card-soft p-6 lg:p-7 space-y-4">
            <h2 className="text-lg font-semibold text-white">Synthèse en une minute</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-200">
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

            <div className="surface-card p-4 text-sm text-slate-200 space-y-2">
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
                className="!px-4 !py-2"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {t("navbar.investors", { defaultValue: "Investisseurs" })}
              </Button>
            </div>
          </aside>
        </div>
      </div>
      <NexusSalesBotWidget />
    </Layout>
  );
};

export default InvestorPage;

import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const EnterprisePage: React.FC = () => {
  const { t } = useTranslation();

  return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <section className="container mx-auto px-4 py-10 lg:py-16">
          {/* HERO */}
          <header className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              {t("enterprise.badge")}
            </span>

            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
              {t("enterprise.pageTitle")}
            </h1>

            <p className="mt-4 text-base md:text-lg text-slate-300">
              {t("enterprise.pageSubtitle")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="mailto:hubnexusinfo@gmail.com"
                className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-slate-950 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                {t("enterprise.hero.ctaDemo")}
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                {t("enterprise.hero.ctaContact")}
              </Link>
            </div>
          </header>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)] items-start">
            {/* Colonne principale */}
            <div className="space-y-10">
              {/* Contexte */}
              <section className="border-t border-slate-800 pt-6">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                  {t("enterprise.section.context.title")}
                </h2>
                <p className="mt-4 text-sm md:text-base text-slate-200">
                  {t("enterprise.section.context.p1")}
                </p>
                <p className="mt-3 text-sm md:text-base text-slate-200">
                  {t("enterprise.section.context.p2")}
                </p>
              </section>

              {/* Valeur pour l’entreprise */}
              <section className="border-t border-slate-800 pt-6">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                  {t("enterprise.section.value.title")}
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <article className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <h3 className="text-sm font-semibold">
                      {t("enterprise.section.value.item1.title")}
                    </h3>
                    <p className="mt-2 text-xs md:text-sm text-slate-200">
                      {t("enterprise.section.value.item1.desc")}
                    </p>
                  </article>
                  <article className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <h3 className="text-sm font-semibold">
                      {t("enterprise.section.value.item2.title")}
                    </h3>
                    <p className="mt-2 text-xs md:text-sm text-slate-200">
                      {t("enterprise.section.value.item2.desc")}
                    </p>
                  </article>
                  <article className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <h3 className="text-sm font-semibold">
                      {t("enterprise.section.value.item3.title")}
                    </h3>
                    <p className="mt-2 text-xs md:text-sm text-slate-200">
                      {t("enterprise.section.value.item3.desc")}
                    </p>
                  </article>
                  <article className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <h3 className="text-sm font-semibold">
                      {t("enterprise.section.value.item4.title")}
                    </h3>
                    <p className="mt-2 text-xs md:text-sm text-slate-200">
                      {t("enterprise.section.value.item4.desc")}
                    </p>
                  </article>
                </div>
              </section>

              {/* Cas d’usage */}
              <section className="border-t border-slate-800 pt-6">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                  {t("enterprise.section.useCases.title")}
                </h2>
                <ul className="mt-4 space-y-2 text-sm md:text-base text-slate-200">
                  <li>• {t("enterprise.section.useCases.item1")}</li>
                  <li>• {t("enterprise.section.useCases.item2")}</li>
                  <li>• {t("enterprise.section.useCases.item3")}</li>
                  <li>• {t("enterprise.section.useCases.item4")}</li>
                </ul>
              </section>

              {/* Intégration */}
              <section className="border-t border-slate-800 pt-6">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                  {t("enterprise.section.integration.title")}
                </h2>
                <p className="mt-3 text-sm md:text-base text-slate-200">
                  {t("enterprise.section.integration.p1")}
                </p>
                <p className="mt-3 text-sm md:text-base text-slate-200">
                  {t("enterprise.section.integration.p2")}
                </p>
                <ul className="mt-4 space-y-2 text-sm md:text-base text-slate-200">
                  <li>• {t("enterprise.section.integration.list1")}</li>
                  <li>• {t("enterprise.section.integration.list2")}</li>
                  <li>• {t("enterprise.section.integration.list3")}</li>
                </ul>
              </section>

              {/* Plans */}
              <section className="border-t border-slate-800 pt-6">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                  {t("enterprise.section.plans.title")}
                </h2>
                <p className="mt-3 text-sm md:text-base text-slate-200">
                  {t("enterprise.section.plans.p1")}
                </p>
                <p className="mt-3 text-sm md:text-base text-slate-200">
                  {t("enterprise.section.plans.p2")}
                </p>
              </section>

              {/* Prochaine étape */}
              <section className="border-t border-slate-800 pt-6">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                  {t("enterprise.section.next.title")}
                </h2>
                <p className="mt-3 text-sm md:text-base text-slate-200">
                  {t("enterprise.section.next.p1")}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href="mailto:hubnexusinfo@gmail.com"
                    className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-slate-950 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
                  >
                    {t("enterprise.section.next.ctaDemo")}
                  </a>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
                  >
                    {t("enterprise.section.next.ctaContact")}
                  </Link>
                </div>
              </section>
            </div>

            {/* Colonne droite : résumé décisionnel */}
            <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg shadow-black/40">
              <h2 className="text-base md:text-lg font-semibold tracking-tight">
                Décision rapide : Nexus est-il adapté à votre contexte ?
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                ✓ Vous gérez déjà un volume important de demandes (emails,
                appels, messages) et voulez les centraliser dans un portail
                unique.<br />
                ✓ Votre support N1 est saturé et vous cherchez à réduire le
                temps passé sur les tickets simples.<br />
                ✓ Vous avez besoin d’une traçabilité claire, de statistiques en
                temps réel et d’une solution conforme aux bonnes pratiques
                d’accessibilité.
              </p>

              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p>
                  💡 Vous pouvez démarrer avec un petit périmètre (un service,
                  une équipe, un pays) puis élargir progressivement l’usage de
                  Nexus à l’ensemble de votre organisation.
                </p>
              </div>

              <div className="mt-5">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center rounded-lg border border-primary/70 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  Voir les offres et plans
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
  );
};

export default EnterprisePage;

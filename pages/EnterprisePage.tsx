import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "../components/FormElements";
import NexusSalesBotWidget from "../components/NexusSalesBotWidget";
import MarketingLayout from "../components/MarketingLayout";

const EnterprisePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* Navbar and Footer are already handled by the global Layout wrapper */}
      <MarketingLayout>
        <div className="section-stack">
          <section className="surface-card p-6 lg:p-8 space-y-4">
            <p className="section-eyebrow">{t("enterprise.badge")}</p>
            <div className="space-y-3">
              <h1 className="section-title">{t("enterprise.pageTitle")}</h1>
              <p className="section-subtitle">{t("enterprise.pageSubtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:hubnexusinfo@gmail.com"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                {t("enterprise.hero.ctaDemo")}
              </a>
              <Link to="/contact" className="inline-flex">
                <Button variant="outline" className="!px-5 !py-3 !text-sm">
                  {t("enterprise.hero.ctaContact")}
                </Button>
              </Link>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr),minmax(0,0.9fr)] items-start">
            <div className="section-stack">
              <section className="surface-card p-6 lg:p-7 space-y-3">
                <h2 className="section-title text-2xl">{t("enterprise.section.context.title")}</h2>
                <p className="muted-copy">{t("enterprise.section.context.p1")}</p>
                <p className="muted-copy">{t("enterprise.section.context.p2")}</p>
              </section>

              <section className="surface-card p-6 lg:p-7 space-y-5">
                <h2 className="section-title text-2xl">{t("enterprise.section.value.title")}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <article key={item} className="surface-card-soft p-4 space-y-2">
                      <h3 className="text-base font-semibold text-white">
                        {t(`enterprise.section.value.item${item}.title` as const)}
                      </h3>
                      <p className="muted-copy">
                        {t(`enterprise.section.value.item${item}.desc` as const)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="surface-card p-6 lg:p-7 space-y-3">
                <h2 className="section-title text-2xl">{t("enterprise.section.useCases.title")}</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-200">
                  <li>{t("enterprise.section.useCases.item1")}</li>
                  <li>{t("enterprise.section.useCases.item2")}</li>
                  <li>{t("enterprise.section.useCases.item3")}</li>
                  <li>{t("enterprise.section.useCases.item4")}</li>
                </ul>
              </section>

              <section className="surface-card p-6 lg:p-7 space-y-3">
                <h2 className="section-title text-2xl">{t("enterprise.section.integration.title")}</h2>
                <p className="muted-copy">{t("enterprise.section.integration.p1")}</p>
                <p className="muted-copy">{t("enterprise.section.integration.p2")}</p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-200">
                  <li>{t("enterprise.section.integration.list1")}</li>
                  <li>{t("enterprise.section.integration.list2")}</li>
                  <li>{t("enterprise.section.integration.list3")}</li>
                </ul>
              </section>

              <section className="surface-card p-6 lg:p-7 space-y-3">
                <h2 className="section-title text-2xl">{t("enterprise.section.plans.title")}</h2>
                <p className="muted-copy">{t("enterprise.section.plans.p1")}</p>
                <p className="muted-copy">{t("enterprise.section.plans.p2")}</p>
              </section>

              <section className="surface-card p-6 lg:p-7 space-y-4">
                <h2 className="section-title text-2xl">{t("enterprise.section.next.title")}</h2>
                <p className="muted-copy">{t("enterprise.section.next.p1")}</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:hubnexusinfo@gmail.com"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                  >
                    {t("enterprise.section.next.ctaDemo")}
                  </a>
                  <Link to="/contact" className="inline-flex">
                    <Button variant="outline" className="!px-5 !py-3 !text-sm">
                      {t("enterprise.section.next.ctaContact")}
                    </Button>
                  </Link>
                </div>
              </section>
            </div>

            <aside className="surface-card-soft p-6 lg:p-7 space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Décision rapide : Nexus est-il adapté à votre contexte ?
              </h2>
              <p className="muted-copy">
                ✓ Vous gérez déjà un volume important de demandes (emails, appels,
                messages) et voulez les centraliser dans un portail unique.<br />
                ✓ Votre support N1 est saturé et vous cherchez à réduire le temps
                passé sur les tickets simples.<br />
                ✓ Vous avez besoin d’une traçabilité claire, de statistiques en
                temps réel et d’une solution conforme aux bonnes pratiques
                d’accessibilité.
              </p>

              <div className="surface-card p-4 space-y-2">
                <p className="text-sm text-slate-200">
                  💡 Vous pouvez démarrer avec un petit périmètre (un service, une
                  équipe, un pays) puis élargir progressivement l’usage de Nexus à
                  l’ensemble de votre organisation.
                </p>
              </div>

              <div>
                <Link to="/pricing" className="inline-flex">
                  <Button variant="outline" size="sm" className="!px-4 !py-2">
                    Voir les offres et plans
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </MarketingLayout>
      <NexusSalesBotWidget />
    </>
  );
};

export default EnterprisePage;

import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../components/FormElements";
import NexusSalesBotWidget from "@/components/NexusSalesBotWidget";

const EnterprisePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
        <header className="space-y-4">
          <p className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {t("enterprise.badge")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t("enterprise.pageTitle")}
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            {t("enterprise.pageSubtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:hubnexusinfo@gmail.com"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {t("enterprise.hero.ctaDemo")}
            </a>
            <Link to="/contact" className="inline-flex">
              <Button
                variant="outline"
                className="!px-5 !py-3 !text-sm !border-slate-300 !text-slate-800 hover:!bg-white"
              >
                {t("enterprise.hero.ctaContact")}
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)] items-start">
          <div className="space-y-10">
            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("enterprise.section.context.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("enterprise.section.context.p1")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t("enterprise.section.context.p2")}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-5">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("enterprise.section.value.title")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <article
                    key={item}
                    className="rounded-xl bg-white border border-slate-200 shadow-sm p-4 space-y-2"
                  >
                    <h3 className="text-base font-semibold text-slate-900">
                      {t(`enterprise.section.value.item${item}.title` as const)}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {t(`enterprise.section.value.item${item}.desc` as const)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("enterprise.section.useCases.title")}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>{t("enterprise.section.useCases.item1")}</li>
                <li>{t("enterprise.section.useCases.item2")}</li>
                <li>{t("enterprise.section.useCases.item3")}</li>
                <li>{t("enterprise.section.useCases.item4")}</li>
              </ul>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("enterprise.section.integration.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("enterprise.section.integration.p1")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t("enterprise.section.integration.p2")}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>{t("enterprise.section.integration.list1")}</li>
                <li>{t("enterprise.section.integration.list2")}</li>
                <li>{t("enterprise.section.integration.list3")}</li>
              </ul>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("enterprise.section.plans.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("enterprise.section.plans.p1")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t("enterprise.section.plans.p2")}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-6 space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t("enterprise.section.next.title")}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {t("enterprise.section.next.p1")}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:hubnexusinfo@gmail.com"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  {t("enterprise.section.next.ctaDemo")}
                </a>
                <Link to="/contact" className="inline-flex">
                  <Button
                    variant="outline"
                    className="!px-5 !py-3 !text-sm !border-slate-300 !text-slate-800 hover:!bg-white"
                  >
                    {t("enterprise.section.next.ctaContact")}
                  </Button>
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Décision rapide : Nexus est-il adapté à votre contexte ?
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              ✓ Vous gérez déjà un volume important de demandes (emails, appels,
              messages) et voulez les centraliser dans un portail unique.<br />
              ✓ Votre support N1 est saturé et vous cherchez à réduire le temps
              passé sur les tickets simples.<br />
              ✓ Vous avez besoin d’une traçabilité claire, de statistiques en
              temps réel et d’une solution conforme aux bonnes pratiques
              d’accessibilité.
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
              <p>
                💡 Vous pouvez démarrer avec un petit périmètre (un service, une
                équipe, un pays) puis élargir progressivement l’usage de Nexus à
                l’ensemble de votre organisation.
              </p>
            </div>

            <div>
              <Link to="/pricing" className="inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="!text-primary !border-primary !px-4 !py-2"
                >
                  Voir les offres et plans
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>
      <NexusSalesBotWidget />
    </div>
  );
};

export default EnterprisePage;

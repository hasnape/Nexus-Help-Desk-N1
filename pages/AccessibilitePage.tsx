import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../components/Layout";

const AccessibilitePage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const org = {
    name: "Rép&Web",
    address: "10 Grande Rue de Saint-Clair, 69300",
    email: "repweb.69@laposte.net",
    serviceUrl: "https://nexussupporthub.eu",
  };

  const today = new Date().toLocaleDateString(i18n.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout mainClassName="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        <header className="space-y-4">
          <p className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-wide">
            {t("accessibility.title")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t("accessibility.title")}
          </h1>
          <p className="text-slate-700 leading-relaxed">
            {t("accessibility.intro", {
              orgName: org.name,
              address: org.address,
              email: org.email,
              serviceUrl: org.serviceUrl,
            })}
          </p>
        </header>

        <nav
          aria-label={t("accessibility.onThisPage") || undefined}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            {t("accessibility.onThisPage")}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm text-slate-800">
            <li>
              <a className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded" href="#etat">
                {t("accessibility.toc.state")}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded" href="#resultats">
                {t("accessibility.toc.results")}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded" href="#non-accessible">
                {t("accessibility.toc.nonAccessible")}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded" href="#alternatives">
                {t("accessibility.toc.alternatives")}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded" href="#technos">
                {t("accessibility.toc.technologies")}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded" href="#contact">
                {t("accessibility.toc.improvementContact")}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded" href="#recours">
                {t("accessibility.toc.remedies")}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded" href="#maj">
                {t("accessibility.toc.updated")}
              </a>
            </li>
          </ul>
        </nav>

        <div className="space-y-10">
          <section id="etat" aria-labelledby="h-etat" className="space-y-3">
            <h2 id="h-etat" className="text-2xl font-semibold text-slate-900">
              {t("accessibility.state.title")}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {t("accessibility.state.content")}
            </p>
          </section>

          <section id="resultats" aria-labelledby="h-resultats" className="space-y-3">
            <h2 id="h-resultats" className="text-2xl font-semibold text-slate-900">
              {t("accessibility.results.title")}
            </h2>
            <p className="text-slate-700">
              {t("accessibility.results.rate")}
            </p>
            <p className="text-slate-700">
              {t("accessibility.results.pages")}
            </p>
          </section>

          <section id="non-accessible" aria-labelledby="h-non-accessible" className="space-y-3">
            <h2 id="h-non-accessible" className="text-2xl font-semibold text-slate-900">
              {t("accessibility.nonAccessible.title")}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>{t("accessibility.nonAccessible.item1")}</li>
              <li>{t("accessibility.nonAccessible.item2")}</li>
              <li>{t("accessibility.nonAccessible.item3")}</li>
            </ul>
            <p className="text-slate-700">
              {t("accessibility.nonAccessible.derogations")}
            </p>
          </section>

          <section id="alternatives" aria-labelledby="h-alternatives" className="space-y-3">
            <h2 id="h-alternatives" className="text-2xl font-semibold text-slate-900">
              {t("accessibility.alternatives.title")}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>{t("accessibility.alternatives.item1")}</li>
              <li>{t("accessibility.alternatives.item2")}</li>
              <li>{t("accessibility.alternatives.item3")}</li>
            </ul>
          </section>

          <section id="technos" aria-labelledby="h-technos" className="space-y-3">
            <h2 id="h-technos" className="text-2xl font-semibold text-slate-900">
              {t("accessibility.tech.title")}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {t("accessibility.tech.content")}
            </p>
          </section>

          <section id="contact" aria-labelledby="h-contact" className="space-y-3">
            <h2 id="h-contact" className="text-2xl font-semibold text-slate-900">
              {t("accessibility.contact.title")}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {t("accessibility.contact.content", { email: org.email })}{" "}
              <Link
                to="/contact"
                className="font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                {t("accessibility.contact.formLink")}
              </Link>
              .
            </p>
          </section>

          <section id="recours" aria-labelledby="h-recours" className="space-y-3">
            <h2 id="h-recours" className="text-2xl font-semibold text-slate-900">
              {t("accessibility.remedies.title")}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {t("accessibility.remedies.content")}
            </p>
          </section>

          <section id="maj" aria-labelledby="h-maj" className="space-y-3">
            <h2 id="h-maj" className="text-2xl font-semibold text-slate-900">
              {t("accessibility.updated.title")}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {t("accessibility.updated.content", { date: today })}
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AccessibilitePage;

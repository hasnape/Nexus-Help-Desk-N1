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
    <Layout>
      <div className="min-h-screen bg-white text-slate-800">

        {/* Skip link */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-black focus:text-white focus:px-3 focus:py-2 rounded"
        >
          {t("accessibility.skipToContent")}
        </a>

        <main id="content" role="main" className="pt-20">
          <section className="py-10 px-4">
            <div className="container mx-auto max-w-4xl">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">
                {t("accessibility.title")}
              </h1>

              <p className="text-slate-700 mb-6">
                {t("accessibility.intro", {
                  orgName: org.name,
                  address: org.address,
                  email: org.email,
                  serviceUrl: org.serviceUrl,
                })}
              </p>

              {/* Sommaire */}
              <nav aria-label={t("accessibility.onThisPage") || undefined} className="mb-8">
                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                  <li><a className="underline" href="#etat">{t("accessibility.toc.state")}</a></li>
                  <li><a className="underline" href="#resultats">{t("accessibility.toc.results")}</a></li>
                  <li><a className="underline" href="#non-accessible">{t("accessibility.toc.nonAccessible")}</a></li>
                  <li><a className="underline" href="#alternatives">{t("accessibility.toc.alternatives")}</a></li>
                  <li><a className="underline" href="#technos">{t("accessibility.toc.technologies")}</a></li>
                  <li><a className="underline" href="#contact">{t("accessibility.toc.improvementContact")}</a></li>
                  <li><a className="underline" href="#recours">{t("accessibility.toc.remedies")}</a></li>
                  <li><a className="underline" href="#maj">{t("accessibility.toc.updated")}</a></li>
                </ul>
              </nav>

              {/* État de conformité */}
              <section id="etat" aria-labelledby="h-etat" className="mb-10">
                <h2 id="h-etat" className="text-2xl font-semibold mb-3">
                  {t("accessibility.state.title")}
                </h2>
                <p className="text-slate-700">
                  {t("accessibility.state.content")}
                </p>
              </section>

              {/* Résultats des tests */}
              <section id="resultats" aria-labelledby="h-resultats" className="mb-10">
                <h2 id="h-resultats" className="text-2xl font-semibold mb-3">
                  {t("accessibility.results.title")}
                </h2>
                <p className="text-slate-700 mb-2">
                  {t("accessibility.results.rate")}
                </p>
                <p className="text-slate-700">
                  {t("accessibility.results.pages")}
                </p>
              </section>

              {/* Contenus non accessibles */}
              <section id="non-accessible" aria-labelledby="h-non-accessible" className="mb-10">
                <h2 id="h-non-accessible" className="text-2xl font-semibold mb-3">
                  {t("accessibility.nonAccessible.title")}
                </h2>
                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                  <li>{t("accessibility.nonAccessible.item1")}</li>
                  <li>{t("accessibility.nonAccessible.item2")}</li>
                  <li>{t("accessibility.nonAccessible.item3")}</li>
                </ul>
                <p className="text-slate-700 mt-3">
                  {t("accessibility.nonAccessible.derogations")}
                </p>
              </section>

              {/* Alternatives proposées */}
              <section id="alternatives" aria-labelledby="h-alternatives" className="mb-10">
                <h2 id="h-alternatives" className="text-2xl font-semibold mb-3">
                  {t("accessibility.alternatives.title")}
                </h2>
                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                  <li>{t("accessibility.alternatives.item1")}</li>
                  <li>{t("accessibility.alternatives.item2")}</li>
                  <li>{t("accessibility.alternatives.item3")}</li>
                </ul>
              </section>

              {/* Technologies */}
              <section id="technos" aria-labelledby="h-technos" className="mb-10">
                <h2 id="h-technos" className="text-2xl font-semibold mb-3">
                  {t("accessibility.tech.title")}
                </h2>
                <p className="text-slate-700">
                  {t("accessibility.tech.content")}
                </p>
              </section>

              {/* Amélioration & contact */}
              <section id="contact" aria-labelledby="h-contact" className="mb-10">
                <h2 id="h-contact" className="text-2xl font-semibold mb-3">
                  {t("accessibility.contact.title")}
                </h2>
                <p className="text-slate-700">
                  {t("accessibility.contact.content", { email: org.email })}{" "}
                  <Link to="/contact" className="underline">
                    {t("accessibility.contact.formLink")}
                  </Link>.
                </p>
              </section>

              {/* Voies de recours */}
              <section id="recours" aria-labelledby="h-recours" className="mb-10">
                <h2 id="h-recours" className="text-2xl font-semibold mb-3">
                  {t("accessibility.remedies.title")}
                </h2>
                <p className="text-slate-700">
                  {t("accessibility.remedies.content")}
                </p>
              </section>

              {/* Mise à jour */}
              <section id="maj" aria-labelledby="h-maj" className="mb-4">
                <h2 id="h-maj" className="text-2xl font-semibold mb-3">
                  {t("accessibility.updated.title")}
                </h2>
                <p className="text-slate-700">
                  {t("accessibility.updated.content", { date: today })}
                </p>
              </section>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default AccessibilitePage;

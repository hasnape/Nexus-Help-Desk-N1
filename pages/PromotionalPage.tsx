import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../App";

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

const PromotionalPage: React.FC = () => {
  const { t, ready } = useTranslation(["promotional", "common"]);
  const { user } = useApp();
  const location = useLocation();

  const backLinkDestination = user ? "/dashboard" : "/login";

  const renderSection = (titleKey: string, contentKey: string) => {
    const title = t(titleKey);
    const content = t(contentKey);

    if (!title || !content || title === titleKey || content === contentKey) {
      return (
        <section className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⚠️ Contenu en cours de chargement... (Clé: {titleKey})
            </p>
          </div>
        </section>
      );
    }

    return (
      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3 pb-2 border-b border-slate-300">
          {title}
        </h2>
        <div
          className="prose prose-slate max-w-none text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </section>
    );
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des traductions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <Link
            to={backLinkDestination}
            state={{ from: location }}
            className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 me-2" />
            {t("promotional:backToApp", {
              defaultValue: "Retour à l'application",
            })}
          </Link>
        </div>

        <main className="bg-white p-4 sm:p-6 lg:p-10 rounded-lg shadow-lg">
          <header className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 mb-2">
              {t("promotional:mainTitle", {
                defaultValue: "Nexus Support Hub",
              })}
            </h1>
            <p className="text-sm sm:text-lg text-slate-500">
              {t("promotional:mainSubtitle", {
                defaultValue: "Document promotionnel",
              })}
            </p>
          </header>

          <article>
            {renderSection(
              "promotional:sections.intro.title",
              "promotional:sections.intro.content"
            )}
            {renderSection(
              "promotional:sections.features.title",
              "promotional:sections.features.content"
            )}
            {renderSection(
              "promotional:sections.advantages.title",
              "promotional:sections.advantages.content"
            )}
            {renderSection(
              "promotional:sections.limits.title",
              "promotional:sections.limits.content"
            )}
            {renderSection(
              "promotional:sections.future.title",
              "promotional:sections.future.content"
            )}
            {renderSection(
              "promotional:sections.conclusion.title",
              "promotional:sections.conclusion.content"
            )}
          </article>
        </main>

        <footer className="py-6 sm:py-8 mt-6 sm:mt-8 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {t("common:appName")}.{" "}
            {t("common:footer.allRightsReserved")}
          </p>
          <p className="mt-2">
            <Link to="/legal" className="hover:text-primary hover:underline">
              {t("common:footer.legalLink")}
            </Link>
            <span className="mx-2 text-slate-400">|</span>
            <Link to="/manual" className="hover:text-primary hover:underline">
              {t("common:footer.userManualLink")}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PromotionalPage;

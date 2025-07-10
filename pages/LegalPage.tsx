import React, { useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../App";
import { LoadingSpinner } from "../components/LoadingSpinner";

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

const LegalPage: React.FC = () => {
  const { t } = useTranslation(["legal", "common"]);
  const { user } = useApp();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("cgu");

  const tabs = [
    { id: "cgu", labelKey: "tabs.cgu" },
    { id: "privacy", labelKey: "tabs.privacy" },
    { id: "ip", labelKey: "tabs.ip" },
    { id: "integration", labelKey: "tabs.integration" },
    { id: "api", labelKey: "tabs.api" },
    { id: "security", labelKey: "tabs.security" },
    { id: "pricing", labelKey: "tabs.pricing" },
    { id: "sla", labelKey: "tabs.sla" },
  ];

  const renderContent = () => {
    const renderSection = (sectionKey: string) => (
      <article className="prose prose-slate max-w-none prose-p:text-slate-600 prose-h2:text-slate-800 prose-h2:mb-2 prose-h2:mt-6 prose-a:text-primary hover:prose-a:text-primary-dark">
        <h1 className="text-primary">{t(`${sectionKey}.title`)}</h1>
        <p className="text-xs text-slate-500 italic">
          {t(`${sectionKey}.lastUpdated`)}
        </p>
        <div dangerouslySetInnerHTML={{ __html: t(`${sectionKey}.content`) }} />
      </article>
    );

    return renderSection(activeTab);
  };

  const backLinkDestination = user ? "/dashboard" : "/login";

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              to={backLinkDestination}
              state={{ from: location }}
              className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
            >
              <ArrowLeftIcon className="w-5 h-5 me-2" />
              {t("backToApp")}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4 lg:w-1/5">
              <nav className="sticky top-24">
                <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">
                  {t("pageTitle")}
                </h2>
                <ul className="space-y-1">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-start px-3 py-2 rounded-md font-medium text-sm transition-colors duration-150 ${
                          activeTab === tab.id
                            ? "bg-primary/10 text-primary"
                            : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                        }`}
                      >
                        {t(tab.labelKey)}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <main className="md:w-3/4 lg:w-4/5 bg-surface p-6 sm:p-8 rounded-lg shadow-lg">
              {renderContent()}
            </main>
          </div>

          <footer className="py-8 mt-8 border-t border-slate-200 text-center text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} {t("appName", { ns: "common" })}
              . {t("footer.allRightsReserved", { ns: "common" })}
            </p>
            <p className="mt-1">
              <Link to="/legal" className="hover:text-primary hover:underline">
                {t("footer.legalLink", { ns: "common" })}
              </Link>
              <span className="mx-2 text-slate-400">|</span>
              <Link to="/manual" className="hover:text-primary hover:underline">
                {t("footer.userManualLink", { ns: "common" })}
              </Link>
              <span className="mx-2 text-slate-400">|</span>
              <Link
                to="/presentation"
                className="hover:text-primary hover:underline"
              >
                {t("footer.promotionalLink", { ns: "common" })}
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </Suspense>
  );
};

export default LegalPage;

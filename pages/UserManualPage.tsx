import React, { Suspense } from "react";
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

const UserManualPage: React.FC = () => {
  const { t } = useTranslation(["userManual", "common"]);
  const { user } = useApp();
  const location = useLocation();

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

          <main className="bg-surface p-6 sm:p-10 rounded-lg shadow-lg">
            <article className="prose prose-slate max-w-none prose-h2:text-primary prose-h2:border-b prose-h2:pb-2 prose-h3:text-secondary-dark">
              <h1 className="text-4xl font-bold text-center mb-10 text-slate-800">
                {t("pageTitle")}
              </h1>

              <section>
                <h2>{t("section.gettingStarted.title")}</h2>
                <p>{t("section.gettingStarted.intro")}</p>

                <h3>{t("section.gettingStarted.manager.title")}</h3>
                <ol>
                  <li>{t("section.gettingStarted.manager.step1")}</li>
                  <li>{t("section.gettingStarted.manager.step2")}</li>
                  <li>{t("section.gettingStarted.manager.step3")}</li>
                  <li>{t("section.gettingStarted.manager.step4")}</li>
                  <li>{t("section.gettingStarted.manager.step5")}</li>
                </ol>

                <h3>{t("section.gettingStarted.agentUser.title")}</h3>
                <ol>
                  <li>{t("section.gettingStarted.agentUser.step1")}</li>
                  <li>{t("section.gettingStarted.agentUser.step2")}</li>
                  <li>{t("section.gettingStarted.agentUser.step3")}</li>
                  <li>{t("section.gettingStarted.agentUser.step4")}</li>
                </ol>
              </section>

              <section>
                <h2>{t("section.usingTheApp.title")}</h2>

                <h3>{t("section.usingTheApp.login.title")}</h3>
                <p>{t("section.usingTheApp.login.desc")}</p>

                <h3>{t("section.usingTheApp.user.title")}</h3>
                <p>{t("section.usingTheApp.user.desc")}</p>

                <h3>{t("section.usingTheApp.agent.title")}</h3>
                <p>{t("section.usingTheApp.agent.desc")}</p>

                <h3>{t("section.usingTheApp.manager.title")}</h3>
                <p>{t("section.usingTheApp.manager.desc")}</p>
                <ul>
                  <li>{t("section.usingTheApp.manager.feature1")}</li>
                  <li>{t("section.usingTheApp.manager.feature2")}</li>
                  <li>{t("section.usingTheApp.manager.feature3")}</li>
                  <li>{t("section.usingTheApp.manager.feature4")}</li>
                  <li>{t("section.usingTheApp.manager.feature5")}</li>
                </ul>
              </section>

              <section>
                <h2>{t("section.voice.title")}</h2>
                <p>{t("section.voice.desc")}</p>
              </section>
            </article>
          </main>

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

export default UserManualPage;

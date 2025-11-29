import React from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { useApp } from "../App";
import VideoPlayer from "../components/VideoPlayer";
import { useTranslation } from "react-i18next";

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
);

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useApp();
  const location = useLocation();

  const backLinkDestination = user ? "/dashboard" : "/landing";
  const backLinkText = user
    ? t("subscription.backToDashboard", { defaultValue: "Back to Dashboard" })
    : t("contact.backToHome", { defaultValue: "Back to Home" });

  return (
    <Layout>
      <main className="min-h-[calc(100vh-5rem)] bg-slate-50 py-8 lg:py-12">
        <div className="mx-auto max-w-6xl px-4 space-y-8">
          <div>
            <Link
              to={backLinkDestination}
              state={{ from: location }}
              className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
            >
              <ArrowLeftIcon className="w-5 h-5 me-2" />
              {backLinkText}
            </Link>
          </div>

          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("contact.badge")}</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t("contact.pageTitle", { defaultValue: "Contact Us" })}</h1>
            <p className="max-w-2xl text-sm text-slate-600">{t("contact.subtitle")}</p>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary w-12 h-12 flex items-center justify-center rounded-full">
                  <MailIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">{t("contact.tagline")}</p>
                  <h2 className="text-xl font-semibold text-slate-900">{t("contact.sectionTitle")}</h2>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{t("contact.body")}</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <p className="text-sm text-slate-700">{t("contact.email.label")}</p>
                <a
                  href={`mailto:${t("contact.email.address")}`}
                  className="text-primary text-lg font-semibold hover:underline break-all"
                >
                  {t("contact.email.address")}
                </a>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <img
                  src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
                  alt="Nexus Support Hub Logo"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("appName")}</p>
                  <p className="text-xs text-slate-500">REP&WEB</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm space-y-4">
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-semibold text-slate-900">{t("contact.video.title")}</h2>
                <p className="text-sm text-slate-600">{t("contact.video.subtitle")}</p>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                  }}
                >
                  <iframe
                    src="https://www.youtube.com/embed/OnfUuaRlukQ"
                    title="Nexus Support Hub Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  ></iframe>
                </div>
              </div>
              <div className="text-center">
                <VideoPlayer
                  buttonText={t("contact.video.watchFull", {
                    defaultValue: "Voir la présentation complète",
                  })}
                  className="text-sm"
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ContactPage;

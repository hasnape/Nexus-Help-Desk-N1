import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import Layout from "../components/Layout";
import VideoPlayer from "../components/VideoPlayer";

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

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
);

const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useApp();
  const location = useLocation();

  const backLinkDestination = user ? "/dashboard" : "/landing";
  const backLinkText = user
    ? t("subscription.backToDashboard", { default: "Back to Dashboard" })
    : t("contact.backToHome", { default: "Back to Home" });

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full mx-auto">
          <div className="mb-6">
            <Link
              to={backLinkDestination}
              state={{ from: location }}
              className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
            >
              <ArrowLeftIcon className="w-5 h-5 me-2" />
              {backLinkText}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section Contact */}
            <main className="bg-surface p-8 sm:p-12 rounded-lg shadow-xl text-center">
              <div className="mx-auto bg-primary/10 text-primary w-16 h-16 flex items-center justify-center rounded-full mb-6">
                <MailIcon className="w-9 h-9" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800">
                {t("contact.pageTitle", { default: "Contact Us" })}
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
                {t("contact.subtitle", {
                  default:
                    "We'd love to hear from you. For any questions, partnerships, or enterprise inquiries, please reach out.",
                })}
              </p>

              <div className="mt-8">
                <p className="text-slate-700 mb-1">
                  {t("contact.email.label", {
                    default: "You can contact us directly at:",
                  })}
                </p>
                <a
                  href={`mailto:${t("contact.email.address")}`}
                  className="text-primary text-xl font-semibold hover:underline break-all"
                >
                  {t("contact.email.address")}
                </a>
              </div>

              {/* Logo et entreprise */}
              <div className="mt-8">
                <div className="flex justify-center items-center mb-4">
                  <img
                    src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
                    alt="Nexus Support Hub Logo"
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-700">
                      {t("appName")}
                    </h3>
                    <p className="text-sm text-slate-500">REP&WEB</p>
                  </div>
                </div>
              </div>
            </main>

            {/* Section Vidéo */}
            <div className="bg-surface p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
                {t("contact.video.title", {
                  default: "Découvrez notre solution",
                })}
              </h2>
              <p className="text-slate-600 mb-6 text-center">
                {t("contact.video.subtitle", {
                  default:
                    "Regardez comment Nexus Support Hub peut transformer votre support client.",
                })}
              </p>

              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                  overflow: "hidden",
                  marginBottom: "1rem",
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
                    borderRadius: "0.5rem",
                  }}
                ></iframe>
              </div>

              <div className="text-center">
                <VideoPlayer
                  buttonText={t("contact.video.watchFull", {
                    default: "Voir la présentation complète",
                  })}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;

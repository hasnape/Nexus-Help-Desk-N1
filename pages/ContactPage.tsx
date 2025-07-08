import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
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

  // If user is logged in, link back to their dashboard, otherwise to the landing page.
  const backLinkDestination = user ? "/dashboard" : "/landing";
  const backLinkText = user
    ? t("subscription.backToDashboard", { default: "Back to Dashboard" })
    : t("contact.backToHome", { default: "Back to Home" });
  const emailAddress = t("contact.email.address", {
    default: "hubnexusinfo@gmail.com",
  });

  return (
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
        <main className="bg-surface p-8 sm:p-12 rounded-lg shadow-xl">
          <div className="text-center mb-12">
            <div className="mx-auto bg-primary/10 text-primary w-16 h-16 flex items-center justify-center rounded-full mb-6">
              <MailIcon className="w-9 h-9" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">
              {t("contact.pageTitle", { default: "Contact Us" })}
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              {t("contact.subtitle", {
                default:
                  "We'd love to hear from you. For any questions, partnerships, or enterprise inquiries, please reach out.",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Support Technique
              </h2>
              <p className="text-slate-600 mb-4">
                Besoin d'aide avec la plateforme ? Notre équipe de support est
                disponible pour vous aider.
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Support par email pour tous les plans</li>
                <li>• Réponse sous 24-72h (Freemium)</li>
                <li>• Support prioritaire (Standard/Pro)</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Solutions Entreprise
              </h2>
              <p className="text-slate-600 mb-4">
                Intéressé par une solution personnalisée ? Parlons de vos
                besoins spécifiques.
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Intégrations personnalisées</li>
                <li>• Volumes élevés</li>
                <li>• Formations équipe</li>
                <li>• SLA dédiés</li>
              </ul>
            </div>
          </div>

          <div className="text-center bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Contact Direct
            </h3>
            <p className="text-slate-700 mb-2">
              {t("contact.email.label", {
                default: "You can contact us directly at:",
              })}
            </p>
            <a
              href={`mailto:${emailAddress}`}
              className="text-primary text-xl font-semibold hover:underline break-all"
            >
              {emailAddress}
            </a>
            <p className="text-sm text-slate-600 mt-3">
              Nous nous efforçons de répondre à tous les emails dans les plus
              brefs délais.
            </p>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              À Propos de Nexus Support Hub
            </h3>
            <p className="text-sm text-slate-600">
              Nexus Support Hub est une plateforme moderne de support client
              avec assistant IA conversationnel. Nous offrons une solution
              transparente et fiable pour améliorer l'efficacité de votre
              support client tout en maintenant une approche honnête sur les
              capacités de notre technologie.
            </p>
          </div>

          <footer className="mt-10 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} {t("appName")}.{" "}
              {t("footer.allRightsReserved", {
                default: "All Rights Reserved.",
              })}
            </p>
            <p className="mt-1">
              <Link to="/legal" className="hover:text-primary hover:underline">
                {t("footer.legalLink", { default: "Legal & Documentation" })}
              </Link>
              <span className="mx-2 text-slate-400">|</span>
              <Link
                to="/user-manual"
                className="hover:text-primary hover:underline"
              >
                {t("footer.userManualLink", { default: "User Manual" })}
              </Link>
              <span className="mx-2 text-slate-400">|</span>
              <Link
                to="/promotional"
                className="hover:text-primary hover:underline"
              >
                {t("footer.promotionalLink", { default: "Presentation" })}
              </Link>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ContactPage;

import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
                alt="Nexus Support Hub Logo"
                className="w-10 h-10 mr-3 rounded-full object-cover"
                onError={(e) => {
                  // Fallback vers l'ancien SVG si l'image ne charge pas
                  console.log("Logo failed to load, using fallback");
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = "block";
                  }
                }}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-primary mr-2"
                style={{ display: "none" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z"
                />
              </svg>
              <h3 className="text-xl font-bold">{t("appName")}</h3>
            </div>
            <p className="text-slate-300 mb-4 max-w-md">
              {t("footer.description", {
                default:
                  "Centre d'assistance intelligent avec IA pour une gestion efficace des tickets et un support client optimisé.",
              })}
            </p>

            {/* Lien vers la vidéo promotionnelle */}
            <div className="mb-4">
              <a
                href="https://youtu.be/OnfUuaRlukQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                {t("footer.watchDemo", {
                  default: "🎥 Voir notre démonstration",
                })}
              </a>
            </div>

            <div className="flex space-x-4">
              {/* Social Media Links */}
              <a
                href="https://youtu.be/OnfUuaRlukQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label="YouTube"
                title="Notre chaîne YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-blue-500 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="mailto:hubnexusinfo@gmail.com"
                className="text-slate-400 hover:text-primary transition-colors"
                aria-label="Email"
                title="Contactez-nous par email"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819A1.636 1.636 0 0 1 24 5.457z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {t("footer.quickLinks", { default: "Liens rapides" })}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/landing" className="text-slate-300 hover:text-primary transition-colors">
                  {t("footer.home", { default: "Accueil" })}
                </Link>
              </li>
              <li>
                <Link to="/presentation" className="text-slate-300 hover:text-primary transition-colors">
                  {t("footer.presentation", { default: "Présentation" })}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-300 hover:text-primary transition-colors">
                  {t("footer.pricing", { default: "Tarifs" })}
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-slate-300 hover:text-primary transition-colors">
                  {t("footer.demo", { default: "Demander une démo" })}
                </Link>
              </li>
              <li>
                <Link to="/infographie" className="text-slate-300 hover:text-primary transition-colors">
                  {t("footer.infographie", { default: "Infographie" })}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-primary transition-colors">
                  {t("footer.contact", { default: "Contact" })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {t("footer.support", { default: "Support" })}
            </h4>
            <ul className="space-y-2">
                <li>
                <Link
                  to="accessibilite"
                  className="text-slate-300 hover:text-primary transition-colors"
                >
                  {t("footer.accessibilite", { default: "Déclaration d’accessibilité" })}
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-slate-300 hover:text-primary transition-colors"
                >
                  {t("footer.helpCenter", { default: "Centre d'aide" })}
                </Link>
              </li>
              <li>
                <Link
                  to="/manual"
                  className="text-slate-300 hover:text-primary transition-colors"
                >
                  {t("footer.userManual", { default: "Manuel utilisateur" })}
                </Link>
              </li>
              <li>
                <Link
                  to="/legal"
                  className="text-slate-300 hover:text-primary transition-colors"
                >
                  {t("footer.legalLink", { default: "Mentions légales" })}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hubnexusinfo@gmail.com"
                  className="text-slate-300 hover:text-primary transition-colors"
                >
                  {t("footer.emailSupport", { default: "Support par email" })}
                </a>
              </li>
              <li>
                <a
                  href="https://youtu.be/OnfUuaRlukQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-primary transition-colors"
                >
                  {t("footer.videoDemo", { default: "Démonstration vidéo" })}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              <p>
                © {currentYear} {t("appName")} - REP&WEB.{" "}
                {t("footer.allRightsReserved", {
                  default: "Tous droits réservés.",
                })}
              </p>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                to="/legal"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                {t("footer.privacyPolicy", {
                  default: "Politique de confidentialité",
                })}
              </Link>
              <Link
                to="/legal"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                {t("footer.termsOfService", {
                  default: "Conditions d'utilisation",
                })}
              </Link>
              <Link
                to="/legal"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                {t("footer.cookies", { default: "Cookies" })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

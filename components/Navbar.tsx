import React, { useState, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../App";
import { Button } from "./FormElements";
import { useLanguage } from "../contexts/LanguageContext";
import { UserRole } from "../types";
import { Transition } from "@headlessui/react"; // Ajoutez cette dépendance si besoin
import type { Locale } from "../contexts/LanguageContext";

const SpeakerLoudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M10 3a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM6.5 5.05A.75.75 0 005 5.801v8.397a.75.75 0 001.5.652V5.802a.75.75 0 00-.75-.752zM13.5 5.05a.75.75 0 00-.75.752v8.397a.75.75 0 001.5.652V5.802a.75.75 0 00-.75-.752zM2.75 7.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5zM17.25 7.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5z" />
  </svg>
);

const SpeakerOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M13.28 6.72a.75.75 0 00-1.06-1.06L10 7.94 7.78 5.66a.75.75 0 00-1.06 1.06L8.94 9l-2.22 2.22a.75.75 0 101.06 1.06L10 10.06l2.22 2.22a.75.75 0 101.06-1.06L11.06 9l2.22-2.28z" />
    <path
      fillRule="evenodd"
      d="M10 1a9 9 0 100 18 9 9 0 000-18z"
      clipRule="evenodd"
    />
  </svg>
);

const Navbar: React.FC = () => {
  const { user, logout, isAutoReadEnabled, toggleAutoRead } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const languages = [
    { code: "en", nameKey: "language.english", defaultName: "English" },
    { code: "fr", nameKey: "language.french", defaultName: "Français" },
    { code: "ar", nameKey: "language.arabic", defaultName: "العربية" },
  ];

  const shouldHideSubscriptionLink =
    user?.role === UserRole.AGENT || user?.role === UserRole.USER;

  const mainLinks = [
    { to: "/landing", label: t("navbar.home", { default: "Accueil" }) },
    {
      to: "/presentation",
      label: t("navbar.presentation", { default: "Présentation" }),
    },
    {
      to: "/accessibilite",
      label: t("navbar.AccessibilitePage", {
        default: "Déclaration d’accessibilité",
      }),
    },
    {
      to: "/pricing",
      label: t("navbar.pricingpage", { default: "Tarifs" }),
    },
    // 🔹 NOUVELLES PAGES B2B / INVEST
    {
      to: "/enterprise",
      label: t("navbar.enterprise", { default: "Entreprise" }),
    },
    {
      to: "/investors",
      label: t("navbar.investors", { default: "Investisseurs" }),
    },
    {
      to: "/demo",
      label: t("navbar.demo", { default: "Demander une démo" }),
    },
    {
      to: "/infographie",
      label: t("navbar.infographie", { default: "Infographie" }),
    },
    // 🔹 Guide onboarding (pour les managers / IT)
    {
      to: "/guide-onboarding",
      label: t("navbar.onboardingGuide", {
        default: "Guide d’onboarding",
      }),
    },
    {
      to: "/manual",
      label: t("navbar.userManual", { default: "Manuel utilisateur" }),
    },
    {
      to: "/help",
      label: t("navbar.helpCenter", { default: "Centre d'aide" }),
    },
    { to: "/support", label: t("navbar.support", { default: "Support" }) },
    { to: "/contact", label: t("navbar.contact", { default: "Contact" }) },
    {
      to: "/legal",
      label: t("navbar.legal", { default: "Légal & Documentation" }),
    },
    {
      to: "/email-support",
      label: t("navbar.emailSupport", { default: "Support par email" }),
    },
    {
      to: "/presentation-video",
      label: t("navbar.demoVideo", { default: "Démonstration vidéo" }),
    },
  ];

  if (!shouldHideSubscriptionLink) {
    mainLinks.push({
      to: "/subscribe",
      label: t("navbar.pricing", { default: "Abonnement" }),
    });
  }

  const navGroups = [
    {
      key: "main",
      title: t("navbar.group.main", { default: "Navigation" }),
      links: mainLinks,
    },
    {
      key: "community",
      title: t("navbar.group.community", { default: "Communauté" }),
      links: [
        {
          to: "/testimonials",
          label: t("navbar.testimonials", { default: "Témoignages" }),
        },
        {
          to: "/partners",
          label: t("navbar.partners", { default: "Partenaires" }),
        },
      ],
    },
    {
      key: "account",
      title: t("navbar.group.account", { default: "Compte" }),
      links: user
        ? [
            ...(!shouldHideSubscriptionLink
              ? [
                  {
                    to: "/subscribe",
                    label: t("navbar.subscriptionButton", {
                      default: "Abonnement",
                    }),
                  },
                ]
              : []),
            ...(user.role === UserRole.AGENT
              ? [
                  {
                    to: "/agent/dashboard",
                    label: t("navbar.agentPortalButton", {
                      default: "Espace Agent",
                    }),
                  },
                ]
              : []),
            ...(user.role === UserRole.MANAGER
              ? [
                  {
                    to: "/manager/dashboard",
                    label: t("navbar.managerPortalButton", {
                      default: "Espace Manager",
                    }),
                  },
                ]
              : []),
          ]
        : [
            {
              to: "/login",
              label: t("navbar.loginButton", { default: "Connexion" }),
            },
            {
              to: "/signup",
              label: t("navbar.signUpButton", {
                default: "Créer un compte",
              }),
            },
          ],
    },
  ];

  // Gestion des groupes repliables sur mobile
  const toggleGroup = (key: string) => {
    setOpenGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <nav className="bg-slate-800 text-white shadow-md">
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-3 container mx-auto px-4 sm:px-6 lg:px-8 items-center h-20 relative">
        {/* Langues à gauche */}
        <div className="flex items-center space-x-1 sm:space-x-2 justify-start">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              onClick={() => setLanguage(lang.code as Locale)}
              variant="outline"
              size="sm"
              className={`!py-1 !px-2 !text-xs ${
                language === lang.code
                  ? "!bg-sky-500 !text-white !border-sky-500"
                  : "!text-slate-300 !border-slate-600 hover:!bg-slate-700 hover:!text-white"
              }`}
            >
              {t(lang.nameKey, { default: lang.defaultName })}
            </Button>
          ))}
        </div>
        {/* Logo centré */}
        <div className="flex items-center justify-center">
          <Link
            to={user ? "/dashboard" : "/landing"}
            className="flex items-center space-x-2"
          >
            <img
              src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
              alt="Logo Nexus"
              className="w-10 h-10 rounded-full object-cover border-2 border-sky-400 bg-white"
              style={{ minWidth: 40, minHeight: 40, background: "#fff" }}
            />
          </Link>
        </div>
        {/* Boutons Connexion/Créer un compte + burger à droite */}
        <div className="flex items-center justify-end space-x-2">
          {!user && (
            <>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="!text-slate-200 !border-slate-500 hover:!bg-slate-700"
                >
                  {t("navbar.loginButton", { default: "Connexion" })}
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  variant="primary"
                  size="sm"
                  className="!bg-sky-500 hover:!bg-sky-600"
                >
                  {t("navbar.signUpButton", { default: "Créer un compte" })}
                </Button>
              </Link>
            </>
          )}
          <button
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-400 md:inline-flex"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between px-4 h-16">
        {/* Icône menu */}
        <button
          className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-400"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {/* Logo centré */}
        <Link
          to={user ? "/dashboard" : "/landing"}
          className="flex items-center space-x-2"
        >
          <img
            src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
            alt="Logo Nexus"
            className="w-9 h-9 rounded-full object-cover border-2 border-sky-400 bg-white"
            style={{ minWidth: 36, minHeight: 36, background: "#fff" }}
          />
        </Link>
        {/* Langues à droite */}
        <div className="flex items-center space-x-1">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              onClick={() => setLanguage(lang.code as Locale)}
              variant="outline"
              size="sm"
              className={`!py-1 !px-2 !text-xs ${
                language === lang.code
                  ? "!bg-sky-500 !text-white !border-sky-500"
                  : "!text-slate-300 !border-slate-600 hover:!bg-slate-700 hover:!text-white"
              }`}
            >
              {t(lang.nameKey, { default: lang.defaultName })}
            </Button>
          ))}
        </div>
      </div>

      {/* Sidebar mobile & desktop */}
      <Transition show={menuOpen} as={Fragment}>
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-60"
          onClick={() => setMenuOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div
              className="fixed top-0 right-0 w-80 max-w-full h-full bg-slate-800 shadow-lg flex flex-col p-6 space-y-6 z-50 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Menu latéral"
            >
              <button
                className="self-end mb-4 p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-400"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {navGroups.map((group) => (
                <div key={group.key} className="mb-2">
                  <button
                    className="flex items-center w-full text-left text-xs text-slate-400 font-semibold mb-1 focus:outline-none"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={openGroups.includes(group.key)}
                    aria-controls={`group-${group.key}`}
                  >
                    <span className="flex-1">{group.title}</span>
                    <svg
                      className={`w-4 h-4 ml-1 transition-transform ${
                        openGroups.includes(group.key) ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <Transition
                    show={openGroups.includes(group.key)}
                    enter="transition-all duration-200"
                    enterFrom="max-h-0 opacity-0"
                    enterTo="max-h-40 opacity-100"
                    leave="transition-all duration-150"
                    leaveFrom="max-h-40 opacity-100"
                    leaveTo="max-h-0 opacity-0"
                  >
                    <div
                      className="flex flex-col pl-2"
                      id={`group-${group.key}`}
                    >
                      {group.links.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="block py-2 px-3 rounded text-slate-200 hover:bg-sky-700 hover:text-white transition"
                          onClick={() => setMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </Transition>
                </div>
              ))}
              {/* Actions utilisateur */}
              {user ? (
                <>
                  <Button
                    onClick={() => {
                      toggleAutoRead();
                      setMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full !p-1.5 !border-slate-500 hover:!bg-slate-700 mb-2"
                    title={
                      isAutoReadEnabled
                        ? t("navbar.toggleAutoReadDisable")
                        : t("navbar.toggleAutoReadEnable")
                    }
                  >
                    {isAutoReadEnabled ? (
                      <SpeakerLoudIcon className="w-4 h-4 text-sky-400" />
                    ) : (
                      <SpeakerOffIcon className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="ml-2">
                      {t("navbar.autoRead", { default: "Lecture auto" })}
                    </span>
                  </Button>
                  <div className="text-slate-300 text-sm mb-2">
                    {t("navbar.welcome", { username: user.full_name })} (
                    {t(`userRoleShort.${user.role}`, { default: user.role })})
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
                  >
                    {t("navbar.logoutButton", { default: "Déconnexion" })}
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full !text-slate-200 !border-slate-500 hover:!bg-slate-700"
                    >
                      {t("navbar.loginButton", { default: "Connexion" })}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full !bg-sky-500 hover:!bg-sky-600"
                    >
                      {t("navbar.signUpButton", {
                        default: "Créer un compte",
                      })}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Transition>
    </nav>
  );
};

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <img src="/logo.png" alt="Logo Nexus" className="w-8 h-8 mr-2" />
          <span className="font-bold text-lg">Nexus Support Hub</span>
        </div>
        <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
          <Link to="/landing" className="hover:text-sky-400">
            Accueil
          </Link>
          <Link to="/about" className="hover:text-sky-400">
            À propos
          </Link>
          <Link to="/enterprise" className="hover:text-sky-400">
            Entreprise
          </Link>
          <Link to="/investors" className="hover:text-sky-400">
            Investisseurs
          </Link>
          <Link to="/guide-onboarding" className="hover:text-sky-400">
            Guide d’onboarding
          </Link>
          <Link to="/testimonials" className="hover:text-sky-400">
            Témoignages
          </Link>
          <Link to="/partners" className="hover:text-sky-400">
            Partenaires
          </Link>
          <Link to="/infographie" className="hover:text-sky-400">
            {t("navbar.infographie", { default: "Infographie" })}
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              className="!text-slate-200 !border-slate-500 hover:!bg-slate-700"
            >
              Connexion
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              variant="primary"
              size="sm"
              className="!bg-sky-500 hover:!bg-sky-600"
            >
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Navbar;

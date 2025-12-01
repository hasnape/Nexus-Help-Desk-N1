import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "../components/FormElements";
import NexusSalesBotWidget from "../components/NexusSalesBotWidget";
import InfographieNexus from "../InfographieNexus";
import { useApp } from "../App";

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useApp();
  const location = useLocation();

  const backLinkDestination = user ? "/dashboard" : "/landing";
  const backLinkText = t("pricing.backToApp", { defaultValue: "Back" });

  const primaryCta = t("landing.hero.primaryCta", {
    defaultValue: t("landing.hero.ctaButton", {
      defaultValue: "Essayer Nexus gratuitement",
    }),
  });

  const secondaryCta = t("landing.hero.secondaryCta", {
    defaultValue: t("landing.hero.infographieLink", {
      defaultValue: "Voir l’infographie technique",
    }),
  });

  return (
     

        {/* HERO */}
        <section className="space-y-8 text-center">
          <header className="space-y-3 max-w-3xl mx-auto">
            <p className="section-eyebrow">
                {t("landing.hero.badge", {
                  defaultValue: "Help desk IA autonome N1 → N2",
                })}
              </p>
              <h1 className="section-title">
                {t("landing.hero.title", {
                  defaultValue:
                    "Help desk IA autonome pour votre support N1 → N2",
                })}
              </h1>
              <p className="section-subtitle">
                {t("landing.hero.subtitle", {
                  defaultValue:
                    "Nexus Support Hub automatise le support de niveau 1 et assiste le niveau 2 en Français, Anglais et Arabe, avec une architecture multi-entreprise sécurisée.",
                })}
              </p>
            </header>

            <div
              className="surface-card flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              role="group"
              aria-label={t("landing.hero.actionsAria", {
                defaultValue: "Actions principales de la page d’accueil",
              })}
            >
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-6 py-3">
                  {primaryCta}
                </Button>
              </Link>
              <a
                href="https://youtu.be/OnfUuaRlukQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-slate-500/60 px-5 py-2.5 text-sm font-semibold text-slate-50 bg-slate-900/60 hover:bg-slate-800/80 transition"
              >
                <svg
                  className="w-5 h-5 me-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                {t("landing.hero.watchDemo", {
                  defaultValue: "Voir la démo vidéo",
                })}
              </a>
              <Link to="/infographie" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto px-6 py-3"
                >
                  {secondaryCta}
                </Button>
              </Link>
            </div>

            <p className="muted-copy max-w-3xl mx-auto">
              {t("landing.hero.previewCaption", {
                defaultValue:
                  "Conçu avec RGAA 4.1 en tête, hébergé sur Supabase (PostgreSQL + RLS) et prêt pour les équipes support N1→N2 multi-tenant.",
              })}
            </p>
          </section>

          {/* PRÉSENTATION + VIDÉO */}
          <section
            id="presentation"
            className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr),minmax(0,1fr)] items-start"
          >
            <div className="surface-card space-y-4">
              <h2 className="section-title text-left text-2xl">
                {t("landing.presentation.title", {
                  defaultValue:
                    "Un hub intelligent pour centraliser votre support",
                })}
              </h2>
              <p className="muted-copy">
                {t("landing.presentation.description", {
                  defaultValue:
                    "Nexus Support Hub réunit tickets, IA, multi-entreprise, multi-langue et accessibilité dans une seule interface.",
                })}
              </p>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">
                  {t("landing.presentation.forWho.title", {
                    defaultValue: "Pour qui ?",
                  })}
                </h3>
                <ul className="list-disc pl-5 text-sm text-slate-200 space-y-1">
                  <li>
                    {t("landing.presentation.forWho.items.0", {
                      defaultValue:
                        "ESN / MSP / infogérants qui gèrent plusieurs clients.",
                    })}
                  </li>
                  <li>
                    {t("landing.presentation.forWho.items.1", {
                      defaultValue:
                        "Équipes IT internes qui veulent automatiser le N1.",
                    })}
                  </li>
                  <li>
                    {t("landing.presentation.forWho.items.2", {
                      defaultValue:
                        "Startups SaaS avec du support client multi-langue.",
                    })}
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">
                  {t("landing.presentation.problems.title", {
                    defaultValue: "Les problèmes que Nexus adresse",
                  })}
                </h3>
                <ul className="list-disc pl-5 text-sm text-slate-200 space-y-1">
                  <li>
                    {t("landing.presentation.problems.items.0", {
                      defaultValue:
                        "Tickets N1 répétitifs qui consomment vos agents.",
                    })}
                  </li>
                  <li>
                    {t("landing.presentation.problems.items.1", {
                      defaultValue:
                        "Aucune vue consolidée sur la charge N1 / N2.",
                    })}
                  </li>
                  <li>
                    {t("landing.presentation.problems.items.2", {
                      defaultValue:
                        "Processus d’onboarding support lents et non documentés.",
                    })}
                  </li>
                </ul>
              </div>
            </div>

            <div className="surface-card-soft space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden border border-slate-600/60 bg-black">
                <iframe
                  src="https://www.youtube.com/embed/OnfUuaRlukQ"
                  title="Nexus Support Hub Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <p className="muted-copy text-center">
                <a
                  href="https://youtu.be/OnfUuaRlukQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light font-semibold"
                >
                  {t("landing.video.watchOnYoutube", {
                    defaultValue: "Voir la démo complète sur YouTube",
                  })}
                </a>
              </p>
            </div>
          </section>

                 {/* ACCESSIBILITÉ / INFOGRAPHIE */}
          <section id="infographie" className="section-stack">
            <div className="surface-card space-y-3 max-w-3xl mx-auto text-center lg:text-left">
              <h2 className="section-title text-2xl text-left">
                {t("infographie.title", {
                  defaultValue: "Architecture & automatisation",
                })}
              </h2>
              <p className="muted-copy">
                {t("infographie.subtitle", {
                  defaultValue:
                    "Découvrez comment Nexus combine Supabase, RLS, multi-tenant, RGAA 4.1 et IA pour automatiser le support N1.",
                })}
              </p>
              <p className="text-sm text-slate-200">
                {t("landing.hero.previewCaption", {
                  defaultValue:
                    "L’IA traite le N1 et accompagne le N2, avec une escalade maîtrisée et une traçabilité complète.",
                })}
              </p>
              <Link to="/accessibilite" className="pill-link inline-flex w-max">
                {t("landing.rgaa.statementLinkFull", {
                  defaultValue:
                    "Lire la déclaration d’accessibilité complète (RGAA 4.1)",
                })}
              </Link>
            </div>

            <div className="surface-card-soft">
              <div className="w-full max-w-5xl mx-auto">
                <InfographieNexus />
              </div>
            </div>
          </section>

      </div>

      <NexusSalesBotWidget />
    </>
  );
};

export default LandingPage;

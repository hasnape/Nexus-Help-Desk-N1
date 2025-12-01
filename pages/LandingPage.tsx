import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "../components/FormElements";
import NexusSalesBotWidget from "../components/NexusSalesBotWidget";
import InfographieNexus from "../InfographieNexus";
import MarketingLayout from "../components/MarketingLayout";

const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  const videoDescriptionId = "nexus-video-caption";

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

  const presentationHighlights = [
    t("landing.presentation.highlights.0", {
      defaultValue: "Multi-tenant, multi-langue (FR / EN / AR) et RGAA 4.1",
    }),
    t("landing.presentation.highlights.1", {
      defaultValue: "Automatise le N1 et assiste le N2 avec IA + Supabase",
    }),
    t("landing.presentation.highlights.2", {
      defaultValue: "Onboarding documenté et traçabilité bout-en-bout",
    }),
  ];

  return (
    <>
      {/* Navbar and Footer are already handled by the global Layout wrapper */}
      <MarketingLayout>
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
              aria-label="Voir la démo vidéo Nexus sur YouTube"
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

            <div className="lg:hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-100">
                {t("landing.presentation.summary.title", {
                  defaultValue: "En bref",
                })}
              </h3>
              <ul className="space-y-2 text-sm text-slate-200">
                {presentationHighlights.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="surface-card-soft space-y-4">
            <div className="lg:hidden space-y-3">
              <a
                href="https://youtu.be/OnfUuaRlukQ"
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                aria-label="Voir la démo vidéo Nexus sur YouTube"
              >
                <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.22),transparent_40%)]" aria-hidden="true" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur group-hover:bg-white/20">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      {t("landing.hero.watchDemo", {
                        defaultValue: "Voir la démo vidéo",
                      })}
                    </span>
                  </div>
                </div>
                <span className="sr-only" id={`${videoDescriptionId}-mobile`}>
                  {t("landing.video.description", {
                    defaultValue:
                      "Démonstration vidéo montrant l’interface Nexus Support Hub et la gestion automatisée des tickets.",
                  })}
                </span>
              </a>
            </div>

            <div className="hidden lg:block aspect-video rounded-xl overflow-hidden border border-slate-600/60 bg-black">
              <iframe
                src="https://www.youtube.com/embed/OnfUuaRlukQ"
                title="Démonstration vidéo de Nexus Support Hub"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                aria-describedby={videoDescriptionId}
              />
            </div>

            <p className="muted-copy text-center" id={videoDescriptionId}>
              <a
                href="https://youtu.be/OnfUuaRlukQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-light font-semibold"
                aria-label="Voir la démo vidéo Nexus sur YouTube"
              >
                {t("landing.video.watchOnYoutube", {
                  defaultValue: "Voir la démo complète sur YouTube",
                })}
              </a>
            </p>
          </div>
        </section>

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
      </MarketingLayout>

      <NexusSalesBotWidget />
    </>
  );
};

export default LandingPage;

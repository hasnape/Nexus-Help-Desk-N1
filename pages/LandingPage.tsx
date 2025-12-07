import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "../components/FormElements";
import NexusSalesBotWidget from "../components/NexusSalesBotWidget";
import InfographieNexus from "../InfographieNexus";
import MarketingLayout from "../components/MarketingLayout";
import { blogPosts } from "../content/blogPosts";

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

  const blogHighlights = blogPosts.slice(0, 3);

  return (
    <>
      {/* Navbar and Footer are already handled by the global Layout wrapper */}
      <MarketingLayout>
        <section className="space-y-8 text-center -mt-8 sm:-mt-10 lg:-mt-12 pt-[3vh] sm:pt-[3vh] lg:pt-[2vh]">
          <header className="space-y-3 max-w-3xl mx-auto">
            <p className="section-eyebrow">
              {t("landing.hero.badge", {
                defaultValue: "Help desk IA autonome N1 → N2",
              })}
            </p>
            <h1 className="section-title">
              {t("landing.hero.title", {
                defaultValue:
                  "Moins de tickets répétitifs. Plus de temps pour les vrais problèmes.",
              })}
            </h1>
            <p className="section-subtitle">
              {t("landing.hero.subtitle", {
                defaultValue:
                  "Nexus Support Hub est un centre d’assistance intelligent qui automatise votre support de Niveau 1 avec l’IA et prépare vos équipes de Niveau 2 avec des tickets déjà résumés, classés, priorisés et enrichis par votre propre FAQ d’entreprise, dans un espace privé dédié à votre organisation.",
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
                "Chaque entreprise dispose d’un espace Nexus séparé : vos données ne sont jamais partagées avec d’autres clients.",
            })}
          </p>
        </section>

        <section
          id="presentation"
          className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr),minmax(0,1fr)] items-start"
        >
          <div className="surface-card space-y-4 max-w-3xl mx-auto text-center">
            <h2 className="section-title text-2xl text-center">
              {t("landing.presentation.title", {
                defaultValue:
                  "Un hub intelligent pour centraliser votre support",
              })}
            </h2>
            <div className="muted-copy space-y-3">
              <p>
                {t("landing.presentation.description", {
                  defaultValue:
                    "Nexus Support Hub est une plateforme de help desk qui combine IA, gestion de tickets et base de connaissance (FAQ) pour décharger vos équipes des demandes de Niveau 1.",
                })}
              </p>
              <p>
                {t("landing.presentation.description2", {
                  defaultValue:
                    "L’assistant IA répond aux questions simples en autonomie en s’appuyant d’abord sur la FAQ et les procédures de votre entreprise. Quand une demande devient plus complexe, Nexus crée ou met à jour un ticket, le catégorise, le priorise et le résume avant de l’envoyer à vos agents.",
                })}
              </p>
              <p>
                {t("landing.presentation.description3", {
                  defaultValue:
                    "Votre organisation dispose d’un espace d’assistance dédié, avec ses propres utilisateurs, ses propres règles et sa propre base de connaissance. Les données sont isolées des autres organisations et protégées par une architecture sécurisée (PostgreSQL + contrôle d’accès fin côté serveur).",
                })}
              </p>
              <p>
                {t("landing.presentation.description4", {
                  defaultValue:
                    "L’interface est disponible en Français, Anglais et Arabe et conçue avec une attention particulière portée à l’accessibilité (navigation clavier, lecteurs d’écran, contrastes renforcés).",
                })}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-100 text-center">
                {t("landing.presentation.forWho.title", {
                  defaultValue: "Pour qui ?",
                })}
              </h3>
              <p className="muted-copy text-center">
                {t("landing.presentation.forWho.intro", {
                  defaultValue:
                    "Nexus Support Hub s’adresse aux équipes qui reçoivent beaucoup de demandes récurrentes et veulent arrêter de traiter les mêmes questions N1 encore et encore.",
                })}
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-200 space-y-1 inline-block text-left mx-auto">
                <li>
                  {t("landing.presentation.forWho.items.0", {
                    defaultValue:
                      "PME / ETI avec support IT ou service client",
                  })}
                </li>
                <li>
                  {t("landing.presentation.forWho.items.1", {
                    defaultValue:
                      "Écoles, centres de formation, administrations",
                  })}
                </li>
                <li>
                  {t("landing.presentation.forWho.items.2", {
                    defaultValue:
                      "Entreprises qui travaillent en plusieurs langues (FR / EN / AR)",
                  })}
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-100 text-center">
                {t("landing.presentation.problems.title", {
                  defaultValue: "Ce que Nexus règle concrètement",
                })}
              </h3>
              <p className="muted-copy text-center">
                {t("landing.presentation.problems.intro", {
                  defaultValue:
                    "Nexus a été pensé à partir de situations réelles rencontrées dans les services IT et support client :",
                })}
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-200 space-y-1 inline-block text-left mx-auto">
                <li>
                  {t("landing.presentation.problems.items.0", {
                    defaultValue:
                      "Trop de tickets N1 répétitifs : demandes d’accès, réinitialisation de mot de passe, procédures simples, questions de FAQ.",
                  })}
                </li>
                <li>
                  {t("landing.presentation.problems.items.1", {
                    defaultValue:
                      "Agents noyés dans les emails ou formulaires, sans structuration claire par tickets.",
                  })}
                </li>
                <li>
                  {t("landing.presentation.problems.items.2", {
                    defaultValue:
                      "Perte de temps en qualification : chaque agent doit relire toute l’historique avant d’agir.",
                  })}
                </li>
                <li>
                  {t("landing.presentation.problems.items.3", {
                    defaultValue:
                      "Difficulté à faire vivre une FAQ que les utilisateurs consultent spontanément.",
                  })}
                </li>
                <li>
                  {t("landing.presentation.problems.items.4", {
                    defaultValue:
                      "Besoin d’un outil accessible (clavier, lecteurs d’écran, contrastes) conforme aux bonnes pratiques sans lancer un gros projet sur mesure.",
                  })}
                </li>
              </ul>
              <p className="muted-copy text-center">
                {t("landing.presentation.problems.conclusion", {
                  defaultValue:
                    "Avec Nexus, l’IA interroge d’abord votre FAQ et vos contenus internes, propose une réponse immédiate quand c’est possible, puis crée un ticket déjà résumé et priorisé quand un humain doit intervenir.",
                })}
              </p>
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

        <section className="section-stack" aria-labelledby="blog-highlights">
          <div className="surface-card space-y-3 max-w-3xl mx-auto text-center">
            <p className="section-eyebrow" id="blog-highlights">
              Derniers articles du blog
            </p>
            <h2 className="section-title text-2xl">Des cas concrets pour organiser votre support N1 → N2 avec Nexus.</h2>
            <p className="section-subtitle">
              Trois exemples d’actions rapides à mettre en place pour réduire le volume de tickets et fluidifier l’escalade vers vos agents.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {blogHighlights.map((article) => (
              <article
                key={article.slug}
                className="rounded-2xl border border-indigo-500/25 bg-slate-900/60 shadow-lg p-5 space-y-3 h-full flex flex-col"
              >
                <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">{article.excerpt}</p>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 hover:text-white"
                  aria-label={`Lire l’article ${article.title} sur le blog`}
                >
                  Lire sur le blog
                  <span aria-hidden className="text-indigo-100">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="infographie" className="section-stack">
          <div className="surface-card space-y-3 max-w-3xl mx-auto text-center">
            <h2 className="section-title text-2xl text-center">
              {t("infographie.title", {
                defaultValue: "Architecture & automatisation",
              })}
            </h2>
            <p className="muted-copy">
              {t("infographie.subtitle", {
                defaultValue:
                  "Schéma illustratif du parcours d’un ticket dans Nexus Support Hub : de la réponse IA en N1 jusqu’au traitement par vos agents N2.",
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

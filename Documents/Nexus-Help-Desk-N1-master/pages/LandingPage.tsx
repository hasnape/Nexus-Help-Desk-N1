import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import NexusInfographic from "../components/NexusInfographic";
import Layout from "../components/Layout";

const LandingPage: React.FC = () => {
          const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleWatchDemo = () => {
    window.open("https://youtu.be/OnfUuaRlukQ?si=DaIZ6gI9LF1aVzoe", "_blank");
  };

  const features = [
    {
      title: t("landing.features.ai.title", { default: "Assistant IA conversationnel" }),
      description: t("landing.features.ai.desc", { 
        default: "Chat intelligent avec l'IA Nexus qui aide vos utilisateurs et crée automatiquement des tickets détaillés avec historique de conversation quand nécessaire." 
      }),
      icon: "🤖",
    },
    {
      title: t("landing.features.secure.title", { default: "Gestion multi-entreprises sécurisée" }),
      description: t("landing.features.secure.desc", { 
        default: "Architecture multi-tenant avec isolation complète des données par entreprise. Chaque organisation a ses propres utilisateurs, agents et tickets." 
      }),
      icon: "🏢",
    },
    {
      title: t("landing.features.multilingual.title", { default: "Interface multilingue" }),
      description: t("landing.features.multilingual.desc", { 
        default: "Interface utilisateur disponible en français, anglais et arabe pour s'adapter aux équipes internationales." 
      }),
      icon: "🌐",
    },
    {
      title: t("landing.features.dashboards.title", { default: "Tableaux de bord par rôles" }),
      description: t("landing.features.dashboards.desc", { 
        default: "Vues dédiées pour utilisateurs, agents et managers avec gestion des tickets adaptée à chaque niveau de responsabilité." 
      }),
      icon: "📊",
    },
  ];

  const plans = [
    {
      name: t("pricing.freemium.name"),
      price: t("pricing.freemium.price"),
      description: t("pricing.freemium.desc"),
      features: [
        t("pricing.freemium.feature1"),
        t("pricing.freemium.feature2"),
        t("pricing.freemium.feature3"),
        t("landing.pricing.freemium.feature4", { default: "Tableaux de bord de base" }),
        t("landing.pricing.freemium.feature5", { default: "Support par email" }),
      ],
      popular: false,
      icon: "🆓",
    },
    {
      name: t("pricing.standard.name"),
      price: t("pricing.standard.price") + t("pricing.perAgentPerMonth", { default: "/agent/mois" }),
      description: t("pricing.standard.desc"),
      features: [
        t("landing.pricing.standard.feature1", { default: "Agents illimités" }),
        t("pricing.standard.feature1"),
        t("pricing.standard.feature2"),
        t("pricing.standard.feature3"),
        t("pricing.standard.feature4"),
        t("landing.pricing.standard.feature6", { default: "Assignation d'agents" }),
        t("landing.pricing.standard.feature7", { default: "Notes internes" }),
      ],
      popular: true,
      icon: "⭐",
    },
    {
      name: t("pricing.pro.name"),
      price: t("pricing.pro.price") + t("pricing.perAgentPerMonth", { default: "/agent/mois" }),
      description: t("pricing.pro.desc"),
      features: [
        t("pricing.pro.feature1"),
        t("pricing.pro.feature2"),
        t("pricing.pro.feature3"),
        t("pricing.pro.feature4"),
        t("landing.pricing.pro.feature5", { default: "Support prioritaire 24/7" }),
        t("landing.pricing.pro.feature6", { default: "Intégrations personnalisées" }),
        t("landing.pricing.pro.feature7", { default: "Gestion des postes de travail" }),
      ],
      popular: false,
      icon: "🚀",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section id="home" className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("landing.hero.title")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              {t("landing.hero.ctaButton")}
            </button>
            <button
              onClick={handleWatchDemo}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              {t("landing.hero.demoButton", { default: "Voir la démo" })}
            </button>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.ai.title", { default: "Assistant IA Nexus : Votre première ligne de support" })}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.ai.subtitle", { 
                default: "L'IA Nexus aide vos utilisateurs en temps réel et transforme automatiquement les conversations en tickets organisés pour vos équipes." 
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">💬</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("landing.ai.chatTitle", { default: "Chat intelligent 24/7" })}
                    </h3>
                    <p className="text-gray-600">
                      {t("landing.ai.chatDesc", { 
                        default: "L'IA Nexus dialogue avec vos utilisateurs, comprend leurs problèmes et fournit une assistance immédiate basée sur sa base de connaissances." 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">🎫</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("landing.ai.ticketCreationTitle", { default: "Création automatique de tickets" })}
                    </h3>
                    <p className="text-gray-600">
                      {t("landing.ai.ticketCreationDesc", { 
                        default: "Quand l'IA atteint ses limites, elle crée automatiquement un ticket avec tout l'historique de conversation, la catégorie et la priorité suggérées." 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">👥</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("landing.ai.smartAssignmentTitle", { default: "Assignation intelligente" })}
                    </h3>
                    <p className="text-gray-600">
                      {t("landing.ai.smartAssignmentDesc", { 
                        default: "Les tickets créés peuvent être automatiquement assignés aux agents appropriés selon la catégorie et la charge de travail." 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {t("landing.ai.exampleTicketTitle", { default: "Exemple de ticket créé automatiquement" })}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div className="border-b border-gray-200 pb-2 mb-2">
                  <span className="font-semibold text-blue-600">
                    {t("landing.ai.ticketNumber", { default: "Ticket #12345" })}
                  </span>
                  <span className="float-right text-gray-500">
                    {t("landing.ai.createdByAI", { default: "Créé par IA Nexus" })}
                  </span>
                </div>
                <p className="mb-2">
                  <span className="font-semibold">{t("landing.ai.userLabel", { default: "Utilisateur:" })}</span> Marie
                  Dupont
                </p>
                <p className="mb-2">
                  <span className="font-semibold">{t("landing.ai.titleLabel", { default: "Titre:" })}</span> Impossible de se
                  connecter à l'application
                </p>
                <p className="mb-2">
                  <span className="font-semibold">{t("landing.ai.categoryLabel", { default: "Catégorie:" })}</span> Technique
                  (suggérée par IA)
                </p>
                <p className="mb-2">
                  <span className="font-semibold">{t("landing.ai.priorityLabel", { default: "Priorité:" })}</span> Moyenne
                  (suggérée par IA)
                </p>
                <p className="mb-2">
                  <span className="font-semibold">
                    {t("landing.ai.conversationHistoryLabel", { default: "Historique conversation:" })}
                  </span>
                </p>
                <div className="bg-white rounded p-2 mb-2 text-xs">
                  <p>
                    <strong>{t("landing.ai.userLabel", { default: "Utilisateur:" })}</strong> Je n'arrive pas à me connecter
                  </p>
                  <p>
                    <strong>{t("landing.ai.aiLabel", { default: "IA:" })}</strong> Avez-vous essayé de réinitialiser votre
                    mot de passe ?
                  </p>
                  <p>
                    <strong>{t("landing.ai.userLabel", { default: "Utilisateur:" })}</strong> Oui, mais ça ne fonctionne
                    toujours pas
                  </p>
                  <p>
                    <strong>{t("landing.ai.aiLabel", { default: "IA:" })}</strong> Je vais créer un ticket pour qu'un
                    agent vous aide...
                  </p>
                </div>
                <p>
                  <span className="font-semibold">{t("landing.ai.statusLabel", { default: "Status:" })}</span> Ouvert - En
                  attente d'assignation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.demo.title", { default: "Découvrez Support Hub en vidéo" })}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.demo.subtitle", { 
                default: "Regardez une démonstration complète de la plateforme : chat IA, création de tickets, tableaux de bord et gestion multi-rôles." 
              })}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" /* 16:9 */ }}
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                src="https://www.youtube.com/embed/OnfUuaRlukQ"
                title="Support Hub - Présentation"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                {t("landing.demo.ctaButton", { default: "Essayer maintenant" })}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.features.title", { default: "Une plateforme complète et sécurisée" })}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.features.subtitle", { 
                default: "Toutes les fonctionnalités essentielles pour un support client moderne, avec une architecture pensée pour les entreprises." 
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infographic Section */}
      <NexusInfographic />

      {/* Pricing Section */}
      <section id="pricing" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("landing.pricing.title", { default: "Des tarifs transparents et abordables" })}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("landing.pricing.subtitle", { 
                default: "Commencez gratuitement pour tester la plateforme, puis évoluez selon vos besoins. Tarification simple par agent actif." 
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-xl shadow-lg p-8 ${
                  plan.popular ? "ring-2 ring-blue-600 transform scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {t("pricing.popularLabel", { default: "Le plus populaire" })}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">{plan.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {plan.price}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.name === "Freemium"
                    ? t("pricing.freemium.ctaButton", { default: "Commencer gratuitement" })
                    : t("pricing.ctaButton", { default: "Choisir ce plan" })}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              {t("landing.pricing.customSolutionPrompt", { default: "Besoin d'une solution sur mesure pour votre entreprise ?" })}
            </p>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              {t("landing.pricing.contactUs", { default: "Contactez-nous pour un devis personnalisé" })}
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("landing.contact.title", { default: "Prêt à améliorer votre support client ?" })}
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {t("landing.contact.subtitle", { 
              default: "Rejoignez les entreprises qui utilisent Support Hub pour offrir un service client moderne avec l'aide de l'intelligence artificielle." 
            })}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              {t("landing.contact.ctaButton", { default: "Commencer gratuitement" })}
            </button>
            <Link
              to="/contact"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 hover:text-white transition-colors inline-block"
            >
              {t("landing.contact.contactButton", { default: "Nous contacter" })}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-2xl font-bold text-blue-400 mb-4">
                Support Hub
              </h4>
              <p className="text-gray-300 mb-4 max-w-md">
                Plateforme complète de support client avec assistant IA
                conversationnel. Architecture sécurisée multi-entreprises pour
                équipes de toutes tailles.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Tarifs
                  </a>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Intégrations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Sécurité
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    to="/user-manual"
                    className="hover:text-white transition-colors"
                  >
                    Guide d'utilisation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Centre d'aide
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Nous contacter
                  </Link>
                </li>
                <li>
                  <Link
                    to="/promotional"
                    className="hover:text-white transition-colors"
                  >
                    Présentation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Support Hub. Tous droits réservés.</p>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <Link to="/legal" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link
                to="/user-manual"
                className="hover:text-white transition-colors"
              >
                Manuel d'utilisation
              </Link>
              <Link
                to="/promotional"
                className="hover:text-white transition-colors"
              >
                Présentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default LandingPage;

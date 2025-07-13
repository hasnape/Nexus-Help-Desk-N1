import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };
  const handleWatchDemo = () => {
    window.open("https://youtu.be/OnfUuaRlukQ?si=DaIZ6gI9LF1aVzoe", "_blank");
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section
        id="home"
        className="bg-gray-800 text-white py-8 sm:py-12"
        aria-label="Section d'accueil"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6"
            aria-label="Titre principal"
          >
            Nexus Help Desk : Simplifiez la gestion de votre support client
          </h1>
          <p
            className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto"
            aria-label="Sous-titre d'accueil"
          >
            Centralisez vos tickets, agents et conversations sur une seule
            plateforme intelligente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Commencer l'inscription"
              tabIndex={0}
            >
              Commencer maintenant
            </button>
            <button
              onClick={handleWatchDemo}
              className="border-2 border-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Voir la démo vidéo"
              tabIndex={0}
            >
              Voir la démo vidéo
            </button>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-8 sm:py-12 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Assistant IA pour votre support
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Automatisez la gestion des tickets et bénéficiez de suggestions
              intelligentes.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-base">
                        💬
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Chat instantané avec vos clients
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Répondez rapidement et efficacement grâce à l'IA.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-base">
                        🎫
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Création automatique de tickets
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      L'IA détecte les problèmes et crée des tickets pour vous.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-base">
                        👥
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Assignation intelligente
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Les tickets sont automatiquement assignés à l'agent le
                      plus pertinent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Exemple de ticket généré par l'IA
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
                <div className="border-b border-gray-200 pb-2 mb-2">
                  <span className="font-semibold text-blue-600">
                    Ticket #12345
                  </span>
                  <span className="float-right text-gray-500 text-xs">
                    Créé par l'IA
                  </span>
                </div>
                <p className="mb-2">
                  <span className="font-semibold">Utilisateur :</span> Marie
                  Dupont
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Titre :</span> Impossible de
                  se connecter à l'application
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Catégorie :</span> Technique
                  (suggérée par IA)
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Priorité :</span> Moyenne
                  (suggérée par IA)
                </p>
                <p className="mb-2">
                  <span className="font-semibold">
                    Historique de conversation :
                  </span>
                </p>
                <div className="bg-white rounded p-2 mb-2 text-xs">
                  <p className="mb-1">
                    <strong>Utilisateur :</strong> Je n'arrive pas à me
                    connecter
                  </p>
                  <p className="mb-1">
                    <strong>IA :</strong> Avez-vous essayé de réinitialiser
                    votre mot de passe ?
                  </p>
                  <p className="mb-1">
                    <strong>Utilisateur :</strong> Oui, mais ça ne fonctionne
                    toujours pas
                  </p>
                  <p>
                    <strong>IA :</strong> Je vais créer un ticket pour qu'un
                    agent vous aide...
                  </p>
                </div>
                <p>
                  <span className="font-semibold">Statut :</span> Ouvert - En
                  attente d'assignation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Vidéo de démonstration
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment Nexus Help Desk peut transformer votre support
              client.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                src="https://www.youtube.com/embed/OnfUuaRlukQ"
                title="Vidéo de démonstration"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="text-center mt-4 sm:mt-6">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition-colors"
              >
                Commencer maintenant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités principales - version française statique */}
      <section id="features" className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez tout ce que Nexus Help Desk peut vous offrir pour
              simplifier et automatiser votre support client.
            </p>
          </div>
          {/* Définition locale des fonctionnalités */}
          {(() => {
            const features = [
              {
                icon: "💬",
                title: "Chat instantané",
                description:
                  "Discutez en temps réel avec vos clients pour une résolution rapide des problèmes.",
              },
              {
                icon: "🎫",
                title: "Création automatique de tickets",
                description:
                  "L'IA détecte les demandes et crée des tickets sans intervention humaine.",
              },
              {
                icon: "👥",
                title: "Assignation intelligente",
                description:
                  "Les tickets sont assignés automatiquement à l'agent le plus compétent.",
              },
              {
                icon: "📊",
                title: "Statistiques avancées",
                description:
                  "Suivez la performance de votre support grâce à des rapports détaillés.",
              },
            ];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 text-center">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Section Infographie */}
      {/* ...section déjà présente plus haut... */}
    </Layout>
  );
};

export default LandingPage;

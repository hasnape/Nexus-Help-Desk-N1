import React, { Suspense } from "react";
// import supprimé
import LoadingSpinner from "./LoadingSpinner";

const SystemInfographicContent: React.FC = () => {
  // Traductions supprimées, tout est statique en français

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            {"Présentation du système Nexus"}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {
              "Découvrez comment Nexus Help Desk optimise la gestion de vos tickets et utilisateurs."
            }
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Étape 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {"Création de ticket simplifiée"}
            </h3>
            <p className="text-slate-600">
              {"Créez un ticket en quelques clics, sans complexité."}
            </p>
          </div>

          {/* Étape 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {"Affectation intelligente"}
            </h3>
            <p className="text-slate-600">
              {
                "Les tickets sont automatiquement assignés à l’agent le plus pertinent."
              }
            </p>
          </div>

          {/* Étape 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {"Suivi et résolution"}
            </h3>
            <p className="text-slate-600">
              {"Suivez l’avancement et la résolution en temps réel."}
            </p>
          </div>
        </div>

        {/* Diagramme de flux */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-8">
            {"Flux de traitement des tickets"}
          </h3>

          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-4">
            {/* Utilisateur */}
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg flex-1">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-800">{"Utilisateur"}</h4>
              <p className="text-sm text-slate-600 text-center mt-1">
                {"Crée un ticket et suit sa résolution."}
              </p>
            </div>

            {/* Flèche */}
            <div className="text-slate-400 rotate-90 lg:rotate-0">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>

            {/* IA */}
            <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg flex-1">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-800">{"IA"}</h4>
              <p className="text-sm text-slate-600 text-center mt-1">
                {"Analyse et assigne le ticket à l’agent le plus pertinent."}
              </p>
            </div>

            {/* Flèche */}
            <div className="text-slate-400 rotate-90 lg:rotate-0">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>

            {/* Agent */}
            <div className="flex flex-col items-center p-6 bg-purple-50 rounded-lg flex-1">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-800">{"Agent"}</h4>
              <p className="text-sm text-slate-600 text-center mt-1">
                {"Prend en charge et résout le ticket."}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-primary mb-2">85%</div>
            <p className="text-slate-600">{"Taux de résolution des tickets"}</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-accent mb-2">24/7</div>
            <p className="text-slate-600">{"Disponibilité du support"}</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-amber-500 mb-2">3min</div>
            <p className="text-slate-600">{"Temps de réponse moyen"}</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-500 mb-2">99%</div>
            <p className="text-slate-600">{"Satisfaction client"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SystemInfographic: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SystemInfographicContent />
    </Suspense>
  );
};

export default SystemInfographic;

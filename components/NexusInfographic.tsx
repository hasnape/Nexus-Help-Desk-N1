import React from 'react';

const NexusInfographic: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-indigo-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Comment fonctionne Nexus Support Hub
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Une solution complète de support client en 3 étapes simples
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Étape 1 */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Créer un ticket</h3>
            <p className="text-gray-600">
              Les utilisateurs créent facilement des tickets de support avec tous les détails nécessaires
            </p>
          </div>

          {/* Étape 2 */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Assignation intelligente</h3>
            <p className="text-gray-600">
              Notre système assigne automatiquement les tickets aux agents disponibles et compétents
            </p>
          </div>

          {/* Étape 3 */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Résolution rapide</h3>
            <p className="text-gray-600">
              Les agents résolvent les problèmes avec l'aide de l'IA et communiquent directement avec les clients
            </p>
          </div>
        </div>

        {/* Flux de travail */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Flux de travail Nexus Support Hub
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-lg p-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                  T
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">Ticket créé</h4>
              <p className="text-sm text-gray-600 mt-1">Par l'utilisateur</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-lg p-4 mb-4">
                <div className="w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                  A
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">Assigné</h4>
              <p className="text-sm text-gray-600 mt-1">À un agent</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-lg p-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                  P
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">En cours</h4>
              <p className="text-sm text-gray-600 mt-1">Traitement actif</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-lg p-4 mb-4">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                  ✓
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">Résolu</h4>
              <p className="text-sm text-gray-600 mt-1">Problème fermé</p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-gray-900 font-semibold">Satisfaction client</div>
            <div className="text-gray-600">Basé sur les retours clients</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-900 font-semibold">Support disponible</div>
            <div className="text-gray-600">Assistance continue</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">&lt;2h</div>
            <div className="text-gray-900 font-semibold">Temps de réponse</div>
            <div className="text-gray-600">Réponse moyenne</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusInfographic;
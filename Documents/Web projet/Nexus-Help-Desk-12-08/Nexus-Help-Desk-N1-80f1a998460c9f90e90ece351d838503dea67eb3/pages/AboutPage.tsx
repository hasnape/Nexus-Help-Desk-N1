import React from "react";

const AboutPage: React.FC = () => (
  <div className="container mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-4">À propos de Nexus Support Hub</h1>
    <p className="text-lg text-slate-700 mb-6">
      Nexus Support Hub est une plateforme innovante dédiée à l’assistance
      client, réunissant agents, managers et utilisateurs autour d’une
      expérience fluide et moderne.
    </p>
    <ul className="list-disc pl-6 text-slate-600">
      <li>Support multilingue</li>
      <li>Gestion intelligente des tickets</li>
      <li>Intégration de solutions de paiement et d’abonnement</li>
      <li>Interface moderne et responsive</li>
    </ul>
  </div>
);

export default AboutPage;

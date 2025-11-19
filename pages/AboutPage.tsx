import React from "react";
import { useTranslation } from "react-i18next";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            À propos de Nexus Support Hub
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            Nexus Support Hub est une plateforme innovante dédiée à l’assistance
            client, réunissant agents, managers et utilisateurs autour d’une
            expérience fluide et moderne.
          </p>
        </header>

        <section
          aria-labelledby="about-highlights"
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-6"
        >
          <h2
            id="about-highlights"
            className="text-xl font-semibold text-slate-900 mb-4"
          >
            {t("navbar.presentation", { defaultValue: "Présentation" })}
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Support multilingue</li>
            <li>Gestion intelligente des tickets</li>
            <li>Intégration de solutions de paiement et d’abonnement</li>
            <li>Interface moderne et responsive</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

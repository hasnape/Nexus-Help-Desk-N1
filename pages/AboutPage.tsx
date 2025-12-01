import React from "react";
import { useTranslation } from "react-i18next";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container section-stack">
      <header className="surface-card p-6 lg:p-8 space-y-3">
        <p className="section-eyebrow">{t("about.badge", { defaultValue: "L’équipe" })}</p>
        <h1 className="section-title">À propos de Nexus Support Hub</h1>
          <p className="section-subtitle">
            Nexus Support Hub est une plateforme innovante dédiée à l’assistance
            client, réunissant agents, managers et utilisateurs autour d’une
            expérience fluide et moderne.
          </p>
        </header>

        <section aria-labelledby="about-highlights" className="surface-card p-6 lg:p-8 space-y-4">
          <h2 id="about-highlights" className="text-xl font-semibold text-white">
            {t("navbar.presentation", { defaultValue: "Présentation" })}
          </h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-200">
          <li>Support multilingue</li>
          <li>Gestion intelligente des tickets</li>
          <li>Intégration de solutions de paiement et d’abonnement</li>
          <li>Interface moderne et responsive</li>
        </ul>
      </section>
    </div>
  );
};

export default AboutPage;

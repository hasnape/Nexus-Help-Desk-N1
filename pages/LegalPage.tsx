import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../App";
import LoadingSpinner from "../components/LoadingSpinner";

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

const LegalPage: React.FC = () => {
  // Suppression de la logique i18n et multilingue
  const [activeTab, setActiveTab] = useState("cgu");
  const tabs = [
    { id: "cgu", label: "CGU" },
    { id: "privacy", label: "Confidentialité" },
    { id: "ip", label: "Propriété intellectuelle" },
    { id: "integration", label: "Intégration" },
    { id: "api", label: "API" },
    { id: "security", label: "Sécurité" },
    { id: "pricing", label: "Tarifs" },
    { id: "sla", label: "SLA" },
  ];

  const renderContent = () => {
    // Contenus statiques français pour chaque section
    const sections: Record<
      string,
      { title: string; lastUpdated: string; content: string }
    > = {
      cgu: {
        title: "Conditions Générales d'Utilisation",
        lastUpdated: "Dernière mise à jour : 01/07/2025",
        content:
          "<p>Bienvenue sur Nexus Help Desk. L'utilisation de la plateforme implique l'acceptation des présentes CGU. Pour toute question, contactez-nous via le formulaire de contact.</p>",
      },
      privacy: {
        title: "Politique de Confidentialité",
        lastUpdated: "Dernière mise à jour : 01/07/2025",
        content:
          "<p>Vos données sont protégées et ne sont jamais revendues. Consultez notre politique complète sur la page dédiée.</p>",
      },
      ip: {
        title: "Propriété intellectuelle",
        lastUpdated: "Dernière mise à jour : 01/07/2025",
        content:
          "<p>Tous les contenus, logos et marques sont la propriété de Nexus Help Desk ou de ses partenaires.</p>",
      },
      integration: {
        title: "Intégration",
        lastUpdated: "Dernière mise à jour : 01/07/2025",
        content:
          "<p>Des intégrations sont disponibles pour les principaux outils du marché. Contactez-nous pour en savoir plus.</p>",
      },
      api: {
        title: "API",
        lastUpdated: "Dernière mise à jour : 01/07/2025",
        content:
          "<p>Notre API permet d'automatiser la gestion des tickets et des utilisateurs.</p>",
      },
      security: {
        title: "Sécurité",
        lastUpdated: "Dernière mise à jour : 01/07/2025",
        content:
          "<p>La sécurité de vos données est notre priorité. Toutes les communications sont chiffrées.</p>",
      },
      pricing: {
        title: "Tarifs",
        lastUpdated: "Dernière mise à jour : 01/07/2025",
        content:
          "<p>Consultez la page Tarifs pour plus d'informations sur nos abonnements.</p>",
      },
      sla: {
        title: "SLA",
        lastUpdated: "Dernière mise à jour : 01/07/2025",
        content:
          "<p>Nous garantissons un taux de disponibilité de 99,9% sur l'ensemble de nos services.</p>",
      },
    };
    const section = sections[activeTab];
    return (
      <article className="prose prose-slate max-w-none prose-p:text-slate-600 prose-h2:text-slate-800 prose-h2:mb-2 prose-h2:mt-6 prose-a:text-primary hover:prose-a:text-primary-dark">
        <h1 className="text-primary">{section.title}</h1>
        <p className="text-xs text-slate-500 italic">{section.lastUpdated}</p>
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </article>
    );
  };

  const backLinkDestination = "/dashboard";

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to={backLinkDestination}
            className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-5 h-5 me-2" />
            Retour à l'application
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/4 lg:w-1/5">
            <nav className="sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">
                Mentions légales & CGU
              </h2>
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-start px-3 py-2 rounded-md font-medium text-sm transition-colors duration-150 ${
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary"
                          : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="md:w-3/4 lg:w-4/5 bg-surface p-6 sm:p-8 rounded-lg shadow-lg">
            {renderContent()}
          </main>
        </div>

        <footer className="py-8 mt-8 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Nexus Help Desk. Tous droits
            réservés.
          </p>
          <p className="mt-1">
            <Link to="/legal" className="hover:text-primary hover:underline">
              Mentions Légales
            </Link>
            <span className="mx-2 text-slate-400">|</span>
            <Link to="/manual" className="hover:text-primary hover:underline">
              Manuel Utilisateur
            </Link>
            <span className="mx-2 text-slate-400">|</span>
            <Link
              to="/presentation"
              className="hover:text-primary hover:underline"
            >
              Présentation
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LegalPage;

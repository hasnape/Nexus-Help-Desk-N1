import React from "react";
// import supprimé : plus de logique i18n
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../App";

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

const PromotionalPage: React.FC = () => {
  // Suppression de toute la logique i18n et des états liés au modal
  const { user } = useApp();
  const location = useLocation();
  const backLinkDestination = user ? "/dashboard" : "/login";
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<string>("");
  const [modalTitle, setModalTitle] = React.useState<string>("");

  // Sections statiques en français
  const sections = [
    {
      title: "Introduction",
      content:
        "Nexus Support Hub est la solution idéale pour la gestion de support client moderne. Notre plateforme centralise la gestion des tickets, la communication et l’automatisation grâce à l’IA, pour une expérience fluide et efficace.",
    },
    {
      title: "Fonctionnalités principales",
      content:
        "• Gestion des tickets et des agents<br/>• Chat IA pour assistance et création de tickets<br/>• Tableaux de bord interactifs<br/>• Prise de rendez-vous (Standard et Pro)<br/>• Intégrations personnalisées (Pro)<br/>• Support prioritaire et technique dédié",
    },
    {
      title: "Avantages",
      content:
        "• Gain de temps et d’efficacité<br/>• Automatisation des tâches répétitives<br/>• Amélioration de la satisfaction client<br/>• Sécurité et confidentialité des données",
    },
    {
      title: "Limites",
      content:
        "La formule Freemium offre un accès limité aux fonctionnalités principales et un nombre restreint d’agents/tickets. Les formules Standard et Pro débloquent toutes les options avancées.",
    },
    {
      title: "Perspectives d’évolution",
      content:
        "Nous prévoyons d’ajouter prochainement des modules d’analyse avancée, des intégrations avec de nouveaux outils, et des fonctionnalités IA encore plus puissantes.",
    },
    {
      title: "Conclusion",
      content:
        "Nexus Support Hub accompagne votre croissance et simplifie la gestion du support client. Rejoignez-nous pour une expérience innovante et performante !",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <Link
            to={backLinkDestination}
            state={{ from: location }}
            className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 me-2" />
            Retour à l'application
          </Link>
        </div>

        <main className="bg-white p-4 sm:p-6 lg:p-10 rounded-lg shadow-lg">
          <header className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 mb-2">
              Nexus Support Hub
            </h1>
            <p className="text-sm sm:text-lg text-slate-500">
              Document promotionnel
            </p>
          </header>

          <article>
            {sections.map((section, idx) => {
              const shortContent =
                section.content.length > 220
                  ? section.content.slice(0, 220) + "..."
                  : section.content;
              return (
                <section className="mb-6 sm:mb-8" key={section.title}>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3 pb-2 border-b border-slate-300 truncate">
                    {section.title}
                  </h2>
                  <div
                    className="prose prose-slate max-w-none text-sm sm:text-base truncate"
                    dangerouslySetInnerHTML={{ __html: shortContent }}
                  />
                  <button
                    className="mt-3 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary-dark transition-colors text-xs sm:text-sm"
                    onClick={() => {
                      setModalTitle(section.title);
                      setModalContent(section.content);
                      setModalOpen(true);
                    }}
                  >
                    Voir le détail
                  </button>
                </section>
              );
            })}
          </article>
        </main>

        {/* Modal détail section */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 relative">
              <button
                className="absolute top-2 right-2 text-slate-400 hover:text-primary text-xl font-bold"
                onClick={() => setModalOpen(false)}
                aria-label="Fermer"
              >
                ×
              </button>
              <h2 className="text-xl font-bold text-primary mb-4 truncate">
                {modalTitle}
              </h2>
              <div
                className="prose prose-slate max-w-none text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: modalContent }}
              />
            </div>
          </div>
        )}

        <footer className="py-6 sm:py-8 mt-6 sm:mt-8 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Nexus Support Hub. Tous droits
            réservés.
          </p>
          <p className="mt-2">
            <Link to="/legal" className="hover:text-primary hover:underline">
              Mentions légales
            </Link>
            <span className="mx-2 text-slate-400">|</span>
            <Link to="/manual" className="hover:text-primary hover:underline">
              Guide utilisateur
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PromotionalPage;

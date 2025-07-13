import React, { Suspense } from "react";
// import supprimé : plus de traduction dynamique
import { Link, useLocation } from "react-router-dom";
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

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
);

const ContactPageContent: React.FC = () => {
  // Traduction supprimée, tout est statique en français
  const { user } = useApp();
  const location = useLocation();

  // Si l'utilisateur est connecté, retour au tableau de bord, sinon à l'accueil.
  const backLinkDestination = user ? "/dashboard" : "/landing";
  const backLinkText = user
    ? "Retour au tableau de bord"
    : "Retour à l'accueil";
  const emailAddress = "contact@nexus-support.fr";

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto">
        <div className="mb-6">
          <Link
            to={backLinkDestination}
            state={{ from: location }}
            className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 me-2" />
            {backLinkText}
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                Contactez-nous
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                Notre équipe est à votre écoute pour toute demande ou
                assistance.
              </p>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Email Section */}
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <MailIcon className="w-6 h-6 text-primary mr-3" />
                  <h2 className="text-xl font-semibold text-slate-800">
                    Adresse e-mail
                  </h2>
                </div>
                <p className="text-slate-600 mb-4">
                  Vous pouvez nous écrire à l'adresse ci-dessous :
                </p>
                <a
                  href={`mailto:${emailAddress}`}
                  className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm bg-white px-4 py-2 rounded-lg border border-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <MailIcon className="w-4 h-4 mr-2" />
                  {emailAddress}
                </a>
              </div>

              {/* Support Hours */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Horaires du support
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Lundi - Vendredi</span>
                    <span className="font-semibold text-slate-800">
                      9h00 - 18h00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Samedi - Dimanche</span>
                    <span className="font-semibold text-slate-800">
                      10h00 - 16h00
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                      Nous répondons généralement sous 24h ouvrées.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Formulaire de contact
              </h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Votre e-mail"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sujet
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Sujet de votre demande"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Votre message"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors font-semibold"
                >
                  Envoyer
                </button>
              </form>
            </div>

            {/* Additional Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                Informations complémentaires
              </h2>
              <div className="space-y-3">
                <p className="text-blue-700">
                  <strong>Délai de réponse :</strong> Sous 24h ouvrées
                </p>
                <p className="text-blue-700">
                  <strong>Langues :</strong> Français
                </p>
                <p className="text-blue-700">
                  <strong>Urgence :</strong> Pour les demandes urgentes,
                  précisez-le dans le sujet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ContactPageContent />
    </Suspense>
  );
};

export default ContactPage;

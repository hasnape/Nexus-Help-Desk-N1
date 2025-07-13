import React from "react";
import { Link } from "react-router-dom";

const UserManualPage: React.FC = () => {
  const backLinkDestination = "/dashboard";
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to={backLinkDestination}
            className="text-blue-600 hover:underline"
          >
            Retour au tableau de bord
          </Link>
        </div>
        <main>
          <article className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6">Manuel d’utilisation</h1>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Introduction</h2>
              <p>
                Bienvenue sur Nexus Help Desk ! Cette application vous permet de
                gérer efficacement les tickets d’assistance et la communication
                entre agents, managers et utilisateurs.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Premiers pas</h2>
              <ol className="list-decimal list-inside">
                <li>Créer un compte manager</li>
                <li>Configurer les paramètres de l’entreprise</li>
                <li>Ajouter des agents et des utilisateurs</li>
                <li>Définir les plans et les limites</li>
                <li>Accéder au tableau de bord manager</li>
              </ol>
              <h3 className="font-semibold mt-4">
                Pour les agents et utilisateurs
              </h3>
              <ol className="list-decimal list-inside">
                <li>Créer un compte agent ou utilisateur</li>
                <li>Se connecter à la plateforme</li>
                <li>Accéder à l’espace personnel</li>
                <li>Consulter et gérer les tickets</li>
              </ol>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                Utilisation de l’application
              </h2>
              <h3 className="font-semibold">Connexion</h3>
              <p>
                Connectez-vous avec vos identifiants pour accéder à votre
                espace.
              </p>
              <h3 className="font-semibold mt-4">Création d’un ticket</h3>
              <ol className="list-decimal list-inside">
                <li>Accédez à la page “Nouveau ticket”</li>
                <li>Remplissez le formulaire avec les détails du problème</li>
                <li>Soumettez le ticket</li>
              </ol>
              <h3 className="font-semibold mt-4">Gestion des tickets</h3>
              <ul className="list-disc list-inside">
                <li>Consultez la liste des tickets</li>
                <li>Attribuez un agent au ticket</li>
                <li>Suivez l’évolution et l’historique des échanges</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                Rôles et permissions
              </h2>
              <ul className="list-disc list-inside">
                <li>
                  <strong>Manager :</strong> Gère les agents, les utilisateurs
                  et les paramètres globaux
                </li>
                <li>
                  <strong>Agent :</strong> Prend en charge les tickets et
                  communique avec les utilisateurs
                </li>
                <li>
                  <strong>Utilisateur :</strong> Soumet des tickets et suit leur
                  résolution
                </li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                Conseils d’utilisation
              </h2>
              <ul className="list-disc list-inside">
                <li>Gardez vos informations à jour</li>
                <li>Consultez régulièrement les notifications</li>
                <li>Utilisez la barre latérale pour naviguer rapidement</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">Support</h2>
              <p>
                En cas de difficulté, contactez votre manager ou consultez la
                FAQ dans l’application.
              </p>
            </section>
          </article>
        </main>
      </div>
    </div>
  );
};

export default UserManualPage;

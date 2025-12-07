import React from "react";
import { Link } from "react-router-dom";

import { Button } from "../components/FormElements";
import InfographieNexus from "../InfographieNexus";

const InfographiePage: React.FC = () => {
  return (
    <div className="page-container section-stack">
      <div className="surface-card p-4 lg:p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="section-eyebrow">Infographie</p>
            <h1 className="section-title">Nexus Support Hub</h1>
            <p className="section-subtitle">
              Schéma illustratif du parcours d’un ticket dans Nexus Support Hub : de la réponse IA en N1 jusqu’au traitement par vos agents N2.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link to="/landing">
              <Button variant="outline" className="w-full sm:w-auto">
                Retour à l’accueil
              </Button>
            </Link>
            <a href="/infographie.pdf" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="w-full sm:w-auto">
                Télécharger PDF
              </Button>
            </a>
            <Link to="/contact">
              <Button variant="secondary" className="w-full sm:w-auto">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="surface-card-soft p-3 lg:p-5">
        <InfographieNexus />
      </div>
    </div>
  );
};

export default InfographiePage;

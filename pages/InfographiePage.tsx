// filepath: c:\Users\HARBI Amine\Documents\Web projet\AI N28\Nexus-Help-Desk-N1\pages\InfographiePage.tsx
import React from "react";
import InfographieNexus from "../InfographieNexus";
import { Link } from "react-router-dom";
import { Button } from "../components/FormElements";

const InfographiePage: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="flex justify-end mb-6 max-w-5xl mx-auto px-4 pt-6">
        <Link to="/landing">
          <Button variant="outline" className="mr-2">
            Retour à l’accueil
          </Button>
        </Link>
        <a href="/infographie.pdf" target="_blank" rel="noopener noreferrer">
          <Button variant="primary" className="mr-2">
            Télécharger PDF
          </Button>
        </a>
        <Link to="/contact">
          <Button variant="secondary">Nous contacter</Button>
        </Link>
      </div>
      <InfographieNexus />
    </div>
  );
};

export default InfographiePage;

// {/* Testimonials Section */}
// <section id="testimonials" className="py-20 bg-white">
//   ...contenu témoignages...
// </section>

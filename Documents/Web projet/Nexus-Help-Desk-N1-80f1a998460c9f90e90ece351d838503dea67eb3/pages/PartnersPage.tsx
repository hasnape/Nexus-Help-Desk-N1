import React from "react";

const partners = [
  { name: "TechCorp", logo: "/partners/techcorp.png" },
  { name: "Supportify", logo: "/partners/supportify.png" },
];

const PartnersPage: React.FC = () => (
  <div className="container mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-8">Nos partenaires</h1>
    <div className="flex flex-wrap gap-8 items-center">
      {partners.map((p) => (
        <div key={p.name} className="flex flex-col items-center">
          <img src={p.logo} alt={p.name} className="h-16 mb-2" />
          <span className="text-slate-700">{p.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default PartnersPage;

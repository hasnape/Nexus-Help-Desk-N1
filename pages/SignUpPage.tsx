import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../App";
import { Input } from "../components/FormElements";
import FreemiumPlanIcon from "../components/plan_images/FreemiumPlanIcon";
import StandardPlanIcon from "../components/plan_images/StandardPlanIcon";
import ProPlanIcon from "../components/plan_images/ProPlanIcon";

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const PlanSelection = () => {
  const { plan, setPlan, activationCode, setActivationCode } = useApp();
  const tiers = [
    {
      name: "Formule Freemium",
      price: "Gratuit",
      features: [
        "Accès limité aux fonctionnalités principales",
        "Jusqu'à 3 agents",
        "200 tickets / mois",
        "Chat IA avec création de tickets",
        "Tableaux de bord basiques",
        "Support par email",
      ],
      icon: <FreemiumPlanIcon />,
      value: "freemium",
    },
    {
      name: "Formule Standard",
      price: "9,99€/mois",
      features: [
        "Accès à toutes les fonctionnalités",
        "Nombre illimité d'agents",
        "Chat IA avancé",
        "Tableaux de bord complets",
        "Support prioritaire",
      ],
      icon: <StandardPlanIcon />,
      value: "standard",
      paypal: "https://paypal.com/standard",
    },
    {
      name: "Formule Pro",
      price: "19,99€/mois",
      features: [
        "Toutes les options de la formule Standard",
        "Support technique dédié",
        "Intégrations personnalisées",
        "Accès API complet",
      ],
      icon: <ProPlanIcon />,
      value: "pro",
      paypal: "https://paypal.com/pro",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {tiers.map((tier) => (
        <div
          key={tier.value}
          className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm text-center"
        >
          <div className="mb-2">{tier.icon}</div>
          <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
          <p className="text-primary font-semibold mb-2">{tier.price}</p>
          <ul className="text-sm text-slate-700 mb-4 list-none px-0">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start">
                <CheckIcon className="w-4 h-4 text-green-500 me-2 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setPlan(tier.value)}
            className="mt-2 font-semibold rounded-md px-6 py-2 text-base bg-primary text-white w-full focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Sélectionner la formule ${tier.name}`}
            tabIndex={0}
          >
            Sélectionner
          </button>

          {["standard", "pro"].includes(tier.value) && tier.paypal && (
            <>
              <a
                href={tier.paypal}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block"
                aria-label={`Payer la formule ${tier.name} avec PayPal`}
                tabIndex={0}
              >
                <button className="w-full py-2 px-4 rounded-lg font-semibold text-base bg-yellow-400 text-white">
                  Payer avec PayPal
                </button>
              </a>
              <p className="mt-2 text-xs text-slate-600">
                Après paiement, vous recevrez votre code d'activation par email.
              </p>
            </>
          )}
        </div>
      ))}

      {["standard", "pro"].includes(plan) &&
        (() => {
          const mailto = `mailto:hubnexusinfo@gmail.com?subject=${encodeURIComponent(
            `Demande de code d'activation - ${
              plan === "standard" ? "Standard" : "Pro"
            }`
          )}&body=${encodeURIComponent(
            `Bonjour,\n\nNotre société, [NOM DE VOTRE SOCIÉTÉ], souhaite souscrire à la formule ${
              plan === "standard" ? "Standard" : "Pro"
            }. Merci de nous envoyer le code d'activation après vérification du paiement.\n\nCordialement.`
          )}`;
          return (
            <div className="md:col-span-3 mt-6 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Input
                label="Code d'activation"
                id="activationCode"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                placeholder="Entrez le code reçu du support"
                required
              />
              <p className="text-xs text-slate-600">
                Pour souscrire à la formule{" "}
                {plan === "standard" ? "Standard" : "Pro"}, vous devez obtenir
                un code d'activation. Après paiement via PayPal, contactez le
                support pour recevoir votre code personnalisé.
                <a
                  href={mailto}
                  className="ms-1 text-primary hover:underline font-semibold"
                >
                  Demander votre code par email.
                </a>
              </p>
              <div className="mt-6 text-center">
                Vous avez déjà un compte ?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default PlanSelection;

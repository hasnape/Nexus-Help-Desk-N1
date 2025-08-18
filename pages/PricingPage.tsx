// pages/PricingPage.tsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);

const PricingPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useApp();
  const location = useLocation();
  const backLinkDestination = user ? '/dashboard' : '/landing';

  const plans = [
    {
      name: 'Freemium',
      price: '1€ / mois',
      features: ["Jusqu'à 3 agents", '200 tickets par mois', 'Assistance IA de base'],
      link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-3KG35083B1716942TNBYOA4Q'
    },
    {
      name: 'Standard',
      price: '10€ / mois',
      features: ['500 tickets / mois, 5 agents', 'Fonctionnalités IA complètes', 'Catégorisation automatique'],
      link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0E515487AE797135CNBTRYKA'
    },
    {
      name: 'Pro',
      price: '20€ / mois',
      features: ['Toutes les fonctionnalités Standard', '1000 tickets / mois, 10 agents', 'Commandes vocales avancées', 'Support multilingue', 'Planification de rendez-vous'],
      link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-7HP75881LB3608938NBTBGUA'
    }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link to={backLinkDestination} state={{ from: location }} className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm">
          <ArrowLeftIcon className="w-5 h-5 me-2" />
          {t('pricing.backToApp', { default: 'Retour à l’application' })}
        </Link>
      </div>

      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2">{t('pricing.mainTitle', { default: 'Tarifs – Nexus Support Hub' })}</h1>
        <p className="text-lg text-slate-500">{t('pricing.mainSubtitle', { default: 'Choisissez le plan qui correspond à vos besoins' })}</p>
      </header>

      {/* Bannière centrale */}
      <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 border-l-4 border-yellow-400 rounded-lg p-6 mb-8 shadow-md text-center">
        <p className="text-yellow-900 font-bold text-lg sm:text-xl">
          Freemium : <span className="font-semibold">1 €/mois</span> &nbsp;|&nbsp; 
          Standard : <span className="font-semibold">1er mois 5 €, ensuite 10 €/mois</span> &nbsp;|&nbsp; 
          Pro : <span className="font-semibold">20 €/mois</span>
        </p>
        <p className="text-yellow-800 text-sm mt-2">
          Choisissez le plan qui correspond le mieux à vos besoins
        </p>
      </div>

      <section className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="border rounded p-6 shadow hover:shadow-lg transition flex flex-col justify-between h-full"
          >
            <div>
              <h2 className="text-2xl font-bold mb-3">{plan.name}</h2>
              <p className="text-xl font-semibold mb-4">{plan.price}</p>
              <ul className="mb-4 list-disc list-inside">
                {plan.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            <a
              href={plan.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-sky-500 text-white font-semibold py-2 rounded hover:bg-sky-600"
            >
              {t('pricing.subscribe', { default: 'Souscrire' })}
            </a>
          </div>
        ))}
      </section>
    </div>
  );
};

export default PricingPage;

import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { useLanguage } from "@/contexts/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import { getPricingPlans, type PricingPlanKey } from "@/utils/pricing";

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const { t: legacyTranslate } = useLanguage();
  const { user } = useApp();
  const location = useLocation();
  const backLinkDestination = user ? '/dashboard' : '/landing';

  const plans = [
    {
      name: t('pricing.freemium.name', { default: 'Freemium' }),
      price: t('pricing.freemium.price', { default: 'Gratuit' }),
      features: [
        t('pricing.freemium.feature1', { default: "Jusqu'à 3 agents" }),
        t('pricing.freemium.feature2', { default: '200 tickets par mois' }),
        t('pricing.freemium.feature3', {
          default: 'Sauvegarde locale des tickets et sessions',
        }),
        t('pricing.freemium.feature4', {
          default: '1 entreprise Freemium par ordinateur',
        }),
      ],
      link: '/signup',
      external: false,
      cta: t('pricing.freemium.cta', { default: 'Commencer gratuitement' }),
    },
    {
      name: t('pricing.standard.name', { default: 'Standard' }),
      price: t('pricing.standard.price', { default: '10€ / mois' }),
      features: [
        t('pricing.standard.feature1'),
        t('pricing.standard.feature2'),
        t('pricing.standard.feature3'),
        t('pricing.standard.feature4'),
      ],
      link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0E515487AE797135CNBTRYKA',
      external: true,
      cta: t('pricing.subscribe', { default: 'Souscrire' }),
    },
    {
      name: t('pricing.pro.name', { default: 'Pro' }),
      price: t('pricing.pro.price', { default: '20€ / mois' }),
      features: [
        t('pricing.pro.feature1'),
        t('pricing.pro.feature2'),
        t('pricing.pro.feature3'),
        t('pricing.pro.feature4'),
      ],
      link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-7HP75881LB3608938NBTBGUA',
      external: true,
      cta: t('pricing.subscribe', { default: 'Souscrire' }),
    }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to={backLinkDestination}
          state={{ from: location }}
          className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
        >
          <ArrowLeftIcon className="w-5 h-5 me-2" />
          {legacyTranslate("pricing.backToApp", { default: "Retour à l’application" })}
        </Link>
      </div>

      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-3">{t("pricing.title")}</h1>
        <p className="text-lg text-slate-600">{t("pricing.disclaimer")}</p>
      </header>

      {/* Bannière centrale */}
      <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 border-l-4 border-yellow-400 rounded-lg p-6 mb-6 shadow-md text-center">
        <p className="text-yellow-900 font-bold text-lg sm:text-xl">
          {t('pricing.banner.freemiumFree', {
            default: 'Freemium : Gratuit | Standard : 1er mois 5€, ensuite 10€/mois | Pro : 20€/mois',
          })}
        </p>
        <p className="text-yellow-800 text-sm mt-2">
          {t('pricing.banner.choosePlan', { default: 'Choisissez le plan qui correspond le mieux à vos besoins' })}
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-8 text-green-800">
        <p className="font-medium">
          {t('pricing.freemium.storageNotice', {
            default:
              'Avec l’offre Freemium, vos tickets, sessions et sauvegardes sont stockés en local sur l’ordinateur qui gère Nexus Support Hub. Une seule entreprise Freemium peut être utilisée par appareil.',
          })}
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
            {plan.external ? (
              <a
                href={plan.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-sky-500 text-white font-semibold py-2 rounded hover:bg-sky-600"
              >
                {plan.cta}
              </a>
            ) : (
              <Link
                to={plan.link}
                className="block text-center bg-sky-500 text-white font-semibold py-2 rounded hover:bg-sky-600"
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default PricingPage;

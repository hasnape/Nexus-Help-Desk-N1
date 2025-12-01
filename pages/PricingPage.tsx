import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { useApp } from '../App';
import { getPricingPlans, type PricingPlanKey } from '@/utils/pricing';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' {...props}>
    <path
      fillRule='evenodd'
      d='M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z'
      clipRule='evenodd'
    />
  </svg>
);

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useApp();
  const location = useLocation();

  const plans = getPricingPlans(t);
  const popularBadge = t('pricing.badges.popular');
  const ctaDemo = t('pricing.ctaDemo');
  const ctaBuyNow = t('pricing.buy_now', {
    defaultValue: t('signupPlans.subscribeDefault', { defaultValue: 'Souscrire maintenant' }),
  });
  const ctaActivate = t('pricing.activate_now', {
    defaultValue: t('signupPlans.freemium.modal.buttons.subscribe', { defaultValue: 'Activer maintenant' }),
  });

  const backLinkDestination = user ? '/dashboard' : '/landing';
  const backLinkText = t('pricing.backToApp', { defaultValue: 'Back' });

  const orderedPlans: Array<{ key: PricingPlanKey; isPopular: boolean }> = [
    { key: 'freemium', isPopular: false },
    { key: 'standard', isPopular: true },
    { key: 'pro', isPopular: false },
  ];

  const subscribeLinks: Record<PricingPlanKey, string> = {
    freemium: '/signup?plan=freemium',
    standard: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0E515487AE797135CNBTRYKA',
    pro: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-7HP75881LB3608938NBTBGUA',
  };

  return (
    <div className='page-container section-stack'>
      <div>
        <Link to={backLinkDestination} state={{ from: location }} className='pill-link'>
          <ArrowLeftIcon className='w-5 h-5' />
          {backLinkText}
        </Link>
      </div>

      <header className='space-y-3 text-center'>
        <p className='section-eyebrow mx-auto'>{t('pricing.badge')}</p>
        <h1 className='section-title'>{t('pricing.title')}</h1>
        <p className='section-subtitle max-w-2xl mx-auto'>{t('pricing.disclaimer')}</p>
      </header>

      <div className='grid gap-6 md:grid-cols-3'>
        {orderedPlans.map(({ key, isPopular }) => {
          const plan = plans[key];
          return (
            <div
              key={plan.name}
              className={`surface-card relative p-6 flex flex-col ${isPopular ? 'border-indigo-500/60 shadow-indigo-900/40' : ''}`}
            >
              {isPopular ? (
                <span className='absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/30'>
                  {popularBadge}
                </span>
              ) : null}
              <div className='space-y-1'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-300'>{plan.badge}</p>
                <h2 className='text-xl font-bold text-white'>{plan.name}</h2>
                <p className='muted-copy'>{plan.description}</p>
              </div>
              <div className='mt-4 flex items-baseline gap-1'>
                <span className='text-3xl font-bold text-white'>{plan.price}</span>
                <span className='text-sm text-slate-300'>{plan.period}</span>
              </div>
              <ul className='mt-4 space-y-2 text-sm text-slate-200'>
                {plan.features.map((feature) => (
                  <li key={feature} className='flex items-start gap-2'>
                    <span className='mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200'>
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className='mt-auto pt-6 space-y-2'>
                <a
                  href={subscribeLinks[key]}
                  className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
                    isPopular ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {key === 'freemium' ? ctaActivate : ctaBuyNow}
                </a>
                {key !== 'freemium' && (
                  <Link to='/contact' className='block text-center text-sm font-semibold text-primary hover:text-primary-light'>
                    {ctaDemo}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className='mx-auto max-w-3xl surface-card-soft p-5 text-center'>
        <p className='muted-copy'>{t('pricing.additionalNote')}</p>
      </div>
    </div>
  );
};

export default PricingPage;

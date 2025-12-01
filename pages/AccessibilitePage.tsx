import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../App';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' {...props}>
    <path
      fillRule='evenodd'
      d='M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z'
      clipRule='evenodd'
    />
  </svg>
);

const AccessibilitePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const location = useLocation();

  const backLinkDestination = user ? '/dashboard' : '/landing';

  const org = {
    name: 'Rép&Web',
    address: '10 Grande Rue de Saint-Clair, 69300',
    email: 'repweb.69@laposte.net',
    serviceUrl: 'https://nexussupporthub.eu',
  };

  const today = new Date().toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sections = [
    { id: 'etat', title: t('accessibility.state.title'), body: t('accessibility.state.content') },
    { id: 'resultats', title: t('accessibility.results.title'), body: `${t('accessibility.results.rate')}` },
  ];

  return (
    <div className='page-container section-stack'>
      <div>
        <Link to={backLinkDestination} state={{ from: location }} className='pill-link'>
          <ArrowLeftIcon className='w-5 h-5' />
            {t('pricing.backToApp', { defaultValue: 'Back' })}
          </Link>
        </div>

        <header className='space-y-3'>
          <span className='section-eyebrow'>{t('accessibility.title')}</span>
          <div className='space-y-2'>
            <h1 className='section-title'>{t('accessibility.title')}</h1>
            <p className='section-subtitle'>
              {t('accessibility.intro', {
                orgName: org.name,
                address: org.address,
                email: org.email,
                serviceUrl: org.serviceUrl,
              })}
            </p>
          </div>
        </header>

        <nav aria-label={t('accessibility.onThisPage') || undefined} className='surface-card p-5 lg:p-6'>
          <h2 className='text-lg font-semibold text-white mb-4'>{t('accessibility.onThisPage')}</h2>
          <ul className='grid gap-2 sm:grid-cols-2 text-sm text-slate-200'>
            <li>
              <a className='pill-link' href='#etat'>
                {t('accessibility.toc.state')}
              </a>
            </li>
            <li>
              <a className='pill-link' href='#resultats'>
                {t('accessibility.toc.results')}
              </a>
            </li>
            <li>
              <a className='pill-link' href='#non-accessible'>
                {t('accessibility.toc.nonAccessible')}
              </a>
            </li>
            <li>
              <a className='pill-link' href='#alternatives'>
                {t('accessibility.toc.alternatives')}
              </a>
            </li>
            <li>
              <a className='pill-link' href='#technos'>
                {t('accessibility.toc.technologies')}
              </a>
            </li>
            <li>
              <a className='pill-link' href='#contact'>
                {t('accessibility.toc.contact')}
              </a>
            </li>
            <li>
              <a className='pill-link' href='#recours'>
                {t('accessibility.toc.remedies')}
              </a>
            </li>
            <li>
              <a className='pill-link' href='#maj'>
                {t('accessibility.toc.updated')}
              </a>
            </li>
          </ul>
        </nav>

        <div className='space-y-5'>
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`h-${section.id}`}
              className='surface-card-soft p-5 lg:p-6 space-y-3'
            >
              <h2 id={`h-${section.id}`} className='text-lg font-semibold text-white'>
                {section.title}
              </h2>
              <p className='muted-copy'>{section.body}</p>
            </section>
          ))}

          <section id='non-accessible' aria-labelledby='h-non-accessible' className='surface-card-soft p-5 lg:p-6 space-y-3'>
            <h2 id='h-non-accessible' className='text-lg font-semibold text-white'>
              {t('accessibility.nonAccessible.title')}
            </h2>
            <ul className='list-disc pl-5 space-y-2 text-sm text-slate-200'>
              <li>{t('accessibility.nonAccessible.item1')}</li>
              <li>{t('accessibility.nonAccessible.item2')}</li>
              <li>{t('accessibility.nonAccessible.item3')}</li>
            </ul>
            <p className='muted-copy'>{t('accessibility.nonAccessible.derogations')}</p>
          </section>

          <section id='alternatives' aria-labelledby='h-alternatives' className='surface-card-soft p-5 lg:p-6 space-y-3'>
            <h2 id='h-alternatives' className='text-lg font-semibold text-white'>
              {t('accessibility.alternatives.title')}
            </h2>
            <ul className='list-disc pl-5 space-y-2 text-sm text-slate-200'>
              <li>{t('accessibility.alternatives.item1')}</li>
              <li>{t('accessibility.alternatives.item2')}</li>
              <li>{t('accessibility.alternatives.item3')}</li>
            </ul>
          </section>

          <section id='technos' aria-labelledby='h-technos' className='surface-card-soft p-5 lg:p-6 space-y-3'>
            <h2 id='h-technos' className='text-lg font-semibold text-white'>
              {t('accessibility.tech.title')}
            </h2>
            <p className='muted-copy'>{t('accessibility.tech.content')}</p>
          </section>

          <section id='contact' aria-labelledby='h-contact' className='surface-card-soft p-5 lg:p-6 space-y-3'>
            <h2 id='h-contact' className='text-lg font-semibold text-white'>
              {t('accessibility.contact.title')}
            </h2>
            <p className='muted-copy'>
              {t('accessibility.contact.content', { email: org.email })}{' '}
              <Link
                to='/contact'
                className='font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary'
              >
                {t('accessibility.contact.formLink')}
              </Link>
              .
            </p>
          </section>

          <section id='recours' aria-labelledby='h-recours' className='surface-card-soft p-5 lg:p-6 space-y-3'>
            <h2 id='h-recours' className='text-lg font-semibold text-white'>
              {t('accessibility.remedies.title')}
            </h2>
            <p className='muted-copy'>{t('accessibility.remedies.content')}</p>
          </section>

          <section id='maj' aria-labelledby='h-maj' className='surface-card-soft p-5 lg:p-6 space-y-3'>
            <h2 id='h-maj' className='text-lg font-semibold text-white'>
              {t('accessibility.updated.title')}
            </h2>
          <p className='muted-copy'>{t('accessibility.updated.content', { date: today })}</p>
        </section>
      </div>
    </div>
  );
};

export default AccessibilitePage;

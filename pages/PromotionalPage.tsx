import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useApp } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

const PromotionalPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useApp();
  const location = useLocation();

  const backLinkDestination = user ? '/dashboard' : '/login';

  const renderSection = (titleKey: string, contentKey: string) => (
    <section className='space-y-3'>
      <h2 className='text-xl font-semibold text-white'>{t(titleKey)}</h2>
      <div className='prose prose-invert max-w-none' dangerouslySetInnerHTML={{ __html: t(contentKey) }} />
    </section>
  );

  return (
    <div className='page-container section-stack'>
      <div>
        <Link to={backLinkDestination} state={{ from: location }} className='pill-link'>
          <ArrowLeftIcon className='w-5 h-5' />
          {t('promotional.backToApp', { default: 'Back to Application' })}
        </Link>
      </div>

      <header className='surface-card p-6 lg:p-8 space-y-3 text-center'>
        <h1 className='section-title'>
          {t('promotional.mainTitle', { default: 'Nexus Support Hub – The Revolution in Intelligent Customer Support' })}
        </h1>
        <p className='section-subtitle'>{t('promotional.mainSubtitle', { default: 'Promotional Document | October 26, 2023' })}</p>
      </header>

      <article className='surface-card-soft p-6 lg:p-8 space-y-8'>
        {renderSection('promotional.section.intro.title', 'promotional.section.intro.content')}
        {renderSection('promotional.section.features.title', 'promotional.section.features.content')}
        {renderSection('promotional.section.advantages.title', 'promotional.section.advantages.content')}
        {renderSection('promotional.section.limits.title', 'promotional.section.limits.content')}
        {renderSection('promotional.section.future.title', 'promotional.section.future.content')}
        {renderSection('promotional.section.conclusion.title', 'promotional.section.conclusion.content')}
      </article>
    </div>
  );
};

export default PromotionalPage;

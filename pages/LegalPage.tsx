import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { useTranslation } from 'react-i18next';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' {...props}>
    <path
      fillRule='evenodd'
      d='M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z'
      clipRule='evenodd'
    />
  </svg>
);

const LegalPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useApp();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('cgu');

  const tabs = [
    { id: 'cgu', labelKey: 'legal.tabs.cgu' },
    { id: 'privacy', labelKey: 'legal.tabs.privacy' },
    { id: 'ip', labelKey: 'legal.tabs.ip' },
    { id: 'integration', labelKey: 'legal.tabs.integration' },
    { id: 'api', labelKey: 'legal.tabs.api' },
    { id: 'security', labelKey: 'legal.tabs.security' },
    { id: 'pricing', labelKey: 'legal.tabs.pricing' },
    { id: 'sla', labelKey: 'legal.tabs.sla' },
  ];

  const renderSection = (sectionKey: string) => (
    <article className='prose prose-invert max-w-none prose-p:text-slate-200 prose-h2:text-white prose-a:text-primary hover:prose-a:text-primary-light'>
      <h1 className='text-primary'>{t(`legal.${sectionKey}.title`)}</h1>
      <p className='text-xs text-slate-400 italic'>{t(`legal.${sectionKey}.lastUpdated`)}</p>
      <div dangerouslySetInnerHTML={{ __html: t(`legal.${sectionKey}.content`) }} />
    </article>
  );

  const backLinkDestination = user ? '/dashboard' : '/landing';

  return (
    <div className='page-container section-stack'>
      <div>
        <Link to={backLinkDestination} state={{ from: location }} className='pill-link'>
          <ArrowLeftIcon className='w-5 h-5' />
            {t('legal.backToApp', { defaultValue: 'Back to Application' })}
          </Link>
        </div>

        <header className='space-y-3'>
          <p className='section-eyebrow'>{t('legal.badge')}</p>
          <h1 className='section-title'>{t('legal.pageTitle', { defaultValue: 'Legal & Info' })}</h1>
          <p className='section-subtitle max-w-3xl'>{t('legal.subtitle')}</p>
        </header>

        <div className='grid gap-6 lg:grid-cols-[280px,1fr]'>
          <aside className='surface-card p-4'>
            <h2 className='text-sm font-semibold text-white mb-2'>{t('legal.navigation')}</h2>
            <ul className='space-y-1'>
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-start px-3 py-2 rounded-md font-medium text-sm transition-colors duration-150 ${
                      activeTab === tab.id
                        ? 'bg-primary/20 text-white shadow-inner shadow-indigo-900/40'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {t(tab.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className='surface-card p-6'>{renderSection(activeTab)}</section>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;

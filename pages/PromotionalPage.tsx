
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';



import { useTranslation } from "react-i18next";

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);

const PromotionalPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useApp();
    const location = useLocation();

    const backLinkDestination = user ? '/dashboard' : '/login';

    const renderSection = (titleKey: string, contentKey: string) => (
        <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-3 pb-2 border-b border-slate-300">{t(titleKey)}</h2>
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: t(contentKey) }} />
        </section>
    );

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                     <Link to={backLinkDestination} state={{ from: location }} className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm">
                        <ArrowLeftIcon className="w-5 h-5 me-2" />
                        {t('promotional.backToApp', { default: 'Back to Application' })}
                    </Link>
                </div>
                
                <main className="bg-surface p-6 sm:p-10 rounded-lg shadow-lg">
                    <header className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-slate-800 mb-2">{t('promotional.mainTitle', { default: 'Nexus Support Hub – The Revolution in Intelligent Customer Support' })}</h1>
                        <p className="text-lg text-slate-500">{t('promotional.mainSubtitle', { default: 'Promotional Document | October 26, 2023' })}</p>
                    </header>
                    
                    <article>
                        {renderSection('promotional.section.intro.title', 'promotional.section.intro.content')}
                        {renderSection('promotional.section.features.title', 'promotional.section.features.content')}
                        {renderSection('promotional.section.advantages.title', 'promotional.section.advantages.content')}
                        {renderSection('promotional.section.limits.title', 'promotional.section.limits.content')}
                        {renderSection('promotional.section.future.title', 'promotional.section.future.content')}
                        {/* Pricing section removed from here */}
                        {renderSection('promotional.section.conclusion.title', 'promotional.section.conclusion.content')}
                    </article>
                </main>
            </div>
        </div>
    );
};

export default PromotionalPage;

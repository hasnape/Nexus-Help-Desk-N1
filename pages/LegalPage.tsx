
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';


const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);


const LegalPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useApp();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('cgu'); // Default to Terms of Service

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
    
    const renderContent = () => {
        const renderSection = (sectionKey: string) => (
            <article className="prose prose-slate max-w-none prose-p:text-slate-600 prose-h2:text-slate-800 prose-h2:mb-2 prose-h2:mt-6 prose-a:text-primary hover:prose-a:text-primary-dark">
                <h1 className="text-primary">{t(`legal.${sectionKey}.title`)}</h1>
                <p className="text-xs text-slate-500 italic">{t(`legal.${sectionKey}.lastUpdated`)}</p>
                <div dangerouslySetInnerHTML={{ __html: t(`legal.${sectionKey}.content`) }} />
            </article>
        );

        switch (activeTab) {
            case 'integration': return renderSection('integration');
            case 'cgu': return renderSection('cgu');
            case 'api': return renderSection('api');
            case 'privacy': return renderSection('privacy');
            case 'security': return renderSection('security');
            case 'pricing': return renderSection('pricing');
            case 'sla': return renderSection('sla');
            case 'ip': return renderSection('ip');
            default: return renderSection('cgu');
        }
    };

    const backLinkDestination = user ? '/dashboard' : '/login';

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                     <Link to={backLinkDestination} state={{ from: location }} className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm">
                        <ArrowLeftIcon className="w-5 h-5 me-2" />
                        {t('legal.backToApp', { default: 'Back to Application' })}
                    </Link>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="md:w-1/4 lg:w-1/5">
                        <nav className="sticky top-24">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">{t('legal.pageTitle', { default: 'Legal & Info' })}</h2>
                            <ul className="space-y-1">
                                {tabs.map(tab => (
                                    <li key={tab.id}>
                                        <button
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full text-start px-3 py-2 rounded-md font-medium text-sm transition-colors duration-150 ${
                                                activeTab === tab.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                                            }`}
                                        >
                                            {t(tab.labelKey)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="md:w-3/4 lg:w-4/5 bg-surface p-6 sm:p-8 rounded-lg shadow-lg">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;

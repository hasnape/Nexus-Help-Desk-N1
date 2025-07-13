

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
        <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
    </svg>
);


const ContactPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useApp();
    const location = useLocation();

    // If user is logged in, link back to their dashboard, otherwise to the landing page.
    const backLinkDestination = user ? '/dashboard' : '/landing';
    const backLinkText = user ? t('subscription.backToDashboard', { default: 'Back to Dashboard'}) : t('contact.backToHome', { default: 'Back to Home' });
    const emailAddress = t('contact.email.address', { default: "hubnexusinfo@gmail.com" });

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-3xl w-full mx-auto">
                <div className="mb-6">
                     <Link to={backLinkDestination} state={{ from: location }} className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm">
                        <ArrowLeftIcon className="w-5 h-5 me-2" />
                        {backLinkText}
                    </Link>
                </div>
                <main className="bg-surface p-8 sm:p-12 rounded-lg shadow-xl text-center">
                    <div className="mx-auto bg-primary/10 text-primary w-16 h-16 flex items-center justify-center rounded-full mb-6">
                        <MailIcon className="w-9 h-9" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800">{t('contact.pageTitle', { default: "Contact Us" })}</h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">{t('contact.subtitle', { default: "We'd love to hear from you. For any questions, partnerships, or enterprise inquiries, please reach out." })}</p>
                    <div className="mt-8">
                        <p className="text-slate-700 mb-1">{t('contact.email.label', { default: "You can contact us directly at:" })}</p>
                        <a href={`mailto:${emailAddress}`} className="text-primary text-xl font-semibold hover:underline break-all">
                            {emailAddress}
                        </a>
                    </div>
                     <footer className="mt-10 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
                        <p>&copy; {new Date().getFullYear()} {t('appName')}. {t('footer.allRightsReserved', { default: 'All Rights Reserved.' })}</p>
                        <p className="mt-1">
                            <Link to="/legal" className="hover:text-primary hover:underline">{t('footer.legalLink', { default: 'Legal & Documentation' })}</Link>
                            <span className="mx-2 text-slate-400">|</span>
                            <Link to="/manual" className="hover:text-primary hover:underline">{t('footer.userManualLink', { default: 'User Manual' })}</Link>
                            <span className="mx-2 text-slate-400">|</span>
                            <Link to="/presentation" className="hover:text-primary hover:underline">{t('footer.promotionalLink', { default: 'Presentation' })}</Link>
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default ContactPage;
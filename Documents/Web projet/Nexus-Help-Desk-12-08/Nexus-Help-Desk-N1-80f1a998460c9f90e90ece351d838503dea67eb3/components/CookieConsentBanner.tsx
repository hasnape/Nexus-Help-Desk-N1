
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './FormElements';

interface CookieConsentBannerProps {
  onAccept: () => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onAccept }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-4 shadow-lg z-50 transition-transform duration-300 animate-slide-up">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-300 text-center sm:text-start">
          {t('cookieConsent.message', { default: 'We use cookies and local storage to ensure the proper functioning of the application and to enhance your experience (e.g., authentication, language preferences). By continuing to use this site, you accept their use.' })}
          {' '}
          <Link to="/legal" className="font-semibold text-sky-400 hover:text-sky-300 underline">
            {t('cookieConsent.privacyPolicyLink', { default: 'Learn more.' })}
          </Link>
        </p>
        <Button 
          onClick={onAccept}
          variant="primary"
          size="md"
          className="flex-shrink-0 !bg-sky-500 hover:!bg-sky-600"
        >
          {t('cookieConsent.acceptButton', { default: 'Accept' })}
        </Button>
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CookieConsentBanner;

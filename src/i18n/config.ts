import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'fr',
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: [
      'common',
      'promotional',
      'pricing',
      'landing',
      'userManual',
      'legal',
      'auth',
      'contact',
      'dashboard',
      'tickets',
      'helpChat',
      'manager',
      'ticketDetail',
      'signup',
      'newTicket',
      'subscription',
      'components',
      'enums',
      'errors',
      'success',
      'notifications',
      'labels'
    ],
    
    interpolation: {
      escapeValue: false,
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'default',
      },
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
    
    // Configuration pour un meilleur debugging
    debug: process.env.NODE_ENV === 'development',
    
    // Options de mise en cache
    saveMissing: false,
    updateMissing: false,
    
    // Options de chargement
    load: 'languageOnly',
    preload: ['fr', 'en'],
    
    // Interpolation avancée
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
      format: function(value, format, lng) {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);
        return value;
      }
    },
  });

export default i18n;
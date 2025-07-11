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
      'labels',
      'speechRecognition'
    ],

    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
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
  });

export default i18n;
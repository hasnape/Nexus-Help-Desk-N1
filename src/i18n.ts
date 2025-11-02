import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

type Language = 'en' | 'fr' | 'ar';

const supportedLanguages: Language[] = ['en', 'fr', 'ar'];

const resourceCache = new Map<string, Record<string, unknown>>();

const fetchBackend = {
  type: 'backend' as const,
  read(language: Language, _namespace: string, callback: (error: Error | null, resources: Record<string, unknown> | false) => void) {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') {
      callback(null, {});
      return;
    }

    const cacheKey = `${language}`;
    const cached = resourceCache.get(cacheKey);
    if (cached) {
      callback(null, cached);
      return;
    }

    fetch(`/locales/${language}.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load locale: ${language}`);
        }
        return response.json();
      })
      .then((data: Record<string, unknown>) => {
        resourceCache.set(cacheKey, data);
        callback(null, data);
      })
      .catch((error: unknown) => {
        callback(error instanceof Error ? error : new Error(String(error)), false);
      });
  },
};

export function applyHtmlLangDir(lang?: string) {
  if (typeof document === 'undefined') {
    return;
  }
  const currentLang = (lang || i18n.language || 'fr') as Language;
  document.documentElement.lang = currentLang;
  document.documentElement.dir = i18n.dir(currentLang);
}

if (!i18n.isInitialized) {
  i18n.use(fetchBackend).use(initReactI18next);

  i18n
    .init({
      fallbackLng: 'fr',
      supportedLngs: supportedLanguages,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      returnEmptyString: false,
    })
    .then(() => {
      applyHtmlLangDir();
    })
    .catch((error) => {
      if (import.meta.env?.MODE !== 'production') {
        console.error('i18n init error', error);
      }
    });
}

i18n.on('languageChanged', (lng) => {
  applyHtmlLangDir(lng);
});

export default i18n;

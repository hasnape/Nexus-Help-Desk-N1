import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export type Locale = 'en' | 'fr' | 'ar';

export type TranslationPrimitive = string | number | boolean | null;
export type TranslationValue =
  | TranslationPrimitive
  | TranslationValue[]
  | { [key: string]: TranslationValue };
export type Translations = Record<string, TranslationValue>;

// ⬇️ Type élargi: autorise des props arbitraires (company, message, error, date, etc.)
type TranslateOptions = {
  default?: string;
  defaultValue?: string;
  values?: Record<string, string | number>;
} & Record<string, unknown>;

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: string, options?: TranslateOptions) => string;
  getBCP47Locale: () => string;
  isLoadingLang: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const emptyTranslations: Translations = {};

const applyHtmlLangDir = (lang: Locale) => {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.lang = lang === 'ar' ? 'ar' : lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
};

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources: {},
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnObjects: true,
  });
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    const storedLang = localStorage.getItem('aiHelpDeskLang') as Locale | null;
    return storedLang && ['en', 'fr', 'ar'].includes(storedLang) ? storedLang : 'en';
  });
  const [translations, setTranslations] = useState<Translations | null>(null);
  const isLoadingLang = translations === null;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setTranslations(null);

    const loadLanguage = async (target: Locale) => {
      try {
        const response = await fetch(`./locales/${target}.json`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Failed to load ${target}.json: ${response.statusText}`);
        const data: Translations = await response.json();
        if (!isMounted) return;
        setTranslations(data);
        if (i18next.isInitialized) {
          i18next.addResourceBundle(target, 'translation', data, true, true);
          i18next.changeLanguage(target);
        }
        applyHtmlLangDir(target);
      } catch (error) {
        if (!isMounted || controller.signal.aborted) return;
        if (target !== 'en') {
          try {
            const fallbackResponse = await fetch('./locales/en.json', { signal: controller.signal });
            if (!fallbackResponse.ok) {
              throw new Error(`Failed to load fallback en.json: ${fallbackResponse.statusText}`);
            }
            const fallbackData: Translations = await fallbackResponse.json();
            if (!isMounted) return;
            setTranslations(fallbackData);
            if (i18next.isInitialized) {
              i18next.addResourceBundle('en', 'translation', fallbackData, true, true);
              i18next.changeLanguage('en');
            }
            applyHtmlLangDir('en');
          } catch (fallbackError) {
            if (!isMounted || controller.signal.aborted) return;
            console.error('Error loading fallback translation:', fallbackError);
            setTranslations(emptyTranslations);
          }
        } else {
          console.error('Error loading translation file:', error);
          setTranslations(emptyTranslations);
        }
      }
    };

    loadLanguage(language).catch((error) => {
      console.error('Failed to change language', error);
      if (isMounted) setTranslations(emptyTranslations);
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('aiHelpDeskLang', language);
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [language]);

  const setLanguage = useCallback((lang: Locale) => {
    setLanguageState((prev) => (prev === lang ? prev : lang));
  }, []);

  const t = useCallback(
    (key: string, options?: TranslateOptions): string => {
      const fallbackValue = options?.default ?? options?.defaultValue;
      if (isLoadingLang || !translations) return fallbackValue ?? key;

      const segments = key.split('.');
      let node: TranslationValue | undefined = translations;
      for (const segment of segments) {
        if (node && typeof node === 'object' && !Array.isArray(node) && segment in node) {
          node = (node as Record<string, TranslationValue>)[segment];
        } else {
          return fallbackValue ?? key;
        }
      }

      if (typeof node === 'string') {
        const values = (options?.values ?? {}) as Record<string, string | number>;
        return Object.entries(values).reduce<string>((acc, [placeholder, value]) => {
          return acc.replace(new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g'), String(value));
        }, node);
      }

      if (node == null) return fallbackValue ?? key;
      return typeof node === 'string' ? node : fallbackValue ?? key;
    },
    [translations, isLoadingLang]
  );

  const getBCP47Locale = useCallback((): string => {
    switch (language) {
      case 'fr':
        return 'fr-FR';
      case 'ar':
        return 'ar';
      default:
        return 'en-US';
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getBCP47Locale, isLoadingLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

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

type TranslateOptions = {
  default?: string;
  defaultValue?: string;
  values?: Record<string, string | number>;
};

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: string, options?: TranslateOptions) => string;
  getBCP47Locale: () => string;
  isLoadingLang: boolean;
  setIsLoadingLang: React.Dispatch<React.SetStateAction<boolean>>;
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
    if (typeof window === 'undefined') {
      return 'en';
    }
    const storedLang = localStorage.getItem('aiHelpDeskLang') as Locale | null;
    return storedLang && ['en', 'fr', 'ar'].includes(storedLang) ? storedLang : 'en';
  });
  const [translations, setTranslations] = useState<Translations>(emptyTranslations);
  const [isLoadingLang, setIsLoadingLang] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadLanguage = async (target: Locale) => {
      setIsLoadingLang(true);
      try {
        const response = await fetch(`./locales/${target}.json`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load ${target}.json: ${response.statusText}`);
        }
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
      } finally {
        if (isMounted) {
          setIsLoadingLang(false);
        }
      }
    };

    loadLanguage(language).catch((error) => {
      console.error('Failed to change language', error);
      if (isMounted) {
        setIsLoadingLang(false);
      }
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
    setLanguageState((prev) => {
      if (prev === lang) {
        return prev;
      }
      return lang;
    });
  }, []);

  const t = useCallback(
    (key: string, options?: TranslateOptions): string => {
      const fallbackValue = options?.default ?? options?.defaultValue;
      if (isLoadingLang) {
        return fallbackValue ?? key;
      }

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
        if (options?.values) {
          return Object.entries(options.values).reduce<string>((acc, [placeholder, value]) => {
            return acc.replace(new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g'), String(value));
          }, node);
        }
        return node;
      }

      if (node == null) {
        return fallbackValue ?? key;
      }

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
    <LanguageContext.Provider
      value={{ language, setLanguage, t, getBCP47Locale, isLoadingLang, setIsLoadingLang }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

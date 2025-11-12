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

export type TranslateOptionPrimitive = string | number | boolean | null | undefined;

export interface TranslateOptions {
  default?: string;
  defaultValue?: string;
  values?: Record<string, TranslateOptionPrimitive>;
  returnObjects?: boolean;
  [key: string]: TranslateOptionPrimitive | Record<string, TranslateOptionPrimitive> | boolean | undefined;
}

type TranslateFunction = {
  (key: string, options?: TranslateOptions): string;
  <TResult = TranslationValue>(key: string, options: TranslateOptions & { returnObjects: true }): TResult;
};

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: TranslateFunction;
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
    if (typeof window === 'undefined') {
      return 'en';
    }
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
      }
    };

    loadLanguage(language).catch((error) => {
      console.error('Failed to change language', error);
      if (isMounted) {
        setTranslations(emptyTranslations);
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

  const resolveInterpolationValues = (options?: TranslateOptions): Record<string, TranslateOptionPrimitive> | undefined => {
    if (!options) return undefined;
    if (options.values && typeof options.values === 'object') {
      return options.values;
    }

    const { default: _default, defaultValue, values, returnObjects, ...rest } = options;
    const derived: Record<string, TranslateOptionPrimitive> = {};

    for (const [key, rawValue] of Object.entries(rest)) {
      if (rawValue === undefined) continue;
      if (rawValue === null || typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
        derived[key] = rawValue;
      }
    }

    return Object.keys(derived).length > 0 ? derived : undefined;
  };

  const translateImpl = useCallback(
    <TResult = string>(key: string, options?: TranslateOptions): TResult | string => {
      const fallbackValue = options?.default ?? options?.defaultValue;
      if (isLoadingLang || !translations) {
        return (fallbackValue ?? key) as TResult;
      }

      const segments = key.split('.');
      let node: TranslationValue | undefined = translations;
      for (const segment of segments) {
        if (node && typeof node === 'object' && !Array.isArray(node) && segment in node) {
          node = (node as Record<string, TranslationValue>)[segment];
        } else {
          return (fallbackValue ?? key) as TResult;
        }
      }

      const interpolationValues = resolveInterpolationValues(options);

      if (typeof node === 'string') {
        if (interpolationValues) {
          return Object.entries(interpolationValues).reduce<string>((acc, [placeholder, value]) => {
            const replacement = value == null ? '' : String(value);
            return acc.replace(new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g'), replacement);
          }, node) as TResult;
        }
        return node as TResult;
      }

      if (typeof node === 'number' || typeof node === 'boolean') {
        return String(node) as TResult;
      }

      if (Array.isArray(node)) {
        if (options?.returnObjects) {
          return node as unknown as TResult;
        }
        return (fallbackValue ?? key) as TResult;
      }

      if (node && typeof node === 'object') {
        if (options?.returnObjects) {
          return node as unknown as TResult;
        }
        return (fallbackValue ?? key) as TResult;
      }

      return (fallbackValue ?? key) as TResult;
    },
    [translations, isLoadingLang]
  );

  const t = translateImpl as TranslateFunction;

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
      value={{ language, setLanguage, t, getBCP47Locale, isLoadingLang }}
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


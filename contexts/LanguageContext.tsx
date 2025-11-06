import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export type Locale = 'en' | 'fr' | 'ar';

type TranslationPrimitive = string | number | boolean | null;
type TranslationValue = TranslationPrimitive | TranslationValue[] | { [key: string]: TranslationValue };
export type Translations = Record<string, TranslationValue>;

export type Locale = 'en' | 'fr' | 'ar';
interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: string, replacementsOrOptions?: Record<string, string | number> | { default: string } | (Record<string, string | number> & { default?: string })) => string;
  getBCP47Locale: () => string;
  isLoadingLang: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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

  const [isLoadingLang, setIsLoadingLang] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const applyLanguage = async (lang: Locale) => {
      const shouldTriggerChange = i18n.language !== lang;

      if (!shouldTriggerChange) {
        applyHtmlLangDir(lang);
        if (isMounted) {
          setIsLoadingLang(false);
        }
        return;
      }

      setIsLoadingLang(true);

      try {
        const response = await fetch(`./locales/${lang}.json`); // Relative to public/index.html
        if (!response.ok) {
          throw new Error(`Failed to load ${lang}.json: ${response.statusText}`);
        }
        const data: Translations = await response.json();
        setTranslations(data);
        if (i18next.isInitialized) {
          i18next.addResourceBundle(lang, 'translation', data, true, true);
          i18next.changeLanguage(lang);
        }
      } catch (error) {
        console.error("Error loading translation file:", error);
        // Attempt to load English as a fallback if the selected language fails
        if (lang !== 'en') {
            try {
                const fallbackResponse = await fetch('./locales/en.json');
                if (fallbackResponse.ok) {
                    const fallbackData: Translations = await fallbackResponse.json();
                    setTranslations(fallbackData);
                    if (i18next.isInitialized) {
                      i18next.addResourceBundle('en', 'translation', fallbackData, true, true);
                      i18next.changeLanguage('en');
                    }
                } else {
                    setTranslations(emptyTranslations);
                }
            } catch (fallbackError) {
                console.error("Error loading fallback English translation:", fallbackError);
                setTranslations(emptyTranslations);
            }
        } else {
             setTranslations(emptyTranslations);
        }
      } finally {
        if (isMounted) {
          setIsLoadingLang(false);
        }
      }
    };

    applyLanguage(language).catch((error) => {
      console.error('Failed to change language', error);
      setIsLoadingLang(false);
    });

    if (typeof window !== 'undefined') {
        localStorage.setItem('aiHelpDeskLang', language);
    }

    return () => {
      isMounted = false;
    };
  }, [language]);

  const setLanguage = (lang: Locale) => {
    if (lang !== language) {
      setLanguageState(lang);
    }
  };

  const mapOptions = (options?: Record<string, string | number> | { default: string } | (Record<string, string | number> & { default?: string })) => {
    if (!options) {
      return { defaultValue: undefined, interpolation: undefined as Record<string, string | number> | undefined };
    }

    const resolveTranslation = (path: string): string | undefined => {
      const direct = translations[path];
      if (typeof direct === 'string') {
        return direct;
      }

      const segments = path.split('.');
      let current: TranslationValue | undefined = translations;
      for (const segment of segments) {
        if (!current || typeof current !== 'object' || Array.isArray(current)) {
          return undefined;
        }
        current = (current as Record<string, TranslationValue>)[segment];
      }
      return typeof current === 'string' ? current : undefined;
    };

    const resolved = resolveTranslation(key);
    if (isLoadingLang && resolved === undefined) {
        return defaultValue !== undefined ? defaultValue : key;
    }

    let translation = resolved ?? defaultValue ?? key;

    if (replacements && typeof translation === 'string') {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
      });
    }
    return typeof translation === 'string' ? translation : String(translation);
  }, [translations, isLoadingLang]);
  
  const getBCP47Locale = useCallback((): string => {
    if (language === 'fr') return 'fr-FR';
    if (language === 'ar') return 'ar-SA';
    return 'en-US';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate, getBCP47Locale, isLoadingLang }}>
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

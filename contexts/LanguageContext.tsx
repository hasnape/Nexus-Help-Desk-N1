import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export type Locale = 'en' | 'fr' | 'ar';

type TranslationPrimitive = string | number | boolean | null;
type TranslationValue = TranslationPrimitive | TranslationValue[] | { [key: string]: TranslationValue };
export type Translations = Record<string, TranslationValue>;

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: string, replacementsOrOptions?: Record<string, string | number> | { default: string }) => string;
  getBCP47Locale: () => string;
  isLoadingLang: boolean; 
}

const emptyTranslations: Translations = {};

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
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem('aiHelpDeskLang') as Locale : 'en';
    return ['en', 'fr', 'ar'].includes(storedLang) ? storedLang : 'en';
  });

  const [translations, setTranslations] = useState<Translations>(emptyTranslations);
  const [isLoadingLang, setIsLoadingLang] = useState<boolean>(true);

  useEffect(() => {
    const fetchTranslations = async (lang: Locale) => {
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
        setIsLoadingLang(false);
      }
    };

    fetchTranslations(language);

    if (typeof window !== 'undefined') {
        localStorage.setItem('aiHelpDeskLang', language);
    }
  }, [language]);

  const setLanguage = (lang: Locale) => {
    // This function is called by components (Navbar, SignUpPage, App.tsx) to change language.
    // The useEffect above will handle fetching and updating document attributes.
    if (lang !== language) { // Only update if different
        setLanguageState(lang);
    }
  };

  const t = useCallback((key: string, replacementsOrOptions?: Record<string, string | number> | { default: string }): string => {
    let defaultValue: string | undefined = undefined;
    let replacements: Record<string, string | number> | undefined = undefined;

    if (replacementsOrOptions) {
        if (typeof (replacementsOrOptions as { default: string }).default === 'string') {
            defaultValue = (replacementsOrOptions as { default: string }).default;
        } else {
            replacements = replacementsOrOptions as Record<string, string | number>;
        }
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
    <LanguageContext.Provider value={{ language, setLanguage, t, getBCP47Locale, isLoadingLang }}>
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

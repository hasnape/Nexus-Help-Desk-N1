import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

export type Locale = 'en' | 'fr' | 'ar';
export type Translations = Record<string, string | Record<string, string>>; // Allow nested for plurals etc. later

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: string, replacementsOrOptions?: Record<string, string | number> | { default: string }) => string;
  getBCP47Locale: () => string;
  isLoadingLang: boolean; 
}

const emptyTranslations: Translations = {};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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
      } catch (error) {
        console.error("Error loading translation file:", error);
        // Attempt to load English as a fallback if the selected language fails
        if (lang !== 'en') {
            try {
                const fallbackResponse = await fetch('./locales/en.json');
                if (fallbackResponse.ok) {
                    setTranslations(await fallbackResponse.json());
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
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
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

    if (isLoadingLang && !translations[key]) {
        return defaultValue !== undefined ? defaultValue : key;
    }
    
    let translation = (translations[key] as string) || defaultValue || key;
    
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
      });
    }
    return translation;
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

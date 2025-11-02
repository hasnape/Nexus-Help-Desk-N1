import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

import i18n from '@/config/i18n';

export type Locale = 'en' | 'fr' | 'ar';
interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: string, replacementsOrOptions?: Record<string, string | number> | { default: string } | (Record<string, string | number> & { default?: string })) => string;
  getBCP47Locale: () => string;
  isLoadingLang: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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
        if (isMounted) {
          setIsLoadingLang(false);
        }
        return;
      }

      setIsLoadingLang(true);

      try {
        await i18n.changeLanguage(lang);
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
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
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

    if ('default' in options) {
      const { default: defaultValue, ...rest } = options;
      return { defaultValue, interpolation: Object.keys(rest).length > 0 ? (rest as Record<string, string | number>) : undefined };
    }

    return { defaultValue: undefined, interpolation: options as Record<string, string | number> };
  };

  const translate = useCallback(
    (key: string, replacementsOrOptions?: Record<string, string | number> | { default: string } | (Record<string, string | number> & { default?: string })) => {
      const { defaultValue, interpolation } = mapOptions(replacementsOrOptions);

      const translation = i18n.t(key, {
        defaultValue,
        ...(interpolation ?? {}),
      });

      if (typeof translation === 'string' && translation.trim().length > 0 && translation !== key) {
        return translation;
      }

      if (Array.isArray(translation)) {
        return translation.join(', ');
      }

      if (defaultValue) {
        return defaultValue;
      }

      if (typeof translation === 'string' && translation.trim().length > 0) {
        return translation;
      }

      return key;
    },
    []
  );

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

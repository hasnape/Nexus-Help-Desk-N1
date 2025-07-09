import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

export type Locale = "en" | "fr" | "ar";
export type Translations = Record<string, string | Record<string, string>>;

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  changeLanguage: (language: Locale) => void;
  t: (
    key: string,
    replacementsOrOptions?:
      | Record<string, string | number>
      | { default: string }
  ) => string;
  getBCP47Locale: () => string;
  isLoadingLang: boolean;
}

const emptyTranslations: Translations = {};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Cache des traductions
const preloadedTranslations: Record<Locale, Translations | null> = {
  en: null,
  fr: null,
  ar: null,
};

// Fonction de pré-chargement optimisée pour Vercel
const preloadTranslations = async (
  lang: Locale
): Promise<Translations | null> => {
  if (preloadedTranslations[lang]) return preloadedTranslations[lang];

  try {
    const response = await fetch(`/locales/${lang}.json`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "public, max-age=86400",
      },
    });

    if (response.ok) {
      const data = await response.json();
      preloadedTranslations[lang] = data;
      console.log(`🚀 Pré-chargement ${lang} réussi`);
      return data;
    }
  } catch (error) {
    console.warn(`⚠️ Pré-chargement ${lang} échoué:`, error);
  }
  return null;
};

// Pré-chargement intelligent avec RequestIdleCallback
if (typeof window !== "undefined") {
  const preloadInIdle = () => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        preloadTranslations("en");
        preloadTranslations("fr");
      });
    } else {
      // Fallback pour navigateurs sans requestIdleCallback
      setTimeout(() => {
        preloadTranslations("en");
        preloadTranslations("fr");
      }, 1000);
    }
  };

  if (document.readyState === "complete") {
    preloadInIdle();
  } else {
    window.addEventListener("load", preloadInIdle);
  }
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Locale>(() => {
    const storedLang =
      typeof window !== "undefined"
        ? (localStorage.getItem("aiHelpDeskLang") as Locale)
        : "en";
    return ["en", "fr", "ar"].includes(storedLang) ? storedLang : "en";
  });

  const [translations, setTranslations] =
    useState<Translations>(emptyTranslations);
  const [isLoadingLang, setIsLoadingLang] = useState<boolean>(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchTranslations = async (lang: Locale) => {
      setIsLoadingLang(true);

      try {
        // Vérifier cache en premier
        const preloaded = preloadedTranslations[lang];
        if (preloaded) {
          setTranslations(preloaded);
          console.log(`✅ Cache hit pour ${lang}`);
          return;
        }

        console.log(`🔄 Chargement de /locales/${lang}.json`);

        const response = await fetch(`/locales/${lang}.json`, {
          signal: abortController.signal,
          headers: {
            Accept: "application/json",
            // Laisser le navigateur gérer le cache avec 304
            "Cache-Control": "public, max-age=86400",
          },
        });

        console.log(
          `📡 Réponse ${lang}: ${response.status} ${response.statusText}`
        );

        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
          preloadedTranslations[lang] = data;
          console.log(
            `✅ ${lang} chargé avec succès (${Object.keys(data).length} clés)`
          );
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("🛑 Requête annulée");
          return;
        }

        console.error(`❌ Erreur pour ${lang}:`, error);

        // Fallback vers anglais si pas déjà anglais
        if (lang !== "en") {
          console.log("🔄 Fallback vers anglais...");
          try {
            const fallbackResponse = await fetch(`/locales/en.json`, {
              signal: abortController.signal,
            });

            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setTranslations(fallbackData);
              preloadedTranslations["en"] = fallbackData;
              console.log("✅ Fallback anglais réussi");
            } else {
              setTranslations(emptyTranslations);
            }
          } catch (fallbackError) {
            console.error("❌ Fallback échoué:", fallbackError);
            setTranslations(emptyTranslations);
          }
        } else {
          setTranslations(emptyTranslations);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingLang(false);
          console.log(`🏁 Terminé pour ${lang}`);
        }
      }
    };

    fetchTranslations(language);

    if (typeof window !== "undefined") {
      localStorage.setItem("aiHelpDeskLang", language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }

    return () => {
      abortController.abort();
    };
  }, [language]);

  useEffect(() => {
    let visibilityTimeout: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (!document.hidden && isLoadingLang) {
        console.log("Retour sur l'onglet - forcer la résolution du loading");

        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
        }

        visibilityTimeout = setTimeout(() => {
          console.log("Forcer la fin du loading après changement d'onglet");
          setIsLoadingLang(false);
        }, 2000);
      }
    };

    const emergencyTimeout = setTimeout(() => {
      if (isLoadingLang) {
        console.warn("⏰ Timeout d'urgence après 3s");
        setIsLoadingLang(false);
      }
    }, 3000); // Réduit à 3s

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
      clearTimeout(emergencyTimeout);
    };
  }, [isLoadingLang]);

  const setLanguage = (lang: Locale) => {
    console.log(`Changement de langue vers: ${lang}`);
    if (lang !== language) {
      setLanguageState(lang);
    }
  };

  const changeLanguage = setLanguage;

  const t = useCallback(
    (
      key: string,
      replacementsOrOptions?:
        | Record<string, string | number>
        | { default: string }
    ): string => {
      let defaultValue: string | undefined = undefined;
      let replacements: Record<string, string | number> | undefined = undefined;

      if (replacementsOrOptions) {
        if (
          typeof (replacementsOrOptions as { default: string }).default ===
          "string"
        ) {
          defaultValue = (replacementsOrOptions as { default: string }).default;
        } else {
          replacements = replacementsOrOptions as Record<
            string,
            string | number
          >;
        }
      }

      if (isLoadingLang && !translations[key]) {
        return defaultValue !== undefined ? defaultValue : key;
      }

      let translation = (translations[key] as string) || defaultValue || key;

      if (replacements) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
          translation = translation.replace(
            new RegExp(`{{${placeholder}}}`, "g"),
            String(value)
          );
        });
      }
      return translation;
    },
    [translations, isLoadingLang]
  );

  const getBCP47Locale = useCallback((): string => {
    if (language === "fr") return "fr-FR";
    if (language === "ar") return "ar-SA";
    return "en-US";
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        changeLanguage,
        t,
        getBCP47Locale,
        isLoadingLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

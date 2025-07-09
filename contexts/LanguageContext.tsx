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
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout de pré-chargement")), 3000); // Réduit à 3s pour Vercel
    });

    // Utiliser des chemins absolus pour Vercel
    const vercelOptimizedPaths = [
      `/locales/${lang}.json`,
      `/public/locales/${lang}.json`,
    ];

    for (const path of vercelOptimizedPaths) {
      try {
        const response = (await Promise.race([
          fetch(path, {
            headers: {
              "Cache-Control": "public, max-age=300", // Cache 5 minutes
              Accept: "application/json",
            },
          }),
          timeoutPromise,
        ])) as Response;

        if (response.ok) {
          const data = (await Promise.race([
            response.json(),
            timeoutPromise,
          ])) as Translations;

          preloadedTranslations[lang] = data;
          console.log(`Pré-chargement réussi pour ${lang} depuis ${path}`);
          return data;
        }
      } catch (error) {
        console.warn(`Tentative ${path} échouée:`, error);
        continue; // Essayer le chemin suivant
      }
    }
  } catch (error) {
    console.error(`Erreur de pré-chargement pour ${lang}:`, error);
  }
  return null;
};

// Initialiser le pré-chargement
if (typeof window !== "undefined") {
  preloadTranslations("en");
  preloadTranslations("fr");
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
          console.log(`✅ Traductions ${lang} chargées depuis le cache`);
          return;
        }

        // Chemins spécifiques pour Vercel (ORDRE IMPORTANT)
        const vercelPaths = [
          `/locales/${lang}.json`, // Chemin principal pour Vercel
          `./locales/${lang}.json`, // Fallback relatif
        ];

        let response;
        let loadSuccess = false;

        for (const path of vercelPaths) {
          try {
            console.log(`🔄 Tentative: ${path}`);

            response = await fetch(path, {
              signal: abortController.signal,
              method: "GET",
              headers: {
                Accept: "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            });

            console.log(
              `📡 Réponse ${path}: ${response.status} ${response.statusText}`
            );

            if (response.ok) {
              loadSuccess = true;
              console.log(`✅ Succès pour ${path}`);
              break;
            } else {
              console.warn(`❌ Échec ${path}: ${response.status}`);
              // Continuer avec le chemin suivant
            }
          } catch (pathError) {
            if (pathError.name === "AbortError") {
              console.log("🛑 Requête annulée");
              return;
            }
            console.warn(`💥 Erreur ${path}:`, pathError.message);
          }
        }

        if (!loadSuccess || !response) {
          throw new Error(`🚫 Aucun chemin valide trouvé pour ${lang}.json`);
        }

        const data: Translations = await response.json();

        if (!abortController.signal.aborted) {
          setTranslations(data);
          preloadedTranslations[lang] = data;
          console.log(`✅ ${lang} chargé:`, Object.keys(data).length, "clés");
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("🛑 Chargement annulé");
          return;
        }

        console.error(`❌ Erreur chargement ${lang}:`, error);

        // Fallback critique vers l'anglais
        if (lang !== "en") {
          console.log("🔄 Tentative fallback vers anglais...");
          try {
            const fallbackResponse = await fetch(`/locales/en.json`, {
              signal: abortController.signal,
              headers: {
                Accept: "application/json",
                "Cache-Control": "no-cache",
              },
            });

            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setTranslations(fallbackData);
              preloadedTranslations["en"] = fallbackData;
              console.log("✅ Fallback anglais réussi");
            } else {
              throw new Error(`Fallback échoué: ${fallbackResponse.status}`);
            }
          } catch (fallbackError) {
            console.error("❌ Fallback anglais échoué:", fallbackError);
            // Utiliser des traductions vides en dernier recours
            setTranslations(emptyTranslations);
          }
        } else {
          // Si même l'anglais échoue, utiliser des traductions vides
          console.warn("⚠️ Utilisation de traductions vides");
          setTranslations(emptyTranslations);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingLang(false);
          console.log(`🏁 Chargement terminé pour ${lang}`);
        }
      }
    };

    fetchTranslations(language);

    // Configuration DOM
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
        console.warn("Timeout d'urgence - forcer la fin du loading");
        setIsLoadingLang(false);
      }
    }, 15000);

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

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

export type Locale = "en" | "fr" | "ar";
export type Translations = Record<string, string | Record<string, string>>; // Allow nested for plurals etc. later

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  changeLanguage: (language: Locale) => void; // Alias pour setLanguage
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

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Locale>(() => {
    const storedLang =
      typeof window !== "undefined"
        ? (localStorage.getItem("aiHelpDeskLang") as Locale)
        : "en"; // Changé de "fr" à "en" pour que l'anglais soit la langue par défaut
    return ["en", "fr", "ar"].includes(storedLang) ? storedLang : "en"; // Changé de "fr" à "en"
  });

  const [translations, setTranslations] =
    useState<Translations>(emptyTranslations);
  const [isLoadingLang, setIsLoadingLang] = useState<boolean>(true);

  useEffect(() => {
    const fetchTranslations = async (lang: Locale) => {
      setIsLoadingLang(true);
      try {
        // Essayer plusieurs chemins possibles pour les fichiers de traduction
        let response;
        const possiblePaths = [
          `/locales/${lang}.json`, // Chemin absolu depuis public
          `./locales/${lang}.json`, // Chemin relatif depuis public
          `/public/locales/${lang}.json`, // Si dans un sous-dossier
          `./public/locales/${lang}.json`, // Chemin relatif avec public
        ];

        let loadSuccess = false;
        for (const path of possiblePaths) {
          try {
            response = await fetch(path);
            if (response.ok) {
              loadSuccess = true;
              console.log(`Traductions ${lang} chargées depuis: ${path}`);
              break;
            }
          } catch (pathError) {
            console.log(`Chemin ${path} non disponible`);
          }
        }

        if (!loadSuccess || !response) {
          throw new Error(
            `Impossible de charger ${lang}.json depuis tous les chemins testés`
          );
        }

        const data: Translations = await response.json();
        setTranslations(data);
        console.log(`Traductions ${lang} chargées avec succès:`, Object.keys(data).length, 'clés');
      } catch (error) {
        console.error(
          "Erreur lors du chargement du fichier de traduction:",
          error
        );

        // Tentative de chargement de l'anglais comme fallback
        if (lang !== "en") {
          try {
            const fallbackPaths = [
              `/locales/en.json`,
              `./locales/en.json`,
              `/public/locales/en.json`,
              `./public/locales/en.json`,
            ];

            let fallbackSuccess = false;
            for (const path of fallbackPaths) {
              try {
                const fallbackResponse = await fetch(path);
                if (fallbackResponse.ok) {
                  setTranslations(await fallbackResponse.json());
                  fallbackSuccess = true;
                  console.log("Fallback anglais chargé depuis:", path);
                  break;
                }
              } catch (fallbackPathError) {
                console.log(`Chemin fallback ${path} non disponible`);
              }
            }

            if (!fallbackSuccess) {
              setTranslations(emptyTranslations);
            }
          } catch (fallbackError) {
            console.error(
              "Erreur lors du chargement du fallback anglais:",
              fallbackError
            );
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

    if (typeof window !== "undefined") {
      localStorage.setItem("aiHelpDeskLang", language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  const setLanguage = (lang: Locale) => {
    console.log(`Changement de langue vers: ${lang}`);
    if (lang !== language) {
      setLanguageState(lang);
    }
  };

  // Alias pour la compatibilité
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


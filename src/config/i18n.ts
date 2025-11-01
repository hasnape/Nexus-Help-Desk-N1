import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "../../locales/ar.json" assert { type: "json" };
import en from "../../locales/en.json" assert { type: "json" };
import fr from "../../locales/fr.json" assert { type: "json" };

type SupportedLng = "en" | "fr" | "ar";

type ResourceRecord = Record<SupportedLng, { translation: Record<string, unknown> }>;

const resources: ResourceRecord = {
  en: { translation: en as Record<string, unknown> },
  fr: { translation: fr as Record<string, unknown> },
  ar: { translation: ar as Record<string, unknown> },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
  });
}

export default i18n;

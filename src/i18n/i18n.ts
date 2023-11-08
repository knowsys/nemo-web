import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from "./en.json";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: "en",
    defaultNS: "common",
    resources: { en: enTranslations },
    detection: {
      order: ["querystring", "navigator"],
      lookupQuerystring: "language",
    },
  });

export { i18n };

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import fa from "./fa.json";

const savedLang = localStorage.getItem("lang") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Set initial dir + font
document.documentElement.dir = savedLang === "fa" ? "rtl" : "ltr";
document.documentElement.lang = savedLang === "fa" ? "fa" : "en";
document.documentElement.style.fontFamily =
  savedLang === "fa"
    ? "'Vazirmatn', sans-serif"
    : "'Inter', sans-serif";

export default i18n;

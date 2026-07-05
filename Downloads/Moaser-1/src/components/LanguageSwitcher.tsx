import { useTranslation } from "react-i18next";

function applyLanguage(lang: string) {
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  document.documentElement.lang = lang === "fa" ? "fa" : "en";
  document.documentElement.style.fontFamily =
    lang === "fa"
      ? "'Vazirmatn', sans-serif"
      : "'Inter', sans-serif";
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const toggle = () => {
    const next = isEn ? "fa" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
    applyLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
    >
      {isEn ? "فا" : "EN"}
    </button>
  );
}

export { applyLanguage };

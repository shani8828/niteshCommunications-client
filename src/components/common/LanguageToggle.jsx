import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === "hi" ? "en" : "hi";
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-6 left-6 z-[99] flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 hover:border-blue-300/80 text-slate-700 hover:text-blue-600 font-heading font-semibold text-xs rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 select-none active:scale-95 cursor-pointer"
      title={i18n.language === "hi" ? "Switch to English" : "हिन्दी में बदलें"}
    >
      <Globe size={15} className="text-blue-500 flex-shrink-0" />
      <span>{i18n.language === "hi" ? "English" : "हिंदी"}</span>
    </button>
  );
};

export default LanguageToggle;

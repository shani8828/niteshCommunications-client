import React from "react";
import i18next from "i18next";
/**
 * Reusable Global Loader Component
 * @param {boolean} fullPage - If true, displays a dark glassmorphic overlay over the entire viewport.
 */
const Loader = ({ fullPage = false }) => {
  const currentLang = i18next.language || "en";
  if (fullPage) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen bg-slate-900/40 flex justify-center items-center z-[9999] backdrop-blur-md">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 flex flex-col items-center shadow-2xl gap-4">
          <div className="loader-spinner"></div>
          <p className="font-heading font-bold text-xl text-blue-600 tracking-wider mt-2">
            {currentLang === "hi"
              ? "नितेश कम्युनिकेशन्स"
              : "NITESH COMMUNICATIONS"}
          </p>
          <span className="font-sans text-xs text-slate-500 text-center">
            {currentLang === "hi"
              ? "एक बार सेवा का अवसर अवश्य दें।"
              : "Please give us a chance to serve you."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8 w-full">
      <div className="loader-spinner"></div>
    </div>
  );
};

export default Loader;

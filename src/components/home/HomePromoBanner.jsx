import React from "react";
import { Link } from "react-router-dom";

const HomePromoBanner = ({ t, currentLang }) => {
  return (
    <section className="w-full bg-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="p-8 md:p-12 bg-blue-50 rounded-3xl border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="flex-1 min-w-[280px] flex flex-col gap-4 pl-4 md:pl-0 text-left">
            <span className="bg-blue-100 text-blue-600 border border-blue-300 px-2.5 py-1 rounded text-[10px] font-bold self-start uppercase">
              {currentLang === "hi"
                ? "स्पेशल फ़ोन स्किन"
                : "Special Phone Skins"}
            </span>
            <h2 className="font-heading text-2xl font-bold text-slate-800">
              {t("desc_banner_2")}
            </h2>
            <p className="text-sm text-slate-600">{t("cta_seva")}</p>
            <div className="mt-4">
              <Link
                to="/repairs"
                className="px-5 py-2.5 font-heading font-bold text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
              >
                {currentLang === "hi"
                  ? "फोन स्किन बुक करें"
                  : "Book Skin Customization Now"}
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0 w-full md:w-[200px] h-[200px] flex justify-center items-center">
            <img
              src="/branding/logo-full.png"
              alt="Promo Logo"
              className="w-full h-full object-contain rounded-xl"
              loading="lazy"
              onError={(e) => {
                e.target.src = "/branding/app-icon.png";
              }}
            />
          </div>
        </div>
        <Link to="/repairs" className="flex justify-center items-center mt-10">
          <div className="px-8 py-3.5 font-heading font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 rounded-full text-center transition-all duration-300 shadow-md shadow-blue-500/10">
            {currentLang === "hi"
              ? "फोन रिपेयर करवाएं"
              : "Repair Your Mobile Now"}
          </div>
        </Link>
      </div>
    </section>
  );
};

export default React.memo(HomePromoBanner);

import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Wrench, FileText } from "lucide-react";

const HomeHero = ({ t, currentLang }) => {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-blue-50 to-white text-slate-800 py-24 px-6">
      {/* Animated drifting blue-300 smoke and light blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Faded Watermark Logo in Background */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[550px] md:h-[550px] lg:w-[1100px] lg:h-[1100px] opacity-[0.2] pointer-events-none">
          <div className="w-full h-full">
            <img
              src="/branding/logo-500.webp"
              alt="Background Watermark Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Smoke Cloud 1 (Drifting Blue) */}
        <div
          className="animate-drift-1 absolute top-1/4 left-1/12 w-[400px] h-[400px] rounded-full bg-blue-300/20 blur-[90px]"
        />

        {/* Smoke Cloud 2 (Drifting Blue) */}
        <div
          className="animate-drift-2 absolute bottom-1/4 right-1/12 w-[450px] h-[450px] rounded-full bg-blue-300/15 blur-[100px]"
        />

        {/* Floating White Cloud */}
        <div
          className="animate-drift-3 absolute top-1/3 left-1/3 w-[550px] h-[350px] rounded-full bg-white/60 blur-[90px]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-8 md:gap-10">
        <h1
          style={{ "--fade-up-distance": "20px", animationDelay: "0.1s" }}
          className="animate-fade-up font-heading text-3xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight text-blue-600"
        >
          {t("brand")}
        </h1>

        <p
          style={{ "--fade-up-distance": "20px", animationDelay: "0.2s" }}
          className="animate-fade-up text-xl sm:text-3xl text-blue-600 font-bold font-heading tracking-wide"
        >
          {t("tagline")}
        </p>

        <p
          style={{ "--fade-up-distance": "20px", animationDelay: "0.3s" }}
          className="animate-fade-up text-slate-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-lg"
        >
          {t("desc_banner_1")}
        </p>

        <div
          style={{ "--fade-up-distance": "25px", animationDelay: "0.4s" }}
          className="animate-fade-up flex gap-4 sm:gap-6 mt-4 flex-wrap justify-center"
        >
          <Link
            to="/shop"
            className="px-8 py-3.5 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <ShoppingBag size={16} />
            {t("shop")}
          </Link>
          <Link
            to="/repairs"
            className="px-8 py-3.5 font-heading font-bold text-sm bg-white text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 hover:scale-105 transition-all flex items-center gap-2 shadow-sm"
          >
            <Wrench size={16} />
            {t("repair")}
          </Link>
          <Link
            to="/csc"
            className="px-8 py-3.5 font-heading font-bold text-sm bg-blue-50 text-blue-700 border border-blue-100 rounded-full hover:bg-blue-100/60 hover:scale-105 transition-all flex items-center gap-2"
          >
            <FileText size={16} />
            {t("csc")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomeHero);

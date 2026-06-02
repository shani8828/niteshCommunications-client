import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Wrench, FileText } from "lucide-react";

const HomeHero = ({ t, currentLang }) => {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-blue-50 to-white text-slate-800 py-24 px-6">
      {/* Animated drifting blue-300 smoke and light blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Faded Watermark Logo in Background */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[550px] md:h-[550px] lg:w-[1100px] lg:h-[1100px] opacity-[0.2] pointer-events-none">
          <motion.div
            animate={{
              rotate: [0, 0],
            }}
            transition={{
              duration: 90,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-full h-full"
          >
            <img
              src="/branding/logo.png"
              alt="Background Watermark Logo"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>

        {/* Smoke Cloud 1 (Drifting Blue) */}
        <motion.div
          animate={{
            x: [-120, 120, -120],
            y: [-50, 50, -50],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/12 w-[400px] h-[400px] rounded-full bg-blue-300/20 blur-[90px]"
        />

        {/* Smoke Cloud 2 (Drifting Blue) */}
        <motion.div
          animate={{
            x: [120, -120, 120],
            y: [50, -50, 50],
            scale: [1.2, 0.95, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/12 w-[450px] h-[450px] rounded-full bg-blue-300/15 blur-[100px]"
        />

        {/* Floating White Cloud */}
        <motion.div
          animate={{
            x: [-40, 40, -40],
            y: [40, -40, 40],
            scale: [0.95, 1.1, 0.95],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 left-1/3 w-[550px] h-[350px] rounded-full bg-white/60 blur-[90px]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-8 md:gap-10">
        {/* Glassmorphic Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-md border border-blue-100/60 text-xs font-semibold text-blue-600 uppercase tracking-wider"
        >
          <span>
            {currentLang === "hi"
              ? "विश्वसनीय डिजिटल सेवा केंद्र"
              : "Trusted Digital Service Hub"}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-3xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight text-blue-600"
        >
          {t("brand")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl sm:text-3xl text-blue-600 font-bold font-heading tracking-wide"
        >
          {t("tagline")}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-slate-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-lg"
        >
          {t("desc_banner_1")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 sm:gap-6 mt-4 flex-wrap justify-center"
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
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(HomeHero);

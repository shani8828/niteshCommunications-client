import React from "react";
import { Instagram, Facebook } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const HomeSocials = ({ currentLang }) => {
  return (
    <section className="w-full bg-white py-16 px-6 border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto text-center flex flex-col gap-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-slate-800 mb-3 text-center">
            {currentLang === "hi"
              ? "सोशल मीडिया पर हमें खोजें"
              : "Find us on Social Media"}
          </h3>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed text-center">
            {currentLang === "hi"
              ? "हमारे सोशल मीडिया हैंडल्स को फॉलो करें और नए अपडेट्स, ऑफर्स और डील्स प्राप्त करें।"
              : "Follow us on our social media handles to stay updated with latest products, services, and special offers."}
          </p>
        </div>

        <div className="grid gap-1 grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto w-full">
          {/* Instagram Card */}
          <a
            href="https://instagram.com/nitesh.communications"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md hover:border-pink-200 group text-center"
          >
            <div className="p-4 bg-pink-50 text-pink-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Instagram size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading font-bold text-slate-800 text-sm">Instagram</span>
              <span className="text-xs text-slate-400">@nitesh.communications</span>
            </div>
          </a>

          {/* Facebook Card */}
          <a
            href="https://www.facebook.com/share/18r5kc8pKq/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md hover:border-blue-200 group text-center"
          >
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Facebook size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading font-bold text-slate-800 text-sm">Facebook</span>
              <span className="text-xs text-slate-400">Nitesh Communications</span>
            </div>
          </a>

          {/* WhatsApp Card */}
          <a
            href="https://whatsapp.com/channel/0029VaDyFpZ9mrGiKnPD0g2c"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md hover:border-emerald-200 group text-center"
          >
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <FaWhatsapp size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading font-bold text-slate-800 text-sm">WhatsApp</span>
              <span className="text-xs text-slate-400">Official Channel</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomeSocials);

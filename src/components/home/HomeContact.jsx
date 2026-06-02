import React from "react";
import { Phone, MapPin } from "lucide-react";

const HomeContact = ({ currentLang }) => {
  return (
    <section className="w-full bg-white py-20 px-6 border-t border-slate-100">
      <div className="max-w-3xl mx-auto text-center">
        <h3 className="font-heading text-2xl font-bold text-blue-600 mb-3 text-center">
          {currentLang === "hi"
            ? "कोई प्रश्न? संपर्क करें "
            : "Have Questions? Get in Touch"}
        </h3>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto text-center">
          {currentLang === "hi"
            ? "रिपेयर की कीमत या उत्पाद संबंधी प्रश्नों के लिए नितेश कम्युनिकेशंस टीम से व्हाट्सएप या फोन पर सीधे संपर्क करने में संकोच न करें।"
            : "Feel free to contact Nitesh Communications Team directly on WhatsApp or phone for custom repairs pricing or product questions."}
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Phone size={18} className="text-blue-600" />
            <span>+91 9125949456</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 text-left">
            <MapPin size={18} className="text-blue-600 flex-shrink-0" />
            <span>
              {currentLang === "hi"
                ? "करमडांडा मोड़, पटखौली चौराहा, अयोध्या"
                : "Karamdanda Mod, Patkhauli Chauraha, Ayodhya"}
            </span>
          </div>
        </div>
        <div>
          <a
            href="https://wa.me/919125949456?text=नमस्ते%20नितेश%20कम्युनिकेशन्स,%20मुझे%20रिपेयर%20या%20प्रोडक्ट%20से%20संबंधित%20जानकारी%20चाहिए।"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 inline-block"
          >
            {currentLang === "hi"
              ? "व्हाट्सएप पर चैट करें"
              : "Chat on WhatsApp"}
          </a>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomeContact);

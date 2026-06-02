import React from "react";
import { MapPin } from "lucide-react";

const HomeMap = ({ currentLang }) => {
  return (
    <section className="w-full bg-slate-50 py-16 px-6 border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto text-center flex flex-col gap-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-slate-800 mb-3">
            {currentLang === "hi"
              ? "गूगल मैप पर हमें खोजें"
              : "Find us on Google Map"}
          </h3>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            {currentLang === "hi"
              ? "हमारी दुकान करमडांडा मोड़, पटखौली चौराहा, अयोध्या पर स्थित है। दिशा-निर्देश प्राप्त करने और सीधे हमारे पास आने के लिए नीचे दिए गए मानचित्र का उपयोग करें।"
              : "Our shop is located at Karamdanda Mod, Patkhauli Chauraha, Ayodhya. Use the map below to get directions and reach our shop easily."}
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 h-[380px] w-full bg-white p-2">
          <iframe
            title="Google Map Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3565.2719941459654!2d82.00883197528618!3d26.671782176791652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a11003ad51177%3A0xe8ae78ae027dc07!2sNitesh%20Communications!5e0!3m2!1sen!2sin!4v1780212388004!5m2!1sen!2sin"
            width="100%"
            height="100%"
            className="border-0 rounded-xl"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div>
          <a
            href="https://maps.app.goo.gl/EFMXBm2RCEf9YNa88"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 inline-flex items-center gap-2"
          >
            <MapPin size={16} />
            {currentLang === "hi"
              ? "दुकान तक पहुँचने का रास्ता (दिशा-निर्देश)"
              : "Get Directions to Reach Our Shop"}
          </a>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomeMap);

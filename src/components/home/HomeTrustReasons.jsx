import React from "react";
import { ShieldCheck, Zap, Clock } from "lucide-react";

const HomeTrustReasons = ({ currentLang }) => {
  return (
    <section className="w-full bg-gradient-to-b from-slate-50/60 to-white py-20 px-6 border-t border-slate-200/40">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-12">
          {currentLang === "hi"
            ? "नितेश कम्युनिकेशन्स पर भरोसा क्यों करें?"
            : "Why Choose Nitesh Communications?"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center gap-3 text-slate-600">
            <ShieldCheck size={38} className="text-blue-600" />
            <h4 className="font-heading font-bold text-lg text-slate-800">
              {currentLang === "hi"
                ? "100% ओरिजिनल सामान"
                : "100% Genuine Products"}
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              {currentLang === "hi"
                ? "हम सत्यापित वितरकों से सीधे प्रामाणिक कवर, बैटरी और चार्जर प्राप्त करते हैं।"
                : "We source authentic covers, batteries, and chargers directly from verified distributors."}
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 text-slate-600">
            <Zap size={38} className="text-blue-600" />
            <h4 className="font-heading font-bold text-lg text-slate-800">
              {currentLang === "hi"
                ? "एक्सप्रेस डिजिटल डिलीवरी"
                : "Express Digital Delivery"}
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              {currentLang === "hi"
                ? "सरकारी फॉर्म और प्रिंटिंग संचालन प्रिंटेड, लैमिनेटेड और न्यूनतम प्रतीक्षा समय के साथ परोसे जाते हैं।"
                : "Government forms and printing operations printed, laminated, and served with minimal waiting time."}
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 text-slate-600">
            <Clock size={38} className="text-blue-600" />
            <h4 className="font-heading font-bold text-lg text-slate-800">
              {currentLang === "hi"
                ? "त्वरित मरम्मत सेवा"
                : "Rapid Repair Service"}
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              {currentLang === "hi"
                ? "हमारी विशेषज्ञ टीम अधिकांश डिस्प्ले और हार्डवेयर समस्याओं को 2 घंटे के भीतर ठीक कर देती है।"
                : "Our expert team fixes most display and hardware issues within 2 hours."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomeTrustReasons);

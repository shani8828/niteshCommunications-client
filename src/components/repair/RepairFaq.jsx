import React, { useState } from "react";
import { FileText } from "lucide-react";

const RepairFaq = ({ currentLang, t }) => {
  const [faqOpen, setFaqOpen] = useState([false, false, false]);

  const toggleFaq = (index) => {
    setFaqOpen((prev) =>
      prev.map((item, idx) => (idx === index ? !item : item))
    );
  };

  const faqItems = currentLang === "hi"
    ? [
        {
          q: "क्या आप वारंटी देते हैं?",
          a: "हाँ! हम सभी स्क्रीन रिप्लेसमेंट और बैटरी रिप्लेसमेंट पर 90 दिनों की वारंटी देते हैं।",
        },
        {
          q: "पिकअप और डिलीवरी का शुल्क कितना है?",
          a: "पटखौली चौराहा से 5 किमी के भीतर हम मुफ्त होम पिकअप और ड्रॉप सुविधा देते हैं।",
        },
        {
          q: "क्या रिपेयर के दौरान मेरे फोन का डेटा सुरक्षित रहेगा?",
          a: "हम आपकी प्राइवेसी का पूरा ध्यान रखते हैं। फिर भी, यदि डिवाइस चालू है तो बैकअप लेने की सलाह दी जाती है।",
        },
      ]
    : [
        {
          q: "Do you offer a repair warranty?",
          a: "Yes! We provide a 90-day warranty on all screen replacements and battery replacements.",
        },
        {
          q: "What is the pickup and delivery charge?",
          a: "We offer free home pickups and drops for repairs within 5 km of Patkhauli Chauraha.",
        },
        {
          q: "Are my phone data files safe during repairs?",
          a: "We take complete care of privacy. However, we recommend taking backups if the device is operational.",
        },
      ];

  return (
    <div className="max-w-4xl mx-auto mt-16 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
      <h3 className="font-heading text-base font-bold text-blue-600 mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
        <FileText size={18} /> {t("repair:faq_title")}
      </h3>
      <div className="flex flex-col gap-3">
        {faqItems.map((faq, idx) => (
          <div
            key={idx}
            className="p-4 cursor-pointer bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => toggleFaq(idx)}
          >
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-bold text-xs sm:text-sm">{faq.q}</span>
              <span className="text-[10px] text-slate-400">
                {faqOpen[idx] ? "▲" : "▼"}
              </span>
            </div>
            {faqOpen[idx] && (
              <p className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RepairFaq);

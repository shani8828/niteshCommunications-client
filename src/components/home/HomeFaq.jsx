import React, { useState } from "react";
import { Link } from "react-router-dom";

const HomeFaq = ({ currentLang }) => {
  const [faqOpen, setFaqOpen] = useState([false, false, false, false]);

  const toggleFaq = (index) => {
    setFaqOpen((prev) =>
      prev.map((item, idx) => (idx === index ? !item : item)),
    );
  };

  const faqsList = currentLang === "hi"
    ? [
        {
          q: "मोबाइल स्क्रीन रिप्लेसमेंट में कितना समय लगता है?",
          a: "हमारे पटखौली चौराहा केंद्र पर अधिकांश डिस्प्ले रिपेयर और टचस्क्रीन ग्लास रिप्लेसमेंट 1 से 2 घंटे के भीतर पूरे हो जाते हैं।",
        },
        {
          q: "क्या आप मोबाइल फाइनेंसिंग विकल्प प्रदान करते हैं?",
          a: "हाँ, हम अपने पार्टनर नेटवर्क के माध्यम से नए स्मार्टफोन पर आसान किश्तों (EMI) और फाइनेंसिंग योजनाएं प्रदान करते हैं।",
        },
        {
          q: "आधार/पैन सेवाओं के लिए कौन से दस्तावेज़ आवश्यक हैं?",
          a: (
            <span>
              आम तौर पर, एक पहचान प्रमाण (वोटर आईडी/राशन कार्ड) और पते
              का प्रमाण आवश्यक होता है। विवरण के लिए हमसे संपर्क करें
              या हमारे{" "}
              <Link
                to="/csc"
                className="text-blue-600 hover:underline font-bold"
              >
                जन सेवा केंद्र (CSC) अनुभाग
              </Link>{" "}
              पर जाएँ।
            </span>
          ),
        },
        {
          q: "क्या मैं अपने उत्पाद ऑर्डर की स्थिति ऑनलाइन ट्रैक कर सकता हूँ?",
          a: (
            <span>
              बिल्कुल! एक बार आपका ऑर्डर कन्फर्म हो जाने के बाद, आप
              अपने{" "}
              <Link
                to="/profile"
                className="text-blue-600 hover:underline font-bold"
              >
                प्रोफाइल डैशबोर्ड
              </Link>{" "}
              में ऑर्डर्स के अंतर्गत इसे ट्रैक कर सकते हैं।
            </span>
          ),
        },
      ]
    : [
        {
          q: "How long does mobile screen replacement take?",
          a: "Most display repairs and touchscreen glass replacements are completed within 1 to 2 hours at our Patkhauli Chauraha center.",
        },
        {
          q: "Do you offer mobile financing options?",
          a: "Yes, we provide easy installments (EMI) and financing schemes on brand new smartphones through our partner networks.",
        },
        {
          q: "Which documents are required for Aadhaar/PAN services?",
          a: (
            <span>
              Generally, an identity proof (Voter ID/Rashan Card) and
              address proof are required. Contact us or visit our{" "}
              <Link
                to="/csc"
                className="text-blue-600 hover:underline font-bold"
              >
                CSC section
              </Link>{" "}
              for details.
            </span>
          ),
        },
        {
          q: "Can I track my product order status online?",
          a: (
            <span>
              Absolutely! Once your order is confirmed, you can track
              it in your{" "}
              <Link
                to="/profile"
                className="text-blue-600 hover:underline font-bold"
              >
                Profile Dashboard
              </Link>{" "}
              under My Orders.
            </span>
          ),
        },
      ];

  return (
    <section className="w-full bg-white py-20 border-t border-slate-100/80">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-8 text-center">
          {currentLang === "hi"
            ? "अक्सर पूछे जाने वाले प्रश्न"
            : "Frequently Asked Questions"}
        </h2>
        <div className="flex flex-col gap-4">
          {faqsList.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 cursor-pointer bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left"
              onClick={() => toggleFaq(idx)}
            >
              <div className="flex justify-between items-center font-bold text-sm sm:text-base text-slate-700">
                <span>{faq.q}</span>
                <span
                  className={`text-xs text-blue-600 transition-transform duration-200 ${faqOpen[idx] ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </div>
              {faqOpen[idx] && (
                <p className="mt-4 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomeFaq);

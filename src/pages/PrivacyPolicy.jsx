import React from "react";
import { useTranslation } from "react-i18next";
import { Lock, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  const isHindi = currentLang === "hi";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-24 bg-white relative">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft size={14} />{" "}
        {isHindi ? "मुख्य पृष्ठ पर वापस जाएँ" : "Back to Home"}
      </Link>

      <div className="p-6 md:p-10 bg-white border border-slate-200/80 rounded-3xl shadow-xl flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 flex-wrap">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl flex justify-center items-center text-blue-600">
            <Lock size={32} />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800">
              {isHindi ? "गोपनीयता नीति / Privacy Policy" : "Privacy Policy"}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-semibold">
              <Calendar size={12} />
              <span>
                {isHindi
                  ? "अंतिम अपडेट: 30 मई, 2026"
                  : "Last Updated: May 30, 2026"}
              </span>
            </div>
          </div>
        </div>

        {isHindi ? (
          <div className="flex flex-col gap-6 text-slate-600 text-sm leading-relaxed">
            <p>
              नितेश कम्युनिकेशन्स आपकी गोपनीयता की सुरक्षा के लिए पूरी तरह से
              प्रतिबद्ध है। यह गोपनीयता नीति बताती है कि जब आप हमारी सेवाओं का
              उपयोग करते हैं, तो हम आपकी जानकारी को कैसे एकत्र, उपयोग और
              सुरक्षित करते हैं।
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">
                1. सूचना संग्रह (Information Collection)
              </h2>
              <p>
                हम निम्नलिखित व्यक्तिगत जानकारी एकत्र करते हैं जब आप रजिस्टर
                करते हैं, ऑर्डर देते हैं या रिपेयर बुकिंग करते हैं:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 mt-1 text-slate-500">
                <li>आपका नाम (Full Name)</li>
                <li>पंजीकृत मोबाइल नंबर (Mobile Number)</li>
                <li>डिलीवरी या पिकअप का पता (Delivery/Pickup Address)</li>
                <li>
                  सटीक डिलीवरी और यह सत्यापित करने के लिए कि आपका पता हमारे 15
                  किमी डिलीवरी दायरे के भीतर है, जियो-लोकेशन कोऑर्डिनेट्स (GPS
                  Coordinates)
                </li>
                <li>ईमेल पता (वैकल्पिक)</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">
                2. एकत्रित जानकारी का उपयोग (How We Use Data)
              </h2>
              <p>
                आपकी जानकारी का उपयोग मुख्य रूप से निम्नलिखित कार्यों के लिए
                किया जाता है:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 mt-1 text-slate-500">
                <li>
                  आपके ऑर्डर्स को पूरा करने और समय पर डिलीवरी सुनिश्चित करने के
                  लिए।
                </li>
                <li>
                  मोबाइल रिपेयर और पिकअप शेड्यूलिंग की सुविधा प्रदान करने के
                  लिए।
                </li>
                <li>
                  ऑर्डर की स्थिति और अपडेट्स के बारे में व्हाट्सएप या फोन द्वारा
                  सूचना देने के लिए।
                </li>
                <li>हमारे उत्पादों और ग्राहक सहायता को बेहतर बनाने के लिए।</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">
                3. डेटा सुरक्षा (Data Security)
              </h2>
              <p>
                हम आपके डेटा को अनधिकृत पहुंच या लीक होने से बचाने के लिए तकनीकी
                सुरक्षा उपायों का उपयोग करते हैं। आपकी व्यक्तिगत जानकारी किसी भी
                तीसरे पक्ष (Third Party) के साथ विपणन या विज्ञापन उद्देश्यों के
                लिए साझा नहीं की जाती है।
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">
                4. कुकीज़ नीति (Cookies Declaration)
              </h2>
              <p>
                हमारी वेबसाइट बेहतर उपयोगकर्ता अनुभव, सत्र प्रबंधन (Session
                Management) और आपकी भाषा प्राथमिकताओं (English/Hindi) को याद
                रखने के लिए कुकीज़ और लोकल स्टोरेज (Local Storage) का उपयोग करती
                है। वेबसाइट का उपयोग करके आप कुकीज़ के उपयोग की अनुमति देते हैं।
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 mt-4">
              <h2 className="font-heading text-base font-bold text-slate-800">
                संपर्क विवरण (Contact Information)
              </h2>
              <p>
                यदि आपके पास इस गोपनीयता नीति या अपने डेटा से संबंधित कोई
                चिंताएं हैं, तो कृपया हमसे व्हाट्सएप (+91 9125949456) या ईमेल
                (info.niteshcommunications@gmail.com) पर संपर्क करें।
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 text-slate-600 text-sm leading-relaxed">
            <p>
              At Nitesh Communications, we respect and are committed to
              protecting your privacy. This Privacy Policy details how we
              collect, store, and process your personal information when you use
              our website or order accessories and services.
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">
                1. Information We Collect
              </h2>
              <p>
                We collect personal information when you register an account,
                place an order, or submit repair requests:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 mt-1 text-slate-500">
                <li>Full Name</li>
                <li>Contact Mobile Number</li>
                <li>Delivery/Pickup Address details</li>
                <li>
                  GPS / Geo-location coordinates (to verify your address is
                  within our 15 km delivery radius and for accurate dispatch)
                </li>
                <li>Email Address (optional)</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">
                2. How We Use Your Information
              </h2>
              <p>The information we collect is primarily used for:</p>
              <ul className="list-disc pl-5 flex flex-col gap-1 mt-1 text-slate-500">
                <li>
                  Processing and fulfilling your product purchases and checkout
                  orders.
                </li>
                <li>
                  Scheduling and coordinating door-step mobile repair pickups
                  and drops.
                </li>
                <li>
                  Communicating order status or delivery confirmation via
                  call/SMS/WhatsApp.
                </li>
                <li>
                  Enhancing customer support and optimizing the user experience.
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">
                3. Data Security & Disclosures
              </h2>
              <p>
                We implement structural and digital safety protocols to protect
                your personal details. We do not sell, trade, or share your
                personal database with third-party marketing agencies.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">
                4. Cookies Usage
              </h2>
              <p>
                We use cookies and localStorage parameters to maintain user
                sessions, login state, and remember your language preference
                (English/Hindi) during navigation. Continuing to browse our site
                signifies agreement with this policy.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 mt-4">
              <h2 className="font-heading text-base font-bold text-slate-800">
                Contact Information
              </h2>
              <p>
                For questions regarding this policy or data management requests,
                please write to us via email at
                info.niteshcommunications@gmail.com or call +91 9125949456.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;

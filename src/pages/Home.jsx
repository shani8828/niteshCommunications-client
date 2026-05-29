import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Wrench,
  FileText,
  ChevronRight,
  ShieldCheck,
  Zap,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import Loader from "../components/common/Loader";
import api from "../utils/api";

const Home = () => {
  const { t, i18n } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [faqOpen, setFaqOpen] = useState([false, false, false, false]);

  const toggleFaq = (index) => {
    setFaqOpen((prev) =>
      prev.map((item, idx) => (idx === index ? !item : item)),
    );
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get("/products?limit=4");
        setFeaturedProducts(response.data.products);
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const currentLang = i18n.language || "hi";

  return (
    <div className="w-full bg-white">
      {/* 1. Redesigned Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100/30 py-20 px-6 sm:py-32">
        {/* Subtle decorative background shapes */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight"
          >
            {t("brand")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-2xl text-blue-600 font-semibold font-heading"
          >
            {t("tagline")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-slate-600 max-w-xl mx-auto leading-relaxed text-sm sm:text-base"
          >
            {t("desc_banner_1")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex gap-4 mt-4 flex-wrap justify-center"
          >
            <Link
              to="/shop"
              className="px-6 py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 flex items-center gap-2"
            >
              <ShoppingBag size={16} />
              {t("shop")}
            </Link>
            <Link
              to="/repairs"
              className="px-6 py-3 font-heading font-bold text-sm bg-white text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Wrench size={16} />
              {t("repair")}
            </Link>
            <Link
              to="/csc"
              className="px-6 py-3 font-heading font-bold text-sm bg-blue-50 text-blue-700 border border-blue-100 rounded-full hover:bg-blue-100/50 transition-all flex items-center gap-2"
            >
              <FileText size={16} />
              {t("csc")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Three Major CTA Cards */}
      <section className="bg-gradient-to-b from-blue-100/30 via-white to-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Shop */}
            <motion.div
              whileHover={{ y: -6 }}
              className="flex flex-col items-start gap-4 p-8 glass-card rounded-2xl"
            >
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex justify-center items-center">
                <ShoppingBag size={28} className="text-blue-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-800">
                {t("shop")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {currentLang == "hi"
                  ? "स्टेशनरी, फाइल फोल्डर, ब्लूटूथ इयरफ़ोन, चार्जर, बैटरी, हेडफ़ोन,फ़ोन ग्लास, फ़ोन आदि उपलब्ध हैं।"
                  : "Stationary, File Folders, Bluetooth Earphone, Charger, Battery, Headphone, Phone Glasses, Phones are available."}
              </p>
              <Link
                to="/shop"
                className="flex items-center gap-1 text-blue-600 font-bold text-xs hover:underline mt-auto pt-4"
              >
                {currentLang == "hi" ? "स्टोर देखें" : "Browse Store"}
                <ChevronRight size={16} />
              </Link>
            </motion.div>

            {/* Card 2: Repair */}
            <motion.div
              whileHover={{ y: -6 }}
              className="flex flex-col items-start gap-4 p-8 glass-card rounded-2xl"
            >
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex justify-center items-center">
                <Wrench size={28} className="text-blue-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-800">
                {t("repair")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                •{" "}
                {currentLang == "hi"
                  ? "मोबाइल रिपेयर (स्क्रीन, बैटरी, पानी से खराब, स्पीकर) घंटो के अंदर किया जाता है।"
                  : "Mobile repairs (screen, battery, water damage, speakers) done within hours."}
                <br />• {t("desc_banner_2")}
              </p>
              <Link
                to="/repairs"
                className="flex items-center gap-1 text-blue-600 font-bold text-xs hover:underline mt-auto pt-4"
              >
                {currentLang == "hi" ? "रिपेयर बुक करें" : "Book Repair"}{" "}
                <ChevronRight size={16} />
              </Link>
            </motion.div>

            {/* Card 3: CSC */}
            <motion.div
              whileHover={{ y: -6 }}
              className="flex flex-col items-start gap-4 p-8 glass-card rounded-2xl"
            >
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex justify-center items-center">
                <FileText size={28} className="text-blue-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-800">
                {t("csc")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {currentLang == "hi"
                  ? "आधार, पैन, ऑनलाइन फॉर्म, बैंकिंग सहायता, जन्म / आय प्रमाण पत्र जैसी अन्य ऑनलाइन सेवाएँ उपलब्ध हैं।"
                  : "Fast service like Aadhaar, PAN, online job forms, banking withdrawal help, and birth/income certificates are available."}
              </p>
              <Link
                to="/csc"
                className="flex items-center gap-1 text-blue-600 font-bold text-xs hover:underline mt-auto pt-4"
              >
                {currentLang == "hi" ? "ऑनलाइन पूछताछ करें" : "Online Inquiry"}
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Promotional Special Banner */}
      <section className="max-w-6xl mx-auto my-12 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12 bg-slate-50 border border-slate-100 rounded-2xl">
        <div className="flex-1 min-w-[280px] flex flex-col gap-4">
          <span className="bg-blue-600 text-white px-2.5 py-1 rounded text-[10px] font-bold self-start uppercase">
            {currentLang == "hi" ? "स्पेशल फ़ोन स्किन" : "Special Phone Skins"}
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
              {currentLang == "hi"
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
            onError={(e) => {
              e.target.src = "/branding/app-icon.png";
            }}
          />
        </div>
      </section>

      {/* 4. Featured Store Products */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="font-heading text-3xl font-extrabold text-slate-900 mb-2 text-center md:text-left">
          {currentLang == "hi" ? "हमारे प्रोडक्ट्स" : "Featured Products"}
        </h2>
        <p className="text-sm text-slate-500 mb-8 text-center md:text-left">
          {currentLang == "hi"
            ? "ओरिजिनल चार्जर, मोबाइल ग्लास, इयरफ़ोन, और भी सामान देखें..."
            : "Explore original chargers, mobile glasses, earphones, and accessories..."}
        </p>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className="p-4 flex flex-col gap-3 glass-card rounded-2xl hover:shadow-md"
              >
                <div className="bg-slate-50 rounded-xl h-[180px] flex justify-center items-center overflow-hidden border border-slate-100">
                  <img
                    src={product.images[0]}
                    alt={product.name.en}
                    className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <h4 className="font-heading text-sm font-semibold text-slate-800 truncate">
                    {product.name[currentLang]}
                  </h4>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-base font-extrabold text-blue-600">
                      ₹{product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/product/${product._id}`}
                    className="w-full py-2 mt-4 font-heading font-semibold text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-center rounded-lg block transition-colors"
                  >
                    {currentLang == "hi" ? "देखें" : "View Product"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Trust / Why Choose Us */}
      <section className="bg-slate-50 border-y border-slate-200/80 my-16">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-12">
            {currentLang == "hi"
              ? "नितेश कम्युनिकेशन्स पर भरोसा क्यों करें?"
              : "Why Choose Nitesh Communications?"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center gap-3 text-slate-600">
              <ShieldCheck size={38} className="text-blue-600" />
              <h4 className="font-heading font-bold text-lg text-slate-800">
                {currentLang == "hi"
                  ? "100% ओरिजिनल सामान"
                  : "100% Genuine Products"}
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {currentLang == "hi"
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
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
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
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {currentLang === "hi"
                  ? "हमारी विशेषज्ञ टीम अधिकांश डिस्प्ले और हार्डवेयर समस्याओं को 2 घंटे के भीतर ठीक कर देती है।"
                  : "Our expert team fixes most display and hardware issues within 2 hours."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-8 text-center">
          {currentLang === "hi"
            ? "अक्सर पूछे जाने वाले प्रश्न"
            : "Frequently Asked Questions"}
        </h2>
        <div className="flex flex-col gap-4">
          {(currentLang === "hi"
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
                  a: "आम तौर पर, एक पहचान प्रमाण (वोटर आईडी/राशन कार्ड) और पते का प्रमाण आवश्यक होता है। विवरण के लिए हमसे संपर्क करें या हमारे CSC अनुभाग पर जाएँ।",
                },
                {
                  q: "क्या मैं अपने उत्पाद ऑर्डर की स्थिति ऑनलाइन ट्रैक कर सकता हूँ?",
                  a: "बिल्कुल! एक बार आपका ऑर्डर कन्फर्म हो जाने के बाद, आपको वास्तविक समय में अपडेट देखने के लिए एक अद्वितीय ट्रैकिंग लिंक प्राप्त होगा।",
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
                  a: "Generally, an identity proof (Voter ID/Rashan Card) and address proof are required. Contact us or visit our CSC section for details.",
                },
                {
                  q: "Can I track my product order status online?",
                  a: "Absolutely! Once your order is confirmed, you will receive a unique tracking link to watch updates in real-time.",
                },
              ]
          ).map((faq, idx) => (
            <div
              key={idx}
              className="p-5 cursor-pointer bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
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
      </section>

      {/* 7. Quick Contact */}
      <section className="max-w-xl mx-auto my-16 px-6">
        <div className="p-8 md:p-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl">
          <h3 className="font-heading text-2xl font-bold text-blue-600 mb-3">
            {currentLang == "hi"
              ? "कोई प्रश्न? संपर्क करें "
              : "Have Questions? Get in Touch"}
          </h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            {currentLang == "hi"
              ? "रिपेयर की कीमत या प्रोडक्ट संबंधी प्रश्नों के लिए नितेश कम्युनिकेशंस टीम से व्हाट्सएप या फोन पर सीधे संपर्क करने में संकोच न करें।"
              : "Feel free to contact Nitesh Communications Team directly on WhatsApp or phone for custom repairs pricing or product questions."}
          </p>
          <div className="flex flex-col gap-4 items-center mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone size={18} className="text-blue-600" />
              <span>+91 9125949456</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin size={18} className="text-blue-600" />
              <span>
                {currentLang == "hi"
                  ? "करमडांडा मोड़, पटखौली चौराहा, अयोध्या"
                  : "Karamdanda Mod, Patkhauli Chauraha, Ayodhya"}
              </span>
            </div>
          </div>
          <div>
            <a
              href="https://wa.me/919125949456?text=Hello%20Nitesh%20Communications,%20I%20have%20a%20repair/product%20query."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 inline-block"
            >
              {currentLang == "hi"
                ? "व्हाट्सएप पर चैट करें"
                : "Chat on WhatsApp"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

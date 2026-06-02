import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { getCachedData, setCachedData } from "../utils/cache";
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
  Shield,
  CreditCard,
  Landmark,
  Printer,
  Users,
  Instagram,
  Facebook,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import api from "../utils/api";

const categoriesList = [
  {
    id: "phones",
    name: {
      en: "Phones",
      hi: "फ़ोन",
    },
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format&fit=crop",
    desc: {
      en: "Latest smartphones and devices",
      hi: "नवीनतम स्मार्टफोन और डिवाइस",
    },
  },
  {
    id: "earphone",
    name: {
      en: "Earphone",
      hi: "इयरफोन",
    },
    image:
      "https://res.cloudinary.com/dd1tmrvu0/image/upload/v1780293047/nitesh_communications/keyxffy0yg48yrgosewd.avif",
    desc: {
      en: "Wired & wireless audio gear",
      hi: "वायर्ड और वायरलेस ऑडियो गियर",
    },
  },
  {
    id: "tshirt",
    name: {
      en: "TShirt",
      hi: "टी-शर्ट",
    },
    image:
      "https://res.cloudinary.com/dd1tmrvu0/image/upload/v1780222418/nitesh_communications/x8db5ricws3aqpdylfml.avif",
    desc: {
      en: "Comfortable and trendy apparel",
      hi: "आरामदायक और ट्रेंडी कपड़े",
    },
  },
  {
    id: "stationary",
    name: {
      en: "Stationary",
      hi: "स्टेशनरी",
    },
    image:
      "https://res.cloudinary.com/dd1tmrvu0/image/upload/v1780292917/nitesh_communications/pkh52pudhusn6eeiupap.avif",
    desc: {
      en: "Quality notebooks, pens and more",
      hi: "गुणवत्ता वाले नोटबुक, पेन और बहुत कुछ",
    },
  },
];

const cscServicesFeatured = [
  {
    icon: Shield,
    title: { en: "Aadhaar Services", hi: "आधार सेवाएं" },
    desc: {
      en: "Biometric updates, demographic corrections & print support.",
      hi: "बायोमेट्रिक अपडेट, जनसांख्यिकीय सुधार और प्रिंट सहायता।",
    },
  },
  {
    icon: CreditCard,
    title: { en: "PAN Card Services", hi: "पैन कार्ड सेवाएं" },
    desc: {
      en: "Application for new PAN card and corrections on existing card.",
      hi: "नए पैन कार्ड के लिए आवेदन और मौजूदा कार्ड में सुधार।",
    },
  },
  {
    icon: FileText,
    title: { en: "Govt Certificates", hi: "सरकारी प्रमाण पत्र" },
    desc: {
      en: "Apply for Income, Caste, and Domicile certificates quickly.",
      hi: "आय, जाति और निवास प्रमाण पत्र के लिए त्वरित आवेदन करें।",
    },
  },
  {
    icon: Landmark,
    title: { en: "Ration Card & Banking", hi: "राशन कार्ड और बैंकिंग" },
    desc: {
      en: "New applications, member modifications & banking withdrawals.",
      hi: "नए आवेदन, सदस्य संशोधन और बैंकिंग निकासी सहायता।",
    },
  },
  {
    icon: Printer,
    title: { en: "Online Forms & Printing", hi: "ऑनलाइन फॉर्म और प्रिंटिंग" },
    desc: {
      en: "Job application form filling, printouts & document lamination.",
      hi: "नौकरी आवेदन पत्र भरना, प्रिंटआउट और दस्तावेज लेमिनेशन।",
    },
  },
  {
    icon: Users,
    title: { en: "Welfare & Pensions", hi: "कल्याणकारी योजनाएं" },
    desc: {
      en: "Old Age, Widow and Disability pension registration assistance.",
      hi: "वृद्धावस्था, विधवा और विकलांगता पेंशन पंजीकरण सहायता।",
    },
  },
];

const Home = () => {
  const { t, i18n } = useTranslation();
  const [faqOpen, setFaqOpen] = useState([false, false, false, false]);

  const toggleFaq = (index) => {
    setFaqOpen((prev) =>
      prev.map((item, idx) => (idx === index ? !item : item)),
    );
  };

  const currentLang = i18n.language || "hi";

  useEffect(() => {
    document.title =
      "Nitesh Communications | E-Commerce, Mobile Repairing & CSC Services | नितेश कम्युनिकेशन्स";

    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Nitesh Communications Ayodhya - A leading store providing brand new mobile phones, quality repair services, and digital CSC solutions. नितेश कम्युनिकेशन्स - मोबाइल शॉप, रिपेयरिंग सेवाएं और जन सेवा केंद्र।"
    );

    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", window.location.origin);
  }, [currentLang]);

  useEffect(() => {
    // Prefetch Shop page data in the background after home renders
    const prefetchShopData = async () => {
      // 1. Categories prefetch
      const catCacheKey = "shop_categories";
      if (!getCachedData(catCacheKey)) {
        try {
          const response = await api.get("/products/categories");
          setCachedData(catCacheKey, response.data, 10 * 60 * 1000);
        } catch (err) {
          console.error("Prefetch categories failed:", err);
        }
      }

      // 2. Products prefetch
      const prodCacheKey =
        "shop_products_p_1_s_newest_min_0_max_100000_k__c__b_";
      if (!getCachedData(prodCacheKey)) {
        try {
          const url = "/products?page=1&sort=newest&minPrice=0&maxPrice=100000";
          const response = await api.get(url);
          setCachedData(
            prodCacheKey,
            { products: response.data.products, pages: response.data.pages },
            5 * 60 * 1000,
          );
        } catch (err) {
          console.error("Prefetch products failed:", err);
        }
      }

      // 3. Category-specific prefetch for the 4 featured categories
      const targetCategories = ["phones", "earphone", "tshirt", "stationary"];
      for (const cat of targetCategories) {
        const catProdCacheKey = `shop_products_p_1_s_newest_min_0_max_100000_k__c_${cat}_b_`;
        if (!getCachedData(catProdCacheKey)) {
          try {
            const url = `/products?page=1&sort=newest&minPrice=0&maxPrice=100000&category=${cat}`;
            const response = await api.get(url);
            setCachedData(
              catProdCacheKey,
              { products: response.data.products, pages: response.data.pages },
              5 * 60 * 1000,
            );
          } catch (err) {
            console.error(`Prefetch products for category ${cat} failed:`, err);
          }
        }
      }
    };

    // Use a small timeout to let the home page load fully first
    const timer = setTimeout(() => {
      prefetchShopData();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full bg-white">
      {/* 1. Redesigned Premium Hero Section */}
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
            {/* <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" /> */}
            <span>
              {currentLang == "hi"
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

      {/* 2. Featured Store Categories */}
      <section className="w-full bg-gradient-to-b from-white to-slate-50/60 py-20 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-extrabold text-slate-900 mb-2 text-center md:text-left">
            {currentLang === "hi"
              ? "श्रेणी के अनुसार खरीदें"
              : "Shop by Category"}
          </h2>
          <p className="text-sm text-slate-500 mb-8 text-center md:text-left">
            {currentLang === "hi"
              ? "हमारे चुनिंदा और लोकप्रिय श्रेणियों के उत्पादों को ब्राउज़ करें"
              : "Browse through our curated and popular product categories"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categoriesList.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="p-4 flex flex-col gap-4 glass-card rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group"
              >
                <div className="bg-slate-50 rounded-xl h-[180px] flex justify-center items-center overflow-hidden border border-slate-100 relative">
                  <img
                    src={cat.image}
                    alt={cat.name.en}
                    className="max-w-[90%] max-h-[90%] object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col flex-grow text-center sm:text-left">
                  <h4 className="font-heading text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {cat.name[currentLang]}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {cat.desc[currentLang]}
                  </p>
                  <div className="w-full py-2.5 mt-4 font-heading font-bold text-xs bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white text-center rounded-xl block transition-all">
                    {currentLang === "hi" ? "प्रोडक्ट देखें" : "View Products"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/shop" className="flex justify-center items-center mt-10">
            <div className="px-8 py-3.5 font-heading font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 rounded-full text-center transition-all duration-300 shadow-md shadow-blue-500/10">
              {currentLang === "hi"
                ? "सभी प्रोडक्ट देखें"
                : "View All Products"}
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Promotional Special Banner Or Repair Section*/}
      <section className="w-full bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="p-8 md:p-12 bg-blue-50 rounded-3xl border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="flex-1 min-w-[280px] flex flex-col gap-4 pl-4 md:pl-0">
              <span className="bg-blue-100 text-blue-600 border border-blue-300 px-2.5 py-1 rounded text-[10px] font-bold self-start uppercase">
                {currentLang == "hi"
                  ? "स्पेशल फ़ोन स्किन"
                  : "Special Phone Skins"}
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
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/branding/app-icon.png";
                }}
              />
            </div>
          </div>
          <Link
            to="/repairs"
            className="flex justify-center items-center mt-10"
          >
            <div className="px-8 py-3.5 font-heading font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 rounded-full text-center transition-all duration-300 shadow-md shadow-blue-500/10">
              {currentLang === "hi"
                ? "फोन रिपेयर करवाएं"
                : "Repair Your Mobile Now"}
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Jan Seva Kendra Section*/}
      <section className="w-full bg-gradient-to-b from-white to-slate-50/40 py-20 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 flex flex-col items-center gap-2">
            <h2 className="font-heading text-3xl font-extrabold text-slate-900 mt-1">
              {currentLang === "hi"
                ? "जन सेवा केंद्र सेवाएं"
                : "Jan Seva Kendra Services"}
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              {currentLang === "hi"
                ? "अयोध्या में विश्वसनीय सरकारी प्रमाण पत्र, पहचान पत्र सुधार, ऑनलाइन फॉर्म और डिजिटल बैंकिंग सेवाएं।"
                : "Reliable government certificate application, identity card correction, online form filling, and digital banking right in Ayodhya."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cscServicesFeatured.map((service, idx) => {
              const IconComp = service.icon;
              return (
                <Link
                  key={idx}
                  to="/csc"
                  className="p-6 flex flex-col gap-4 bg-white border border-slate-200/80 rounded-2xl hover:shadow-lg hover:border-blue-300/80 hover:scale-[1.02] transition-all cursor-pointer group"
                >
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 w-fit flex justify-center items-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                    <IconComp
                      size={24}
                      className="text-blue-600 group-hover:text-white transition-all duration-300"
                    />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h4 className="font-heading text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {service.title[currentLang]}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {service.desc[currentLang]}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <Link to="/csc" className="flex justify-center items-center mt-10">
            <div className="px-8 py-3.5 font-heading font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 rounded-full text-center transition-all duration-300 shadow-md shadow-blue-500/10">
              {currentLang === "hi"
                ? "सभी जन सेवा केंद्र सेवाएं देखें"
                : "View All Jan Seva Kendra Services"}
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Trust / Why Choose Us */}
      <section className="w-full bg-gradient-to-b from-slate-50/60 to-white py-20 px-6 border-t border-slate-200/40">
        <div className="max-w-6xl mx-auto px-6 text-center">
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
      <section className="w-full bg-white py-20 border-t border-slate-100/80">
        <div className="max-w-4xl mx-auto px-6">
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
                        में मेरे ऑर्डर्स के अंतर्गत इसे ट्रैक कर सकते हैं।
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
        </div>
      </section>

      {/* 7. Quick Contact */}
      <section className="w-full bg-white py-20 px-6 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-heading text-2xl font-bold text-blue-600 mb-3">
            {currentLang == "hi"
              ? "कोई प्रश्न? संपर्क करें "
              : "Have Questions? Get in Touch"}
          </h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto">
            {currentLang == "hi"
              ? "रिपेयर की कीमत या उत्पाद संबंधी प्रश्नों के लिए नितेश कम्युनिकेशंस टीम से व्हाट्सएप या फोन पर सीधे संपर्क करने में संकोच न करें।"
              : "Feel free to contact Nitesh Communications Team directly on WhatsApp or phone for custom repairs pricing or product questions."}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
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
              href="https://wa.me/919125949456?text=नमस्ते%20नितेश%20कम्युनिकेशन्स,%20मुझे%20रिपेयर%20या%20प्रोडक्ट%20से%20संबंधित%20जानकारी%20चाहिए।"
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

      {/* 8. Find Us on Google Maps Section */}
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

      {/* 9. Find Us on Social Media Section */}
      <section className="w-full bg-white py-16 px-6 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-8">
          <div>
            <h3 className="font-heading text-2xl font-bold text-slate-800 mb-3">
              {currentLang === "hi"
                ? "सोशल मीडिया पर हमें खोजें"
                : "Find us on Social Media"}
            </h3>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              {currentLang === "hi"
                ? "हमारे सोशल मीडिया हैंडल्स को फॉलो करें और नए अपडेट्स, ऑफर्स और डील्स प्राप्त करें।"
                : "Follow us on our social media handles to stay updated with latest products, services, and special offers."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto w-full">
            {/* Instagram Card */}
            <a
              href="https://instagram.com/nitesh.communications"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md hover:border-pink-200 group"
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
              className="flex flex-col items-center gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md hover:border-blue-200 group"
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
              className="flex flex-col items-center gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md hover:border-emerald-200 group"
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
    </div>
  );
};

export default Home;

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { Wrench, MapPin, Smartphone, Battery, Zap, Cpu, Camera, Volume2, Shield } from "lucide-react";
import QuickLinksBanner from "../components/common/QuickLinksBanner";

const RepairService = () => {
  const { t, i18n } = useTranslation(["repair", "common", "notifications"]);
  const currentLang = i18n.language || "hi";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("Hardware repair");
  const [problem, setProblem] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [faqOpen, setFaqOpen] = useState([false, false, false]);

  const toggleFaq = (index) => {
    setFaqOpen((prev) =>
      prev.map((item, idx) => (idx === index ? !item : item)),
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast.error(
        "आपका ब्राउज़र लोकेशन का समर्थन नहीं करता है / Your browser does not support geolocation",
      );
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          );
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            showToast.success(
              "लोकेशन सफलतापूर्वक प्राप्त की गई / Location retrieved successfully",
            );
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          console.error(err);
          setAddress(`${latitude}, ${longitude}`);
          showToast.warning(
            "लोकेशन तो मिल गई, पर पता खोजने में समस्या हुई / Location retrieved, but failed to fetch address name",
          );
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        console.error(error);
        setGeolocating(false);
        showToast.error(
          "लोकेशन अनुमति अस्वीकृत या उपलब्ध नहीं है / Location permission denied or unavailable",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();

    if (!name || !phone || !brand || !model || !problem || !address) {
      showToast.error(t("notifications:fill_all_fields"));
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/repairs", {
        customerName: name,
        customerPhone: phone,
        deviceBrand: brand,
        deviceModel: model,
        problemDescription: problem,
        serviceCategory: category,
        pickupAddress: address,
        coordinates,
      });

      const data = response.data;
      showToast.success(
        t("notifications:repair_submitted") +
          " ID: " +
          (data.repair?.requestId || data.repairRequest?.requestId || ""),
      );
      setName("");
      setPhone("");
      setBrand("");
      setModel("");
      setProblem("");
      setAddress("");
      setCoordinates(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("notifications:server_error");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const servicesList = [
    {
      title: { en: "Screen / Folder Replacement", hi: "स्क्रीन और फोल्डर रिप्लेसमेंट" },
      desc: { en: "Fix broken, flickering, color bleeding, or non-responsive touchscreen folders.", hi: "टूटे हुए, टिमटिमाते, रंग बदलने वाले, या काम न करने वाले टचस्क्रीन फोल्डर को बदलें।" },
      fee: { en: "₹1,499 onwards", hi: "₹1,499 से शुरू" },
      time: { en: "1 - 2 Hours", hi: "1 - 2 घंटे" },
      bullets: {
        en: ["High-quality LCD/OLED panels", "90-day warranty included", "Tempered glass protection free"],
        hi: ["उच्च गुणवत्ता वाले LCD/OLED पैनल", "90 दिनों की वारंटी शामिल", "टेम्पर्ड ग्लास सुरक्षा मुफ्त"]
      },
      icon: Smartphone
    },
    {
      title: { en: "Battery Replacement", hi: "मोबाइल बैटरी बदलना" },
      desc: { en: "Replace old, bloated, draining, or heating phone batteries with fresh cells.", hi: "पुरानी, सूजी हुई, जल्दी डिस्चार्ज होने वाली या गर्म होने वाली मोबाइल बैटरी को नई सेल से बदलें।" },
      fee: { en: "₹799 onwards", hi: "₹799 से शुरू" },
      time: { en: "30 - 60 Minutes", hi: "30 - 60 मिनट" },
      bullets: {
        en: ["OEM-quality high capacity batteries", "Strict testing & power safety", "Safe disposal of old cell"],
        hi: ["OEM-गुणवत्ता वाली उच्च क्षमता वाली बैटरी", "सख्त परीक्षण और बिजली सुरक्षा", "पुरानी सेल का सुरक्षित निपटान"]
      },
      icon: Battery
    },
    {
      title: { en: "Charging Port Jack Repair", hi: "चार्जिंग जैक और पोर्ट मरम्मत" },
      desc: { en: "Fix loose connection, slow charging, or unrecognised USB connection issues.", hi: "ढीले कनेक्शन, धीमी चार्जिंग, या न पहचानी जाने वाली यूएसबी कनेक्शन समस्याओं को ठीक करें।" },
      fee: { en: "₹349 onwards", hi: "₹349 से शुरू" },
      time: { en: "1 - 2 Hours", hi: "1 - 2 घंटे" },
      bullets: {
        en: ["Type-C & Micro-USB jacks replacement", "Mic/audio pathway checking", "Proper solder joint reinforcement"],
        hi: ["टाइप-सी और माइक्रो-यूएसबी जैक रिप्लेसमेंट", "माइक/ऑडियो पाथवे चेकिंग", "सोल्डर जोड़ का सुदृढ़ीकरण"]
      },
      icon: Zap
    },
    {
      title: { en: "Motherboard Chip-Level Repair", hi: "मदरबोर्ड और आईसी चिप-लेवल रिपेयर" },
      desc: { en: "Micro-soldering, water damage recovery, network IC, and CPU reballing.", hi: "माइक्रो-सोल्डरिंग, पानी से खराब हुए फोन की रिकवरी, नेटवर्क आईसी और सीपीयू रीबॉलिंग।" },
      fee: { en: "₹999 onwards", hi: "₹999 से शुरू" },
      time: { en: "1 - 2 Days", hi: "1 - 2 दिन" },
      bullets: {
        en: ["Expert chip-level micro-soldering", "Short circuit tracing on board", "Dead phone boot recovery"],
        hi: ["विशेषज्ञ चिप-लेवल माइक्रो-सोल्डरिंग", "बोर्ड पर शॉर्ट सर्किट की ट्रेसिंग", "डेड फोन बूट रिकवरी"]
      },
      icon: Cpu
    },
    {
      title: { en: "Speaker, Mic & Audio Fix", hi: "स्पीकर, माइक और ऑडियो फिक्स" },
      desc: { en: "Repair crackling ear speaker, low volume, silent main speaker, or faulty mic.", hi: "फटने वाली आवाज, कम वॉल्यूम, बंद मुख्य स्पीकर, या दोषपूर्ण माइक को ठीक करें।" },
      fee: { en: "₹249 onwards", hi: "₹249 से शुरू" },
      time: { en: "1 - 2 Hours", hi: "1 - 2 घंटे" },
      bullets: {
        en: ["Original replacement buzzer/mic", "Dust mesh cleaning included", "Pre-delivery call quality check"],
        hi: ["मूल रिप्लेसमेंट बजर/माइक", "धूल की जाली की सफाई शामिल", "वितरण से पहले कॉल गुणवत्ता की जांच"]
      },
      icon: Volume2
    },
    {
      title: { en: "Camera Lens & Module Repair", hi: "कैमरा लेंस और सेंसर मरम्मत" },
      desc: { en: "Replace blurry camera glass, broken external lens, or vibration issues.", hi: "धुंधले कैमरे के कांच, टूटे हुए बाहरी लेंस, या वाइब्रेशन की समस्या को बदलें।" },
      fee: { en: "₹399 onwards", hi: "₹399 से शुरू" },
      time: { en: "1 - 2 Hours", hi: "1 - 2 घंटे" },
      bullets: {
        en: ["OEM glass lens replacements", "Autofocus sensor realignment", "Dust removal from camera lens"],
        hi: ["OEM ग्लास लेंस रिप्लेसमेंट", "ऑटोफोकस सेंसर रीलाइनमेंट", "कैमरा लेंस से धूल हटाना"]
      },
      icon: Camera
    },
    {
      title: { en: "Software Flash & OS Boot", hi: "सॉफ्टवेयर फ्लैश और ओएस बूट" },
      desc: { en: "Bypass boot loops, logo stuck, pattern lock, FRP Google lock bypass.", hi: "बूट लूप, लोगो पर अटकना, पैटर्न लॉक, एफआरपी गूगल लॉक बाईपास।" },
      fee: { en: "₹299 onwards", hi: "₹299 से शुरू" },
      time: { en: "1 - 2 Hours", hi: "1 - 2 घंटे" },
      bullets: {
        en: ["Official stock firmware flash", "Safe and secure data handling", "Latest security patch installations"],
        hi: ["आधिकारिक स्टॉक फर्मवेयर फ्लैश", "सुरक्षित डेटा हैंडलिंग", "नवीनतम सुरक्षा पैच इंस्टॉलेशन"]
      },
      icon: Wrench
    },
    {
      title: { en: "Custom Back Skins & Glass", hi: "कस्टम बैक स्किन और पैनल" },
      desc: { en: "Precision machine cut designer skins and mobile back panel glass replacement.", hi: "सटीक मशीन कट डिजाइनर स्किन और मोबाइल बैक पैनल ग्लास रिप्लेसमेंट।" },
      fee: { en: "₹199 onwards", hi: "₹199 से शुरू" },
      time: { en: "15 - 30 Minutes", hi: "15 - 30 मिनट" },
      bullets: {
        en: ["3M quality scratch-proof skins", "Precision cutting for all brands", "Premium color match back glass"],
        hi: ["3M गुणवत्ता वाली स्क्रैच-प्रूफ स्किन", "सभी ब्रांडों के लिए सटीक कटिंग", "प्रीमियम रंग मिलान बैक ग्लास"]
      },
      icon: Shield
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white relative">
      {loading && <Loader fullPage />}
      <div className="text-center mb-12 flex flex-col items-center gap-2">
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
          {t("common:repair")}
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          {currentLang == "hi"
            ? "करमडांडा मोड़, अयोध्या में प्रोफेशनल चिप-लेवल रिपेयर, स्क्रीन रिप्लेसमेंट, और सॉफ्टवेयर फिक्स।"
            : "Professional chip-level repairs, screen replacements, and software fixes at Karamdanda Mod, Ayodhya."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.1fr] gap-10">
        {/* Left Column: Repair Service Offerings Showcase */}
        <div className="flex flex-col gap-6">
          <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            {currentLang === 'hi' ? 'सभी रिपेयर सेवाएं और अनुमानित दरें' : 'All Repair Services & Estimated Pricing'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {servicesList.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:shadow-md hover:border-blue-200/80 gap-3 relative group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl flex justify-center items-center">
                      <IconComponent size={20} className="text-blue-600" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wide">
                        {item.fee[currentLang]}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {currentLang === 'hi' ? 'समय: ' : 'Time: '}{item.time[currentLang]}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-bold text-slate-800">
                      {item.title[currentLang]}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.desc[currentLang]}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-1.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {currentLang === 'hi' ? 'सेवा हाइलाइट्स:' : 'Service Highlights:'}
                    </p>
                    <ul className="list-none p-0 m-0 flex flex-col gap-1">
                      {item.bullets[currentLang].map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs text-slate-700 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Booking Form, WhatsApp CTA & FAQs */}
        <div className="flex flex-col gap-6 w-full">
          {/* WhatsApp CTA Button */}
          <div className="p-6 bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-r-2xl flex flex-col gap-3 shadow-sm">
            <h4 className="font-heading font-bold text-sm text-emerald-600">
              {currentLang == "hi"
                ? "तुरंत मरम्मत मूल्य निर्धारण चाहिए?"
                : "Need Instant Repair Quote?"}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {currentLang == "hi"
                ? "मूल्य निर्धारण या नैदानिक प्रश्नों पर चर्चा करने के लिए सीधे नितेश कम्युनिकेशंस टीम से व्हाट्सएप पर चैट करें।"
                : "Chat directly with Nitesh Communications Team on WhatsApp to discuss pricing or diagnostic questions."}
            </p>
            <div>
              <a
                href="https://wa.me/919125949456?text=Hello%20Nitesh%20Communications,%20I%20have%20a%20repair%20query."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm inline-block cursor-pointer transition-colors border-0"
              >
                {currentLang == "hi"
                  ? "व्हाट्सएप पर चैट करें"
                  : "Chat on WhatsApp"}
              </a>
            </div>
          </div>

          {/* Booking Form Card */}
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="font-heading text-base font-bold text-slate-800 mb-2">
              {t("repair:book_repair")}
            </h3>
            <form onSubmit={handleRepairSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                    {currentLang == "hi" ? "पूरा नाम" : "Full Name"} *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                    {currentLang == "hi" ? "संपर्क नंबर" : "Phone Number"} *
                  </label>
                  <input
                    type="tel"
                    maxLength="10"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                    {t("repair:device_brand")} *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    placeholder={t("repair:placeholder_brand")}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                    {currentLang == "hi" ? "डिवाइस मॉडल" : "Device Model *"}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    placeholder="e.g. Note 12 Pro, Galaxy S21"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                  {t("repair:device_category")} *
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Hardware repair">
                    {currentLang == "hi"
                      ? "हार्डवेयर मरम्मत"
                      : "Hardware Repair"}
                  </option>
                  <option value="Display repair">
                    {t("repair:cat_display")}
                  </option>
                  <option value="Battery replacement">
                    {t("repair:cat_battery")}
                  </option>
                  <option value="Software issue">
                    {t("repair:cat_software")}
                  </option>
                  <option value="Other">
                    {currentLang == "hi" ? "अन्य समस्याएं" : "Other Issues"}
                  </option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                  {t("repair:problem_desc")} *
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  rows="3"
                  placeholder={t("repair:placeholder_desc")}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    {t("repair:pickup_address")} *
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={geolocating}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-semibold disabled:text-slate-400 transition-colors"
                  >
                    <MapPin
                      size={14}
                      className={geolocating ? "animate-bounce" : ""}
                    />
                    {geolocating
                      ? "खोज रहे हैं... / Locating..."
                      : "वर्तमान लोकेशन / Use Location"}
                  </button>
                </div>
                <textarea
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  rows="2"
                  placeholder={t("repair:placeholder_address")}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                {coordinates && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-inner h-32 w-full relative">
                    <iframe
                      title="Location Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`}
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>{loading ? t("common:submitting", "Submitting...") : t("repair:btn_book")}</span>
              </button>
            </form>
          </div>

          {/* FAQs Card */}
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="font-heading text-base font-bold text-blue-600 mb-2">
              {t("repair:faq_title")}
            </h3>
            <div className={`flex flex-col gap-3`}>
              {(currentLang === "hi"
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
                  ]
              ).map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 cursor-pointer bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors"
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-bold text-xs sm:text-sm">
                      {faq.q}
                    </span>

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
        </div>
      </div>
      <QuickLinksBanner currentType="repair" />
    </div>
  );
};

export default RepairService;

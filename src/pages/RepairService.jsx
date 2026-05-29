import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import { Wrench, MapPin } from "lucide-react";

const RepairService = () => {
  const { t } = useTranslation(["repair", "common", "notifications"]);

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
      const response = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          deviceBrand: brand,
          deviceModel: model,
          problemDescription: problem,
          serviceCategory: category,
          pickupAddress: address,
          coordinates,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast.success(
          t("notifications:repair_submitted") +
            " ID: " +
            (data.repairRequest?.requestId || ""),
        );
        setName("");
        setPhone("");
        setBrand("");
        setModel("");
        setProblem("");
        setAddress("");
        setCoordinates(null);
      } else {
        showToast.error(data.message || t("notifications:server_error"));
      }
    } catch (err) {
      showToast.error(t("notifications:server_error"));
    } finally {
      setLoading(false);
    }
  };
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const pricingEstimates = [
    { cat: t("repair:cat_software"), price: "₹299", time: "1-2 hours" },
    { cat: t("repair:cat_charging"), price: "₹349", time: "2-3 hours" },
    { cat: t("repair:cat_battery"), price: "₹799", time: "1 hour" },
    { cat: t("repair:cat_display"), price: "₹1499", time: "1-2 hours" },
    { cat: t("repair:cat_folder"), price: "₹199", time: "30 mins" },
  ];

  if (loading) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white">
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

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10">
        {/* Left Column: Form & Info */}
        <div className="flex flex-col">
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer text-sm"
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
                className="w-full py-3.5 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0"
              >
                {t("repair:btn_book")}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Pricing Estimates & FAQ */}
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
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm inline-block"
              >
                {currentLang == "hi"
                  ? "व्हाट्सएप पर चैट करें"
                  : "Chat on WhatsApp"}
              </a>
            </div>
          </div>

          {/* Pricing list */}
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="font-heading text-base font-bold text-blue-600 mb-2">
              {t("repair:estimated_pricing")}
            </h3>
            <div className="flex flex-col gap-4">
              {pricingEstimates.map((est, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-b-0"
                >
                  <div>
                    <p className="font-heading text-sm font-semibold text-slate-800">
                      {est.cat}
                    </p>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {currentLang == "hi" ? "अनुमानित समय" : "Est. Time"}:{" "}
                      {est.time}
                    </span>
                  </div>
                  <span className="text-sm text-blue-600 font-bold">
                    {est.price} {currentLang == "hi" ? "से शुरू" : "onwards"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
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
    </div>
  );
};

export default RepairService;

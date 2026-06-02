import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import {
  Wrench,
  MapPin,
  Smartphone,
  Battery,
  Zap,
  Cpu,
  Camera,
  Volume2,
  Shield,
  ArrowLeft,
  CheckCircle,
  FileText,
  User,
  Phone,
  X,
} from "lucide-react";
import QuickLinksBanner from "../components/common/QuickLinksBanner";

const RepairService = () => {
  const { t, i18n } = useTranslation(["repair", "common", "notifications"]);
  const { user } = useAuth();
  const currentLang = i18n.language || "hi";
  const location = useLocation();

  // SEO & Head Metadata
  useEffect(() => {
    document.title =
      currentLang === "hi"
        ? "मोबाइल रिपेयरिंग सेवाएं | Nitesh Communications"
        : "Mobile Repair Services | Nitesh Communications";

    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      currentLang === "hi"
        ? "अयोध्या में विशेषज्ञ मोबाइल स्क्रीन रिप्लेसमेंट, बैटरी रिप्लेसमेंट, सॉफ्टवेयर फ्लैशिंग और ग्लास रिपेयर सेवाएं।"
        : "Expert screen replacement, battery replacement, software flashing, and glass repair services in Ayodhya.",
    );
  }, [currentLang]);

  // Dynamic Repair Pricing Data
  const [repairPricingData, setRepairPricingData] = useState(null);

  // Interactive Selection Wizard State
  const [selectedServiceKey, setSelectedServiceKey] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [confirmBookFromHome, setConfirmBookFromHome] = useState(false);

  // Fetch repair pricing data from backend on mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await api.get("/repairs/pricing-data");
        setRepairPricingData(response.data);
      } catch (err) {
        console.error("Error loading repair pricing data:", err);
        showToast.error("Failed to load repair services. Please try again.");
      }
    };
    fetchPricing();
  }, []);

  // Booking Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [faqOpen, setFaqOpen] = useState([false, false, false]);

  const [paymentType, setPaymentType] = useState("COD");
  const [distance, setDistance] = useState(null);
  const [outOfRange, setOutOfRange] = useState(false);

  const SHOP_LAT = 26.671782;
  const SHOP_LON = 82.008832;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Number(d.toFixed(2));
  };

  useEffect(() => {
    if (coordinates && coordinates.latitude) {
      const dist = calculateDistance(
        SHOP_LAT,
        SHOP_LON,
        coordinates.latitude,
        coordinates.longitude,
      );
      setDistance(dist);
      setOutOfRange(dist > 15);
    } else {
      setDistance(null);
      setOutOfRange(false);
    }
  }, [coordinates]);

  // Enforce payment method limits based on price
  useEffect(() => {
    if (
      repairPricingData &&
      selectedServiceKey &&
      selectedBrand &&
      selectedModel
    ) {
      const price =
        repairPricingData[selectedServiceKey].brands[selectedBrand][
          selectedModel
        ];
      if (price > 5000) {
        setPaymentType("Online");
      }
    }
  }, [selectedServiceKey, selectedBrand, selectedModel, repairPricingData]);

  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (selectedServiceKey) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedServiceKey]);

  // Autofill details once logged-in user is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.mobile || user.phone || "");
      if (user.address) {
        setAddress(user.address);
      }
      if (user.coordinates) {
        setCoordinates(user.coordinates);
      }
    }
  }, [user]);

  const toggleFaq = (index) => {
    setFaqOpen((prev) =>
      prev.map((item, idx) => (idx === index ? !item : item)),
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast.error(
        currentLang === "hi"
          ? "आपका ब्राउज़र लोकेशन का समर्थन नहीं करता है"
          : "Your browser does not support geolocation",
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
              currentLang === "hi"
                ? "लोकेशन सफलतापूर्वक प्राप्त की गई"
                : "Location retrieved successfully",
            );
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          console.error(err);
          setAddress(`${latitude}, ${longitude}`);
          showToast.warning(
            currentLang === "hi"
              ? "लोकेशन मिल गई, पर पता खोजने में समस्या हुई"
              : "Location retrieved, but failed to fetch address name",
          );
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        console.error(error);
        setGeolocating(false);
        showToast.error(
          currentLang === "hi"
            ? "लोकेशन अनुमति अस्वीकृत या उपलब्ध नहीं है"
            : "Location permission denied or unavailable",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !address.trim()) {
      showToast.error(t("notifications:fill_all_fields"));
      return;
    }

    if (outOfRange) {
      showToast.error(
        currentLang === "hi"
          ? "क्षमा करें, आपका पता हमारी 15 किमी होम पिकअप सेवा सीमा से बाहर है।"
          : "Sorry, your address is out of our 15km home pickup service range.",
      );
      return;
    }

    const serviceData = repairPricingData[selectedServiceKey];
    const price = serviceData.brands[selectedBrand][selectedModel];

    setLoading(true);

    try {
      const response = await api.post("/repairs", {
        customerName: name,
        customerPhone: phone,
        deviceBrand: selectedBrand,
        deviceModel: selectedModel,
        problemDescription: serviceData.title.en,
        serviceCategory: serviceData.category,
        pickupAddress: address,
        estimatedPrice: price,
        coordinates,
        paymentMethod: paymentType,
      });

      const data = response.data;

      if (paymentType === "COD") {
        setBookingSuccess({
          id:
            data.repair?._id ||
            data.repair?.requestId ||
            data.repairRequest?.requestId ||
            "NC-REP-SUCCESS",
          brand: selectedBrand,
          model: selectedModel,
          price,
          service: serviceData.title[currentLang],
          paymentMethod: paymentType,
        });

        showToast.success(
          currentLang === "hi"
            ? "रिपेयर सफलतापूर्वक बुक किया गया!"
            : "Repair booked successfully!",
        );

        // Reset form options
        setName(user?.name || "");
        setPhone(user?.mobile || user?.phone || "");
        setAddress(user?.address || "");
        setCoordinates(user?.coordinates || null);
        setPaymentType("COD");
      } else {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          showToast.error("Razorpay SDK failed to load. Are you offline?");
          setLoading(false);
          return;
        }

        const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy_key_id";

        const options = {
          key: rzpKey,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: "NITESH COMMUNICATIONS",
          description:
            "Payment for Repair Booking - " +
            selectedBrand +
            " " +
            selectedModel,
          order_id: data.razorpayOrder.id,
          prefill: {
            name: name,
            contact: phone,
            email: user?.email || "",
          },
          theme: {
            color: "#2563eb",
          },
          handler: async (rzpResponse) => {
            setLoading(true);
            try {
              const verifyResponse = await api.post("/repairs/verify", {
                repairId: data.repair._id,
                razorpayPaymentId: rzpResponse.razorpay_payment_id,
                razorpayOrderId: rzpResponse.razorpay_order_id,
                razorpaySignature: rzpResponse.razorpay_signature,
              });

              setBookingSuccess({
                id:
                  verifyResponse.data.repair?._id ||
                  data.repair?._id ||
                  "NC-REP-SUCCESS",
                brand: selectedBrand,
                model: selectedModel,
                price,
                service: serviceData.title[currentLang],
                paymentMethod: paymentType,
              });

              showToast.success(
                currentLang === "hi"
                  ? "रिपेयर सफलतापूर्वक बुक किया गया!"
                  : "Repair booked successfully!",
              );

              // Reset form options
              setName(user?.name || "");
              setPhone(user?.mobile || user?.phone || "");
              setAddress(user?.address || "");
              setCoordinates(user?.coordinates || null);
              setPaymentType("COD");
            } catch (verifyErr) {
              const verifyErrorMessage =
                verifyErr.response?.data?.message ||
                "Signature verification failed";
              showToast.error(verifyErrorMessage);
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              showToast.warning("Payment window closed. Booking is pending.");
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || t("notifications:server_error");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetWizard = () => {
    setSelectedServiceKey(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setConfirmBookFromHome(false);
    setBookingSuccess(null);
    setPaymentType("COD");
    setDistance(null);
    setOutOfRange(false);
  };

  if (!repairPricingData) {
    return <Loader fullPage />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white relative">
      {loading && <Loader fullPage />}

      {/* Header Banner Section */}
      <div className="text-center mb-12 flex flex-col items-center gap-2">
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
          {currentLang === "hi"
            ? "स्मार्टफोन रिपेयरिंग सेंटर"
            : "Smartphone Repairing Centre"}
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          {currentLang === "hi"
            ? "स्क्रीन, बैटरी रिप्लेसमेंट, सॉफ्टवेयर फ़िक्स और चिप-लेवल मदरबोर्ड रिपेयर के लिए अयोध्या का सबसे भरोसेमंद केंद्र।"
            : "Ayodhya's most trusted shop for screens, battery replacements, software fixes, and chip-level motherboard repairs."}
        </p>
      </div>

      {/* Restructured Main Flow */}
      <div className="max-w-4xl mx-auto">
        {/* Step 1: Select Repair Category / Service */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
          <h3 className="font-heading text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
              1
            </span>
            {currentLang === "hi"
              ? "मरम्मत सेवा चुनें"
              : "Select Repair Service"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(repairPricingData).map(([key, item]) => {
              const isSelected = selectedServiceKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedServiceKey(key);
                    setSelectedBrand(null);
                    setSelectedModel(null);
                    setConfirmBookFromHome(false);
                  }}
                  className={`p-5 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer outline-none ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 shadow-sm"
                      : "border-slate-200/80 bg-white hover:border-blue-200 hover:bg-slate-50/30"
                  }`}
                >
                  <div>
                    <h4 className="font-heading text-sm font-bold text-slate-800 leading-tight">
                      {item.title[currentLang]}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {item.desc[currentLang]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Popup Overlay for interactive steps */}
      {selectedServiceKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                {/* Back button within modal */}
                {selectedBrand && !bookingSuccess && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirmBookFromHome === "no" ||
                        confirmBookFromHome === true
                      ) {
                        setConfirmBookFromHome(false);
                      } else if (selectedModel) {
                        setSelectedModel(null);
                      } else {
                        setSelectedBrand(null);
                      }
                    }}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <div>
                  <h3 className="font-heading text-base font-extrabold text-slate-800">
                    {repairPricingData[selectedServiceKey].title[currentLang]}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 max-w-md hidden sm:block">
                    {repairPricingData[selectedServiceKey].desc[currentLang]}
                  </p>
                </div>
              </div>

              {/* Close (X) button */}
              <button
                type="button"
                onClick={handleResetWizard}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            {bookingSuccess ? (
              /* BOOKING SUCCESS SCREEN */
              <div className="text-center flex flex-col items-center gap-5 py-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle size={32} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading text-xl font-extrabold text-slate-800">
                    {currentLang === "hi"
                      ? "बुकिंग की पुष्टि हो गई!"
                      : "Repair Booking Confirmed!"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Request ID: {bookingSuccess.id}
                  </p>
                  <p className="text-xs text-slate-500 max-w-md leading-relaxed mt-1">
                    {currentLang === "hi"
                      ? `हमने ${bookingSuccess.brand} ${bookingSuccess.model} के लिए ${bookingSuccess.service} का अनुरोध दर्ज कर लिया है।`
                      : `We have registered your request for ${bookingSuccess.service} on your ${bookingSuccess.brand} ${bookingSuccess.model}.`}
                  </p>
                </div>

                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left flex flex-col gap-2 max-w-sm">
                  <div className="flex justify-between text-xs text-slate-500 font-semibold">
                    <span>
                      {currentLang === "hi"
                        ? "अनुमानित लागत"
                        : "Estimated Cost"}
                    </span>
                    <span className="text-slate-900 font-bold">
                      ₹{bookingSuccess.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-semibold border-t border-slate-200/60 pt-2">
                    <span>
                      {currentLang === "hi"
                        ? "भुगतान प्रकार"
                        : "Payment Method"}
                    </span>
                    <span className="text-slate-900 font-bold">
                      {bookingSuccess.paymentMethod === "Online"
                        ? currentLang === "hi"
                          ? "ऑनलाइन भुगतान"
                          : "Online Payment"
                        : currentLang === "hi"
                          ? "कैश ऑन डिलीवरी"
                          : "Cash on Delivery"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-semibold border-t border-slate-200/60 pt-2">
                    <span>
                      {currentLang === "hi" ? "पिकअप चार्ज" : "Pickup Charge"}
                    </span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                </div>

                <button
                  onClick={handleResetWizard}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-xs rounded-xl shadow-md cursor-pointer border-0 mt-2 transition-all"
                >
                  {currentLang === "hi"
                    ? "पूर्ण (Done)"
                    : "Close & Book Another"}
                </button>
              </div>
            ) : !selectedBrand ? (
              /* STEP 2: Select Brand */
              <div className="flex flex-col gap-4 animate-fadeIn">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
                  {currentLang === "hi"
                    ? "ब्रांड चुनें"
                    : "Select Device Brand"}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(
                    repairPricingData[selectedServiceKey].brands,
                  ).map(([brandName, modelsMap]) => {
                    const prices = Object.values(modelsMap);
                    const minPrice =
                      prices.length > 0 ? Math.min(...prices) : 0;
                    return (
                      <button
                        key={brandName}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(brandName);
                          setSelectedModel(null);
                        }}
                        className="p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-2xl text-left flex flex-col gap-1 cursor-pointer transition-all outline-none"
                      >
                        <span className="font-heading font-bold text-xs text-slate-800">
                          {brandName}
                        </span>
                        <span className="text-[10px] text-blue-600 font-semibold">
                          {currentLang === "hi"
                            ? `₹${minPrice} से शुरू`
                            : `Starts ₹${minPrice}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : !selectedModel ? (
              /* STEP 3: Select Model & View Pricing */
              <div className="flex flex-col gap-4 animate-fadeIn">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
                  {selectedBrand} -{" "}
                  {currentLang === "hi" ? "मॉडल चुनें" : "Select Model"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[35vh] overflow-y-auto pr-1">
                  {Object.entries(
                    repairPricingData[selectedServiceKey].brands[selectedBrand],
                  ).map(([modelName, price]) => {
                    return (
                      <button
                        key={modelName}
                        type="button"
                        onClick={() => {
                          setSelectedModel(modelName);
                        }}
                        className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl flex justify-between items-center text-left cursor-pointer transition-all outline-none"
                      >
                        <span className="font-heading font-bold text-xs text-slate-800">
                          {modelName}
                        </span>
                        <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100/50">
                          ₹{price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : !confirmBookFromHome ? (
              /* STEP 4: Home pickup choice */
              <div className="flex flex-col items-center gap-4 text-center py-4 animate-fadeIn">
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex flex-col gap-2 w-full text-left">
                  <h4 className="font-heading text-xs font-bold text-slate-800">
                    {currentLang === "hi"
                      ? "चयनित मरम्मत सारांश"
                      : "Selected Repair Summary"}
                  </h4>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs font-semibold text-slate-500 mt-1">
                    <span>
                      {currentLang === "hi" ? "सेवा श्रेणी" : "Service Type"}
                    </span>
                    <span className="text-slate-800 text-right">
                      {repairPricingData[selectedServiceKey].title[currentLang]}
                    </span>
                    <span>
                      {currentLang === "hi" ? "उपकरण मॉडल" : "Device Model"}
                    </span>
                    <span className="text-slate-800 text-right">
                      {selectedBrand} {selectedModel}
                    </span>
                    <span className="border-t border-slate-200 pt-1.5 font-bold text-blue-600">
                      {currentLang === "hi"
                        ? "अनुमानित राशि"
                        : "Estimated Price"}
                    </span>
                    <span className="text-right border-t border-slate-200 pt-1.5 font-bold text-blue-600 text-sm">
                      ₹
                      {
                        repairPricingData[selectedServiceKey].brands[
                          selectedBrand
                        ][selectedModel]
                      }
                    </span>
                  </div>
                </div>

                <div className="py-2">
                  <h4 className="font-heading text-sm sm:text-base font-extrabold text-slate-800">
                    {currentLang === "hi"
                      ? "क्या आप घर बैठे मोबाइल रिपेयरिंग बुक करना चाहते हैं?"
                      : "Would you like to book a repair from home?"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed mt-2 mx-auto">
                    {currentLang === "hi"
                      ? "हम मुफ़्त होम पिकअप और ड्रॉप सुविधा प्रदान करते हैं। हमारे प्रतिनिधि आपके पते पर आकर फोन प्राप्त करेंगे।"
                      : "We offer free home pickups and drops. Our support agent will come to your address to collect your phone."}
                  </p>
                </div>

                {outOfRange && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs text-left max-w-md mx-auto mb-2 flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1">
                      ⚠️{" "}
                      {currentLang === "hi"
                        ? "होम पिकअप अनुपलब्ध"
                        : "Home Pickup Unavailable"}
                    </span>
                    <span>
                      {currentLang === "hi"
                        ? `आपकी लोकेशन दुकान से ${distance} किमी दूर है, जो हमारी 15 किमी की सीमा से बाहर है। कृपया दुकान पर आने का विकल्प चुनें।`
                        : `Your location is ${distance} km away, which exceeds our 15km home pickup service boundary. Please select the shop visit option.`}
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmBookFromHome(true)}
                    disabled={outOfRange}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-xs rounded-xl shadow-md border-0 cursor-pointer transition-all flex-1 max-w-[200px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {currentLang === "hi"
                      ? "हाँ, होम पिकअप बुक करें"
                      : "Yes, Book Free Pickup"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmBookFromHome("no")}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-all flex-1 max-w-[200px]"
                  >
                    {currentLang === "hi"
                      ? "नहीं, मैं दुकान पर आऊंगा"
                      : "No, I'll Visit Shop"}
                  </button>
                </div>
              </div>
            ) : confirmBookFromHome === "no" ? (
              /* SHOP VISIT INFO CARD */
              <div className="flex flex-col items-center gap-4 text-center py-4 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h4 className="font-heading text-sm sm:text-base font-extrabold text-slate-800">
                    {currentLang === "hi"
                      ? "हमारी दुकान पर आपका स्वागत है!"
                      : "Welcome to Our Shop!"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md leading-relaxed mt-2 mx-auto">
                    {currentLang === "hi"
                      ? "आप नीचे दिए गए पते पर आकर तत्काल रिपेयर प्राप्त कर सकते हैं। अधिकतर स्क्रीन और बैटरी रिप्लेसमेंट 1-2 घंटे में हो जाते हैं।"
                      : "You can visit our store directly for instant repairs. Most screen & battery replacements are completed in 1-2 hours."}
                  </p>
                </div>

                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left flex flex-col gap-3 text-xs font-semibold text-slate-600 mt-2">
                  <div className="flex justify-between">
                    <span>
                      {currentLang === "hi" ? "दुकान का पता" : "Shop Address"}
                    </span>
                    <span className="text-slate-800 text-right">
                      Nitesh Communications, Karamdanda Mod, Patkhauli Chauraha,
                      Ayodhya
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-2.5">
                    <span>
                      {currentLang === "hi" ? "कार्य समय" : "Working Hours"}
                    </span>
                    <span className="text-slate-800 text-right">
                      9:00 AM - 8:00 PM (Mon-Sat)
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-2.5">
                    <span>
                      {currentLang === "hi" ? "फ़ोन संपर्क" : "Contact Phone"}
                    </span>
                    <span className="text-blue-600 font-bold text-right">
                      +91 9125949456
                    </span>
                  </div>
                </div>

                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-inner h-32 w-full relative">
                  <iframe
                    title="Shop Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1651.7408662594805!2d82.01162535484514!3d26.671605216106993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a11003ad51177%3A0xe8ae78ae027dc07!2sNitesh%20Communications!5e0!3m2!1sen!2sin!4v1780307010471!5m2!1sen!2sin"
                    allowFullScreen
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmBookFromHome(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-xs rounded-xl shadow-md border-0 cursor-pointer transition-all mt-2"
                >
                  {currentLang === "hi"
                    ? "होम पिकअप बुक करें"
                    : "Book Pickup from Home instead"}
                </button>
              </div>
            ) : (
              /* DETAILED BOOKING FORM WITH AUTOFILL & MAP */
              <div className="flex flex-col gap-4 animate-fadeIn">
                {!user ? (
                  /* LOGIN GATE */
                  <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl text-center flex flex-col items-center gap-4 max-w-md mx-auto w-full">
                    <Wrench size={28} className="text-blue-600 animate-pulse" />
                    <h4 className="font-heading font-bold text-sm text-slate-800">
                      {currentLang === "hi"
                        ? "लॉगिन की आवश्यकता है"
                        : "Login Required"}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {currentLang === "hi"
                        ? "रिपेयर बुकिंग करने और अपने ऑर्डर ट्रैक करने के लिए कृपया पहले लॉगिन करें।"
                        : "Please login to confirm your repair booking and track its status."}
                    </p>
                    <Link
                      to="/login"
                      state={{ from: location }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-xs rounded-xl shadow-md cursor-pointer border-0 block text-center decoration-none"
                    >
                      {currentLang === "hi"
                        ? "लॉगिन करें"
                        : "Login to Continue"}
                    </Link>
                  </div>
                ) : (
                  /* BOOKING DETAILS FORM (AUTO-FILLED) */
                  <form
                    onSubmit={handleRepairSubmit}
                    className="flex flex-col gap-4 w-full"
                  >
                    <h4 className="font-heading text-xs font-bold uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2">
                      {currentLang === "hi"
                        ? "होम पिकअप और संपर्क विवरण"
                        : "Home Pickup & Contact Details"}
                    </h4>

                    <div className="flex flex-col">
                      <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                        {currentLang === "hi"
                          ? "ग्राहक का नाम"
                          : "Customer Name"}{" "}
                        *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <User size={14} />
                        </span>
                        <input
                          type="text"
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs font-medium"
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                        {currentLang === "hi" ? "संपर्क नंबर" : "Phone Number"}{" "}
                        *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Phone size={14} />
                        </span>
                        <input
                          type="tel"
                          maxLength="10"
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs font-medium"
                          placeholder="Enter 10-digit phone number"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, ""))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-slate-500">
                          {currentLang === "hi"
                            ? "पिकअप का पता"
                            : "Pickup Address"}{" "}
                          *
                        </label>
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={geolocating}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-bold disabled:text-slate-400 transition-colors"
                        >
                          <MapPin
                            size={12}
                            className={geolocating ? "animate-bounce" : ""}
                          />
                          {geolocating ? "Locating..." : "Use Location"}
                        </button>
                      </div>
                      <textarea
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs font-medium"
                        rows="2"
                        placeholder="Flat / Building / Area Details"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />

                      {coordinates ? (
                        outOfRange ? (
                          <div className="mt-2 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-[11px] leading-relaxed animate-fadeIn">
                            <strong>
                              ⚠️{" "}
                              {currentLang === "hi"
                                ? "दूरी सीमा से बाहर:"
                                : "Out of Pickup Range:"}
                            </strong>{" "}
                            {currentLang === "hi"
                              ? `आपका पता दुकान से ${distance} किमी दूर है, जो 15 किमी पिकअप सीमा से बाहर है। होम डिलीवरी संभव नहीं है।`
                              : `Your address is ${distance} km from our shop, which exceeds the 15km free pickup limit. Please visit our shop.`}
                          </div>
                        ) : (
                          <div className="mt-2 bg-emerald-50 border border-emerald-250 text-emerald-850 p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 animate-fadeIn">
                            <span>✓</span>
                            <span>
                              {currentLang === "hi"
                                ? `लोकेशन सत्यापित: दुकान से दूरी ${distance} किमी (15 किमी सीमा के भीतर)।`
                                : `Location Verified: ${distance} km from shop (within 15km pickup limit).`}
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-850 p-2.5 rounded-xl text-[11px] leading-relaxed">
                          {currentLang === "hi"
                            ? "📍 दूरी सीमा (15 किमी) की जांच करने के लिए कृपया 'Use Location' का उपयोग करें।"
                            : "📍 Please use 'Use Location' to verify your distance is within the 15km boundary."}
                        </div>
                      )}

                      {coordinates && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-inner h-28 w-full relative">
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

                    {/* Payment Method Selection */}
                    <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl mt-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {currentLang === "hi"
                          ? "भुगतान का विकल्प चुनें"
                          : "Select Payment Method"}{" "}
                        *
                      </label>

                      <div className="flex flex-col gap-2.5 mt-1">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="radio"
                            name="repairPaymentType"
                            value="COD"
                            checked={paymentType === "COD"}
                            onChange={() => setPaymentType("COD")}
                            disabled={
                              repairPricingData[selectedServiceKey].brands[
                                selectedBrand
                              ][selectedModel] > 5000
                            }
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span>
                            {currentLang === "hi"
                              ? "कैश ऑन डिलीवरी (COD)"
                              : "Cash on Delivery (COD)"}
                          </span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="radio"
                            name="repairPaymentType"
                            value="Online"
                            checked={paymentType === "Online"}
                            onChange={() => setPaymentType("Online")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span>
                            {currentLang === "hi"
                              ? "ऑनलाइन भुगतान"
                              : "Online Payment"}
                          </span>
                        </label>
                      </div>

                      {repairPricingData[selectedServiceKey].brands[
                        selectedBrand
                      ][selectedModel] > 5000 && (
                        <p className="text-[10px] text-amber-600 font-semibold mt-1">
                          {currentLang === "hi"
                            ? "₹5,000 से अधिक की लागत होने के कारण केवल ऑनलाइन भुगतान का विकल्प उपलब्ध है।"
                            : "For estimated costs exceeding ₹5,000, only Online Payment is available."}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || outOfRange || !coordinates}
                      className="w-full py-3 mt-2 font-heading font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md border-0 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? currentLang === "hi"
                          ? "बुकिंग दर्ज हो रही है..."
                          : "Processing Booking..."
                        : !coordinates
                          ? currentLang === "hi"
                            ? "पहले स्थान सत्यापित करें"
                            : "Verify Location First"
                          : outOfRange
                            ? currentLang === "hi"
                              ? "दूरी सीमा से बाहर (पिकअप अवरुद्ध)"
                              : "Out of Range (Pickup Blocked)"
                            : `${currentLang === "hi" ? "बुक रिपेयर" : "Confirm Booking"} (₹${repairPricingData[selectedServiceKey].brands[selectedBrand][selectedModel]})`}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQs Section (Full-Width Footer Area) */}
      <div className="max-w-4xl mx-auto mt-16 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="font-heading text-base font-bold text-blue-600 mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText size={18} /> {t("repair:faq_title")}
        </h3>
        <div className="flex flex-col gap-3">
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

      <QuickLinksBanner currentType="repair" />
    </div>
  );
};

export default RepairService;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { CreditCard, Truck, MapPin } from "lucide-react";

const Checkout = () => {
  const { t, i18n } = useTranslation(["cart", "common", "notifications"]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentType, setPaymentType] = useState("COD");
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [distance, setDistance] = useState(null);
  const [outOfRange, setOutOfRange] = useState(false);
  const [addressDetails, setAddressDetails] = useState("");

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
    if (coordinates) {
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

  useEffect(() => {
    if (cartSubtotal > 5000) {
      setPaymentType("Online");
    }
  }, [cartSubtotal]);

  const checkDeliveryHours = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 9 && currentHour < 18;
  };
  const isWithinDeliveryHours = checkDeliveryHours();

  useEffect(() => {
    if (user) {
      setAddress(user.address || "");
      setPhone(user.mobile || "");
      if (
        user.coordinates &&
        user.coordinates.latitude &&
        user.coordinates.longitude
      ) {
        setCoordinates({
          latitude: user.coordinates.latitude,
          longitude: user.coordinates.longitude,
        });
      }
    }
  }, [user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
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
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          let formattedAddress = "";

          if (apiKey) {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=${currentLang}`,
            );
            const data = await response.json();
            if (data && data.results && data.results.length > 0) {
              formattedAddress = data.results[0].formatted_address;
            }
          }

          if (!formattedAddress) {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            );
            const data = await response.json();
            if (data && data.display_name) {
              formattedAddress = data.display_name;
            }
          }

          if (formattedAddress) {
            setAddress(formattedAddress);
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
              ? "लोकेशन तो मिल गई, पर पता खोजने में समस्या हुई"
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
          "लोकेशन अनुमति अस्वीकृत या उपलब्ध नहीं है / Location permission denied or unavailable",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      showToast.error(t("notifications:fill_all_fields"));
      return;
    }

    if (!coordinates) {
      showToast.error(
        currentLang === "hi"
          ? "कृपया ऑर्डर पूरा करने के लिए पहले 'वर्तमान लोकेशन' पर क्लिक करके अपना स्थान सत्यापित करें।"
          : "Please verify your location by clicking 'Use Location' to confirm your delivery range before placing order.",
      );
      return;
    }

    if (!addressDetails.trim()) {
      showToast.error(
        currentLang === "hi"
          ? "कृपया डिलीवरी के लिए अपना फ्लैट, मकान नंबर, बिल्डिंग या पास का लैंडमार्क दर्ज करें।"
          : "Please enter your flat, house number, building, or landmark details for delivery.",
      );
      return;
    }

    if (outOfRange) {
      showToast.error(
        currentLang === "hi"
          ? "क्षमा करें, आपका पता हमारी 15 किमी डिलीवरी सीमा से बाहर है।"
          : "Sorry, your address is out of our 15km delivery range.",
      );
      return;
    }

    if (cartSubtotal > 5000 && paymentType === "COD") {
      showToast.error(
        currentLang === "hi"
          ? "₹5,000 से अधिक के ऑर्डर के लिए कैश ऑन डिलीवरी उपलब्ध नहीं है।"
          : "Cash on Delivery is not available for orders above ₹5,000.",
      );
      return;
    }

    setLoading(true);

    try {
      const finalAddress = `${addressDetails.trim()}, ${address}`;
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        paymentType,
        customerAddress: finalAddress,
        customerPhone: phone,
        coordinates,
      };

      const response = await api.post("/orders", orderPayload);
      const data = response.data;

      if (paymentType === "COD") {
        clearCart();
        showToast.success(t("notifications:payment_success"));
        setLoading(false);
        navigate(`/order-tracking/${data.order._id}`);
      } else {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          showToast.error("Razorpay SDK failed to load. Are you offline?");
          setLoading(false);
          return;
        }

        const rzpKey = data.razorpayKeyId || "rzp_test_dummy_key_id";

        const options = {
          key: rzpKey,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: "NITESH COMMUNICATIONS",
          description: "Payment for order NC-" + data.order.orderId,
          order_id: data.razorpayOrder.id,
          prefill: {
            name: user.name,
            contact: phone,
            email: user.email || "",
          },
          theme: {
            color: "#2563eb",
          },
          handler: async (response) => {
            setLoading(true);
            try {
              await api.post("/orders/verify", {
                orderId: data.order._id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });

              clearCart();
              showToast.success(t("notifications:payment_success"));
              navigate(`/order-tracking/${data.order._id}`);
            } catch (err) {
              const verifyErrorMessage =
                err.response?.data?.message || "Signature verification failed";
              showToast.error(verifyErrorMessage);
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: async () => {
              setLoading(true);
              try {
                await api.delete(`/orders/pending/${data.order._id}`);
              } catch (err) {
                console.error("Error discarding pending order:", err);
              } finally {
                setLoading(false);
              }
              showToast.warning(
                currentLang === "hi"
                  ? "भुगतान रद्द कर दिया गया। आप फिर से प्रयास कर सकते हैं या COD चुन सकते हैं।"
                  : "Payment cancelled. You can try again or choose Cash on Delivery (COD).",
              );
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
        setLoading(false);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || t("notifications:server_error");
      showToast.error(errorMessage);
      setLoading(false);
    }
  };

  const currentLang = i18n.language || "hi";
  const tax = cartSubtotal * 0.0236;
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white relative">
      {loading && <Loader fullPage />}
      <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-6">
        Checkout
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-8">
        {/* Left Column: Form Details */}
        <form
          onSubmit={handlePlaceOrder}
          className="flex flex-col gap-6 w-full"
        >
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="font-heading text-base font-bold text-slate-800 mb-2">
              {t("cart:billing_details")}
            </h3>
            <div className="flex flex-col">
              <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                {currentLang == "hi" ? "मोबाइल नंबर " : "Phone Number"} *
              </label>
              <input
                type="tel"
                maxLength="10"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                placeholder="10 digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <div className="flex flex-col gap-4">
              {!coordinates ? (
                <div className="p-6 bg-blue-50/40 border border-blue-200 rounded-2xl text-center flex flex-col items-center gap-3.5 shadow-sm mt-2">
                  <div className="bg-blue-600/10 text-blue-600 p-3.5 rounded-full flex justify-center items-center">
                    <MapPin
                      size={28}
                      className={geolocating ? "animate-bounce" : ""}
                    />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-slate-800 text-sm md:text-base">
                      {currentLang === "hi"
                        ? "लोकेशन सत्यापन आवश्यक है"
                        : "Location Verification Required"}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                      {currentLang === "hi"
                        ? "डिलीवरी सीमा (15 किमी) की पुष्टि करने के लिए कृपया अपनी वर्तमान लोकेशन सत्यापित करें।"
                        : "To verify your delivery range (15km), please share your current location via GPS."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={geolocating}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer border-0 disabled:opacity-50"
                  >
                    {geolocating ? (
                      <>
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                        {currentLang === "hi"
                          ? "लोकेशन खोजी जा रही है..."
                          : "Locating..."}
                      </>
                    ) : (
                      <>
                        <MapPin size={14} />
                        {currentLang === "hi"
                          ? "लोकेशन सत्यापित करें"
                          : "Verify Location"}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Geolocated Address (Read-only) */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-500">
                        {currentLang === "hi"
                          ? "सत्यापित डिलीवरी स्थान (रीड-ओनली) *"
                          : "Verified Delivery Location (Read-Only) *"}
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
                          : "लोकेशन बदलें / Change Location"}
                      </button>
                    </div>
                    <textarea
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 placeholder-slate-400 outline-none cursor-not-allowed text-sm"
                      rows="2"
                      value={address}
                      readOnly
                      disabled
                      required
                    />
                  </div>

                  {/* Manual Landmark / House No (Editable) */}
                  <div className="flex flex-col">
                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                      {currentLang === "hi"
                        ? "फ्लैट / मकान नंबर, बिल्डिंग, लैंडमार्क (आवश्यक) *"
                        : "Flat, House No., Building, Landmark Details (Required) *"}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder={
                        currentLang === "hi"
                          ? "उदा. फ्लैट नंबर 402, शिव मंदिर के पास, करमडांडा..."
                          : "e.g. Flat 402, Near Shiv Temple, Patkhauli..."
                      }
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      required
                    />
                  </div>

                  {coordinates && (
                    <div className="mt-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner h-32 w-full relative">
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
              )}

              {/* Range and Time Alerts */}
              <div className="flex flex-col gap-2.5 mt-2">
                {/* Delivery Range status */}
                {coordinates &&
                  (outOfRange ? (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                      {currentLang === "hi"
                        ? `✖ डिलीवरी सीमा से बाहर! हम केवल अपनी दुकान (पटखौली चौराहा, अयोध्या) से 15 किमी के भीतर ही डिलीवरी करते हैं।`
                        : `✖ Out of Delivery Range! We only deliver within a 15km radius of our shop (Patkhauli Chauraha, Ayodhya).`}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
                      {currentLang === "hi"
                        ? `✔ डिलीवरी रेंज के भीतर! आपका स्थान दुकान से 15 किमी के भीतर है।`
                        : `✔ Within Delivery Range! Your location is within 15km from our shop.`}
                    </div>
                  ))}

                {/* Delivery Timing status */}
                {!isWithinDeliveryHours && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-semibold">
                    {currentLang === "hi"
                      ? "🚚 डिलीवरी शेड्यूल: हमारे डिलीवरी ऑपरेशंस का समय सुबह 9 बजे से शाम 6 बजे तक है। आपका ऑर्डर कल डिलीवर किया जाएगा।"
                      : "🚚 Delivery Schedule: Delivery hours are 9:00 AM - 6:00 PM. Since it is currently outside these hours, your order will be delivered tomorrow."}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="font-heading text-base font-bold text-slate-800 mb-2">
              {t("cart:select_payment")}
            </h3>

            {cartSubtotal > 5000 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {currentLang === "hi"
                  ? "⚠️ आपका सबटोटल ₹5,000 से अधिक है, इसलिए केवल ऑनलाइन भुगतान उपलब्ध है। कैश ऑन डिलीवरी (COD) उपलब्ध नहीं है।"
                  : "⚠️ Your subtotal exceeds ₹5,000, so only online payment is available. Cash on Delivery (COD) is disabled."}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* COD Option */}
              <div
                className={`flex items-start gap-4 border p-5 rounded-2xl transition-all ${
                  cartSubtotal > 5000
                    ? "border-slate-100 bg-slate-50 opacity-55 cursor-not-allowed"
                    : paymentType === "COD"
                      ? "border-blue-600 bg-blue-50/10 cursor-pointer"
                      : "border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                }`}
                onClick={() => {
                  if (cartSubtotal <= 5000) {
                    setPaymentType("COD");
                  } else {
                    showToast.warning(
                      currentLang === "hi"
                        ? "₹5,000 से अधिक के ऑर्डर के लिए कैश ऑन डिलीवरी उपलब्ध नहीं है।"
                        : "Cash on Delivery is not available for orders above ₹5,000.",
                    );
                  }
                }}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="COD"
                  checked={paymentType === "COD"}
                  disabled={cartSubtotal > 5000}
                  onChange={() => {}}
                  className="hidden"
                />
                <Truck
                  size={20}
                  className={`mt-0.5 ${paymentType === "COD" && cartSubtotal <= 5000 ? "text-blue-600" : "text-slate-400"}`}
                />
                <div className="flex flex-col gap-0.5 text-slate-800">
                  <p
                    className={`text-sm font-semibold ${cartSubtotal > 5000 ? "text-slate-400 line-through" : ""}`}
                  >
                    {t("cart:cod")}
                  </p>
                  <p className="text-xs text-slate-500">
                    Pay in cash at your doorstep when items arrive.
                  </p>
                  {cartSubtotal > 5000 && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">
                      {currentLang === "hi"
                        ? "⚠️ ₹5,000 से अधिक के ऑर्डर के लिए उपलब्ध नहीं है।"
                        : "⚠️ Not available for orders above ₹5,000."}
                    </p>
                  )}
                </div>
              </div>

              {/* Razorpay Option */}
              <div
                className={`flex items-start gap-4 border p-5 rounded-2xl cursor-pointer transition-colors ${
                  paymentType === "Online"
                    ? "border-blue-600 bg-blue-50/10"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
                onClick={() => setPaymentType("Online")}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="Online"
                  checked={paymentType === "Online"}
                  onChange={() => {}}
                  className="hidden"
                />
                <CreditCard
                  size={20}
                  className={`mt-0.5 ${paymentType === "Online" ? "text-blue-600" : "text-slate-400"}`}
                />
                <div className="flex flex-col gap-0.5 text-slate-800">
                  <p className="text-sm font-semibold">{t("cart:online")}</p>
                  <p className="text-xs text-slate-500">
                    Pay instantly via UPI, Credit/Debit cards, Net Banking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || outOfRange}
            className="w-full py-3.5 mt-2 font-heading font-bold text-base bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t("common:submitting", "Submitting...")
              : !isWithinDeliveryHours
                ? `${currentLang === "hi" ? "ऑर्डर दें (कल डिलीवरी)" : "Place Order (Delivery Tomorrow)"} (₹${cartSubtotal})`
                : `${t("cart:place_order")} (₹${cartSubtotal})`}
          </button>
        </form>

        {/* Right Column: Order Items Summary */}
        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm h-fit w-full">
          <h3 className="font-heading text-base font-bold text-blue-600 mb-5">
            {t("cart:items_summary")}
          </h3>
          <div className="flex flex-col gap-3">
            {cartItems.map((item) => (
              <div
                key={item.product._id}
                className="flex justify-between items-center text-xs text-slate-600"
              >
                <span className="max-w-[80%] truncate">
                  {item.product.name[currentLang]}{" "}
                  <strong className="text-slate-500 font-bold ml-1">
                    x{item.quantity}
                  </strong>
                </span>
                <span className="font-semibold text-slate-800">
                  ₹{item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-t border-slate-100 my-4" />

          <div className="flex justify-between items-center text-xs text-slate-600 mb-3">
            <span>{t("cart:subtotal")}</span>
            <span className="font-semibold text-slate-800">
              ₹{cartSubtotal}
            </span>
          </div>
          {/* <div className="flex justify-between items-center text-xs text-slate-600 mb-3">
            <span>{t("cart:taxes")}</span>
            <span className="text-emerald-600 font-bold">₹ {tax}</span>
          </div> */}
          <div className="flex justify-between items-center text-xs text-slate-600 mb-4">
            <span>{t("cart:delivery_charges")}</span>
            <span className="text-emerald-600 font-bold">{t("cart:free")}</span>
          </div>

          <hr className="border-t border-slate-100 my-4" />

          <div className="flex justify-between items-center text-sm font-bold text-slate-800">
            <span>{t("cart:total")}</span>
            <span className="text-lg text-blue-600">
              ₹{cartSubtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

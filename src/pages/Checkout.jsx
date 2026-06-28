import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { getCurrentPositionWithFallback, handleGeolocationError } from "../utils/geolocation";
import { getOnlineDiscount } from "../utils/discount";
import { getDeliveryCharge } from "../utils/delivery";

// Modular Components
import BillingForm from "../components/checkout/BillingForm";
import PaymentSelector from "../components/checkout/PaymentSelector";
import CheckoutSummary from "../components/checkout/CheckoutSummary";

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

const Checkout = () => {
  const { t, i18n } = useTranslation(["cart", "common", "notifications"]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();

  const [address, setAddress] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [initialAddressDetails, setInitialAddressDetails] = useState("");
  const [paymentType, setPaymentType] = useState("COD");
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [distance, setDistance] = useState(null);
  const [outOfRange, setOutOfRange] = useState(false);

  const formValuesRef = useRef({
    phone: "",
    addressDetails: "",
  });

  const currentLang = i18n.language || "en";

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
      const userPhone = user.mobile || "";
      setInitialPhone(userPhone);
      formValuesRef.current.phone = userPhone;

      const userAddresses = user.addresses || [];
      const defaultAddr = userAddresses.find((a) => a.isDefault) || userAddresses[0];

      if (defaultAddr) {
        setAddress(defaultAddr.address || "");
        setInitialAddressDetails(defaultAddr.landmark || "");
        formValuesRef.current.addressDetails = defaultAddr.landmark || "";
        if (defaultAddr.coordinates && defaultAddr.coordinates.latitude) {
          setCoordinates({
            latitude: defaultAddr.coordinates.latitude,
            longitude: defaultAddr.coordinates.longitude,
          });
        }
      } else if (user.address) {
        setAddress(user.address || "");
        if (user.coordinates && user.coordinates.latitude) {
          setCoordinates({
            latitude: user.coordinates.latitude,
            longitude: user.coordinates.longitude,
          });
        }
      }
    }
  }, [user]);

  const handleAddressSelect = useCallback((selectedAddr) => {
    if (selectedAddr) {
      setAddress(selectedAddr.address);
      setCoordinates(selectedAddr.coordinates);
      setInitialAddressDetails(selectedAddr.landmark || "");
      formValuesRef.current.addressDetails = selectedAddr.landmark || "";
    } else {
      setAddress("");
      setCoordinates(null);
      setInitialAddressDetails("");
      formValuesRef.current.addressDetails = "";
    }
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUseCurrentLocation = useCallback(async () => {
    setGeolocating(true);
    try {
      const position = await getCurrentPositionWithFallback();
      const { latitude, longitude } = position.coords;

      const dist = calculateDistance(SHOP_LAT, SHOP_LON, latitude, longitude);
      if (dist > 15) {
        showToast.error(
          currentLang === "hi"
            ? "क्षमा करें, आपका पता हमारी 15 किमी डिलीवरी सीमा से बाहर है।"
            : "Sorry, your address is out of our 15km delivery range."
        );
        setCoordinates(null);
        return;
      }

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
            t("auth:location_retrieved", "Location retrieved successfully")
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
      }
    } catch (error) {
      handleGeolocationError(error, t);
    } finally {
      setGeolocating(false);
    }
  }, [currentLang, t]);

  const handleFormChange = useCallback((field, value) => {
    formValuesRef.current[field] = value;
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const phoneVal = formValuesRef.current.phone;
    const addressDetailsVal = formValuesRef.current.addressDetails;

    if (!phoneVal.trim()) {
      showToast.error(t("notifications:fill_all_fields"));
      return;
    }

    if (!coordinates) {
      showToast.error(
        currentLang === "hi"
          ? "कृपया ऑर्डर पूरा करने के लिए पहले 'वर्तमान लोकेशन' पर क्लिक करके अपना स्थान सत्यापित करें।"
          : "Please verify your location by clicking 'Verify Location' to confirm your delivery range before placing order.",
      );
      return;
    }

    if (!addressDetailsVal.trim()) {
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
      const finalAddress = `${addressDetailsVal.trim()}, ${address}`;
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        paymentType,
        customerAddress: finalAddress,
        customerPhone: phoneVal,
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
            contact: phoneVal,
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

  const discount = paymentType === "Online" ? getOnlineDiscount(cartSubtotal) : 0;
  const deliveryCharge = getDeliveryCharge(distance);
  const finalTotal = cartSubtotal - discount + deliveryCharge;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white relative">
      {loading && <Loader fullPage />}
      <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-6">
        Checkout
      </h2>

      <div className="grid gap-1 grid-cols-1 lg:grid-cols-[1.8fr_1.2fr]">
        {/* Left Column: Form Details */}
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6 w-full">
          <BillingForm
            initialPhone={initialPhone}
            initialAddressDetails={initialAddressDetails}
            address={address}
            coordinates={coordinates}
            geolocating={geolocating}
            outOfRange={outOfRange}
            distance={distance}
            isWithinDeliveryHours={isWithinDeliveryHours}
            currentLang={currentLang}
            onLocationVerify={handleUseCurrentLocation}
            onFormChange={handleFormChange}
            addresses={user?.addresses || []}
            onAddressSelect={handleAddressSelect}
          />

          <PaymentSelector
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            cartSubtotal={cartSubtotal}
            currentLang={currentLang}
            t={t}
          />

           <button
            type="submit"
            disabled={loading || outOfRange}
            className="w-full py-3.5 mt-2 font-heading font-bold text-base bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t("common:submitting", "Submitting...")
              : !isWithinDeliveryHours
                ? `${currentLang === "hi" ? "ऑर्डर दें (कल डिलीवरी)" : "Place Order (Delivery Tomorrow)"} (₹${finalTotal})`
                : `${t("cart:place_order")} (₹${finalTotal})`}
          </button>
        </form>

        {/* Right Column: Order Items Summary */}
        <CheckoutSummary
          cartItems={cartItems}
          cartSubtotal={cartSubtotal}
          currentLang={currentLang}
          t={t}
          paymentType={paymentType}
          distance={distance}
        />
      </div>
    </div>
  );
};

export default Checkout;

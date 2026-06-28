import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import Loader from "../components/common/Loader";
import RegisterForm from "../components/auth/RegisterForm";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import api from "../utils/api";
import { getCurrentPositionWithFallback, handleGeolocationError } from "../utils/geolocation";
const SHOP_LAT = 26.671782;
const SHOP_LON = 82.008832;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2));
};

const Register = () => {
  const { t } = useTranslation(["auth", "common", "notifications"]);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const prefilledMobile = location.state?.prefilledMobile || "";

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState(prefilledMobile);
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSendingStep, setOtpSendingStep] = useState(0);

  const [distance, setDistance] = useState(null);
  const [outOfRange, setOutOfRange] = useState(false);

  // Calculate distance on coordinates change
  useEffect(() => {
    if (coordinates) {
      const dist = calculateDistance(
        SHOP_LAT,
        SHOP_LON,
        coordinates.latitude,
        coordinates.longitude
      );
      setDistance(dist);
      setOutOfRange(dist > 15);
    } else {
      setDistance(null);
      setOutOfRange(false);
    }
  }, [coordinates]);

  // Sync prefilled mobile if routed from login
  useEffect(() => {
    if (prefilledMobile) {
      setMobile(prefilledMobile);
    }
  }, [prefilledMobile]);

  // Clean up recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.error("Error clearing recaptcha verifier on unmount:", error);
        }
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleUseCurrentLocation = useCallback(async () => {
    setGeolocating(true);
    try {
      const position = await getCurrentPositionWithFallback();
      const { latitude, longitude } = position.coords;

      const dist = calculateDistance(SHOP_LAT, SHOP_LON, latitude, longitude);
      if (dist > 15) {
        showToast.error(
          "हम केवल दुकान से 15 किमी के दायरे में सेवाएं प्रदान करते हैं / We only serve within 15km of our shop"
        );
        setCoordinates(null);
        return;
      }

      setCoordinates({ latitude, longitude });
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        );
        const data = await response.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
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
          "लोकेशन तो मिल गई, पर पता खोजने में समस्या हुई / Location retrieved, but failed to fetch address name",
        );
      }
    } catch (error) {
      handleGeolocationError(error, t);
    } finally {
      setGeolocating(false);
    }
  }, [t]);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.error("Error clearing old Recaptcha:", error);
      }
      window.recaptchaVerifier = null;
    }
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          showToast.error("reCAPTCHA expired. Please try again.");
        }
      });
    } catch (error) {
      console.error("Error setting up Recaptcha:", error);
    }
  };

  const handleSendOtp = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!name || !address) {
      showToast.error(t("auth:fill_all_fields"));
      return;
    }
    if (mobile.length !== 10) {
      showToast.error(t("auth:enter_phone_error"));
      return;
    }
    setLoading(true);
    setOtpSendingStep(1);
    await new Promise((r) => setTimeout(r, 600));
    setOtpSendingStep(2);
    await new Promise((r) => setTimeout(r, 600));
    setOtpSendingStep(3);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formatPhone = `+91${mobile}`;
      const confirmation = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      showToast.success(t("auth:otp_sent_success"));
      try {
        await api.post("/auth/log-otp-sent", { mobile });
      } catch (err) {
        console.error("Failed to log OTP sent status to server:", err);
      }
    } catch (error) {
      console.error("Error sending registration OTP:", error);
      showToast.error(error.message || t("auth:otp_failed"));
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.error("Error clearing recaptcha verifier after error:", error);
        }
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
      setOtpSendingStep(0);
    }
  }, [name, mobile, address, t]);

  const handleVerifyOtp = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      showToast.error(t("auth:enter_otp"));
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const firebaseToken = await user.getIdToken();
      
      const registerResult = await register(
        name,
        mobile,
        address,
        email,
        coordinates,
        firebaseToken,
      );
      if (registerResult.success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error verifying registration OTP:", error);
      showToast.error(t("auth:otp_invalid"));
    } finally {
      setLoading(false);
    }
  }, [otp, confirmationResult, register, name, mobile, address, email, coordinates, navigate, t]);

  const handleBackToDetails = useCallback(() => {
    setOtpSent(false);
    setOtp("");
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.error("Error clearing recaptcha verifier on back:", error);
      }
      window.recaptchaVerifier = null;
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[85vh] px-4 py-12 bg-gradient-to-b from-slate-50 to-white relative">
      {loading && <Loader fullPage />}
      <div className="w-full max-w-[450px] p-8 bg-white border border-slate-200/80 shadow-md rounded">
        <RegisterForm
          t={t}
          loading={loading}
          otpSent={otpSent}
          otpSendingStep={otpSendingStep}
          name={name}
          setName={setName}
          mobile={mobile}
          setMobile={setMobile}
          address={address}
          setAddress={setAddress}
          email={email}
          setEmail={setEmail}
          coordinates={coordinates}
          geolocating={geolocating}
          otp={otp}
          setOtp={setOtp}
          onSendOtp={handleSendOtp}
          onVerifyOtp={handleVerifyOtp}
          onBackToDetails={handleBackToDetails}
          handleUseCurrentLocation={handleUseCurrentLocation}
          distance={distance}
          outOfRange={outOfRange}
        />
      </div>
    </div>
  );
};

export default Register;

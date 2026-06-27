import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import Loader from "../components/common/Loader";
import RegisterForm from "../components/auth/RegisterForm";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import api from "../utils/api";

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
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
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
  }, []);

  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
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
        window.recaptchaVerifier.clear();
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
      window.recaptchaVerifier.clear();
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
        />
      </div>
    </div>
  );
};

export default Register;

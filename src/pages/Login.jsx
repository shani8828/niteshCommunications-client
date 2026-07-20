import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import Loader from "../components/common/Loader";
import LoginForm from "../components/auth/LoginForm";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../config/firebase";
import api from "../utils/api";
import { MapPin, Navigation, Check, AlertTriangle } from "lucide-react";
import { getCurrentPositionWithFallback, handleGeolocationError } from "../utils/geolocation";
import LocationMap from "../components/auth/LocationMap";
import { AddressSkeleton } from "../components/xerox/XeroxSkeletons";

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

const Login = () => {
  const { t } = useTranslation(["auth", "common", "notifications"]);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";
  const initialPrefilledMobile = location.state?.prefilledMobile || "";

  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState(initialPrefilledMobile);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSendingStep, setOtpSendingStep] = useState(0);

  // States for new user inline registration details
  const [isNewUser, setIsNewUser] = useState(false);
  const [tempFirebaseToken, setTempFirebaseToken] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);
  const [distance, setDistance] = useState(null);
  const [outOfRange, setOutOfRange] = useState(false);

  // Sync prefilled mobile if redirected
  useEffect(() => {
    if (initialPrefilledMobile) {
      setMobile(initialPrefilledMobile);
    }
  }, [initialPrefilledMobile]);

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
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            showToast.error("reCAPTCHA expired. Please try again.");
          },
        },
      );
    } catch (error) {
      console.error("Error setting up Recaptcha:", error);
    }
  };

  const handleSendOtp = useCallback(
    async (e) => {
      if (e) e.preventDefault();
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
        const confirmation = await signInWithPhoneNumber(
          auth,
          formatPhone,
          appVerifier,
        );
        setConfirmationResult(confirmation);
        setOtpSent(true);
        showToast.success(t("auth:otp_sent_success"));
        try {
          await api.post("/auth/log-otp-sent", { mobile });
        } catch (err) {
          console.error("Failed to log OTP sent status to server:", err);
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        showToast.error(
          error.message || t("auth:otp_failed"),
        );
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
    },
    [mobile, t],
  );

  const handleVerifyOtp = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (otp.length !== 6) {
        showToast.error(t("auth:enter_otp"));
        return;
      }
      setLoading(true);
      try {
        const result = await confirmationResult.confirm(otp);
        const firebaseUser = result.user;
        const firebaseToken = await firebaseUser.getIdToken();

        const loginResult = await login(firebaseToken);
        if (loginResult.success) {
          navigate(from, { replace: true });
        } else if (loginResult.notRegistered) {
          showToast.info(t("auth:number_not_registered"));
          setTempFirebaseToken(firebaseToken);
          setIsNewUser(true);
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
        showToast.error(t("auth:otp_invalid"));
      } finally {
        setLoading(false);
      }
    },
    [otp, confirmationResult, login, navigate, from, t],
  );

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

  const handleCompleteRegistration = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!name || !address) {
        showToast.error(t("auth:fill_all_fields"));
        return;
      }
      if (outOfRange) {
        showToast.error(
          "हम केवल दुकान से 15 किमी के दायरे में सेवाएं प्रदान करते हैं / We only serve within 15km of our shop"
        );
        return;
      }
      if (!coordinates) {
        showToast.error(t("auth:location_warning", "Please verify location using 'Get Current Location' first"));
        return;
      }
      setLoading(true);
      try {
        const registerResult = await register(
          name,
          mobile,
          address,
          email,
          coordinates,
          tempFirebaseToken
        );
        if (registerResult.success) {
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error("Error during inline registration:", error);
      } finally {
        setLoading(false);
      }
    },
    [name, mobile, address, email, coordinates, tempFirebaseToken, register, navigate, from, outOfRange, t]
  );

  const handleBackToMobile = useCallback(() => {
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
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 py-12 bg-gradient-to-b from-slate-50 to-white relative animate-fade-in">
      {loading && <Loader fullPage />}
      <div className={`w-full ${isNewUser ? 'max-w-[480px]' : 'max-w-[420px]'} bg-white border border-slate-200/80 p-5 md:p-6 lg:p-8 shadow-md rounded-2xl transition-all duration-300`}>
        {!isNewUser ? (
          <LoginForm
            t={t}
            loading={loading}
            otpSent={otpSent}
            otpSendingStep={otpSendingStep}
            mobile={mobile}
            setMobile={setMobile}
            otp={otp}
            setOtp={setOtp}
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
            onBackToMobile={handleBackToMobile}
          />
        ) : (
          <form onSubmit={handleCompleteRegistration} className="flex flex-col gap-4">
            <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
              {t("auth:verify_register")}
            </h2>
            <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
              {t("auth:number_not_registered")}
            </p>

            {/* Name */}
            <div className="flex flex-col text-left">
              <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                {t("auth:full_name")} *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                placeholder={t("auth:enter_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col text-left">
              <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                {t("auth:email")}
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                placeholder={t("auth:enter_email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Address Geocoder */}
            <div className="flex flex-col text-left gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("auth:address")} *
              </label>

              {!coordinates && !geolocating && (
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex items-center justify-center gap-2 py-4 px-6 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/20 text-blue-600 rounded-2xl font-semibold text-xs transition-all cursor-pointer bg-transparent"
                >
                  <Navigation size={16} className="animate-pulse" /> Verify Location coordinates (Required)
                </button>
              )}

              {geolocating && <AddressSkeleton />}

              {coordinates && !geolocating && (
                <div className="flex flex-col gap-4">
                  {/* Range Banner status */}
                  <div
                    className={`flex items-center gap-3 p-4 border rounded-2xl text-xs font-semibold ${
                      outOfRange
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {outOfRange ? (
                      <>
                        <AlertTriangle size={20} className="flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Out of service range ({distance} km)</p>
                          <p className="text-[10px] opacity-90 mt-0.5">
                            Your location is further than our maximum service limit of 15km from Ayodhya.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Check size={20} className="bg-emerald-500 text-white rounded-full p-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Location Verified ({distance} km away)</p>
                          <p className="text-[10px] opacity-90 mt-0.5">
                            You are within our delivery zone.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Address Details Output */}
                  {!outOfRange && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin size={10} /> Geocoded Address
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-1">
                          {address}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-2 font-mono">
                          Coords: {coordinates?.latitude.toFixed(6)}, {coordinates?.longitude.toFixed(6)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Flat/House No, Building & Landmark (Required) *
                        </label>
                        <textarea
                          rows="2"
                          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all w-full font-semibold text-slate-800"
                          placeholder="e.g. Near Ram Mandir Gate, House 4B"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="text-[10px] text-slate-400 hover:text-slate-650 font-bold transition-all border-0 bg-transparent cursor-pointer underline decoration-dotted"
                    >
                      Re-detect current location
                    </button>
                  </div>
                </div>
              )}
              <LocationMap coordinates={coordinates} />
            </div>

            <button
              type="submit"
              disabled={loading || !name || !address || outOfRange || !coordinates}
              className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("auth:verifying") : t("auth:verify_register")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

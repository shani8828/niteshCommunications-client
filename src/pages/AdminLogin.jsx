import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import Loader from "../components/common/Loader";
import { ShieldAlert } from "lucide-react";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../config/firebase";
import api from "../utils/api";
import OtpInput from "../components/auth/OtpInput";
import OtpProgress from "../components/auth/OtpProgress";

const AdminLogin = () => {
  const { t } = useTranslation(["auth", "common", "notifications"]);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Progressive OTP states
  const [showProgress, setShowProgress] = useState(false);
  const [progressStep, setProgressStep] = useState(1);
  const [resendTimer, setResendTimer] = useState(60);

  // Clean up recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Resend OTP timer logic
  useEffect(() => {
    let interval = null;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "admin-recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            showToast.error(t("auth:recaptcha_expired", "reCAPTCHA expired. Please try again."));
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
      setShowProgress(true);
      setProgressStep(1);

      // Step 1: Checking number (800ms)
      await new Promise((r) => setTimeout(r, 800));
      setProgressStep(2);

      // Step 2: Connecting securely (800ms)
      await new Promise((r) => setTimeout(r, 800));
      setProgressStep(3);

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
        setResendTimer(60);
        showToast.success(t("auth:admin_otp_sent"));
        try {
          await api.post("/auth/log-otp-sent", { mobile });
        } catch (err) {
          console.error("Failed to log OTP sent status to server:", err);
        }
      } catch (error) {
        console.error("Error sending admin OTP:", error);
        showToast.error(
          error.message || t("auth:otp_failed"),
        );
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
        }
      } finally {
        setLoading(false);
        setShowProgress(false);
      }
    },
    [mobile, t],
  );

  const handleVerifyOtp = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (otp.length !== 6) {
        showToast.error(t("auth:otp_invalid"));
        return;
      }
      setLoading(true);
      try {
        const result = await confirmationResult.confirm(otp);
        const user = result.user;
        const firebaseToken = await user.getIdToken();

        const loginResult = await adminLogin(firebaseToken);
        if (loginResult.success) {
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Error verifying admin OTP:", error);
        showToast.error(t("auth:otp_invalid"));
      } finally {
        setLoading(false);
      }
    },
    [otp, confirmationResult, adminLogin, navigate, t],
  );

  const handleBackToMobile = useCallback(() => {
    setOtpSent(false);
    setOtp("");
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  }, []);

  const handleAutofillDemo = () => {
    setMobile("9125949456");
  };

  const handleBypassDemo = useCallback(async () => {
    setLoading(true);
    try {
      const loginResult = await adminLogin("bypass-devmode-token");
      if (loginResult.success) {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error bypassing admin login:", error);
      showToast.error("Bypass failed. Make sure server is running in development mode.");
    } finally {
      setLoading(false);
    }
  }, [adminLogin, navigate]);

  // Mask number e.g. +91 ••••••1234
  const maskPhone = (phoneNum) => {
    if (!phoneNum || phoneNum.length < 4) return phoneNum;
    return `+91 ••••••${phoneNum.slice(-4)}`;
  };

  // Format timer e.g. 00:59
  const formatTimer = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-6 py-12 bg-slate-50 relative animate-fadeIn">
      {loading && !showProgress && <Loader fullPage />}
      <div className="w-full max-w-[400px] bg-white border border-slate-200/80 p-8 shadow-sm rounded">
        <div className="flex justify-center mb-3">
          <ShieldAlert size={36} className="text-blue-600 animate-pulse" />
        </div>
        <h2 className="text-xl font-heading font-extrabold text-center text-slate-900 mb-1">
          {t("auth:admin_login")}
        </h2>
        <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
          {otpSent
            ? t("auth:otp_sent_success")
            : t("auth:admin_only")}
        </p>

        {showProgress ? (
          <OtpProgress step={progressStep} />
        ) : !otpSent ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="flex flex-col text-left">
              <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                {t("auth:phone_number")} *
              </label>
              <div className="flex bg-white border border-slate-200 rounded overflow-hidden focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="bg-slate-50 px-4 py-2.5 text-sm text-slate-500 font-bold border-r border-slate-200 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength="10"
                  className="w-full px-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none text-sm border-0 font-semibold"
                  placeholder="e.g. 9125949456"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || mobile.length !== 10}
              className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer border-0 disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {t("auth:get_otp")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <div className="flex flex-col text-left">
              <p className="text-xs text-slate-500 text-center mb-3">
                {t("auth:verification_sent")}{" "}
                <span className="font-bold text-slate-700">{maskPhone(mobile)}</span>
              </p>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-500">
                  {t("auth:otp_label")} *
                </label>
                <button
                  type="button"
                  onClick={handleBackToMobile}
                  className="bg-transparent border-0 text-blue-600 text-[11px] font-bold cursor-pointer hover:text-blue-800 transition-all"
                >
                  {t("auth:change_number")}
                </button>
              </div>
              <OtpInput length={6} onChangeOtp={setOtp} />
            </div>

            <div className="text-center text-xs text-slate-500 my-1 font-semibold">
              {resendTimer > 0 ? (
                <span>
                  {t("auth:didnt_receive")}{" "}
                  <span className="text-blue-600 font-bold">
                    {t("auth:resend_available")} {formatTimer(resendTimer)}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-blue-600 hover:text-blue-800 font-bold border-0 bg-transparent cursor-pointer transition-all hover:underline"
                >
                  {t("auth:resend_btn")}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer border-0 disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {loading ? t("auth:verifying") : t("auth:verify_login")}
            </button>
          </form>
        )}

        {/* Invisible ReCaptcha Container */}
        <div
          id="admin-recaptcha-container"
          className="flex justify-center mt-2"
        ></div>

        {import.meta.env.DEV && !otpSent && (
          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded text-center flex flex-col gap-2 animate-fadeIn">
            <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
              {t("auth:development_tools")}
            </p>
            <button
              onClick={handleAutofillDemo}
              className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700 transition-all border-0 cursor-pointer w-full"
            >
              {t("auth:autofill_admin")}
            </button>
            <button
              onClick={handleBypassDemo}
              className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded transition-all border-0 cursor-pointer w-full"
            >
              {t("auth:bypass_admin")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;

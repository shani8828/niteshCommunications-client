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

const Login = () => {
  const { t } = useTranslation(["auth", "common", "notifications"]);
  const { login } = useAuth();
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

  // Sync prefilled mobile if redirected
  useEffect(() => {
    if (initialPrefilledMobile) {
      setMobile(initialPrefilledMobile);
    }
  }, [initialPrefilledMobile]);

  // Clean up recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
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
          window.recaptchaVerifier.clear();
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
        const user = result.user;
        const firebaseToken = await user.getIdToken();

        const loginResult = await login(firebaseToken);
        if (loginResult.success) {
          navigate(from, { replace: true });
        } else if (loginResult.notRegistered) {
          showToast.info(t("auth:number_not_registered"));
          navigate("/register", { state: { prefilledMobile: mobile } });
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
        showToast.error(t("auth:otp_invalid"));
      } finally {
        setLoading(false);
      }
    },
    [otp, confirmationResult, login, navigate, from, mobile, t],
  );

  const handleBackToMobile = useCallback(() => {
    setOtpSent(false);
    setOtp("");
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 py-12 bg-gradient-to-b from-slate-50 to-white relative">
      {loading && <Loader fullPage />}
      <div className="w-full max-w-[420px] bg-white border border-slate-200/80 p-3 md:p-4 lg:p-6 shadow-md rounded">
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
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import RegisterMap from "./RegisterMap";
import OtpInput from "./OtpInput";
import OtpProgress from "./OtpProgress";

const RegisterForm = ({
  t,
  loading,
  otpSent,
  otpSendingStep,
  name,
  setName,
  mobile,
  setMobile,
  address,
  setAddress,
  email,
  setEmail,
  coordinates,
  geolocating,
  otp,
  setOtp,
  onSendOtp,
  onVerifyOtp,
  onBackToDetails,
  handleUseCurrentLocation,
}) => {
  const [resendTimer, setResendTimer] = useState(60);

  // Restart timer when OTP is sent
  useEffect(() => {
    if (otpSent) {
      setResendTimer(60);
    }
  }, [otpSent]);

  // Handle timer countdown
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

  const handleResend = () => {
    if (loading) return;
    setResendTimer(60);
    onSendOtp();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <>
      <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
        {t("common:register")}
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
        {otpSent ? (
          <span className="flex flex-col gap-1 items-center">
            <span>{t("auth:verification_sent")}</span>
            <span className="font-bold text-slate-700 text-sm tracking-wider">
              +91 ••••••{mobile.slice(-4)}
            </span>
          </span>
        ) : (
          t("common:welcome")
        )}
      </p>

      {otpSendingStep > 0 ? (
        <OtpProgress step={otpSendingStep} t={t} />
      ) : !otpSent ? (
        <form onSubmit={onSendOtp} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col text-left">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t("auth:full_name")} *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
              placeholder={t("auth:enter_name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Mobile Number */}
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
                className="w-full px-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none text-sm border-0 font-medium"
                placeholder={t("auth:enter_phone")}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col text-left">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-500">
                {t("auth:address")} *
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
                {geolocating ? t("auth:locating") : t("auth:use_location")}
              </button>
            </div>
            <textarea
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
              rows="2"
              placeholder={t("auth:enter_address")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <RegisterMap coordinates={coordinates} />
          </div>

          {/* Email */}
          <div className="flex flex-col text-left">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t("auth:email")}
            </label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
              placeholder={t("auth:enter_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || mobile.length !== 10 || !name || !address}
            className="w-full py-3 mt-4 font-heading font-bold text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("auth:send_otp_verify")}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded text-left text-xs text-slate-600 flex flex-col gap-1.5">
            <div>
              <strong>{t("auth:name_label")}:</strong> {name}
            </div>
            <div>
              <strong>{t("auth:mobile_label")}:</strong> +91 {mobile}
            </div>
            <div className="line-clamp-2">
              <strong>{t("auth:address_label")}:</strong> {address}
            </div>
            {email && (
              <div>
                <strong>{t("auth:email_label")}:</strong> {email}
              </div>
            )}
          </div>

          <div className="flex flex-col text-left">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-500">
                {t("auth:otp_code")} *
              </label>
              <button
                type="button"
                onClick={onBackToDetails}
                className="bg-transparent border-0 text-blue-600 text-[11px] font-semibold cursor-pointer hover:underline"
              >
                {t("auth:edit_details")}
              </button>
            </div>

            {/* Reusable OtpInput with auto-focus, paste, and auto-move */}
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("auth:verifying") : t("auth:verify_register")}
          </button>

          {/* Resend OTP timer logic */}
          {resendTimer > 0 ? (
            <div className="text-center mt-2 text-xs text-slate-500">
              <p className="mb-1">{t("auth:didnt_receive")}</p>
              <p className="font-semibold text-slate-600">
                {t("auth:resend_available")}{" "}
                <span className="font-mono text-blue-600">
                  {formatTimer(resendTimer)}
                </span>
              </p>
            </div>
          ) : (
            <div className="text-center mt-2 text-xs text-slate-500">
              <p className="mb-1">{t("auth:didnt_receive")}</p>
              <button
                type="button"
                onClick={handleResend}
                className="bg-transparent border-0 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer hover:underline text-xs"
              >
                {t("auth:resend_otp")}
              </button>
            </div>
          )}
        </form>
      )}

      {/* Invisible ReCaptcha Container */}
      <div id="recaptcha-container" className="flex justify-center mt-2"></div>

      <p className="text-center mt-6 text-xs text-slate-500">
        {t("auth:have_account")}{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:underline font-semibold"
        >
          {t("common:login")}
        </Link>
      </p>
    </>
  );
};

export default React.memo(RegisterForm);

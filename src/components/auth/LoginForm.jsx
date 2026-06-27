import React from "react";
import { Link } from "react-router-dom";

const LoginForm = ({
  t,
  loading,
  otpSent,
  mobile,
  setMobile,
  otp,
  setOtp,
  onSendOtp,
  onVerifyOtp,
  onBackToMobile,
}) => {
  return (
    <>
      <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
        {t("common:login")}
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
        {otpSent 
          ? "दर्ज किए गए मोबाइल नंबर पर एक ओटीपी भेजा गया है / An OTP has been sent to your mobile number"
          : t("common:tagline")}
      </p>

      {!otpSent ? (
        <form onSubmit={onSendOtp} className="flex flex-col gap-4">
          <div className="flex flex-col text-left">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t("auth:phone_number")} *
            </label>
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
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

          <button
            type="submit"
            disabled={loading || mobile.length !== 10}
            className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "ओटीपी भेज रहे हैं... / Sending OTP..." : "ओटीपी भेजें / Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="flex flex-col gap-4">
          <div className="flex flex-col text-left">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-500">
                OTP Code / वन-टाइम पासवर्ड *
              </label>
              <button
                type="button"
                onClick={onBackToMobile}
                className="bg-transparent border-0 text-blue-600 text-[11px] font-semibold cursor-pointer hover:underline"
              >
                नंबर बदलें / Change Number
              </button>
            </div>
            <input
              type="text"
              maxLength="6"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-center font-bold tracking-widest"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "सत्यापित कर रहे हैं... / Verifying..." : "लॉगिन करें / Verify & Login"}
          </button>
        </form>
      )}

      {/* Invisible ReCaptcha Container */}
      <div id="recaptcha-container" className="flex justify-center mt-2"></div>

      <p className="text-center mt-6 text-xs text-slate-500">
        {t("auth:new_to_shop")}{" "}
        <Link
          to="/register"
          className="text-blue-600 hover:underline font-semibold"
        >
          {t("common:register")}
        </Link>
      </p>
    </>
  );
};

export default React.memo(LoginForm);

import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import RegisterMap from "./RegisterMap";

const RegisterForm = ({
  t,
  loading,
  otpSent,
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
  return (
    <>
      <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
        {t("common:register")}
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
        {otpSent
          ? "विवरण सत्यापित करने के लिए ओटीपी दर्ज करें / Enter OTP to verify details"
          : t("common:tagline")}
      </p>

      {!otpSent ? (
        <form onSubmit={onSendOtp} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col text-left">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t("auth:full_name")} *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
              placeholder="Enter your name"
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
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <span className="bg-slate-50 px-4 py-2.5 text-sm text-slate-500 font-bold border-r border-slate-200 flex items-center">
                +91
              </span>
              <input
                type="tel"
                maxLength="10"
                className="w-full px-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none text-sm border-0 font-medium"
                placeholder="Enter 10-digit number"
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
                {geolocating
                  ? "खोज रहे हैं... / Locating..."
                  : "वर्तमान लोकेशन / Use Location"}
              </button>
            </div>
            <textarea
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
              rows="2"
              placeholder="Enter your full address"
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
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || mobile.length !== 10 || !name || !address}
            className="w-full py-3 mt-4 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "ओटीपी भेज रहे हैं... / Sending OTP..." : "ओटीपी भेजें / Send OTP to Verify"}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left text-xs text-slate-600 flex flex-col gap-1.5">
            <div><strong>नाम / Name:</strong> {name}</div>
            <div><strong>मोबाइल / Mobile:</strong> +91 {mobile}</div>
            <div className="line-clamp-2"><strong>पता / Address:</strong> {address}</div>
            {email && <div><strong>ईमेल / Email:</strong> {email}</div>}
          </div>

          <div className="flex flex-col text-left">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-500">
                OTP Code / वन-टाइम पासवर्ड *
              </label>
              <button
                type="button"
                onClick={onBackToDetails}
                className="bg-transparent border-0 text-blue-600 text-[11px] font-semibold cursor-pointer hover:underline"
              >
                विवरण संपादित करें / Edit Details
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
            {loading ? "सत्यापित कर रहे हैं... / Verifying..." : "रजिस्ट्रेशन पूरा करें / Verify & Register"}
          </button>
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

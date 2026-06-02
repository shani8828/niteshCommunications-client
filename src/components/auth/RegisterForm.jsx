import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, MapPin } from "lucide-react";
import { showToast } from "../../utils/toast";
import RegisterMap from "./RegisterMap";

const RegisterForm = ({
  t,
  onSubmit,
  loading,
}) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !mobile || !password || !address) {
      showToast.error(t("auth:fill_all_fields"));
      return;
    }
    if (mobile.length !== 10) {
      showToast.error(t("auth:enter_phone"));
      return;
    }
    onSubmit({ name, mobile, password, address, email, coordinates });
  };

  return (
    <>
      <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
        {t("common:register")}
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
        {t("common:tagline")}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col text-left">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            {t("auth:full_name")} *
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col text-left">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            {t("auth:phone_number")} *
          </label>
          <input
            type="tel"
            maxLength="10"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            placeholder="Enter 10 digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>

        <div className="flex flex-col text-left">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            {t("auth:password")} *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              placeholder={t("auth:enter_password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-0 cursor-pointer flex items-center"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

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
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            rows="2"
            placeholder="Enter your full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <RegisterMap coordinates={coordinates} />
        </div>

        <div className="flex flex-col text-left">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            {t("auth:email")}
          </label>
          <input
            type="email"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? t("common:submitting", "Submitting...")
            : t("auth:register_button")}
        </button>
      </form>

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

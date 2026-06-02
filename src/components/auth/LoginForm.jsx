import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = ({
  t,
  onSubmit,
  loading,
  onForgotPasswordClick,
  initialMobile,
}) => {
  const [mobile, setMobile] = useState(initialMobile || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ mobile, password });
  };

  return (
    <>
      <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
        {t("common:login")}
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
        {t("common:tagline")}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col text-left">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            {t("auth:phone_number")}
          </label>
          <input
            type="tel"
            maxLength="10"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            placeholder={t("auth:enter_phone")}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>

        <div className="flex flex-col relative text-left">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-500">
              {t("auth:password")}
            </label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="bg-transparent border-0 text-blue-600 text-[11px] font-semibold cursor-pointer hover:underline"
            >
              {t("auth:forgot_password")}
            </button>
          </div>
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
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-0 cursor-pointer flex items-center"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? t("common:submitting", "Submitting...")
            : t("common:login")}
        </button>
      </form>

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

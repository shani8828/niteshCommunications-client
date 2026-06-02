import React, { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";

const ResetPasswordForm = ({
  t,
  onSubmit,
  loading,
  onBackToLoginClick,
  initialMobile,
}) => {
  const [mobile, setMobile] = useState(initialMobile || "");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ mobile, resetCode, newPassword });
  };

  return (
    <>
      <div className="flex justify-center mb-2">
        <KeyRound size={36} className="text-blue-600" />
      </div>
      <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
        रिकवरी कोड द्वारा रीसेट करें / Reset via Recovery Code
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
        पासवर्ड रीसेट करने के लिए अपना पंजीकृत मोबाइल नंबर, रिकवरी कोड
        (NC-XXXX-XXXX) और नया पासवर्ड दर्ज करें।
        <br />
        <span className="text-[10px] text-slate-400">
          Enter your mobile number, a recovery code, and your new password
          to reset.
        </span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col text-left">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            {t("auth:phone_number")} *
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

        <div className="flex flex-col text-left">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            रिकवरी कोड / Recovery Code (NC-XXXX-XXXX) *
          </label>
          <input
            type="text"
            maxLength="14"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-mono tracking-wider uppercase"
            placeholder="NC-XXXX-XXXX"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col relative text-left">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            नया पासवर्ड / New Password *
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-0 cursor-pointer flex items-center"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            : t("auth:confirm_reset")}
        </button>
      </form>

      <button
        type="button"
        onClick={onBackToLoginClick}
        className="bg-transparent border-0 text-slate-500 text-xs cursor-pointer hover:underline mx-auto mt-6 block font-semibold outline-none"
      >
        {t("auth:back_to_login")}
      </button>
    </>
  );
};

export default React.memo(ResetPasswordForm);

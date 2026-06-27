import React from "react";
import { Check, Loader2 } from "lucide-react";

const OtpProgress = ({ step, t }) => {
  return (
    <div className="flex flex-col gap-3.5 p-4 bg-slate-50 border border-slate-100 rounded text-left my-2 select-none animate-fade-in">
      {/* Step 1: Checking number */}
      <div className="flex items-center gap-2.5 text-sm">
        {step > 1 ? (
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 scale-100 transition-all duration-300">
            <Check size={12} strokeWidth={3} />
          </div>
        ) : step === 1 ? (
          <Loader2 size={16} className="text-blue-600 animate-spin" />
        ) : (
          <div className="w-5 h-5 rounded-full border border-slate-200 bg-white" />
        )}
        <span
          className={`font-medium ${
            step >= 1 ? "text-slate-800" : "text-slate-400"
          }`}
        >
          {t("auth:checking_number")}
        </span>
      </div>

      {/* Step 2: Connecting securely */}
      <div className="flex items-center gap-2.5 text-sm">
        {step > 2 ? (
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 scale-100 transition-all duration-300">
            <Check size={12} strokeWidth={3} />
          </div>
        ) : step === 2 ? (
          <Loader2 size={16} className="text-blue-600 animate-spin" />
        ) : (
          <div className="w-5 h-5 rounded-full border border-slate-200 bg-white" />
        )}
        <span
          className={`font-medium ${
            step >= 2 ? "text-slate-800" : "text-slate-400"
          }`}
        >
          {t("auth:connecting_securely")}
        </span>
      </div>

      {/* Step 3: Sending SMS */}
      <div className="flex items-center gap-2.5 text-sm">
        {step === 3 ? (
          <Loader2 size={16} className="text-blue-600 animate-spin" />
        ) : (
          <div className="w-5 h-5 rounded-full border border-slate-200 bg-white" />
        )}
        <span
          className={`font-medium ${
            step >= 3 ? "text-slate-800" : "text-slate-400"
          }`}
        >
          {t("auth:sending_sms")}
        </span>
      </div>
    </div>
  );
};

export default React.memo(OtpProgress);

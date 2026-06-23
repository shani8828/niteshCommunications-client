import React from "react";
import { CreditCard, Truck } from "lucide-react";
import { showToast } from "../../utils/toast";

const PaymentSelector = ({
  paymentType,
  setPaymentType,
  cartSubtotal,
  currentLang,
  t,
}) => {
  const handleCodClick = () => {
    if (cartSubtotal <= 5000) {
      setPaymentType("COD");
    } else {
      showToast.warning(
        currentLang === "hi"
          ? "₹5,000 से अधिक के ऑर्डर के लिए कैश ऑन डिलीवरी उपलब्ध नहीं है।"
          : "Cash on Delivery is not available for orders above ₹5,000.",
      );
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded flex flex-col gap-4 shadow-sm">
      <h3 className="font-heading text-base font-bold text-slate-800 mb-2">
        {t("cart:select_payment")}
      </h3>

      {cartSubtotal > 5000 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-semibold">
          {currentLang === "hi"
            ? "⚠️ आपका सबटोटल ₹5,000 से अधिक है, इसलिए केवल ऑनलाइन भुगतान उपलब्ध है। कैश ऑन डिलीवरी (COD) उपलब्ध नहीं है।"
            : "⚠️ Your subtotal exceeds ₹5,000, so only online payment is available. Cash on Delivery (COD) is disabled."}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* COD Option */}
        <div
          className={`flex items-start gap-4 border p-5 rounded transition-all ${
            cartSubtotal > 5000
              ? "border-slate-100 bg-slate-50 opacity-55 cursor-not-allowed"
              : paymentType === "COD"
                ? "border-blue-600 bg-blue-50/10 cursor-pointer"
                : "border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
          }`}
          onClick={handleCodClick}
        >
          <input
            type="radio"
            name="paymentType"
            value="COD"
            checked={paymentType === "COD"}
            disabled={cartSubtotal > 5000}
            onChange={() => {}}
            className="hidden"
          />
          <Truck
            size={20}
            className={`mt-0.5 ${paymentType === "COD" && cartSubtotal <= 5000 ? "text-blue-600" : "text-slate-400"}`}
          />
          <div className="flex flex-col gap-0.5 text-slate-800">
            <p
              className={`text-sm font-semibold ${cartSubtotal > 5000 ? "text-slate-400 line-through" : ""}`}
            >
              {t("cart:cod")}
            </p>
            <p className="text-xs text-slate-500">
              Pay in cash at your doorstep when items arrive.
            </p>
            {cartSubtotal > 5000 && (
              <p className="text-[10px] text-rose-500 font-bold mt-1">
                {currentLang === "hi"
                  ? "⚠️ ₹5,000 से अधिक के ऑर्डर के लिए उपलब्ध नहीं है।"
                  : "⚠️ Not available for orders above ₹5,000."}
              </p>
            )}
          </div>
        </div>

        {/* Razorpay Option */}
        <div
          className={`flex items-start gap-4 border p-5 rounded cursor-pointer transition-colors ${
            paymentType === "Online"
              ? "border-blue-600 bg-blue-50/10"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
          onClick={() => setPaymentType("Online")}
        >
          <input
            type="radio"
            name="paymentType"
            value="Online"
            checked={paymentType === "Online"}
            onChange={() => {}}
            className="hidden"
          />
          <CreditCard
            size={20}
            className={`mt-0.5 ${paymentType === "Online" ? "text-blue-600" : "text-slate-400"}`}
          />
          <div className="flex flex-col gap-0.5 text-slate-800">
            <p className="text-sm font-semibold">{t("cart:online")}</p>
            <p className="text-xs text-slate-500">
              Pay instantly via UPI, Credit/Debit cards, Net Banking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PaymentSelector);

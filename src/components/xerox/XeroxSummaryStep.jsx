import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ReceiptSkeleton } from "./XeroxSkeletons";
import { getDeliveryCharge } from "../../utils/delivery";

const XeroxSummaryStep = ({
  documents,
  address,
  landmark,
  user,
  name,
  setName,
  phone,
  setPhone,
  onBack,
  onSubmit,
  processing,
  distance,
}) => {
  const [isWithinHours, setIsWithinHours] = useState(true);
  const [bypassPayment, setBypassPayment] = useState(false);
  const isDevHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!phone && user.mobile) setPhone(user.mobile);
    }
  }, [user, name, phone, setName, setPhone]);

  useEffect(() => {
    const checkDeliveryHours = () => {
      const now = new Date();
      const istTime = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const istDate = new Date(istTime);
      const hour = istDate.getHours();
      return hour >= 9 && hour < 18;
    };
    setIsWithinHours(checkDeliveryHours());
  }, []);

  const subtotal = documents.reduce((sum, doc) => {
    const rate = doc.colorPreference === "color" ? 7 : 5;
    return sum + doc.pages * doc.copies * rate;
  }, 0);
  const tax = 2;
  const deliveryCharge = getDeliveryCharge(distance);
  const total = subtotal + tax + deliveryCharge;

  const handlePayClick = (e) => {
    e.preventDefault();
    onSubmit(bypassPayment);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center md:text-left">
        <h3 className="font-heading text-lg font-bold text-slate-800">
          Confirm & Pay
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Provide your contact details, verify your booking summary, and
          complete your payment online.
        </p>
      </div>

      {processing ? (
        <ReceiptSkeleton />
      ) : (
        <form onSubmit={handlePayClick} className="flex flex-col gap-4">
          {/* Service Hour Delivery schedule indicator */}
          <div
            className={`flex items-start gap-3 p-3.5 border rounded-2xl text-xs font-semibold ${
              isWithinHours
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            {isWithinHours ? (
              <>
                <CheckCircle2
                  size={18}
                  className="flex-shrink-0 mt-0.5 text-emerald-500"
                />
                <div>
                  <p className="font-bold text-sm">
                    Same-day Delivery Available
                  </p>
                  <p className="text-[10px] opacity-90 mt-0.5">
                    Your request was received within service hours (9 AM - 6 PM)
                    and will be processed immediately.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle
                  size={18}
                  className="flex-shrink-0 mt-0.5 text-amber-500"
                />
                <div>
                  <p className="font-bold text-sm">
                    Tomorrow Delivery Scheduled
                  </p>
                  <p className="text-[10px] opacity-90 mt-0.5">
                    Order received outside 9 AM - 6 PM delivery hours. Your
                    documents will be delivered tomorrow morning.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Contact Details fields */}
          <div className="grid gap-1 grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 w-full font-semibold text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 w-full font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Summary Breakdown card */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden mt-2">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/60 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">
                Billing Summary
              </span>
              <span className="text-[10px] bg-slate-200/60 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase">
                {documents.length} File(s)
              </span>
            </div>

            <div className="p-4 flex flex-col gap-2.5 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Subtotal (Page cost)</span>
                <span className="font-semibold text-slate-800">
                  ₹{subtotal}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <span>Convenience / Delivery Tax</span>
                <span className="font-semibold text-slate-800">₹{tax}</span>
              </div>
              {deliveryCharge > 0 && (
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-slate-800">₹{deliveryCharge}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 font-extrabold text-sm text-slate-800">
                <span>Total Amount</span>
                <span className="text-base text-slate-900 font-extrabold">
                  ₹{total}
                </span>
              </div>
            </div>
          </div>

          {/* Dev Mode Bypass Option */}
          {isDevHost && (
            <div className="flex items-center gap-2 p-3 bg-amber-50/50 border border-amber-200/80 rounded-2xl text-xs font-semibold text-amber-800">
              <input
                type="checkbox"
                id="bypassPayment"
                checked={bypassPayment}
                onChange={(e) => setBypassPayment(e.target.checked)}
                className="h-4 w-4 text-brand-cyan border-slate-300 rounded focus:ring-brand-cyan cursor-pointer"
              />
              <label
                htmlFor="bypassPayment"
                className="cursor-pointer select-none font-bold"
              >
                🛠️ Dev Mode: Bypass payment and place test order directly
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="grid gap-1 grid-cols-2 mt-2">
            <button
              type="button"
              onClick={onBack}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all border-0 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <button
              type="submit"
              className={`py-3 px-4 rounded-2xl text-xs font-bold shadow-md transition-all border-0 flex items-center justify-center gap-1.5 cursor-pointer ${
                bypassPayment
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                  : "bg-brand-cyan hover:bg-brand-cyan-dark text-white shadow-brand-cyan/20"
              }`}
            >
              {bypassPayment ? (
                <>
                  <span>🛠️ Place Test Order</span>
                </>
              ) : (
                <>
                  <CreditCard size={14} /> Pay & Place Order
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default XeroxSummaryStep;

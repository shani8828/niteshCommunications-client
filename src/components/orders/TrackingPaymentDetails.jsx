import React from "react";
import { CreditCard } from "lucide-react";

const TrackingPaymentDetails = ({
  order,
  handleRetryPayment,
  retrying,
}) => {
  return (
    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded shadow-sm flex flex-col gap-4 text-left">
      <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
        <CreditCard size={18} className="text-blue-600" /> Payment Details
      </h3>
      <div className="flex flex-col gap-3 text-xs text-slate-600">
        <div>
          <span>
            Payment Mode: <strong>{order.paymentType}</strong>
          </span>
        </div>
        <div>
          <span>
            Payment Status:{" "}
            <span
              className={`font-bold ${
                order.paymentStatus === "Paid"
                  ? "text-emerald-600"
                  : order.paymentStatus === "Failed"
                    ? "text-rose-600"
                    : "text-amber-600"
              }`}
            >
              {order.paymentStatus.toUpperCase()}
            </span>
          </span>
        </div>
        <div>
          <span>
            Date Placed: {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {order.paymentType === "Online" && order.paymentStatus !== "Paid" && (
        <button
          onClick={handleRetryPayment}
          className="w-full py-2.5 mt-4 font-heading font-bold text-xs bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0 outline-none transition-all"
          disabled={retrying}
          type="button"
        >
          {retrying ? "Processing..." : "Retry Razorpay Payment"}
        </button>
      )}
    </div>
  );
};

export default React.memo(TrackingPaymentDetails);

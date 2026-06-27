import React from "react";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

const RepairBookingsTab = ({
  repairs,
  repairsLoading,
  t,
  handleCancelRepair,
}) => {
  const getPaymentStatusText = (status) => {
    switch (status) {
      case "Paid":
        return t("cart:status_paid", "Paid");
      case "Failed":
        return t("cart:status_failed", "Failed");
      default:
        return t("cart:status_pending", "Pending");
    }
  };

  const getRepairStatusText = (status) => {
    switch (status) {
      case "Pending":
        return t("cart:status_pending", "Pending");
      case "Cancelled":
        return t("cart:status_cancelled", "Cancelled");
      case "Approved":
        return t("common:confirmed", "Confirmed");
      case "Repaired":
        return t("common:delivered", "Repaired");
      default:
        return status;
    }
  };

  if (repairsLoading && repairs.length === 0) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fadeIn">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 bg-white border border-slate-200/80 rounded shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse animate-fadeIn"
            >
              <div className="flex flex-col gap-2 min-w-0 flex-1 w-full text-left">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-40 bg-slate-200 rounded mt-1.5" />
                <div className="h-4 w-24 bg-slate-100 rounded mt-1" />
                <div className="h-3 w-3/4 bg-slate-100 rounded mt-2" />
                <div className="h-3 w-28 bg-slate-200 rounded mt-2" />
              </div>
              <div className="flex items-start sm:items-end flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
                <div className="flex gap-2">
                  <div className="h-4 w-20 bg-slate-100 rounded-full" />
                  <div className="h-4 w-20 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (repairs.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50/50 border border-slate-200/60 rounded flex flex-col items-center gap-4 animate-fadeIn">
        <Wrench size={36} className="text-slate-350" />
        <p className="text-sm text-slate-500">{t("repair:repair_empty")}</p>
        <Link
          to="/repairs"
          className="px-6 py-2.5 font-heading font-bold text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-all border-0 shadow-sm"
        >
          {t("repair:book_repair")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 text-left">
        {t("repair:repair_history_title")}
      </h3>

      <div className="flex flex-col gap-4">
        {repairs.map((rep) => (
          <div
            key={rep._id}
            className="p-5 md:p-6 bg-white border border-slate-200/80 rounded shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex flex-col gap-1.5 flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                  {t("repair:booking_id")}: {rep._id.slice(-6).toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {new Date(rep.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 className="font-heading text-sm font-bold text-slate-800 mt-1 truncate">
                {rep.deviceBrand} {rep.deviceModel}
              </h4>
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded w-fit">
                {rep.serviceCategory}
              </span>

              <p className="text-xs text-slate-500 mt-1 break-words leading-relaxed">
                <span className="font-semibold text-slate-700">
                  {t("repair:problem_label")}:{" "}
                </span>
                {rep.problemDescription}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="font-bold text-slate-800">
                  ₹{rep.estimatedPrice}
                </span>
                <span className="text-slate-400 font-semibold">|</span>
                <span className="text-slate-500 font-semibold">
                  {t("repair:payment_method")}: {rep.paymentMethod}
                </span>
              </div>

              {rep.notes && (
                <div className="mt-2 bg-amber-50/50 border border-amber-100 rounded p-2.5 text-xs text-amber-800 break-words leading-relaxed">
                  <span className="font-bold">{t("repair:admin_notes")}: </span>
                  {rep.notes}
                </div>
              )}
            </div>

            <div className="flex items-start sm:items-end flex-col gap-2.5 w-full sm:w-auto flex-shrink-0 mt-3 sm:mt-0">
              <div className="flex gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rep.paymentStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : rep.paymentStatus === "Refunded"
                        ? "bg-amber-100 text-amber-700"
                        : rep.paymentStatus === "Failed"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                  }`}
                >
                  Pay: {getPaymentStatusText(rep.paymentStatus)}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rep.status === "Delivered" || rep.status === "Repaired"
                      ? "bg-emerald-100 text-emerald-700"
                      : rep.status === "Cancelled"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  Status: {getRepairStatusText(rep.status)}
                </span>
              </div>

              {["Pending", "Approved"].includes(rep.status) && (
                <button
                  type="button"
                  onClick={() => handleCancelRepair(rep)}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded cursor-pointer transition-all w-full sm:w-auto text-center"
                >
                  {t("repair:cancel_booking")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RepairBookingsTab);

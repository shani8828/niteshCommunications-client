import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

const OrdersHistoryTab = ({
  orders,
  ordersLoading,
  t,
  currentLang,
  handleCancelClick,
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

  const getDeliveryStatusText = (status) => {
    switch (status) {
      case "Delivered":
        return t("common:delivered", "Delivered");
      case "Cancelled":
        return t("cart:status_cancelled", "Cancelled");
      case "Order Placed":
        return t("common:order_placed", "Order Placed");
      case "Confirmed":
        return t("common:confirmed", "Confirmed");
      case "Packed":
        return t("common:packed", "Packed");
      case "Waiting Pickup":
        return t("common:waiting_pickup", "Waiting Pickup");
      case "Picked Up":
        return t("common:picked_up", "Picked Up");
      case "On The Way":
        return t("common:on_the_way", "On The Way");
      default:
        return status;
    }
  };

  if (ordersLoading && orders.length === 0) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fadeIn">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 bg-white border border-slate-200/80 rounded shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse animate-fadeIn"
            >
              <div className="flex flex-col gap-2 min-w-0 flex-1 w-full text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
                <div className="h-4 w-3/4 bg-slate-100 rounded mt-2" />
                <div className="h-3 w-28 bg-slate-200 rounded mt-2" />
              </div>
              <div className="flex items-start sm:items-end flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
                <div className="flex gap-2">
                  <div className="h-4 w-20 bg-slate-100 rounded-full" />
                  <div className="h-4 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="h-4 w-24 bg-slate-200 rounded mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50/50 border border-slate-200/60 rounded flex flex-col items-center gap-4 animate-fadeIn">
        <ShoppingBag size={36} className="text-slate-350" />
        <p className="text-sm text-slate-500">{t("cart:order_empty")}</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 font-heading font-bold text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-all border-0 shadow-sm"
        >
          {t("cart:go_shopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 text-left">
        {t("cart:order_history_title")}
      </h3>

      <div className="flex flex-col gap-4">
        {orders.map((ord) => (
          <div
            key={ord._id}
            className="p-5 md:p-6 bg-white border border-slate-200/80 rounded shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex flex-col gap-1.5 min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                  {t("cart:order_id")}: {ord.orderId}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {new Date(ord.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 font-semibold mt-1">
                {ord.items.map((item, idx) => (
                  <span
                    key={item._id || idx}
                    className="flex items-center gap-1"
                  >
                    {item.product ? (
                      <Link
                        to={`/products/${
                          item.product.slug ||
                          item.product.name.en
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                        }`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors truncate max-w-[200px]"
                      >
                        {item.product.name[currentLang] ||
                          item.product.name["en"]}{" "}
                        (x{item.quantity})
                      </Link>
                    ) : (
                      <span className="text-slate-500">
                        Item (x{item.quantity})
                      </span>
                    )}
                    {idx < ord.items.length - 1 && (
                      <span className="text-slate-400">,</span>
                    )}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-1 text-xs">
                <span className="font-bold text-slate-700">
                  ₹{ord.totalAmount}
                </span>
                <span className="text-slate-400 font-semibold">|</span>
                <span className="text-slate-500 font-semibold">
                  Pay: {ord.paymentType}
                </span>
              </div>
            </div>

            <div className="flex items-start sm:items-end flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
              <div className="flex gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ord.paymentStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : ord.paymentStatus === "Failed"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {getPaymentStatusText(ord.paymentStatus)}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ord.deliveryStatus === "Delivered"
                      ? "bg-emerald-100 text-emerald-700"
                      : ord.deliveryStatus === "Cancelled"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {getDeliveryStatusText(ord.deliveryStatus)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-1.5 w-full sm:w-auto">
                <Link
                  to={`/order-tracking/${ord._id}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors w-full sm:w-auto text-center"
                >
                  {t("cart:track_order")} <ArrowRight size={12} />
                </Link>
                {["Order Placed", "Confirmed", "Packed", "Waiting Pickup"].includes(
                  ord.deliveryStatus,
                ) && (
                  <button
                    type="button"
                    onClick={() => handleCancelClick(ord)}
                    className="px-3 py-1 text-[11px] font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded cursor-pointer transition-all w-full sm:w-auto text-center"
                  >
                    {t("cart:cancel_order")}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(OrdersHistoryTab);

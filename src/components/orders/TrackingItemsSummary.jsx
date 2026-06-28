import React from "react";
import { ShoppingBag } from "lucide-react";

const TrackingItemsSummary = ({ order, currentLang }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded shadow-sm h-fit text-left">
      <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
        <ShoppingBag size={18} className="text-blue-600" /> Items Ordered
      </h3>
      <div className="flex flex-col gap-4">
        {order.items.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0"
          >
            <div className="flex gap-4 items-center">
              <img
                src={item.product?.images[0] || "/placeholder-product.png"}
                alt={item.product?.name.en}
                className="w-12 h-12 rounded bg-slate-50 border border-slate-100 object-contain flex-shrink-0 mix-blend-multiply"
              />
              <div>
                <p className="font-heading text-sm font-semibold text-slate-800">
                  {item.product?.name[currentLang] || item.product?.name.en}
                </p>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Price: ₹{item.price} | Qty: {item.quantity}
                </span>
              </div>
            </div>
            <span className="font-bold text-sm text-slate-800">
              ₹{item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-t border-slate-100 my-4" />

      {(() => {
        const itemsSubtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        return (
          <>
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-700">₹{itemsSubtotal}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-600 mb-2 font-semibold">
                <span>Discount (Online Payment)</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span>Delivery</span>
              <span className={order.deliveryCharge > 0 ? "font-semibold text-slate-700" : "text-emerald-600 font-bold"}>
                {order.deliveryCharge > 0 ? `₹${order.deliveryCharge}` : "FREE"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-slate-800 mt-4">
              <span>Total</span>
              <span className="text-base text-blue-600">₹{order.totalAmount}</span>
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default React.memo(TrackingItemsSummary);

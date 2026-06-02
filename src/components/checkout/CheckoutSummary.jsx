import React from "react";

const CheckoutSummary = ({ cartItems, cartSubtotal, currentLang, t }) => {
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm h-fit w-full">
      <h3 className="font-heading text-base font-bold text-blue-600 mb-5">
        {t("cart:items_summary")}
      </h3>
      <div className="flex flex-col gap-3">
        {cartItems.map((item) => (
          <div
            key={item.product._id}
            className="flex justify-between items-center text-xs text-slate-600"
          >
            <span className="max-w-[80%] truncate">
              {item.product.name[currentLang]}{" "}
              <strong className="text-slate-500 font-bold ml-1">
                x{item.quantity}
              </strong>
            </span>
            <span className="font-semibold text-slate-800">
              ₹{item.product.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-t border-slate-100 my-4" />

      <div className="flex justify-between items-center text-xs text-slate-600 mb-3">
        <span>{t("cart:subtotal")}</span>
        <span className="font-semibold text-slate-800">
          ₹{cartSubtotal}
        </span>
      </div>
      <div className="flex justify-between items-center text-xs text-slate-600 mb-4">
        <span>{t("cart:delivery_charges")}</span>
        <span className="text-emerald-600 font-bold">{t("cart:free")}</span>
      </div>

      <hr className="border-t border-slate-100 my-4" />

      <div className="flex justify-between items-center text-sm font-bold text-slate-800">
        <span>{t("cart:total")}</span>
        <span className="text-lg text-blue-600">
          ₹{cartSubtotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default React.memo(CheckoutSummary);

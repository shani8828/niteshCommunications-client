import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CartSummary = ({ cartSubtotal, user, t }) => {
  return (
    <div className="p-6 md:p-8 bg-white border border-slate-200 rounded shadow-sm h-fit text-left">
      <h3 className="font-heading text-base font-bold text-blue-600 mb-5">
        {t("cart:items_summary")}
      </h3>

      <div className="flex justify-between items-center text-xs text-slate-600 mb-3">
        <span>{t("cart:subtotal")}</span>
        <span className="font-semibold text-slate-800">₹{cartSubtotal}</span>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-600 mb-3">
        <span>{t("cart:taxes")}</span>
        <span className="text-emerald-600 font-bold">₹ 0</span>
      </div>
      <div className="flex justify-between items-center text-xs text-slate-600 mb-4">
        <span>{t("cart:delivery_charges")}</span>
        <span className="text-emerald-600 font-bold">{t("cart:free")}</span>
      </div>

      <hr className="border-t border-slate-100 my-4" />

      <div className="flex justify-between items-center text-sm font-bold text-slate-800 mb-6">
        <span>{t("cart:total")}</span>
        <span className="text-lg text-blue-600">₹{cartSubtotal}</span>
      </div>

      {user ? (
        <Link
          to="/checkout"
          className="w-full py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer border-0 text-center transition-all"
        >
          {t("cart:checkout_btn")} <ArrowRight size={16} />
        </Link>
      ) : (
        <div className="flex flex-col gap-2">
          <Link
            to="/login"
            className="w-full py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md text-center cursor-pointer border-0 transition-all"
          >
            {t("cart:login_to_checkout")}
          </Link>
          <p className="text-[10px] text-slate-400 text-center font-semibold mt-1">
            {t("cart:verified_account_required")}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(CartSummary);

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";

const Cart = () => {
  const { t, i18n } = useTranslation(["cart", "common"]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal } = useCart();

  const currentLang = i18n.language || "hi";

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center flex flex-col items-center bg-white">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex justify-center items-center mb-4">
          <ShoppingCart size={32} className="text-blue-600" />
        </div>
        <h2 className="font-heading text-2xl font-extrabold text-slate-800">
          {t("cart:empty_cart")}
        </h2>
        <p className="text-sm text-slate-500 max-w-xs mt-2 mb-6">
          {t("cart:empty_desc")}
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 border-0"
        >
          {t("cart:go_shopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white">
      <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-6">
        {t("common:cart")}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8">
        {/* Left Column: Cart Items List */}
        <div className="flex flex-col gap-4">
          {cartItems.map((item) => (
            <div
              key={item.product._id}
              className="flex items-center p-5 gap-6 flex-wrap bg-white border border-slate-200 rounded-2xl shadow-sm"
            >
              {/* Product Thumbnail */}
              <div className="w-[70px] h-[70px] bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name.en}
                  className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply"
                />
              </div>

              {/* Title & Price */}
              <div className="flex-1 min-w-[150px] flex flex-col">
                <Link to={`/products/${item.product.slug || item.product._id}`}>
                  <h4 className="font-heading text-sm font-semibold text-slate-800 truncate hover:text-blue-600 transition-colors">
                    {item.product.name[currentLang]}
                  </h4>
                </Link>
                <span className="text-xs text-slate-500 mt-1 font-semibold">
                  ₹{item.product.price}
                </span>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                <button
                  onClick={() =>
                    updateQuantity(item.product._id, item.quantity - 1)
                  }
                  className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 flex"
                >
                  <Minus size={12} />
                </button>
                <span className="text-xs text-slate-700 font-bold min-w-[20px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.product._id, item.quantity + 1)
                  }
                  className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 flex"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Line Total */}
              <div className="min-w-[85px] text-right">
                <span className="font-heading font-extrabold text-sm text-blue-600">
                  ₹{item.product.price * item.quantity}
                </span>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.product._id)}
                className="bg-transparent border-0 cursor-pointer p-1 flex"
              >
                <Trash2
                  size={16}
                  className="text-rose-600 hover:text-rose-500"
                />
              </button>
            </div>
          ))}
        </div>

        {/* Right Column: Checkout Box Summary */}
        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm h-fit">
          <h3 className="font-heading text-base font-bold text-blue-600 mb-5">
            {t("cart:items_summary")}
          </h3>

          <div className="flex justify-between items-center text-xs text-slate-600 mb-3">
            <span>{t("cart:subtotal")}</span>
            <span className="font-semibold text-slate-800">
              ₹{cartSubtotal}
            </span>
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
              className="w-full py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer border-0 text-center"
            >
              {t("cart:checkout_btn")} <ArrowRight size={16} />
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md text-center cursor-pointer border-0"
              >
                Login to Checkout
              </Link>
              <p className="text-[10px] text-slate-400 text-center font-semibold mt-1">
                You must have a verified account to place orders.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

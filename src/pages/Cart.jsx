import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart } from "lucide-react";

// Modular components
import CartItemCard from "../components/cart/CartItemCard";
import CartSummary from "../components/cart/CartSummary";

const Cart = () => {
  const { t, i18n } = useTranslation(["cart", "common"]);
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal } = useCart();

  const currentLang = i18n.language || "hi";

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center flex flex-col items-center bg-white animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex justify-center items-center mb-4">
          <ShoppingCart size={32} className="text-blue-600" />
        </div>
        <h2 className="font-heading text-2xl font-extrabold text-slate-800">
          {t("cart:empty_cart")}
        </h2>
        <p className="text-sm text-slate-500 max-w-xs mt-2 mb-6 leading-relaxed">
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
      <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-6 text-left">
        {t("common:cart")}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8">
        {/* Left Column: Cart Items List */}
        <div className="flex flex-col gap-4">
          {cartItems.map((item) => (
            <CartItemCard
              key={item.product._id}
              item={item}
              currentLang={currentLang}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
            />
          ))}
        </div>

        {/* Right Column: Checkout Box Summary */}
        <CartSummary
          cartSubtotal={cartSubtotal}
          user={user}
          t={t}
        />
      </div>
    </div>
  );
};

export default Cart;

import React from "react";
import { Star, ShoppingCart, Heart, ShieldAlert } from "lucide-react";

const ProductSpecs = ({
  product,
  isWishlisted,
  savingsPercent,
  addToCart,
  toggleWishlist,
  navigate,
  t,
  currentLang,
  isInCart,
}) => {
  return (
    <div className="flex flex-col gap-4 items-start text-left">
      <span className="bg-blue-50 text-blue-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded mt-1 tracking-wider border border-blue-100">
        {product.category?.name[currentLang]}
      </span>
      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
        {product.name[currentLang]}
      </h1>

      {/* Ratings display */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              size={16}
              fill={
                idx < Math.round(product.ratingsAverage)
                  ? "#f59e0b"
                  : "none"
              }
              color="#f59e0b"
            />
          ))}
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          {product.ratingsAverage} ({product.ratingsCount} reviews)
        </span>
      </div>

      <hr className="border-t border-slate-100 w-full" />

      {/* Pricing Box */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-extrabold text-blue-600">
          ₹{product.price}
        </span>
        {product.originalPrice > product.price && (
          <>
            <span className="text-lg text-slate-400 line-through">
              ₹{product.originalPrice}
            </span>
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded">
              Save {savingsPercent}%
            </span>
          </>
        )}
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        {product.description[currentLang]}
      </p>

      {/* Stock Availability */}
      <div className="flex gap-2 items-center text-sm">
        <span className="text-slate-500 font-semibold">Availability:</span>
        <span
          className={`font-bold ${
            product.availabilityStatus === "In Stock"
              ? "text-emerald-600"
              : product.availabilityStatus === "Low Stock"
                ? "text-amber-600"
                : "text-rose-600"
          }`}
        >
          {product.availabilityStatus === "In Stock"
            ? t("product:in_stock")
            : product.availabilityStatus === "Low Stock"
              ? t("product:low_stock")
              : t("product:out_of_stock")}
        </span>
      </div>

      {/* Return Policy alert */}
      <div className="w-full flex items-center gap-2 bg-blue-50/50 border border-blue-100/50 rounded px-4 py-3 text-xs text-blue-800">
        <ShieldAlert size={16} className="text-blue-600 flex-shrink-0" />
        <span>
          Policy: <strong>{product.returnPolicy}</strong> options apply for
          this accessory.
        </span>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex gap-4 w-full flex-wrap mt-6">
        {product.stock === 0 ? (
          <button
            className="flex-1 py-3 font-heading font-bold text-sm bg-slate-100 text-slate-400 border border-slate-200 rounded-full cursor-not-allowed outline-none"
            disabled
            type="button"
          >
            {t("product:out_of_stock")}
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                if (isInCart) {
                  navigate("/cart");
                } else {
                  addToCart(product);
                }
              }}
              className="flex-1 py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer flex justify-center items-center gap-2 border-0 outline-none transition-all"
              type="button"
            >
              <ShoppingCart size={16} />
              {isInCart ? t("product:go_to_cart") : t("product:add_to_cart")}
            </button>
            <button
              onClick={() => {
                addToCart(product);
                navigate("/cart");
              }}
              className="flex-1 py-3 font-heading font-bold text-sm bg-white text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 cursor-pointer flex justify-center items-center outline-none transition-all"
              type="button"
            >
              {t("product:buy_now")}
            </button>
          </>
        )}

        <button
          onClick={() => toggleWishlist(product)}
          className={`w-11 h-11 rounded-full flex justify-center items-center cursor-pointer border transition-all outline-none ${
            isWishlisted
              ? "border-rose-300 bg-rose-50/50"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
          title={
            currentLang === "hi"
              ? "विशलिस्ट में जोड़ें/हटाएं"
              : "Add/Remove from Wishlist"
          }
          type="button"
        >
          <Heart
            size={20}
            fill={isWishlisted ? "#ef4444" : "none"}
            color={isWishlisted ? "#ef4444" : "#94a3b8"}
          />
        </button>
      </div>
    </div>
  );
};

export default React.memo(ProductSpecs);

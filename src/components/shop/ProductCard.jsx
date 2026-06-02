import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";

const ProductCard = ({
  product,
  isWishlisted,
  addToCart,
  toggleWishlist,
  currentLang,
  t,
}) => {
  const hasDiscount = product.originalPrice > product.price;

  return (
    <div
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "0 320px",
      }}
      className="p-4 flex flex-col gap-3 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all relative group w-full"
    >
      {/* Floating Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-6 right-6 w-8 h-8 rounded-full border flex justify-center items-center cursor-pointer transition-all z-10 shadow-sm ${
          isWishlisted
            ? "border-rose-200 bg-rose-50 text-rose-500"
            : "border-slate-200 bg-white text-slate-400 hover:text-rose-500 hover:scale-105"
        }`}
        title={currentLang === "hi" ? "विशलिस्ट में जोड़ें/हटाएं" : "Add/Remove from Wishlist"}
      >
        <Heart
          size={15}
          fill={isWishlisted ? "#ef4444" : "none"}
          color={isWishlisted ? "#ef4444" : "currentColor"}
        />
      </button>

      {/* Image Wrap */}
      <Link
        to={`/products/${product.slug || product._id}`}
        className="bg-slate-50 rounded-xl h-[170px] flex justify-center items-center overflow-hidden border border-slate-100"
      >
        <img
          src={product.images[0]}
          alt={product.name.en}
          className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply"
          loading="lazy"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
            {product.category?.name[currentLang] || product.category?.name?.en}
          </span>
        </div>

        <Link to={`/products/${product.slug || product._id}`}>
          <h4 className="font-heading text-sm font-semibold text-slate-800 truncate hover:text-blue-600 transition-colors mt-1">
            {product.name[currentLang] || product.name.en}
          </h4>
        </Link>

        <div className="flex gap-2 items-center mt-1 mb-3">
          <span className="text-base font-extrabold text-blue-600">
            ₹{product.price}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {product.stock === 0 ? (
          <button
            className="w-full py-2 font-heading font-semibold text-xs bg-slate-100 text-slate-400 border border-slate-200 rounded-lg cursor-not-allowed"
            disabled
          >
            {t("product:out_of_stock")}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full py-2 font-heading font-semibold text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer border-0"
          >
            <ShoppingCart size={14} />
            {t("product:add_to_cart")}
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.isWishlisted === nextProps.isWishlisted &&
    prevProps.currentLang === nextProps.currentLang &&
    prevProps.product._id === nextProps.product._id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.stock === nextProps.product.stock &&
    prevProps.product.originalPrice === nextProps.product.originalPrice &&
    prevProps.product.name?.[prevProps.currentLang] === nextProps.product.name?.[nextProps.currentLang] &&
    prevProps.product.category?.name?.[prevProps.currentLang] === nextProps.product.category?.name?.[nextProps.currentLang] &&
    prevProps.product.images?.[0] === nextProps.product.images?.[0]
  );
});

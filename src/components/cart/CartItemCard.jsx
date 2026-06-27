import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";

const CartItemCard = ({
  item,
  currentLang,
  updateQuantity,
  removeFromCart,
}) => {
  return (
    <div className="flex items-center p-4 gap-4 sm:gap-6 flex-wrap bg-white border border-slate-200 rounded shadow-sm hover:shadow-md transition-all duration-200 animate-fadeIn">
      {/* Product Thumbnail */}
      <div className="w-[70px] h-[70px] bg-slate-50 border border-slate-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img
          src={
            item.product.images && item.product.images[0]
              ? item.product.images[0]
              : "/placeholder-product.png"
          }
          alt={item.product.name.en}
          className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply"
          loading="lazy"
        />
      </div>

      {/* Title & Price */}
      <div className="flex-1 min-w-[150px] flex flex-col text-left">
        <Link
          to={`/products/${item.product.slug || item.product._id}`}
          state={{ product: item.product }}
        >
          <h4 className="font-heading text-sm font-semibold text-slate-800 truncate hover:text-blue-600 transition-colors">
            {item.product.name[currentLang] || item.product.name.en}
          </h4>
        </Link>
        <span className="text-xs text-slate-500 mt-1 font-semibold">
          ₹{item.product.price}
        </span>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center bg-slate-50 border border-slate-200 rounded overflow-hidden">
        <button
          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
          className="bg-transparent border-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer px-2.5 py-1.5 flex outline-none transition-all"
          type="button"
        >
          <Minus size={12} />
        </button>
        <span className="text-xs text-slate-700 font-bold min-w-[24px] text-center select-none">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
          className="bg-transparent border-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer px-2.5 py-1.5 flex outline-none transition-all"
          type="button"
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
        className="bg-transparent border-0 cursor-pointer p-2 rounded hover:bg-rose-50 transition-all flex outline-none"
        type="button"
      >
        <Trash2 size={16} className="text-rose-600" />
      </button>
    </div>
  );
};

export default React.memo(CartItemCard);

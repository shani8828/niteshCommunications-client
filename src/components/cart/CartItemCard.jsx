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
    <div className="flex items-center p-5 gap-6 flex-wrap bg-white border border-slate-200 rounded-2xl shadow-sm animate-fadeIn">
      {/* Product Thumbnail */}
      <div className="w-[70px] h-[70px] bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img
          src={item.product.images && item.product.images[0] ? item.product.images[0] : '/placeholder-product.png'}
          alt={item.product.name.en}
          className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply"
          loading="lazy"
        />
      </div>

      {/* Title & Price */}
      <div className="flex-1 min-w-[150px] flex flex-col text-left">
        <Link to={`/products/${item.product.slug || item.product._id}`} state={{ product: item.product }}>
          <h4 className="font-heading text-sm font-semibold text-slate-800 truncate hover:text-blue-600 transition-colors">
            {item.product.name[currentLang] || item.product.name.en}
          </h4>
        </Link>
        <span className="text-xs text-slate-500 mt-1 font-semibold">
          ₹{item.product.price}
        </span>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
        <button
          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
          className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 flex outline-none"
          type="button"
        >
          <Minus size={12} />
        </button>
        <span className="text-xs text-slate-700 font-bold min-w-[20px] text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
          className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 flex outline-none"
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
        className="bg-transparent border-0 cursor-pointer p-1 flex outline-none"
        type="button"
      >
        <Trash2 size={16} className="text-rose-600 hover:text-rose-500" />
      </button>
    </div>
  );
};

export default React.memo(CartItemCard);

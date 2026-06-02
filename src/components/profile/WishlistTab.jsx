import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';

const WishlistTab = ({
  wishlist,
  toggleWishlist,
  addToCart,
  isHindi,
  currentLang,
}) => {
  if (wishlist.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col items-center gap-4 animate-fadeIn">
        <Heart size={36} className="text-slate-300" />
        <p className="text-sm text-slate-500">
          {isHindi ? ' आपकी विशलिस्ट खाली है।' : 'Your wishlist is empty.'}
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 font-heading font-bold text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all border-0 shadow-sm"
        >
          {isHindi ? 'शॉपिंग करें' : 'Start Shopping'}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        {isHindi ? 'मेरी विशलिस्ट' : 'My Wishlist'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wishlist.map((prod) => (
          <div
            key={prod._id}
            className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col relative"
          >
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(prod)}
              className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white text-rose-500 hover:text-rose-600 rounded-full border border-slate-100 shadow-sm transition-all backdrop-blur-sm cursor-pointer"
              title={isHindi ? "विशलिस्ट से हटाएं" : "Remove from Wishlist"}
            >
              <Trash2 size={14} />
            </button>

            {/* Product Image */}
            <div className="aspect-square w-full bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
              <img
                src={prod.images && prod.images[0] ? prod.images[0] : '/placeholder-product.png'}
                alt={prod.name[currentLang] || prod.name['en']}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                loading="lazy"
              />
              {prod.stock === 0 && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-rose-200 uppercase tracking-wider">
                    {isHindi ? 'आउट ऑफ स्टॉक' : 'Out of Stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-grow justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                  {typeof prod.category === 'object' ? (prod.category?.name[currentLang] || prod.category?.name?.en || 'N/A') : (prod.category || 'N/A')}
                </span>
                <Link to={`/products/${prod.slug || prod._id}`}>
                  <h4 className="font-heading text-sm font-bold text-slate-800 hover:text-blue-600 line-clamp-1 transition-colors">
                    {prod.name[currentLang] || prod.name['en']}
                  </h4>
                </Link>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {prod.description[currentLang] || prod.description['en']}
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-slate-800">₹{prod.price}</span>
                  {prod.originalPrice && prod.originalPrice > prod.price && (
                    <span className="text-xs text-slate-400 line-through">₹{prod.originalPrice}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(prod)}
                  disabled={prod.stock === 0}
                  className="w-full py-2 px-3 text-xs font-heading font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-0 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag size={12} />
                  <span>{isHindi ? 'कार्ट में जोड़ें' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(WishlistTab);

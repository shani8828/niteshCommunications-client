import React from "react";
import { Link } from "react-router-dom";

const RelatedProducts = ({ related, currentLang, t }) => {
  if (!related || related.length === 0) return null;

  return (
    <div className="mt-16">
      <h3 className="font-heading text-lg font-bold text-slate-800 mb-6">
        {t("product:related_products")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {related.map((item) => (
          <div
            key={item._id}
            className="p-3 text-center bg-white border border-slate-200 rounded-xl hover:shadow-sm"
          >
            <Link to={`/products/${item.slug || item._id}`}>
              <div className="h-[110px] flex justify-center items-center overflow-hidden bg-slate-50 border border-slate-100 rounded-lg mb-2">
                <img
                  src={item.images[0]}
                  alt={item.name.en}
                  className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply"
                  loading="lazy"
                />
              </div>
              <h4 className="font-heading text-xs font-semibold text-slate-700 truncate hover:text-blue-600 transition-colors">
                {item.name[currentLang] || item.name.en}
              </h4>
              <p className="text-xs font-bold text-blue-600 mt-1">
                ₹{item.price}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RelatedProducts);

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, Home, ShoppingBag } from "lucide-react";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50/50 px-6 py-12">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl">
        <div
          className="animate-pop-in w-20 h-20 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner"
        >
          <AlertCircle size={40} />
        </div>

        <div
          className="animate-fade-up flex flex-col gap-2"
          style={{ "--fade-up-distance": "10px", animationDuration: "0.3s", animationDelay: "0.2s" }}
        >
          <h1 className="text-7xl font-extrabold text-slate-900 leading-none">
            404
          </h1>
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            पेज नहीं मिला / Page Not Found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mt-1">
            क्षमा करें, जिस पेज को आप ढूंढ रहे हैं वह मौजूद नहीं है या हटा दिया
            गया है।
            <br />
            <span className="text-[11px] text-slate-400 font-normal">
              Sorry, the page you are looking for does not exist or has been
              moved.
            </span>
          </p>
        </div>

        <div
          className="animate-fade-up flex flex-col sm:flex-row gap-3 w-full mt-4"
          style={{ "--fade-up-distance": "15px", animationDuration: "0.3s", animationDelay: "0.4s" }}
        >
          <Link
            to="/"
            className="flex-1 py-3 px-4 font-heading font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 border-0 cursor-pointer"
          >
            <Home size={14} />
            <span>मुख्य पृष्ठ / Go Home</span>
          </Link>
          <Link
            to="/shop"
            className="flex-1 py-3 px-4 font-heading font-bold text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>दुकान / Visit Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";

const TrackingActions = ({
  order,
  isWithin24Hours,
  hasReturnableItems,
  hasReplaceableItems,
  currentLang,
}) => {
  const isReturnOrReplaceRequested =
    order.deliveryStatus === "Return Requested" ||
    order.deliveryStatus === "Replacement Requested";

  if (order.deliveryStatus === "Delivered" && isWithin24Hours && (hasReturnableItems || hasReplaceableItems)) {
    return (
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded shadow-sm flex flex-col gap-4 text-left">
        <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
          <RefreshCw size={18} className="text-blue-600 animate-pulse" /> Order Actions / ऑर्डर क्रियाएं
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {currentLang === "hi"
            ? "आप डिलीवरी के 24 घंटे के भीतर पात्र वस्तुओं के लिए रिटर्न या रिप्लेसमेंट का अनुरोध कर सकते हैं।"
            : "You can request a return or replacement for eligible items within 24 hours of delivery."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {hasReturnableItems && (
            <Link
              to={`/order-tracking/${order._id}/return`}
              className="flex-1 text-center py-2.5 px-4 font-heading font-bold text-xs bg-red-600 text-white rounded hover:bg-red-700 shadow-md shadow-red-500/10 cursor-pointer block border-0 transition-colors"
            >
              {currentLang === "hi" ? "रिटर्न और रिफंड" : "Request Return & Refund"}
            </Link>
          )}
          {hasReplaceableItems && (
            <Link
              to={`/order-tracking/${order._id}/replace`}
              className="flex-1 text-center py-2.5 px-4 font-heading font-bold text-xs bg-amber-600 text-white rounded hover:bg-amber-700 shadow-md shadow-amber-500/10 cursor-pointer block border-0 transition-colors"
            >
              {currentLang === "hi" ? "रिप्लेसमेंट का अनुरोध" : "Request Replacement"}
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (isReturnOrReplaceRequested) {
    return (
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded shadow-sm flex flex-col gap-4 text-left">
        <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
          <RefreshCw size={18} className="text-blue-600" /> Order Actions / ऑर्डर क्रियाएं
        </h3>
        <div className="p-4 bg-blue-50 border border-blue-100 rounded">
          <p className="text-xs text-blue-800 font-semibold leading-relaxed">
            {order.deliveryStatus === "Return Requested"
              ? currentLang === "hi"
                ? "आपका रिटर्न और रिफंड अनुरोध प्रक्रिया में है। हमारी टीम जल्द ही आपसे संपर्क करेगी।"
                : "Your return and refund request is currently being processed. Our support team will contact you shortly."
              : currentLang === "hi"
                ? "आपका रिप्लेसमेंट अनुरोध प्रक्रिया में है। हमारी टीम जल्द ही आपसे संपर्क करेगी।"
                : "Your replacement request is currently being processed. Our support team will contact you shortly."}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default React.memo(TrackingActions);

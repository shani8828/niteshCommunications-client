import React from "react";
import { User, Phone, MapPin } from "lucide-react";

const TrackingCustomerInfo = ({ order }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-4 text-left">
      <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
        <User size={18} className="text-blue-600" /> Customer & Delivery
      </h3>
      <div className="flex flex-col gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <User size={14} className="text-slate-400" />
          <span>
            Customer Name: <strong>{order.user?.name}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-slate-400" />
          <span>Contact Phone: {order.customerPhone}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-slate-400 mt-0.5" />
          <span className="leading-relaxed">
            Address: {order.customerAddress}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TrackingCustomerInfo);

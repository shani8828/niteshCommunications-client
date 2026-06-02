import React from "react";
import CscServiceCard from "./CscServiceCard";

const CscServicesGrid = ({ servicesList, loading, currentLang }) => {
  if (servicesList.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-slate-500 font-semibold">
        {currentLang === "hi" ? "कोई सेवा उपलब्ध नहीं है।" : "No services available."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        {currentLang === "hi" ? "सभी डिजिटल सेवाएं और दस्तावेज" : "All Digital Services & Documents"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesList.map((item) => (
          <CscServiceCard key={item._id} item={item} currentLang={currentLang} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(CscServicesGrid);

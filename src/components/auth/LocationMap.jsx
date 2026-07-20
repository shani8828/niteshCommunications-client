import React from "react";

const LocationMap = ({ coordinates }) => {
  if (!coordinates) return null;
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-inner h-32 w-full relative">
      <iframe
        title="Location Map"
        width="100%"
        height="100%"
        frameBorder="0"
        src={`https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`}
        allowFullScreen
      />
    </div>
  );
};

export default React.memo(LocationMap);

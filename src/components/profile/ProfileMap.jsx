import React from 'react';

const ProfileMap = ({ latitude, longitude }) => {
  return (
    <div className="mt-3 rounded overflow-hidden border border-slate-200 shadow-inner h-44 w-full relative">
      <iframe
        loading="lazy"
        title="Profile Location Map"
        width="100%"
        height="100%"
        frameBorder="0"
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
        allowFullScreen
      />
    </div>
  );
};

export default React.memo(ProfileMap, (prevProps, nextProps) => {
  return (
    prevProps.latitude === nextProps.latitude &&
    prevProps.longitude === nextProps.longitude
  );
});

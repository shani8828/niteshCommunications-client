import React from "react";

const ShopMap = () => {
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-inner h-32 w-full relative">
      <iframe
        title="Shop Location Map"
        width="100%"
        height="100%"
        frameBorder="0"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1651.7408662594805!2d82.01162535484514!3d26.671605216106993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a11003ad51177%3A0xe8ae78ae027dc07!2sNitesh%20Communications!5e0!3m2!1sen!2sin!4v1780307010471!5m2!1sen!2sin"
        allowFullScreen
      />
    </div>
  );
};

export default React.memo(ShopMap);

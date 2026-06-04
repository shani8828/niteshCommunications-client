import React from "react";
import { Share2 } from "lucide-react";

const ProductImagesGallery = ({
  images,
  name,
  activeImage,
  setActiveImage,
  handleShare,
  currentLang,
}) => {
  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="relative bg-slate-50 border border-slate-200 rounded-2xl h-[350px] flex justify-center items-center overflow-hidden">
        <img
          src={activeImage}
          alt={name.en || name}
          className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply rounded-lg"
          loading="lazy"
        />

        <button
          onClick={handleShare}
          className="w-11 h-11 rounded-full flex justify-center items-center cursor-pointer border border-slate-200 bg-white hover:bg-slate-50 transition-colors absolute top-4 right-4 outline-none"
          title={currentLang === "hi" ? "शेयर करें" : "Share"}
          type="button"
        >
          <Share2 size={20} className="text-slate-500" />
        </button>
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`w-16 h-16 rounded-xl bg-slate-50 border-2 overflow-hidden flex justify-center items-center cursor-pointer transition-all outline-none flex-shrink-0 ${
                activeImage === img ? "border-blue-600" : "border-slate-200"
              }`}
              type="button"
            >
              <img
                src={img}
                alt="Thumbnail"
                className="max-w-full max-h-full object-contain mix-blend-multiply"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductImagesGallery);

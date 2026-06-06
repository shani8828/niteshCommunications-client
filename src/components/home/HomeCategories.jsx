import React from "react";
import { Link } from "react-router-dom";

const categoriesList = [
  {
    id: "tempered-glass",
    name: {
      en: "Tempered Glass",
      hi: "टेम्पर्ड ग्लास",
    },
    image:
      "https://res.cloudinary.com/dd1tmrvu0/image/upload/q_auto/f_auto/v1780765519/tempered-glass_ob0pgf.webp",
    desc: {
      en: " Protect your phone screen",
      hi: "फोन स्क्रीन को बचाएं",
    },
  },
  {
    id: "headphone",
    name: {
      en: "Headphone",
      hi: "हेडफोन",
    },
    image:
      "https://res.cloudinary.com/dd1tmrvu0/image/upload/q_auto/f_auto/v1780765713/headphone_xqowtu.avif",
    desc: {
      en: "Audio gear",
      hi: "ऑडिओ गियर",
    },
  },
  {
    id: "t-shirt",
    name: {
      en: "T-Shirt",
      hi: "टी-शर्ट",
    },
    image:
      "https://res.cloudinary.com/dd1tmrvu0/image/upload/q_auto/f_auto/v1780766046/tshirt_xhxlfw.avif",
    desc: {
      en: "Comfortable and trendy apparel",
      hi: "आरामदायक और ट्रेंडी कपड़े",
    },
  },
  {
    id: "phone-cover",
    name: {
      en: "Phone Cover",
      hi: "फोन कवर",
    },
    image:
      "https://res.cloudinary.com/dd1tmrvu0/image/upload/q_auto/f_auto/v1780765813/phoneCover_xjfhu1.webp",
    desc: {
      en: "Protect your phone",
      hi: "अपने फोन को बचाएं",
    },
  },
];

const HomeCategories = ({ currentLang }) => {
  return (
    <section className="w-full bg-gradient-to-b from-white to-slate-50/60 py-20 px-6 border-t border-slate-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl font-extrabold text-slate-900 mb-2 text-center md:text-left">
          {currentLang === "hi"
            ? "श्रेणी के अनुसार खरीदें"
            : "Shop by Category"}
        </h2>
        <p className="text-sm text-slate-500 mb-8 text-center md:text-left">
          {currentLang === "hi"
            ? "हमारे चुनिंदा और लोकप्रिय श्रेणियों के उत्पादों को ब्राउज़ करें"
            : "Browse through our curated and popular product categories"}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {categoriesList.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="p-2 md:p-3 lg:p-4 flex flex-col justify-around h-full gap-2 md:gap-3 lg:gap-4 bg-white border border-slate-200/80 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
            >
              <div className="bg-slate-50 rounded-xl h-[100px] sm:h-[120px] md:h-[150px] lg:h-[180px] flex justify-center items-center overflow-hidden border border-slate-100 relative">
                <img
                  src={cat.image}
                  alt={cat.name.en}
                  className="max-w-[90%] max-h-[90%] object-contain group-hover:scale-105 transition-transform duration-300 rounded-xl"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-evenly items-center flex-grow text-center sm:text-left">
                <h4 className="font-heading  text-[15px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {cat.name[currentLang]}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  {cat.desc[currentLang]}
                </p>
                <div className="w-full py-2.5 mt-4 font-heading font-bold text-xs bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white text-center rounded-xl block transition-all">
                  {currentLang === "hi" ? "प्रोडक्ट देखें" : "View Products"}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/shop" className="flex justify-center items-center mt-10">
          <div className="px-8 py-3.5 font-heading font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 rounded-full text-center transition-all duration-300 shadow-md shadow-blue-500/10">
            {currentLang === "hi" ? "सभी प्रोडक्ट देखें" : "View All Products"}
          </div>
        </Link>
      </div>
    </section>
  );
};

export default React.memo(HomeCategories);

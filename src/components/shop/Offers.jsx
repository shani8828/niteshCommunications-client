import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../utils/api";

const Offers = () => {
  const staticSlides = [
    { _id: "1", image: "/offers/offer_realme.png", url: "/products/realme-15t", title: "Realme 15T Offer" },
    { _id: "2", image: "/offers/offer_headphone.png", url: "/products/p9-headphone", title: "P9 Headphone Offer" },
    { _id: "3", image: "/offers/offer_oppo.png", url: "/products/oppo-reno-15-5g", title: "Oppo Reno 15 Offer" },
    { _id: "4", image: "/offers/offer_moto.png", url: "/products/moto-g67-power-5g", title: "Moto G67 Offer" },
    { _id: "5", image: "/offers/offer_glass.png", url: "/products/moto-g96-5g-uv-glass", title: "Tempered Glass Offer" },
  ];

  const [slides, setSlides] = useState(staticSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await api.get("/offers");
        if (response.data && response.data.length > 0) {
          setSlides(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch active offers, using fallback.", error);
      }
    };
    fetchOffers();
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="w-full h-[160px] sm:h-[200px] md:h-[360px] lg:h-[490px] xl:h-[710px] rounded overflow-hidden relative group shadow-sm border border-slate-100 bg-slate-50 mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Track */}
      <div
        className="flex transition-transform duration-500 ease-out w-full h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide._id} className="min-w-full h-full flex-shrink-0">
            <Link to={slide.url} className="block w-full h-full">
              <img
                src={slide.image}
                alt={slide.title || "Special Offer Banner"}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.01]"
                loading="lazy"
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-800 p-1.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border-0 cursor-pointer flex items-center justify-center hover:scale-105"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-800 p-1.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border-0 cursor-pointer flex items-center justify-center hover:scale-105"
            aria-label="Next Slide"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 border-0 cursor-pointer p-0 ${
                currentIndex === idx ? "bg-blue-600 w-3" : "bg-white/60 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(Offers);

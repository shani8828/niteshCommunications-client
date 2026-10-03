import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCachedData } from "../../utils/cache";
import { fetchActiveOffers } from "../../utils/shopData";
import { cldUrl, cldResponsiveSrcSet } from "../../utils/image";

// Remembers how many offers were live on the last visit, so the banner space is
// only reserved when offers are expected. Reserving it and then collapsing it
// (when there are no offers) shifts the whole product grid.
const HINT_KEY = "offers_count_hint";
const readHint = () => {
  try {
    return Number(localStorage.getItem(HINT_KEY)) || 0;
  } catch {
    return 0;
  }
};
const writeHint = (count) => {
  try {
    localStorage.setItem(HINT_KEY, String(count));
  } catch {
    // Storage unavailable (private mode etc.) - the banner still works.
  }
};

const BANNER_WIDTHS = [640, 960, 1280, 1920];

const Offers = () => {
  const [slides, setSlides] = useState(() => getCachedData("active_offers") || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(() => !getCachedData("active_offers"));
  const [expectOffers] = useState(() => readHint() > 0);

  useEffect(() => {
    let cancelled = false;
    // Shared with the boot-time prefetch; caches the result (empty too) for 5 minutes
    fetchActiveOffers()
      .then((offers) => {
        if (cancelled) return;
        setSlides(offers);
        writeHint(offers.length);
      })
      .catch((error) => console.error("Failed to fetch active offers.", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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

  if (loading) {
    if (!expectOffers) return null;
    return (
      <div className="w-full h-[160px] sm:h-[200px] md:h-[360px] lg:h-[490px] xl:h-[710px] rounded overflow-hidden relative shadow-sm border border-slate-100 bg-slate-50 mb-6 shimmer-bg" />
    );
  }

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
        {slides.map((slide, idx) => (
          <div key={slide._id} className="min-w-full h-full flex-shrink-0">
            <Link to={slide.url} className="block w-full h-full">
              <img
                src={cldUrl(slide.image, 1280)}
                srcSet={cldResponsiveSrcSet(slide.image, BANNER_WIDTHS)}
                sizes="100vw"
                alt={slide.title || "Special Offer Banner"}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.01]"
                // The first slide is the largest element on the page: load it immediately
                loading={idx === 0 ? "eager" : "lazy"}
                fetchpriority={idx === 0 ? "high" : undefined}
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

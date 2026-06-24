import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ShoppingCart, SlidersHorizontal, X } from "lucide-react";

const ShopFiltersHeader = ({
  categories,
  categoriesLoading,
  selectedCategory,
  onCategorySelect,
  sort,
  onSortSelect,
  initialSearch,
  onSearchDebounce,
  minPrice,
  maxPrice,
  onPriceDebounce,
  onReset,
  currentLang,
  t,
}) => {
  const [searchText, setSearchText] = useState(initialSearch);
  const [isScrolled, setIsScrolled] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);

  // Filters Collapsible Panel States
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState(String(minPrice));
  const [maxPriceInput, setMaxPriceInput] = useState(String(maxPrice));

  // Sync internal search input with URL search state
  useEffect(() => {
    setSearchText(initialSearch);
  }, [initialSearch]);

  // Debounce search text updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== initialSearch) {
        onSearchDebounce(searchText);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText, onSearchDebounce, initialSearch]);

  // Handle sticky state detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check categories horizontal scroll boundary
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [categories, categoriesLoading, checkScroll, isScrolled]);

  // Sync price inputs with parent state updates (e.g. on reset triggers)
  useEffect(() => {
    setMinPriceInput(String(minPrice));
  }, [minPrice]);

  useEffect(() => {
    setMaxPriceInput(String(maxPrice));
  }, [maxPrice]);

  // Debounce price updates to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      const minVal = minPriceInput === "" ? 0 : Number(minPriceInput);
      const maxVal = maxPriceInput === "" ? 100000 : Number(maxPriceInput);
      if (minVal !== minPrice || maxVal !== maxPrice) {
        onPriceDebounce(minVal, maxVal);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [minPriceInput, maxPriceInput, onPriceDebounce, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setMinPriceInput("0");
    setMaxPriceInput("100000");
    onReset();
  };

  return (
    <div
      className={`sticky top-[64px] z-40 bg-white/95 backdrop-blur-md transition-all duration-300 -mx-4 md:-mx-8 px-4 md:px-8 border-b border-slate-100 ${
        isScrolled ? "py-1.5 shadow-md shadow-slate-100/50 mb-3" : "py-1.5 mb-3"
      }`}
    >
      <div className="w-full flex flex-col gap-2">
        {/* Row 1: Search Bar & Sorting/Filters Controls */}
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
          {/* Full-width Search Bar */}
          <div className="relative flex-grow w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={
                currentLang === "hi" ? "उत्पादों की खोज करें..." : "Search products..."
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0.5 rounded transition-colors flex items-center justify-center"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Filter Toggle Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`px-3 py-2 bg-slate-50 border rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filtersOpen
                  ? "text-white bg-blue-600 border-blue-600 shadow-md shadow-blue-600/10"
                  : "text-slate-600 hover:bg-slate-100 border-slate-200"
              }`}
            >
              <SlidersHorizontal size={12} /> {t("product:filters")}
            </button>

            <select
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded text-slate-700 outline-none cursor-pointer text-xs font-semibold focus:border-blue-500 focus:bg-white transition-all"
              value={sort}
              onChange={(e) => onSortSelect(e.target.value)}
            >
              <option value="newest">{t("product:sort_default")}</option>
              <option value="priceAsc">{t("product:sort_price_low")}</option>
              <option value="priceDesc">{t("product:sort_price_high")}</option>
            </select>
          </div>
        </div>

        {/* Row 1.5: Collapsible Price Range & Reset Filters Drawer */}
        {filtersOpen && (
          <div className="flex flex-wrap gap-2 items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded animate-fade-in">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                {currentLang === "hi" ? "मूल्य सीमा" : "Price Range"}:
              </span>
              <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full pl-5 pr-1 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 outline-none focus:border-blue-500 font-semibold"
                />
              </div>
              <span className="text-slate-400 text-[10px] font-bold">to</span>
              <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full pl-5 pr-1 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-transparent border-0 text-slate-400 hover:text-blue-600 text-xs cursor-pointer underline font-bold"
            >
              {t("product:reset_filters")}
            </button>
          </div>
        )}

        {/* Row 2: Categories Horizontal scroll */}
        <div className="relative w-full">
          {/* Left Gradient Indicator */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-blue-200 via-white/80 to-transparent pointer-events-none transition-all duration-300 z-10 ${
              canScrollLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            }`}
          />

          {/* Scroll viewport */}
          <div
            ref={scrollRef}
            className="flex gap-0 overflow-x-auto pt-0 pb-0 scrollbar-none scroll-smooth items-center w-full"
          >
            {/* 'All Categories' */}
            <button
              onClick={() => onCategorySelect("")}
              className={`flex flex-col items-center gap-0 pt-1 min-w-[70px] transition-all duration-300 cursor-pointer ${
                selectedCategory === ""
                  ? "bg-gray-300 text-blue-500 border-b-2 border-blue-500/80 font-bold"
                  : "bg-transparent text-slate-700 border-b-2 border-transparent hover:bg-slate-50"
              }`}
            >
              <div
                className={`transition-all duration-300 overflow-hidden flex items-center justify-center flex-shrink-0 ${
                  isScrolled
                    ? "h-0 opacity-0 scale-y-0 pointer-events-none"
                    : "w-10 h-10 rounded bg-blue-50 border border-blue-100"
                }`}
              >
                <ShoppingCart size={16} className="text-blue-600" />
              </div>
              <span className="text-[10px] leading-tight font-bold text-center truncate w-full max-w-[70px] px-0">
                {currentLang === "hi" ? "सभी" : "All"}
              </span>
            </button>

            {/* Mapped Categories */}
            {categoriesLoading
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={`cat-skeleton-${idx}`}
                    className="flex flex-col items-center gap-0 p-0 bg-transparent text-center justify-between animate-pulse pointer-events-none min-w-[70px]"
                  >
                    <div
                      className={`transition-all duration-300 overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-100 rounded ${
                        isScrolled
                          ? "h-0 opacity-0 scale-y-0 pointer-events-none"
                          : "w-10 h-10 border border-slate-100"
                      }`}
                    />
                    <div className="h-2.5 bg-slate-200 rounded w-8 mt-1" />
                  </div>
                ))
              : categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => onCategorySelect(cat.slug || cat._id)}
                    className={`flex flex-col items-center gap-0 pt-1 min-w-[70px] transition-all duration-300 cursor-pointer ${
                      selectedCategory === (cat.slug || cat._id)
                        ? "bg-gray-300 text-blue-500 border-b-2 border-blue-500/80 font-bold"
                        : "bg-transparent text-slate-700 border-b-2 border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`transition-all duration-300 overflow-hidden flex items-center justify-center flex-shrink-0 ${
                        isScrolled
                          ? "h-0 opacity-0 scale-y-0 pointer-events-none"
                          : "w-10 h-10 rounded bg-slate-100 border border-slate-100"
                      }`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name[currentLang] || cat.name.en}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[10px] leading-tight font-bold text-center truncate w-full max-w-[70px] px-0">
                      {cat.name[currentLang] || cat.name.en}
                    </span>
                  </button>
                ))}
          </div>

          {/* Right Gradient Indicator */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-blue-200 via-white/80 to-transparent pointer-events-none transition-all duration-300 z-10 ${
              canScrollRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ShopFiltersHeader);

import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, SlidersHorizontal } from "lucide-react";

const ShopFiltersHeader = ({
  categories,
  selectedCategory,
  onCategorySelect,
  sort,
  onSortSelect,
  initialSearch,
  onSearchDebounce,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  currentLang,
  t,
}) => {
  const [searchText, setSearchText] = useState(initialSearch);

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

  return (
    <div className="w-full">
      {/* 2-Row Horizontal Scrollable Categories Filter */}
      <div className="mb-10 w-full">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-heading font-extrabold uppercase text-slate-400 tracking-wider">
            {currentLang === "hi" ? "श्रेणियां (बाएं-दाएं स्क्रॉल करें)" : "Categories (Scroll horizontally ↔)"}
          </span>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
            {currentLang === "hi" ? "स्लाइड करें ↔" : "Swipe ↔"}
          </span>
        </div>
        <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-3">
          {/* 'All Categories' Button */}
          <button
            onClick={() => onCategorySelect("")}
            className={`flex flex-col items-center gap-1.5 p-2 bg-white border rounded-2xl hover:shadow-md transition-all cursor-pointer text-center h-[90px] w-[90px] min-w-[90px] justify-between ${
              selectedCategory === ""
                ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-100"
                : "border-slate-200"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex-shrink-0 flex items-center justify-center mt-0.5">
              <ShoppingCart size={16} className="text-blue-600" />
            </div>
            <div className="flex-grow flex items-center justify-center mb-0.5">
              <span
                className={`text-[9px] font-extrabold tracking-tight leading-none text-center ${
                  selectedCategory === "" ? "text-blue-600" : "text-slate-800"
                }`}
              >
                {currentLang === "hi" ? "सभी" : "All"}
              </span>
            </div>
          </button>

          {/* Mapped Categories */}
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategorySelect(cat.slug || cat._id)}
              className={`flex flex-col items-center gap-1.5 p-2 bg-white border rounded-2xl hover:shadow-md transition-all cursor-pointer text-center h-[90px] w-[90px] min-w-[90px] justify-between ${
                selectedCategory === (cat.slug || cat._id)
                  ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-100"
                  : "border-slate-200"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center mt-0.5">
                <img
                  src={cat.image}
                  alt={cat.name.en}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-grow flex items-center justify-center mb-0.5">
                <span
                  className={`text-[9px] font-bold tracking-tight line-clamp-2 leading-none text-center ${
                    selectedCategory === (cat.slug || cat._id)
                      ? "text-blue-600"
                      : "text-slate-700"
                  }`}
                >
                  {cat.name[currentLang] || cat.name.en}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Top Bar (Search & Sort) */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8 items-center">
        <div className="relative flex-1 w-full max-w-lg">
          <Search size={16} className="absolute top-3.5 left-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("product:search_placeholder")}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-blue-600 hover:bg-slate-200 flex items-center gap-2 text-sm font-semibold cursor-pointer"
          >
            <SlidersHorizontal size={16} /> {t("product:filters")}
          </button>

          <select
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer text-sm"
            value={sort}
            onChange={(e) => onSortSelect(e.target.value)}
          >
            <option value="newest">{t("product:sort_default")}</option>
            <option value="priceAsc">{t("product:sort_price_low")}</option>
            <option value="priceDesc">{t("product:sort_price_high")}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ShopFiltersHeader);

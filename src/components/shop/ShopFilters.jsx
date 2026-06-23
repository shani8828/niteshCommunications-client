import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, SlidersHorizontal } from "lucide-react";

const ShopFilters = ({
  categories,
  selectedCategory,
  onCategorySelect,
  availableBrands,
  selectedBrand,
  onBrandSelect,
  sort,
  onSortSelect,
  initialSearch,
  onSearchDebounce,
  initialMinPrice,
  initialMaxPrice,
  onPriceDebounce,
  onReset,
  currentLang,
  t,
}) => {
  const [searchText, setSearchText] = useState(initialSearch);
  const [minPriceInput, setMinPriceInput] = useState(String(initialMinPrice));
  const [maxPriceInput, setMaxPriceInput] = useState(String(initialMaxPrice));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync inputs with props (e.g. when reset occurs or search parameters update from URL)
  useEffect(() => {
    setSearchText(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setMinPriceInput(String(initialMinPrice));
  }, [initialMinPrice]);

  useEffect(() => {
    setMaxPriceInput(String(initialMaxPrice));
  }, [initialMaxPrice]);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== initialSearch) {
        onSearchDebounce(searchText);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText, onSearchDebounce, initialSearch]);

  // Debounce price inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      const minVal = minPriceInput === "" ? 0 : Number(minPriceInput);
      const maxVal = maxPriceInput === "" ? 100000 : Number(maxPriceInput);
      if (minVal !== initialMinPrice || maxVal !== initialMaxPrice) {
        onPriceDebounce(minVal, maxVal);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    minPriceInput,
    maxPriceInput,
    onPriceDebounce,
    initialMinPrice,
    initialMaxPrice,
  ]);

  const handleLocalReset = () => {
    setSearchText("");
    setMinPriceInput("0");
    setMaxPriceInput("100000");
    onReset();
  };

  return (
    <div className="w-full">
      {/* 2-Row Horizontal Scrollable Categories Filter */}
      <div className="mb-10 w-full">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-heading font-extrabold uppercase text-slate-400 tracking-wider">
            {currentLang === "hi"
              ? "श्रेणियां (बाएं-दाएं स्क्रॉल करें)"
              : "Categories (Scroll horizontally ↔)"}
          </span>
        </div>
        <div className="grid gap-1 grid-rows-2 grid-flow-col overflow-x-auto pb-3">
          {/* 'All Categories' Button */}
          <button
            onClick={() => onCategorySelect("")}
            className={`flex flex-col items-center gap-1.5 p-2 bg-white border rounded hover:shadow-md transition-all cursor-pointer text-center h-[90px] w-[90px] min-w-[90px] justify-between ${
              selectedCategory === ""
                ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-100"
                : "border-slate-200"
            }`}
          >
            <div className="w-10 h-10 rounded bg-blue-50 border border-blue-100 flex-shrink-0 flex items-center justify-center mt-0.5">
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
              className={`flex flex-col items-center gap-1.5 p-2 bg-white  hover:scale-105 transition-all cursor-pointer text-center h-[90px] w-[90px] min-w-[90px] justify-between ${
                selectedCategory === (cat.slug || cat._id)
                  ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-100"
                  : ""
              }`}
            >
              <div className="w-10 h-10   bg-slate-50  flex-shrink-0 overflow-hidden flex items-center justify-center mt-0.5">
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
        {/* <div className="relative flex-1 w-full max-w-lg">
          <Search size={16} className="absolute top-3.5 left-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("product:search_placeholder")}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div> */}

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden p-2.5 bg-slate-100 border border-slate-200 rounded text-blue-600 hover:bg-slate-200 flex items-center gap-2 text-sm font-semibold cursor-pointer"
          >
            <SlidersHorizontal size={16} /> {t("product:filters")}
          </button>

          <select
            className="px-4 py-3 bg-white border border-slate-200 rounded text-slate-700 outline-none cursor-pointer text-sm"
            value={sort}
            onChange={(e) => onSortSelect(e.target.value)}
          >
            <option value="newest">{t("product:sort_default")}</option>
            <option value="priceAsc">{t("product:sort_price_low")}</option>
            <option value="priceDesc">{t("product:sort_price_high")}</option>
          </select>
        </div>
      </div>

      {/* Sidebar layout column wrappers */}
      <div className="grid gap-1 grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Left Column Filters (Sidebar) */}
        <aside
          className={`${
            mobileFiltersOpen ? "flex" : "hidden"
          } md:flex flex-col gap-6 p-6 bg-slate-50 border border-slate-200 rounded h-fit`}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-heading font-bold text-sm text-blue-600 uppercase tracking-wider">
              {t("product:filters")}
            </h4>
            <button
              type="button"
              onClick={handleLocalReset}
              className="bg-transparent border-0 text-slate-400 hover:text-blue-600 text-xs cursor-pointer underline font-semibold"
            >
              {t("product:reset_filters")}
            </button>
          </div>

          <hr className="border-t border-slate-200" />

          {/* Price Range Inputs */}
          <div className="flex flex-col gap-3">
            <p className="font-heading font-bold text-xs text-slate-700 uppercase tracking-wider">
              {currentLang === "hi" ? "मूल्य सीमा" : "Price Range"}
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {currentLang === "hi" ? "न्यूनतम मूल्य" : "Min Price"}:
                </span>
                <div className="relative w-32">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 text-xs outline-none focus:border-blue-600 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {currentLang === "hi" ? "अधिकतम मूल्य" : "Max Price"}:
                </span>
                <div className="relative w-32">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="100000"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 text-xs outline-none focus:border-blue-600 transition-all font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          {/* {selectedCategory && availableBrands.length > 0 && (
            <>
              <hr className="border-t border-slate-200" />
              <div className="flex flex-col gap-3">
                <p className="font-heading font-bold text-xs text-slate-700 uppercase tracking-wider">
                  {currentLang === "hi" ? "ब्रांड" : "Brands"}
                </p>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                  {availableBrands.map((brandName) => (
                    <label
                      key={brandName}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrand === brandName}
                        onChange={() => onBrandSelect(brandName)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{brandName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )} */}
        </aside>

        {/* Content container placeholder for child mapping in parent grid layout */}
        <div className="w-full hidden md:block" />
      </div>
    </div>
  );
};

export default React.memo(ShopFilters);

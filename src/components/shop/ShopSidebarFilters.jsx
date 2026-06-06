import React, { useState, useEffect } from "react";

const ShopSidebarFilters = ({
  selectedCategory,
  availableBrands,
  selectedBrand,
  onBrandSelect,
  initialMinPrice,
  initialMaxPrice,
  onPriceDebounce,
  onReset,
  mobileFiltersOpen,
  currentLang,
  t,
}) => {
  const [minPriceInput, setMinPriceInput] = useState(String(initialMinPrice));
  const [maxPriceInput, setMaxPriceInput] = useState(String(initialMaxPrice));

  // Sync inputs with parent state updates (e.g. on reset triggers)
  useEffect(() => {
    setMinPriceInput(String(initialMinPrice));
  }, [initialMinPrice]);

  useEffect(() => {
    setMaxPriceInput(String(initialMaxPrice));
  }, [initialMaxPrice]);

  // Debounce price updates to parent
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

  const handleResetFilters = () => {
    setMinPriceInput("0");
    setMaxPriceInput("100000");
    onReset();
  };

  return (
    <aside
      className={`${
        mobileFiltersOpen ? "flex" : "hidden"
      } md:flex flex-col gap-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl h-fit`}
    >
      <div className="flex justify-between items-center">
        <h4 className="font-heading font-bold text-sm text-blue-600 uppercase tracking-wider">
          {t("product:filters")}
        </h4>
        <button
          type="button"
          onClick={handleResetFilters}
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
                className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs outline-none focus:border-blue-600 transition-all font-semibold"
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
                className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs outline-none focus:border-blue-600 transition-all font-semibold"
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
  );
};

export default React.memo(ShopSidebarFilters);

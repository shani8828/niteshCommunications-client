import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X, ShoppingBag, Grid, Wrench, FileText, Loader2 } from "lucide-react";
import api from "../../utils/api";
import { cldUrl, cldSrcSet } from "../../utils/image";

const GlobalSearch = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    products: [],
    categories: [],
    repairs: [],
    cscServices: []
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const searchCache = useRef({}); // Local client-side cache

  // Handle clicking outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debouncing search request & caching
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ products: [], categories: [], repairs: [], cscServices: [] });
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);

    const delayDebounceFn = setTimeout(async () => {
      // 1. Check local cache first
      if (searchCache.current[trimmed]) {
        setResults(searchCache.current[trimmed]);
        setLoading(false);
        setIsOpen(true);
        setActiveIndex(-1);
        return;
      }

      // 2. Cancel previous pending request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await api.get(`/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          skipAuth: true,
        });
        const data = response.data || {
          products: [],
          categories: [],
          repairs: [],
          cscServices: []
        };

        // Cache the result
        searchCache.current[trimmed] = data;

        setResults(data);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Global search fetch failed:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Flattened items list for keyboard navigation
  const getFlatItems = () => {
    const flat = [];
    if (results.categories?.length > 0) {
      results.categories.forEach((item) => {
        flat.push({
          type: "category",
          title: item.name[currentLang] || item.name.en,
          link: `/shop?category=${item.slug}`,
          icon: <Grid size={15} className="text-blue-500 flex-shrink-0" />
        });
      });
    }
    if (results.products?.length > 0) {
      results.products.forEach((item) => {
        flat.push({
          type: "product",
          title: item.name[currentLang] || item.name.en,
          sub: `${item.brand} | ₹${item.price}`,
          link: `/products/${item.slug}`,
          icon: <ShoppingBag size={15} className="text-emerald-500 flex-shrink-0" />
        });
      });
    }
    if (results.repairs?.length > 0) {
      results.repairs.forEach((item) => {
        flat.push({
          type: "repair",
          title: item.title[currentLang] || item.title.en,
          sub: item.desc[currentLang] || item.desc.en,
          link: `/repairs`,
          icon: <Wrench size={15} className="text-amber-500 flex-shrink-0" />
        });
      });
    }
    if (results.cscServices?.length > 0) {
      results.cscServices.forEach((item) => {
        flat.push({
          type: "csc",
          title: item.title[currentLang] || item.title.en,
          sub: `Fee: ${item.fee[currentLang] || item.fee.en}`,
          link: `/csc`,
          icon: <FileText size={15} className="text-purple-500 flex-shrink-0" />
        });
      });
    }
    return flat;
  };

  const flatItems = getFlatItems();

  const handleSelect = (item) => {
    navigate(item.link);
    setQuery("");
    setIsOpen(false);
  };

  // Keyboard navigation keydown handler
  const handleKeyDown = (e) => {
    if (!isOpen || flatItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatItems.length) {
        handleSelect(flatItems[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Highlight matching text helper
  const highlightMatch = (text, qStr) => {
    if (!qStr) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${qStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === qStr.toLowerCase() ? (
            <mark key={i} className="bg-blue-100/80 text-blue-800 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const hasAnyResults = flatItems.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-[340px] flex-shrink" onKeyDown={handleKeyDown}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 text-slate-400 pointer-events-none" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder={currentLang === "hi" ? "उत्पाद, सेवाएं या श्रेणी खोजें..." : "Search products, services, category..."}
          className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-9 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        {loading ? (
          <Loader2 className="absolute right-3.5 text-blue-500 animate-spin" size={14} />
        ) : (
          query && (
            <button
              onClick={() => {
                setQuery("");
                setResults({ products: [], categories: [], repairs: [], cscServices: [] });
                setIsOpen(false);
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer flex items-center p-0.5 rounded-full hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          )
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-[460px] bg-white border border-slate-150/80 shadow-2xl rounded-2xl p-2 z-[200] overflow-y-auto max-h-[380px]">
          {hasAnyResults ? (
            <div className="flex flex-col gap-3.5 p-1">
              {/* Category Group */}
              {results.categories?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2.5 pb-1.5 border-b border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <Grid size={11} />
                    <span>{currentLang === "hi" ? "श्रेणियां" : "Categories"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {results.categories.map((item, idx) => {
                      const flatIndex = flatItems.findIndex(
                        (f) => f.type === "category" && f.link.includes(item.slug)
                      );
                      const isSelected = flatIndex === activeIndex;
                      return (
                        <div
                          key={item._id || idx}
                          onClick={() => handleSelect(flatItems[flatIndex])}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold select-none transition-all ${
                            isSelected
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Grid size={14} className="text-blue-500 flex-shrink-0" />
                            <span>{highlightMatch(item.name[currentLang] || item.name.en, query)}</span>
                          </div>
                          <span className="text-[10px] bg-slate-50 text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded-full font-bold">
                            {currentLang === "hi" ? "श्रेणी" : "Category"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Products Group */}
              {results.products?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2.5 pb-1.5 border-b border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <ShoppingBag size={11} />
                    <span>{currentLang === "hi" ? "उत्पाद" : "Products"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {results.products.map((item, idx) => {
                      const flatIndex = flatItems.findIndex(
                        (f) => f.type === "product" && f.link.includes(item.slug)
                      );
                      const isSelected = flatIndex === activeIndex;
                      return (
                        <div
                          key={item._id || idx}
                          onClick={() => handleSelect(flatItems[flatIndex])}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs select-none transition-all ${
                            isSelected
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.images?.[0] ? (
                              <img
                                src={cldUrl(item.images[0], 32)}
                                srcSet={cldSrcSet(item.images[0], 32)}
                                alt=""
                                className="h-7 w-7 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                              />
                            ) : (
                              <ShoppingBag size={14} className="text-emerald-500 flex-shrink-0" />
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold truncate">
                                {highlightMatch(item.name[currentLang] || item.name.en, query)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                {item.brand} • {item.stock > 0 ? `₹${item.price}` : (currentLang === "hi" ? "स्टॉक में नहीं" : "Out of stock")}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-50 text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                            {currentLang === "hi" ? "उत्पाद" : "Product"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Repair Services Group */}
              {results.repairs?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2.5 pb-1.5 border-b border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <Wrench size={11} />
                    <span>{currentLang === "hi" ? "मोबाइल रिपेयर सेवाएं" : "Mobile Repair Services"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {results.repairs.map((item, idx) => {
                      const flatIndex = flatItems.findIndex(
                        (f) => f.type === "repair" && f.title === (item.title[currentLang] || item.title.en)
                      );
                      const isSelected = flatIndex === activeIndex;
                      return (
                        <div
                          key={item._id || idx}
                          onClick={() => handleSelect(flatItems[flatIndex])}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs select-none transition-all ${
                            isSelected
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Wrench size={14} className="text-amber-500 flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold truncate">
                                {highlightMatch(item.title[currentLang] || item.title.en, query)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                {item.desc[currentLang] || item.desc.en}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-50 text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                            {currentLang === "hi" ? "रिपेयर" : "Repair"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CSC Services Group */}
              {results.cscServices?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2.5 pb-1.5 border-b border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <FileText size={11} />
                    <span>{currentLang === "hi" ? "जन सेवा केंद्र सेवाएं" : "CSC Jan Seva Services"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {results.cscServices.map((item, idx) => {
                      const flatIndex = flatItems.findIndex(
                        (f) => f.type === "csc" && f.title === (item.title[currentLang] || item.title.en)
                      );
                      const isSelected = flatIndex === activeIndex;
                      return (
                        <div
                          key={item._id || idx}
                          onClick={() => handleSelect(flatItems[flatIndex])}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs select-none transition-all ${
                            isSelected
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText size={14} className="text-purple-500 flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold truncate">
                                {highlightMatch(item.title[currentLang] || item.title.en, query)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                Fee: {item.fee[currentLang] || item.fee.en}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-50 text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                            {currentLang === "hi" ? "सीएससी" : "CSC"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 font-medium text-xs">
              {currentLang === "hi" ? "कोई परिणाम नहीं मिला।" : "No results found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

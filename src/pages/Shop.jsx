import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { getCachedData, setCachedData } from "../utils/cache";
import {
  Search,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import QuickLinksBanner from "../components/common/QuickLinksBanner";

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const Shop = () => {
  const { t, i18n } = useTranslation(["product", "common"]);
  const { addToCart, toggleWishlist, wishlist, user } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category") || "";
  const brandParam = searchParams.get("brand") || "";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "newest";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [minPrice, setMinPrice] = useState(0);
  const [minPriceInput, setMinPriceInput] = useState("0");
  const [maxPriceInput, setMaxPriceInput] = useState("100000");
  const [sort, setSort] = useState(sortParam);
  const [page, setPage] = useState((page) => 1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchText, setSearchText] = useState(searchParam);

  const currentLang = i18n.language || "hi";

  // Sync SearchParams with local states
  useEffect(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (search) params.search = search;
    if (sort !== "newest") params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedBrand, search, sort, setSearchParams]);

  // Sync back from URL when user navigates
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSelectedBrand(brandParam);
    setSearch(searchParam);
    setSearchText(searchParam);
    setSort(sortParam);
  }, [categoryParam, brandParam, searchParam, sortParam]);

  // Sync inputs back when minPrice or maxPrice state changes (e.g. on reset)
  useEffect(() => {
    setMinPriceInput(String(minPrice));
  }, [minPrice]);

  useEffect(() => {
    setMaxPriceInput(String(maxPrice));
  }, [maxPrice]);

  // SEO updates
  useEffect(() => {
    document.title =
      currentLang === "hi"
        ? "दुकान - उत्पाद सूची | Nitesh Communications"
        : "Shop - Product Catalog | Nitesh Communications";

    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      currentLang === "hi"
        ? "स्मार्टफोन, मोबाइल एक्सेसरीज, ईयरफोन, मूल एडाप्टर और पुरुषों के कपड़े सर्वश्रेष्ठ मूल्य पर खरीदें।"
        : "Browse and buy premium smartphones, mobile accessories, earphones, and premium men's clothing.",
    );

    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", `${window.location.origin}/shop`);
  }, [currentLang]);

  useEffect(() => {
    const fetchCats = async () => {
      const cacheKey = "shop_categories";
      const cached = getCachedData(cacheKey);
      if (cached) {
        setCategories(cached);
        return;
      }
      try {
        const response = await api.get("/products/categories");
        setCategories(response.data);
        setCachedData(cacheKey, response.data, 10 * 60 * 1000); // Cache categories for 10 minutes
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Debounce minPriceInput and maxPriceInput to prevent excessive backend queries
  useEffect(() => {
    const timer = setTimeout(() => {
      const val = minPriceInput === "" ? 0 : Number(minPriceInput);
      if (val !== minPrice) {
        setMinPrice(val);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [minPriceInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const val = maxPriceInput === "" ? 100000 : Number(maxPriceInput);
      if (val !== maxPrice) {
        setMaxPrice(val);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [maxPriceInput]);

  // Fetch available brands when a category is selected
  useEffect(() => {
    const fetchBrandsForCategory = async () => {
      if (!selectedCategory) {
        setAvailableBrands([]);
        setSelectedBrand("");
        return;
      }
      try {
        // Fetch products of this category with a high limit to extract unique brand names
        const response = await api.get(
          `/products?category=${selectedCategory}&limit=200`,
        );
        if (response.data && response.data.products) {
          const brands = response.data.products
            .map((p) => p.brand)
            .filter((b) => b && b.trim() !== "")
            .map((b) => b.trim());
          // Unique and sorted alphabetically
          const uniqueBrands = Array.from(new Set(brands)).sort((a, b) =>
            a.localeCompare(b),
          );
          setAvailableBrands(uniqueBrands);
        }
      } catch (err) {
        console.error("Error fetching brands for category:", err);
      }
    };
    fetchBrandsForCategory();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchProds = async () => {
      const cacheKey = `shop_products_p_${page}_s_${sort}_min_${minPrice}_max_${maxPrice}_k_${search}_c_${selectedCategory}_b_${selectedBrand}`;
      const cached = getCachedData(cacheKey);
      if (cached) {
        let fetchedProducts = cached.products;
        if (
          !selectedCategory &&
          !selectedBrand &&
          !search &&
          sort === "newest"
        ) {
          fetchedProducts = shuffleArray(fetchedProducts);
        }
        setProducts(fetchedProducts);
        setTotalPages(cached.pages);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let url = `/products?page=${page}&sort=${sort}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
        if (search) url += `&keyword=${search}`;
        if (selectedCategory) url += `&category=${selectedCategory}`;
        if (selectedBrand) url += `&brand=${encodeURIComponent(selectedBrand)}`;

        const response = await api.get(url);
        setCachedData(
          cacheKey,
          { products: response.data.products, pages: response.data.pages },
          5 * 60 * 1000,
        ); // Cache products for 5 minutes

        let fetchedProducts = response.data.products;
        if (
          !selectedCategory &&
          !selectedBrand &&
          !search &&
          sort === "newest"
        ) {
          fetchedProducts = shuffleArray(fetchedProducts);
        }
        setProducts(fetchedProducts);
        setTotalPages(response.data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProds();
  }, [page, search, selectedCategory, selectedBrand, maxPrice, minPrice, sort]);

  const handleCategorySelect = (id) => {
    const nextCat = id === selectedCategory ? "" : id;
    setSelectedCategory(nextCat);
    setSelectedBrand(""); // Reset brand when category changes
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPriceInput("0");
    setMaxPriceInput("100000");
    setMinPrice(0);
    setMaxPrice(100000);
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white">
      <div className="text-center mb-12 flex flex-col items-center gap-2">
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
          {t("common:shop")}
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          {currentLang == "hi"
            ? "पुरुषों के कपड़े, स्टेशनरी, फाइल फोल्डर, ब्लूटूथ इयरफ़ोन, चार्जर, बैटरी, हेडफ़ोन,फ़ोन ग्लास, फ़ोन आदि उपलब्ध हैं।"
            : "Men's Clothes, Stationary, File Folders, Bluetooth Earphone, Charger, Battery, Headphone, Phone Glasses, Phones are available."}
        </p>
      </div>

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
            onClick={() => handleCategorySelect("")}
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
              onClick={() => handleCategorySelect(cat.slug || cat._id)}
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
                  {cat.name[currentLang]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Top Bar (Search & Sort) */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8 items-center">
        <div className="relative flex-1 w-full max-w-lg">
          <Search
            size={16}
            className="absolute top-3.5 left-4 text-slate-400"
          />
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
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-blue-600 hover:bg-slate-200 flex items-center gap-2 text-sm font-semibold cursor-pointer"
          >
            <SlidersHorizontal size={16} /> {t("product:filters")}
          </button>

          <select
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer text-sm"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">{t("product:sort_default")}</option>
            <option value="priceAsc">{t("product:sort_price_low")}</option>
            <option value="priceDesc">{t("product:sort_price_high")}</option>
          </select>
        </div>
      </div>

      {/* Layout Columns */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
        {/* Left Column Filters (Sidebar) */}
        <aside
          className={`${mobileFiltersOpen ? "flex" : "hidden"} md:flex flex-col gap-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl h-fit`}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-heading font-bold text-sm text-blue-600 uppercase tracking-wider">
              {t("product:filters")}
            </h4>
            <button
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
          {selectedCategory && availableBrands.length > 0 && (
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
                        onChange={() => {
                          setSelectedBrand(
                            selectedBrand === brandName ? "" : brandName,
                          );
                          setPage(1);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{brandName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Right Column Products Grid */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 flex flex-col gap-3 bg-white border border-slate-200 rounded-2xl animate-pulse"
                >
                  {/* Image Skeleton */}
                  <div className="bg-slate-100 rounded-xl h-[170px] w-full" />
                  {/* Category */}
                  <div className="flex justify-between items-center mt-1">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                  {/* Title */}
                  <div className="h-4 bg-slate-200 rounded w-3/4 mt-1" />
                  {/* Price */}
                  <div className="h-5 bg-slate-200 rounded w-1/4 mt-1 mb-3" />
                  {/* Button */}
                  <div className="h-8 bg-slate-200 rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-sm">No products match your filter options.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 mt-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg border-0 cursor-pointer shadow-md shadow-blue-500/10"
              >
                {t("product:reset_filters")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const isWishlisted = wishlist.some(
                    (p) => p._id === product._id,
                  );
                  return (
                    <div
                      key={product._id}
                      className="p-4 flex flex-col gap-3 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all relative group"
                    >
                      {/* Floating Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product)}
                        className={`absolute top-6 right-6 w-8 h-8 rounded-full border flex justify-center items-center cursor-pointer transition-all z-10 shadow-sm ${
                          isWishlisted
                            ? "border-rose-200 bg-rose-50 text-rose-500"
                            : "border-slate-200 bg-white text-slate-400 hover:text-rose-500 hover:scale-105"
                        }`}
                        title={currentLang === "hi" ? "विशलिस्ट में जोड़ें/हटाएं" : "Add/Remove from Wishlist"}
                      >
                        <Heart
                          size={15}
                          fill={isWishlisted ? "#ef4444" : "none"}
                          color={isWishlisted ? "#ef4444" : "currentColor"}
                        />
                      </button>

                      {/* Image Wrap */}
                      <Link
                        to={`/products/${product.slug || product._id}`}
                        className="bg-slate-50 rounded-xl h-[170px] flex justify-center items-center overflow-hidden border border-slate-100"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name.en}
                          className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply"
                          loading="lazy"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex flex-col flex-grow">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                            {product.category?.name[currentLang]}
                          </span>
                        </div>

                        <Link to={`/products/${product.slug || product._id}`}>
                          <h4 className="font-heading text-sm font-semibold text-slate-800 truncate hover:text-blue-600 transition-colors mt-1">
                            {product.name[currentLang]}
                          </h4>
                        </Link>

                        <div className="flex gap-2 items-center mt-1 mb-3">
                          <span className="text-base font-extrabold text-blue-600">
                            ₹{product.price}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>

                        {product.stock === 0 ? (
                          <button
                            className="w-full py-2 font-heading font-semibold text-xs bg-slate-100 text-slate-400 border border-slate-200 rounded-lg cursor-not-allowed"
                            disabled
                          >
                            {t("product:out_of_stock")}
                          </button>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full py-2 font-heading font-semibold text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer border-0"
                          >
                            <ShoppingCart size={14} />
                            {t("product:add_to_cart")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Panel */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (pNum) => (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`w-9 h-9 rounded-lg font-heading font-bold text-xs cursor-pointer border ${
                          page === pNum
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pNum}
                      </button>
                    ),
                  )}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <QuickLinksBanner currentType="shop" />
    </div>
  );
};

export default Shop;

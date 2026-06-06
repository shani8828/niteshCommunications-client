import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { getCachedData, setCachedData } from "../utils/cache";
import { useSearchParams } from "react-router-dom";
import QuickLinksBanner from "../components/common/QuickLinksBanner";
import ProductCard from "../components/shop/ProductCard";
import ShopFiltersHeader from "../components/shop/ShopFiltersHeader";
import ShopSidebarFilters from "../components/shop/ShopSidebarFilters";

const Shop = () => {
  const { t, i18n } = useTranslation(["product", "common"]);
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "newest";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [minPrice, setMinPrice] = useState(0);
  const [sort, setSort] = useState(sortParam);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const currentLang = i18n.language || "en";

  // Sync SearchParams with local states
  useEffect(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (search) params.search = search;
    if (sort !== "newest") params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [selectedCategory, search, sort, setSearchParams]);

  // Sync back from URL when user navigates
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSearch(searchParam);
    setSort(sortParam);
  }, [categoryParam, searchParam, sortParam]);

  // SEO updates
  useEffect(() => {
    document.title =
      "Shop - Product Catalog | दुकान - उत्पाद सूची | Nitesh Communications";

    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Browse and buy premium smartphones, mobile accessories, earphones, and premium clothing at Nitesh Communications. बेहतरीन स्मार्टफोन, मोबाइल एक्सेसरीज, ईयरफोन और कपड़े खरीदें।",
    );

    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", `${window.location.origin}/shop`);
  }, [currentLang]);

  // Fetch product categories
  useEffect(() => {
    const fetchCats = async () => {
      const cacheKey = "shop_categories";
      const cached = getCachedData(cacheKey);
      if (cached) {
        setCategories(cached);
        setCategoriesLoading(false);
        return;
      }
      try {
        setCategoriesLoading(true);
        const response = await api.get("/products/categories");
        setCategories(response.data);
        setCachedData(cacheKey, response.data, 10 * 60 * 1000); // Cache categories for 10 minutes
      } catch (err) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCats();
  }, []);



  // Fetch Products
  useEffect(() => {
    const fetchProds = async () => {
      const isFirstPage = page === 1;
      const cacheKey = `shop_products_l15_p_${page}_s_${sort}_min_${minPrice}_max_${maxPrice}_k_${search}_c_${selectedCategory}`;
      const cached = getCachedData(cacheKey);

      if (isFirstPage) {
        setProducts([]);
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      if (cached) {
        const newProducts = cached.products || [];
        const totalPages = cached.pages || 1;

        if (isFirstPage) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const filteredNew = newProducts.filter(
              (p) => !existingIds.has(p._id),
            );
            return [...prev, ...filteredNew];
          });
        }
        setHasMore(page < totalPages && newProducts.length > 0);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      try {
        let url = `/products?page=${page}&limit=15&sort=${sort}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
        if (search) url += `&keyword=${search}`;
        if (selectedCategory) url += `&category=${selectedCategory}`;

        const response = await api.get(url);
        const newProducts = response.data.products || [];
        const totalPages = response.data.pages || 1;

        setCachedData(
          cacheKey,
          { products: newProducts, pages: totalPages },
          5 * 60 * 1000,
        );

        if (isFirstPage) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const filteredNew = newProducts.filter(
              (p) => !existingIds.has(p._id),
            );
            return [...prev, ...filteredNew];
          });
        }
        setHasMore(page < totalPages && newProducts.length > 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchProds();
  }, [page, search, selectedCategory, maxPrice, minPrice, sort]);

  // Infinite scroll IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore]);

  // Stable callbacks for filters to prevent component updates
  const handleSearchDebounce = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handlePriceDebounce = useCallback((min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
  }, []);

  const handleCategorySelect = useCallback((id) => {
    setSelectedCategory(id);
    setPage(1);
  }, []);

  const handleSortSelect = useCallback((val) => {
    setSort(val);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice(0);
    setMaxPrice(100000);
    setSort("newest");
    setPage(1);
  }, []);

  const renderSkeletons = (count = 6) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-2 flex flex-col gap-3 bg-white border border-slate-200 rounded-2xl animate-pulse w-full"
        >
          <div className="bg-slate-100 rounded-xl h-[170px] w-full" />
          <div className="flex justify-between items-center mt-1">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
          </div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mt-1" />
          <div className="h-5 bg-slate-200 rounded w-1/4 mt-1 mb-3" />
          <div className="h-8 bg-slate-200 rounded-lg w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 pt-2 md:pt-4 lg:pt-8 pb-20 bg-white">
      {/* <div className="text-center mb-12 flex flex-col items-center gap-2">
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
          {t("common:shop")}
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          {currentLang == "hi"
            ? "पुरुषों के कपड़े, स्टेशनरी, फाइल फोल्डर, ब्लूटूथ इयरफ़ोन, चार्जर, बैटरी, हेडफ़ोन,फ़ोन ग्लास, फ़ोन आदि उपलब्ध हैं।"
            : "Men's Clothes, Stationary, File Folders, Bluetooth Earphone, Charger, Battery, Headphone, Phone Glasses, Phones are available."}
        </p>
      </div> */}

      {/* Header filters containing search bar & category horizontal scroll lists */}
      <ShopFiltersHeader
        categories={categories}
        categoriesLoading={categoriesLoading}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        sort={sort}
        onSortSelect={handleSortSelect}
        initialSearch={search}
        onSearchDebounce={handleSearchDebounce}
        mobileFiltersOpen={mobileFiltersOpen}
        setMobileFiltersOpen={setMobileFiltersOpen}
        currentLang={currentLang}
        t={t}
      />

      {/* Layout Columns */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
        {/* Left Column Filters (Sidebar) */}
        <ShopSidebarFilters
          selectedCategory={selectedCategory}
          initialMinPrice={minPrice}
          initialMaxPrice={maxPrice}
          onPriceDebounce={handlePriceDebounce}
          onReset={handleResetFilters}
          mobileFiltersOpen={mobileFiltersOpen}
          currentLang={currentLang}
          t={t}
        />

        {/* Right Column Products Grid */}
        <div className="w-full">
          {loading ? (
            renderSkeletons(6)
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-sm">No products match your filter options.</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 mt-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg border-0 cursor-pointer shadow-md shadow-blue-500/10"
              >
                {t("product:reset_filters")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                {products.map((product) => {
                  const isWishlisted = wishlist.some(
                    (p) => p._id === product._id,
                  );
                  return (
                    <ProductCard
                      key={product._id}
                      product={product}
                      isWishlisted={isWishlisted}
                      addToCart={addToCart}
                      toggleWishlist={toggleWishlist}
                      currentLang={currentLang}
                      t={t}
                    />
                  );
                })}
              </div>

              {/* Sentinel observer element for infinite scroll */}
              {hasMore && (
                <div
                  ref={observerTarget}
                  className="w-full flex justify-center items-center mt-6 min-h-[50px]"
                >
                  {loadingMore && renderSkeletons(3)}
                </div>
              )}

              {!hasMore && products.length > 0 && (
                <p className="text-center text-xs text-slate-400 mt-8 font-semibold">
                  {currentLang === "hi"
                    ? "हमारे स्टोर में और भी उत्पाद जोड़े जा रहे हैं। बने रहिये!"
                    : "More products are being added in our store. Stay tuned!"}
                </p>
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

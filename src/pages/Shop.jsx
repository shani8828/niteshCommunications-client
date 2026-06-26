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
import Offers from "../components/shop/Offers";

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
      const cacheKey = `shop_products_l16_p_${page}_s_${sort}_min_${minPrice}_max_${maxPrice}_k_${search}_c_${selectedCategory}`;
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
        let url = `/products?page=${page}&limit=16&sort=${sort}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
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

  const renderSkeletons = (count = 16) => (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-2 md:p-4 flex flex-col gap-1 md:gap-2 bg-white border border-slate-200 rounded relative w-full overflow-hidden"
        >
          {/* Wishlist Button Skeleton */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full border border-slate-100 bg-slate-50 shimmer-bg" />

          {/* Image Wrap Skeleton */}
          <div className="shimmer-bg rounded h-[120px] md:h-[140px] w-full border border-slate-100" />

          {/* Details Skeleton */}
          <div className="flex flex-col flex-grow gap-2 mt-2">
            {/* Title */}
            <div className="h-4 w-3/4 shimmer-bg rounded" />
            
            {/* Category */}
            <div className="h-2 w-1/4 shimmer-bg rounded" />

            {/* Price */}
            <div className="h-5 w-1/3 shimmer-bg rounded my-1" />

            {/* Button */}
            <div className="h-7 w-full shimmer-bg rounded mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full px-4 md:px-8 pt-0 pb-20 bg-white">
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

      {/* Header filters containing search bar, filters & categories scroll list */}
      <ShopFiltersHeader
        categories={categories}
        categoriesLoading={categoriesLoading}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        sort={sort}
        onSortSelect={handleSortSelect}
        initialSearch={search}
        onSearchDebounce={handleSearchDebounce}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceDebounce={handlePriceDebounce}
        onReset={handleResetFilters}
        currentLang={currentLang}
        t={t}
      />

      {/* Products Grid */}
      <div className="w-full">
        <Offers />
        {loading ? (
            renderSkeletons(16)
          ) : products.length === 0 ? (
            <div className="text-center py-0 text-slate-500">
              <p className="text-sm">No products match your filter options.</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 mt-0 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded border-0 cursor-pointer shadow-md shadow-blue-500/10"
              >
                {t("product:reset_filters")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
                  {loadingMore && renderSkeletons(6)}
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
      <QuickLinksBanner currentType="shop" />
    </div>
  );
};

export default Shop;

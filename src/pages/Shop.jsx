import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { getCachedData } from "../utils/cache";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_MAX_PRICE,
  DEFAULT_MIN_PRICE,
  fetchShopCategories,
  fetchShopProducts,
} from "../utils/shopData";
import ProductCard from "../components/shop/ProductCard";
import ShopFiltersHeader from "../components/shop/ShopFiltersHeader";
import Offers from "../components/shop/Offers";

const Shop = () => {
  const { t, i18n } = useTranslation(["product", "common"]);
  const { addToCart, toggleWishlist, wishlist, cartItems } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "newest";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(() => getCachedData("shop_categories") || []);
  const [categoriesLoading, setCategoriesLoading] = useState(() => !getCachedData("shop_categories"));
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [sort, setSort] = useState(sortParam);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  const currentLang = i18n.language || "en";

  // O(1) lookups for each product card instead of scanning both lists per card
  const wishlistIds = useMemo(() => new Set(wishlist.map((p) => p._id)), [wishlist]);
  const cartIds = useMemo(() => new Set(cartItems.map((item) => item.product._id)), [cartItems]);

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

  // Fetch product categories (shared with the boot-time prefetch, cached 10 minutes)
  useEffect(() => {
    let cancelled = false;
    fetchShopCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch Products (shared with the boot-time prefetch, cached 5 minutes)
  useEffect(() => {
    let cancelled = false;
    const isFirstPage = page === 1;
    const request = fetchShopProducts({
      page,
      sort,
      minPrice,
      maxPrice,
      search,
      category: selectedCategory,
    });

    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    request
      .then(({ products: newProducts, pages: totalPages }) => {
        // Ignore results for filters the user has already changed away from
        if (cancelled) return;
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
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setLoadingMore(false);
      });

    return () => {
      cancelled = true;
    };
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
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
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

  const showOffers = !selectedCategory && !search && Array.from(searchParams.keys()).length === 0;

  return (
    <div className="w-full px-4 md:px-8 pt-0 pb-20 bg-white">
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
        {showOffers && <Offers />}
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
              {products.map((product, index) => {
                const isWishlisted = wishlistIds.has(product._id);
                const isInCart = cartIds.has(product._id);
                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isWishlisted={isWishlisted}
                    isInCart={isInCart}
                    addToCart={addToCart}
                    toggleWishlist={toggleWishlist}
                    currentLang={currentLang}
                    t={t}
                    priority={index < 6}
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
      {/* <QuickLinksBanner currentType="shop" /> */}
    </div>
  );
};

export default Shop;

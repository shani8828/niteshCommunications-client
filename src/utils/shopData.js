import api from "./api";
import { getOrFetch } from "./cache";

// Shared by the Shop page and the boot-time prefetch in main.jsx, so both use
// the same cache keys and only one request is made for each.

export const SHOP_PAGE_SIZE = 16;
export const DEFAULT_MIN_PRICE = 0;
export const DEFAULT_MAX_PRICE = 100000;

export const fetchShopCategories = () =>
  getOrFetch(
    "shop_categories",
    () => api.get("/products/categories", { skipAuth: true }).then((res) => res.data),
    10 * 60 * 1000,
  );

export const fetchShopProducts = ({ page, sort, minPrice, maxPrice, search, category }) => {
  const key = `shop_products_l${SHOP_PAGE_SIZE}_p_${page}_s_${sort}_min_${minPrice}_max_${maxPrice}_k_${search}_c_${category}`;
  return getOrFetch(
    key,
    () => {
      const params = { page, limit: SHOP_PAGE_SIZE, sort, minPrice, maxPrice };
      if (search) params.keyword = search;
      if (category) params.category = category;
      return api
        .get("/products", { params, skipAuth: true })
        .then((res) => ({ products: res.data.products || [], pages: res.data.pages || 1 }));
    },
    5 * 60 * 1000,
  );
};

export const fetchActiveOffers = () =>
  getOrFetch(
    "active_offers",
    () => api.get("/offers", { skipAuth: true }).then((res) => res.data || []),
    5 * 60 * 1000,
  );

/**
 * Called before React renders when the visitor lands on the default shop view,
 * so the first products, categories and offers are already on their way.
 */
export const prefetchLandingData = () => {
  const { pathname, search } = window.location;
  if ((pathname !== "/" && pathname !== "/shop") || search) return;

  const ignore = () => {};
  fetchShopCategories().catch(ignore);
  fetchActiveOffers().catch(ignore);
  fetchShopProducts({
    page: 1,
    sort: "newest",
    minPrice: DEFAULT_MIN_PRICE,
    maxPrice: DEFAULT_MAX_PRICE,
    search: "",
    category: "",
  }).catch(ignore);
};

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import {
  Search,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";

const Shop = () => {
  const { t, i18n } = useTranslation(["product", "common"]);
  const { addToCart, toggleWishlist, wishlist, user } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minPrice, setMinPrice] = useState(0);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await api.get("/products/categories");
        setCategories(response.data);
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

  useEffect(() => {
    const fetchProds = async () => {
      setLoading(true);
      try {
        let url = `/products?page=${page}&sort=${sort}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
        if (search) url += `&keyword=${search}`;
        if (selectedCategory) url += `&category=${selectedCategory}`;

        const response = await api.get(url);
        setProducts(response.data.products);
        setTotalPages(response.data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProds();
  }, [page, search, selectedCategory, maxPrice, minPrice, sort]);

  const handleCategorySelect = (id) => {
    setSelectedCategory(id === selectedCategory ? "" : id);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedCategory("");
    setMinPrice(0);
    setMaxPrice(10000);
    setSort("newest");
    setPage(1);
  };

  const currentLang = i18n.language || "hi";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white">
      <div className="text-center mb-12 flex flex-col items-center gap-2">
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
          {t("common:shop")}
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          {currentLang == "hi"
            ? "स्टेशनरी, फाइल फोल्डर, ब्लूटूथ इयरफ़ोन, चार्जर, बैटरी, हेडफ़ोन,फ़ोन ग्लास, फ़ोन आदि उपलब्ध हैं।"
            : "Stationary, File Folders, Bluetooth Earphone, Charger, Battery, Headphone, Phone Glasses, Phones are available."}
        </p>
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

          {/* Categories List */}
          <div className="flex flex-col gap-3">
            <p className="font-heading font-semibold text-xs text-slate-700 uppercase tracking-wider">
              {t("product:categories")}
            </p>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat._id)}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors border-0 cursor-pointer ${
                    selectedCategory === cat._id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                  }`}
                >
                  {cat.name[currentLang]}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-t border-slate-200" />

          {/* Price Range Slider */}
          <div className="flex flex-col gap-3">
            <p className="font-heading font-semibold text-xs text-slate-700 uppercase tracking-wider">
              {t("product:price_range")}: ₹{maxPrice}
            </p>
            <input
              type="range"
              min="0"
              max="15000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>₹0</span>
              <span>₹15,000+</span>
            </div>
          </div>
        </aside>

        {/* Right Column Products Grid */}
        <div className="w-full">
          {loading ? (
            <Loader />
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
                      className="p-4 flex flex-col gap-3 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all"
                    >
                      {/* Image Wrap */}
                      <Link
                        to={`/product/${product._id}`}
                        className="bg-slate-50 rounded-xl h-[170px] flex justify-center items-center overflow-hidden border border-slate-100"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name.en}
                          className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex flex-col flex-grow">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                            {product.category?.name[currentLang]}
                          </span>
                          {user && (
                            <button
                              onClick={() => toggleWishlist(product)}
                              className="bg-transparent border-0 cursor-pointer p-0"
                            >
                              <Heart
                                size={16}
                                fill={isWishlisted ? "#ef4444" : "none"}
                                color={isWishlisted ? "#ef4444" : "#94a3b8"}
                              />
                            </button>
                          )}
                        </div>

                        <Link to={`/product/${product._id}`}>
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
    </div>
  );
};

export default Shop;

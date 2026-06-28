import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, X, Upload, Search } from "lucide-react";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";

const translateToHindi = async (text) => {
  if (!text || !text.trim()) return "";
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text.trim())}`,
    );
    if (!response.ok) throw new Error("Translation request failed");
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map((item) => item[0]).join("");
    }
    return "";
  } catch (error) {
    console.error("Translation error:", error);
    return "";
  }
};

const ProductsTab = ({
  products,
  setProducts,
  categories,
  t,
  currentLang,
  fetchInventory,
  setLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [prodNameEn, setProdNameEn] = useState("");
  const [prodNameHi, setProdNameHi] = useState("");
  const [prodDescEn, setProdDescEn] = useState("");
  const [prodDescHi, setProdDescHi] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodReturnPolicy, setProdReturnPolicy] = useState("Replace");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // Auto-translate refs
  const prodNameEnDirty = useRef(false);
  const prodNameHiManual = useRef(false);
  const prodDescEnDirty = useRef(false);
  const prodDescHiManual = useRef(false);

  // Auto-translate Product Name
  useEffect(() => {
    if (!prodNameEnDirty.current || prodNameHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (prodNameEn.trim()) {
        const translated = await translateToHindi(prodNameEn);
        if (translated && !prodNameHiManual.current) {
          setProdNameHi(translated);
        }
      } else {
        setProdNameHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [prodNameEn]);

  // Auto-translate Product Description
  useEffect(() => {
    if (!prodDescEnDirty.current || prodDescHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (prodDescEn.trim()) {
        const translated = await translateToHindi(prodDescEn);
        if (translated && !prodDescHiManual.current) {
          setProdDescHi(translated);
        }
      } else {
        setProdDescHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [prodDescEn]);

  // Filters
  const filteredProducts = products.filter((prod) => {
    const nameMatch =
      prod.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.name?.hi?.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch =
      categoryFilter === "all" || prod.category?._id === categoryFilter;
    return nameMatch && catMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProdNameEn("");
    setProdNameHi("");
    setProdDescEn("");
    setProdDescHi("");
    setProdPrice("");
    setProdOriginalPrice("");
    setProdCategory(categories[0]?._id || "");
    setProdStock("");
    setProdReturnPolicy("Replace");
    setExistingImages([]);
    setNewImages([]);
    prodNameEnDirty.current = false;
    prodNameHiManual.current = false;
    prodDescEnDirty.current = false;
    prodDescHiManual.current = false;
    setShowProductModal(true);
  };

  const handleEditProductClick = (prod) => {
    setEditingProduct(prod);
    setProdNameEn(prod.name.en);
    setProdNameHi(prod.name.hi);
    setProdDescEn(prod.description.en);
    setProdDescHi(prod.description.hi);
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalPrice);
    setProdCategory(prod.category?._id || "");
    setProdStock(prod.stock);
    setProdReturnPolicy(prod.returnPolicy);
    setExistingImages(prod.images || []);
    setNewImages([]);
    prodNameEnDirty.current = false;
    prodNameHiManual.current = false;
    prodDescEnDirty.current = false;
    prodDescHiManual.current = false;
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (
      !window.confirm(
        t(
          "admin:confirm_delete_product",
          "Are you sure you want to delete this product?",
        ),
      )
    )
      return;

    let rollbackProducts = products;
    if (setProducts) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }

    try {
      await api.delete(`/products/${id}`);
      showToast.success(
        t("admin:success_product_delete", "Product deleted successfully"),
      );
      fetchInventory().catch(console.error);
    } catch (err) {
      if (setProducts && rollbackProducts) {
        setProducts(rollbackProducts);
      }
      showToast.error(
        err.response?.data?.message ||
          t("admin:error_product_delete", "Delete failed"),
      );
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newImages.length === 0) {
      showToast.error(
        t("admin:error_no_images", "Please upload at least one image"),
      );
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("nameEn", prodNameEn);
    formData.append("nameHi", prodNameHi);
    formData.append("descriptionEn", prodDescEn);
    formData.append("descriptionHi", prodDescHi);
    formData.append("price", prodPrice);
    formData.append("originalPrice", prodOriginalPrice);
    formData.append("category", prodCategory);
    formData.append("stock", prodStock);
    formData.append("returnPolicy", prodReturnPolicy);

    if (editingProduct) {
      existingImages.forEach((img) => {
        formData.append("keptImages", img);
      });
    }

    if (newImages && newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        formData.append("images", newImages[i]);
      }
    }

    try {
      const url = editingProduct
        ? `/products/${editingProduct._id}`
        : "/products";
      const method = editingProduct ? "put" : "post";

      await api({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast.success(
        t("admin:success_product_save", "Product saved successfully!"),
      );
      setShowProductModal(false);
      fetchInventory().catch(console.error);
    } catch (err) {
      showToast.error(
        err.response?.data?.message ||
          t("admin:error_product_save", "Product save failed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded border border-slate-200/60">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-slate-200 flex-grow max-w-md">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder={
              currentLang === "hi"
                ? "उत्पाद का नाम खोजें..."
                : "Search by product name..."
            }
            className="border-0 outline-none text-xs w-full bg-transparent"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded text-xs outline-none focus:border-brand-cyan"
            >
              <option value="all">
                {currentLang === "hi" ? "सभी श्रेणियां" : "All Categories"}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name[currentLang] || cat.name.en}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddProductClick}
            className="px-4 py-2 text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/95 text-white rounded shadow flex items-center gap-1.5 border-0 cursor-pointer transition-all"
          >
            <Plus size={14} /> {t("admin:add_product")}
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded border border-slate-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <th className="px-4 py-3 text-left">
                {t("admin:image_url", "Image")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:product_name_en", "Product Name")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:category", "Category")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:price", "Price")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:stock", "Stock")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((prod) => (
              <tr
                key={prod._id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <img
                    src={prod.images?.[0] || ""}
                    alt={prod.name?.en}
                    className="w-9 h-9 rounded object-contain bg-slate-100 border border-slate-200"
                  />
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                  {prod.name?.[currentLang] || prod.name?.en}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {prod.category?.name?.[currentLang] ||
                    prod.category?.name?.en}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-900 font-bold">
                  ₹{prod.price}
                </td>
                <td
                  className={`border-b border-slate-100 px-4 py-3 text-xs font-extrabold ${
                    prod.stock === 0
                      ? "text-rose-500"
                      : prod.stock <= 5
                        ? "text-amber-500"
                        : "text-emerald-500"
                  }`}
                >
                  {prod.stock}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProductClick(prod)}
                      className="p-1.5 bg-slate-100 border border-slate-200 rounded text-brand-cyan hover:bg-slate-200 flex cursor-pointer transition-all"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod._id)}
                      className="p-1.5 bg-slate-100 border border-slate-200 rounded text-rose-500 hover:bg-rose-50 flex cursor-pointer transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="border-b border-slate-100 px-4 py-6 text-xs text-slate-500 text-center font-semibold"
                >
                  {t("admin:no_data")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            {currentLang === "hi" ? "पिछला" : "Prev"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                currentPage === page
                  ? "bg-brand-cyan border-brand-cyan text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            {currentLang === "hi" ? "अगला" : "Next"}
          </button>
        </div>
      )}

      {/* Product Save Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-100 rounded shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingProduct
                  ? t("admin:edit_product")
                  : t("admin:add_product")}
              </h3>
              <button
                type="button"
                onClick={() => !isSaving && setShowProductModal(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer"
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSaveProduct}
              className="flex flex-col gap-4 text-xs"
            >
              <div className="grid gap-1 grid-cols-1 md:grid-cols-2">
                {/* English name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="e.g. Realme 9 5G (Speed Blue)"
                    value={prodNameEn}
                    onChange={(e) => {
                      prodNameEnDirty.current = true;
                      setProdNameEn(e.target.value);
                    }}
                  />
                </div>

                {/* Hindi name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">
                    उत्पाद का नाम (हिंदी) *
                  </label>
                  <input
                    type="text"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="उदा. रियलमी 9 5जी (स्पीड ब्लू)"
                    value={prodNameHi}
                    onChange={(e) => {
                      prodNameHiManual.current = true;
                      setProdNameHi(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-1 grid-cols-1 md:grid-cols-2">
                {/* English desc */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">
                    Product Description (English) *
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan resize-none"
                    placeholder="English description details..."
                    value={prodDescEn}
                    onChange={(e) => {
                      prodDescEnDirty.current = true;
                      setProdDescEn(e.target.value);
                    }}
                  />
                </div>

                {/* Hindi desc */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">
                    उत्पाद विवरण (हिंदी) *
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan resize-none"
                    placeholder="हिंदी में उत्पाद की विशेषताएं..."
                    value={prodDescHi}
                    onChange={(e) => {
                      prodDescHiManual.current = true;
                      setProdDescHi(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-1 grid-cols-1 sm:grid-cols-3">
                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="12999"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                  />
                </div>

                {/* Original Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">
                    Original MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="15999"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                  />
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="10"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1 grid-cols-1 sm:grid-cols-2">
                {/* Category selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">
                    Category *
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name.en} / {cat.name.hi}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Return/Replacement Policy */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">
                    Return Policy *
                  </label>
                  <select
                    value={prodReturnPolicy}
                    onChange={(e) => setProdReturnPolicy(e.target.value)}
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan cursor-pointer"
                  >
                    <option value="Replace">Replacement Only (24h)</option>
                    <option value="Return">Return & Refund (24h)</option>
                    <option value="None">Non-Returnable</option>
                  </select>
                </div>
              </div>

              {/* Images management */}
              <div className="flex flex-col gap-2.5 mt-2">
                <label className="font-semibold text-slate-500">
                  Product Images (Max 5)
                </label>

                {editingProduct && existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {existingImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative w-16 h-16 rounded border border-slate-200 bg-slate-50 p-1 flex justify-center items-center"
                      >
                        <img
                          src={imgUrl}
                          alt="Product"
                          className="max-w-full max-h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setExistingImages(
                              existingImages.filter((_, i) => i !== index),
                            )
                          }
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-0 cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-slate-200 rounded p-6 text-center hover:border-brand-cyan transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload size={24} className="text-slate-400" />
                    <span className="text-slate-600 font-semibold">
                      {newImages.length > 0
                        ? `${newImages.length} files selected`
                        : "Click or drag images to upload (Max 5 images)"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP (Max 5 images)
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-brand-cyan hover:bg-brand-cyan/95 text-white font-heading font-bold text-xs rounded shadow-lg border-0 cursor-pointer transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  t("common:save", "Save Changes")
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductsTab);

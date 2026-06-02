import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";

const translateToHindi = async (text) => {
  if (!text || !text.trim()) return "";
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text.trim())}`
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

const CategoriesTab = ({ categories, t, currentLang, fetchInventory, setLoading }) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form states
  const [catNameEn, setCatNameEn] = useState("");
  const [catNameHi, setCatNameHi] = useState("");
  const [catImage, setCatImage] = useState(null);
  const [existingCatImage, setExistingCatImage] = useState("");
  const [removeCatImage, setRemoveCatImage] = useState(false);

  // Auto-translate Category Name
  const catNameEnDirty = useRef(false);
  const catNameHiManual = useRef(false);

  useEffect(() => {
    if (!catNameEnDirty.current || catNameHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (catNameEn.trim()) {
        const translated = await translateToHindi(catNameEn);
        if (translated && !catNameHiManual.current) {
          setCatNameHi(translated);
        }
      } else {
        setCatNameHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [catNameEn]);

  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setCatNameEn("");
    setCatNameHi("");
    setCatImage(null);
    setExistingCatImage("");
    setRemoveCatImage(false);
    catNameEnDirty.current = false;
    catNameHiManual.current = false;
    setShowCategoryModal(true);
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat);
    setCatNameEn(cat.name.en);
    setCatNameHi(cat.name.hi);
    setCatImage(null);
    setExistingCatImage(cat.image || "");
    setRemoveCatImage(false);
    catNameEnDirty.current = false;
    catNameHiManual.current = false;
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm(t("admin:confirm_delete_category", "Are you sure you want to delete this category?"))) return;
    setLoading(true);
    try {
      await api.delete(`/products/categories/${id}`);
      showToast.success(t("admin:success_category_delete", "Category deleted successfully"));
      fetchInventory();
    } catch (err) {
      showToast.error(err.response?.data?.message || t("admin:error_category_delete", "Delete failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catNameHi || !catNameEn) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("nameHi", catNameHi);
    formData.append("nameEn", catNameEn);
    if (catImage) {
      formData.append("image", catImage);
    } else if (removeCatImage) {
      formData.append("removeImage", "true");
    }

    try {
      if (editingCategory) {
        await api.put(`/products/categories/${editingCategory._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast.success(t("admin:success_category_update", "Category updated successfully!"));
      } else {
        await api.post("/products/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast.success(t("admin:success_category_create", "Category created successfully!"));
      }

      setShowCategoryModal(false);
      fetchInventory();
    } catch (err) {
      showToast.error(err.response?.data?.message || t("admin:error_category_save", "Category save failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCatImage(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Category Setup Header */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex-wrap gap-4">
        <div className="px-3 py-1.5 bg-brand-cyan/5 border border-brand-cyan/25 text-brand-cyan rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
          Total Categories: <span className="font-bold text-slate-900">{categories.length}</span>
        </div>
        <button
          onClick={handleAddCategoryClick}
          className="px-4 py-2 text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/95 text-white rounded-xl shadow flex items-center gap-1.5 border-0 cursor-pointer transition-all"
        >
          <Plus size={14} /> {t("admin:add_category", "Add Category")}
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-slate-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <th className="px-4 py-3 text-left">{t("admin:image_url", "Image")}</th>
              <th className="px-4 py-3 text-left">{t("admin:product_name_hi", "Category Name (Hindi)")}</th>
              <th className="px-4 py-3 text-left">{t("admin:product_name_en", "Category Name (English)")}</th>
              <th className="px-4 py-3 text-left">{t("admin:actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name.en}
                      className="w-9 h-9 rounded object-contain bg-slate-100 border border-slate-200"
                    />
                  ) : (
                    t("admin:no_image", "No Image")
                  )}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {cat.name.hi}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                  {cat.name.en}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategoryClick(cat)}
                      className="p-1.5 bg-slate-100 border border-slate-200 rounded text-brand-cyan hover:bg-slate-200 flex cursor-pointer transition-all"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="p-1.5 bg-slate-100 border border-slate-200 rounded text-rose-500 hover:bg-rose-50 flex cursor-pointer transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="border-b border-slate-100 px-4 py-6 text-xs text-slate-500 text-center font-semibold"
                >
                  {t("admin:no_data")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Category Save Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-5 text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingCategory ? t("admin:edit_category", "Edit Category") : t("admin:add_category", "Add Category")}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4 text-xs">
              {/* English Category Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-500">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                  placeholder="e.g. Mobile Screen"
                  value={catNameEn}
                  onChange={(e) => {
                    catNameEnDirty.current = true;
                    setCatNameEn(e.target.value);
                  }}
                />
              </div>

              {/* Hindi Category Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-500">श्रेणी का नाम (हिंदी) *</label>
                <input
                  type="text"
                  required
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                  placeholder="उदा. मोबाइल स्क्रीन"
                  value={catNameHi}
                  onChange={(e) => {
                    catNameHiManual.current = true;
                    setCatNameHi(e.target.value);
                  }}
                />
              </div>

              {/* Image Upload */}
              <div className="flex flex-col gap-2.5 mt-2">
                <label className="font-semibold text-slate-500">Category Image</label>

                {existingCatImage && !removeCatImage && (
                  <div className="relative w-20 h-20 rounded border border-slate-200 bg-slate-50 p-1 flex justify-center items-center mb-2">
                    <img src={existingCatImage} alt="Category" className="max-w-full max-h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setRemoveCatImage(true)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-0 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-cyan transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload size={24} className="text-slate-400" />
                    <span className="text-slate-600 font-semibold">
                      {catImage ? catImage.name : "Click or drag category image"}
                    </span>
                    <span className="text-[10px] text-slate-400">Supports JPG, PNG, WEBP</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-cyan hover:bg-brand-cyan/95 text-white font-heading font-bold text-xs rounded-xl shadow-lg border-0 cursor-pointer transition-all mt-4"
              >
                {t("common:save", "Save Changes")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CategoriesTab);

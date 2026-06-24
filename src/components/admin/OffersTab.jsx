import React, { useState } from "react";
import { Plus, Edit, Trash2, X, Upload, Eye, EyeOff } from "lucide-react";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";

const OffersTab = ({ offers, setOffers, t, currentLang, fetchOffers, setLoading }) => {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [offerImage, setOfferImage] = useState(null);
  const [existingOfferImage, setExistingOfferImage] = useState("");

  const handleAddOfferClick = () => {
    setEditingOffer(null);
    setTitle("");
    setUrl("");
    setIsActive(true);
    setOfferImage(null);
    setExistingOfferImage("");
    setShowOfferModal(true);
  };

  const handleEditOfferClick = (offer) => {
    setEditingOffer(offer);
    setTitle(offer.title || "");
    setUrl(offer.url || "");
    setIsActive(offer.isActive !== undefined ? offer.isActive : true);
    setOfferImage(null);
    setExistingOfferImage(offer.image || "");
    setShowOfferModal(true);
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm(currentLang === "hi" ? "क्या आप वाकई इस ऑफर को हटाना चाहते हैं?" : "Are you sure you want to delete this offer?")) return;

    let rollbackOffers = offers;
    if (setOffers) {
      setOffers((prev) => prev.filter((o) => o._id !== id));
    }

    try {
      await api.delete(`/offers/${id}`);
      showToast.success(currentLang === "hi" ? "ऑफर सफलतापूर्वक हटा दिया गया" : "Offer deleted successfully");
      fetchOffers().catch(console.error);
    } catch (err) {
      if (setOffers && rollbackOffers) {
        setOffers(rollbackOffers);
      }
      showToast.error(err.response?.data?.message || (currentLang === "hi" ? "हटाना विफल रहा" : "Delete failed"));
    }
  };

  const handleToggleActive = async (offer) => {
    const originalStatus = offer.isActive;
    const newStatus = !originalStatus;

    let rollbackOffers = offers;
    if (setOffers) {
      setOffers((prev) =>
        prev.map((o) => (o._id === offer._id ? { ...o, isActive: newStatus } : o))
      );
    }

    try {
      await api.put(`/offers/${offer._id}`, { isActive: newStatus });
      showToast.success(
        currentLang === "hi"
          ? `ऑफर सफलतापूर्वक ${newStatus ? "सक्रिय" : "निष्क्रिय"} किया गया`
          : `Offer ${newStatus ? "activated" : "deactivated"} successfully`
      );
      fetchOffers().catch(console.error);
    } catch (err) {
      if (setOffers && rollbackOffers) {
        setOffers(rollbackOffers);
      }
      showToast.error(err.response?.data?.message || (currentLang === "hi" ? "अपडेट विफल रहा" : "Update failed"));
    }
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!offerImage && !existingOfferImage) {
      showToast.error(currentLang === "hi" ? "छवि आवश्यक है" : "Image is required");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("url", url);
    formData.append("isActive", isActive);
    if (offerImage) {
      formData.append("image", offerImage);
    }

    try {
      if (editingOffer) {
        await api.put(`/offers/${editingOffer._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast.success(currentLang === "hi" ? "ऑफर सफलतापूर्वक अपडेट किया गया!" : "Offer updated successfully!");
      } else {
        await api.post("/offers", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast.success(currentLang === "hi" ? "ऑफर सफलतापूर्वक बनाया गया!" : "Offer created successfully!");
      }

      setShowOfferModal(false);
      fetchOffers().catch(console.error);
    } catch (err) {
      showToast.error(err.response?.data?.message || (currentLang === "hi" ? "सहेजना विफल रहा" : "Offer save failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setOfferImage(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full animate-fadeIn">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200 flex-wrap gap-2">
        <div className="px-2 py-1 bg-brand-cyan/5 border border-brand-cyan/25 text-brand-cyan rounded text-xs font-normal flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
          {currentLang === "hi" ? "कुल ऑफर: " : "Total Offers: "}
          <span className="font-medium text-slate-900">{offers.length}</span>
        </div>
        <button
          onClick={handleAddOfferClick}
          className="px-3 py-1.5 text-xs font-medium bg-brand-cyan hover:bg-brand-cyan/95 text-white rounded shadow-sm flex items-center gap-1 border-0 cursor-pointer transition-all"
        >
          <Plus size={14} /> {currentLang === "hi" ? "ऑफर जोड़ें" : "Add Offer"}
        </button>
      </div>

      {/* Grid Layout for Offers */}
      <div className="w-full overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-medium text-xs border-b border-slate-200">
              <th className="px-3 py-2 text-left font-medium">{currentLang === "hi" ? "बैनर छवि" : "Banner Image"}</th>
              <th className="px-3 py-2 text-left font-medium">{currentLang === "hi" ? "शीर्षक" : "Title"}</th>
              <th className="px-3 py-2 text-left font-medium">{currentLang === "hi" ? "यूआरएल / लिंक" : "URL / Link"}</th>
              <th className="px-3 py-2 text-left font-medium">{currentLang === "hi" ? "स्थिति" : "Status"}</th>
              <th className="px-3 py-2 text-left font-medium">{currentLang === "hi" ? "कार्रवाई" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-2 text-xs text-slate-700">
                  {offer.image ? (
                    <img
                      src={offer.image}
                      alt={offer.title || "Offer"}
                      className="w-20 h-10 rounded object-cover bg-slate-50 border border-slate-200"
                    />
                  ) : (
                    <span className="text-slate-400 font-normal">{currentLang === "hi" ? "कोई छवि नहीं" : "No Image"}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-slate-700 font-normal max-w-[150px] truncate">
                  {offer.title || "—"}
                </td>
                <td className="px-3 py-2 text-xs text-slate-700 font-normal max-w-[200px] truncate">
                  {offer.url || "—"}
                </td>
                <td className="px-3 py-2 text-xs text-slate-700">
                  <button
                    onClick={() => handleToggleActive(offer)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer transition-colors ${
                      offer.isActive
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-1 font-medium">
                      {offer.isActive ? (
                        <>
                          <Eye size={10} /> {currentLang === "hi" ? "सक्रिय" : "Active"}
                        </>
                      ) : (
                        <>
                          <EyeOff size={10} /> {currentLang === "hi" ? "निष्क्रिय" : "Inactive"}
                        </>
                      )}
                    </span>
                  </button>
                </td>
                <td className="px-3 py-2 text-xs text-slate-700">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditOfferClick(offer)}
                      className="p-1 bg-slate-50 border border-slate-200 rounded text-brand-cyan hover:bg-slate-100 flex cursor-pointer transition-all"
                      title={currentLang === "hi" ? "संपादित करें" : "Edit"}
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offer._id)}
                      className="p-1 bg-slate-50 border border-slate-200 rounded text-rose-500 hover:bg-rose-50 flex cursor-pointer transition-all"
                      title={currentLang === "hi" ? "हटाएं" : "Delete"}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-3 py-4 text-xs text-slate-500 text-center font-normal"
                >
                  {currentLang === "hi" ? "कोई डेटा उपलब्ध नहीं है" : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Save Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded shadow-lg p-4 flex flex-col gap-2 text-left animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-medium text-slate-900">
                {editingOffer
                  ? currentLang === "hi"
                    ? "ऑफर संपादित करें"
                    : "Edit Offer"
                  : currentLang === "hi"
                  ? "नया ऑफर जोड़ें"
                  : "Add New Offer"}
              </h3>
              <button
                type="button"
                onClick={() => !isSaving && setShowOfferModal(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer"
                disabled={isSaving}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveOffer} className="flex flex-col gap-2 text-xs">
              {/* Title input */}
              <div className="flex flex-col gap-1">
                <label className="font-normal text-slate-500">{currentLang === "hi" ? "शीर्षक" : "Offer Title"}</label>
                <input
                  type="text"
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-900 outline-none focus:border-brand-cyan font-normal"
                  placeholder="e.g. Special Discount on Earbuds"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* URL input */}
              <div className="flex flex-col gap-1">
                <label className="font-normal text-slate-500">{currentLang === "hi" ? "यूआरएल / प्रोडक्ट लिंक" : "Offer URL / Link"}</label>
                <input
                  type="text"
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-900 outline-none focus:border-brand-cyan font-normal"
                  placeholder="e.g. /products/p9-headphone"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isActiveOffer"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="cursor-pointer rounded border-slate-300 text-brand-cyan focus:ring-brand-cyan"
                />
                <label htmlFor="isActiveOffer" className="font-normal text-slate-600 cursor-pointer">
                  {currentLang === "hi" ? "होमपेज / शॉप बैनर पर प्रदर्शित करें" : "Display on homepage/shop banner"}
                </label>
              </div>

              {/* Image Upload Area */}
              <div className="flex flex-col gap-1 mt-1">
                <label className="font-normal text-slate-500">{currentLang === "hi" ? "बैनर छवि" : "Banner Image"}</label>

                {existingOfferImage && !offerImage && (
                  <div className="relative w-32 h-16 rounded border border-slate-200 bg-slate-50 p-1 flex justify-center items-center mb-1">
                    <img src={existingOfferImage} alt="Offer Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}

                <div className="border border-dashed border-slate-300 rounded p-4 text-center hover:border-brand-cyan transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-slate-600 font-normal">
                      {offerImage ? offerImage.name : currentLang === "hi" ? "बैनर छवि चुनें" : "Choose banner image"}
                    </span>
                    <span className="text-[10px] text-slate-400">Supports JPG, PNG, WEBP (Max 15MB)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2 bg-brand-cyan hover:bg-brand-cyan/95 text-white font-medium text-xs rounded shadow-sm border-0 cursor-pointer transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border border-white border-t-transparent rounded-full" />
                    {currentLang === "hi" ? "सहेजा जा रहा है..." : "Saving..."}
                  </>
                ) : (
                  currentLang === "hi" ? "बदलाव सुरक्षित करें" : "Save Changes"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(OffersTab);

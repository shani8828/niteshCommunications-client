import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";
import { clearCache } from "../../utils/cache";

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

const RepairServicesTab = ({
  repairPricingList,
  setRepairPricingList,
  t,
  currentLang,
  fetchRepairPricing,
  setLoading,
}) => {
  const [activeService, setActiveService] = useState(null);
  const [activeBrand, setActiveBrand] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for service configuration
  const [srvKey, setSrvKey] = useState("");
  const [srvCategory, setSrvCategory] = useState("");
  const [srvTitleEn, setSrvTitleEn] = useState("");
  const [srvTitleHi, setSrvTitleHi] = useState("");
  const [srvDescEn, setSrvDescEn] = useState("");
  const [srvDescHi, setSrvDescHi] = useState("");

  // Brand Form states
  const [newBrandName, setNewBrandName] = useState("");
  const [editingBrandName, setEditingBrandName] = useState("");

  // Model Form states
  const [newModelName, setNewModelName] = useState("");
  const [newModelPrice, setNewModelPrice] = useState("");
  const [editingModelName, setEditingModelName] = useState("");
  const [editingModelPrice, setEditingModelPrice] = useState("");

  // Auto-translate refs
  const srvTitleEnDirty = useRef(false);
  const srvTitleHiManual = useRef(false);
  const srvDescEnDirty = useRef(false);
  const srvDescHiManual = useRef(false);

  // Auto-translate Service Title
  useEffect(() => {
    if (!srvTitleEnDirty.current || srvTitleHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (srvTitleEn.trim()) {
        const translated = await translateToHindi(srvTitleEn);
        if (translated && !srvTitleHiManual.current) {
          setSrvTitleHi(translated);
        }
      } else {
        setSrvTitleHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [srvTitleEn]);

  // Auto-translate Service Description
  useEffect(() => {
    if (!srvDescEnDirty.current || srvDescHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (srvDescEn.trim()) {
        const translated = await translateToHindi(srvDescEn);
        if (translated && !srvDescHiManual.current) {
          setSrvDescHi(translated);
        }
      } else {
        setSrvDescHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [srvDescEn]);

  // Sync active service if repair pricing list changes
  useEffect(() => {
    if (activeService) {
      const updated = repairPricingList.find((s) => s._id === activeService._id);
      if (updated) {
        setActiveService(updated);
      }
    }
  }, [repairPricingList]);

  const handleEditServiceClick = (service) => {
    setEditingService(service);
    setSrvKey(service.serviceKey);
    setSrvCategory(service.category);
    setSrvTitleEn(service.title.en);
    setSrvTitleHi(service.title.hi);
    setSrvDescEn(service.desc.en);
    setSrvDescHi(service.desc.hi);
    srvTitleEnDirty.current = false;
    srvTitleHiManual.current = false;
    srvDescEnDirty.current = false;
    srvDescHiManual.current = false;
    setShowServiceModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!srvKey || !srvCategory || !srvTitleEn || !srvTitleHi || !srvDescEn || !srvDescHi) {
      showToast.error("Please fill all required fields / कृपया सभी आवश्यक फ़ील्ड भरें");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        serviceKey: srvKey.trim(),
        category: srvCategory.trim(),
        title: { en: srvTitleEn.trim(), hi: srvTitleHi.trim() },
        desc: { en: srvDescEn.trim(), hi: srvDescHi.trim() },
      };
      let res;
      if (editingService) {
        payload.brands = editingService.brands;
        res = await api.put(`/repairs/pricing/${editingService._id}`, payload);
        showToast.success("Service updated successfully! / सेवा सफलतापूर्वक अपडेट की गई!");
      } else {
        payload.brands = {};
        res = await api.post("/repairs/pricing", payload);
        showToast.success("Service added successfully! / सेवा सफलतापूर्वक जोड़ी गई!");
      }
      setShowServiceModal(false);
      setEditingService(null);
      setSrvKey("");
      setSrvCategory("");
      setSrvTitleEn("");
      setSrvTitleHi("");
      setSrvDescEn("");
      setSrvDescHi("");

      await fetchRepairPricing();
      clearCache();

      if (editingService && activeService && activeService._id === editingService._id) {
        setActiveService(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast.error(err.response?.data?.message || "Failed to save service / सेवा सहेजने में विफल");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this repair service category? This will delete all its brands and models too. / क्या आप वाकई इस रिपेयर सेवा श्रेणी को हटाना चाहते हैं? इससे इसके सभी ब्रांड और मॉडल भी हट जाएंगे।")) return;
    
    let rollbackPricing = repairPricingList;
    setRepairPricingList((prev) => prev.filter((s) => s._id !== id));

    try {
      await api.delete(`/repairs/pricing/${id}`);
      showToast.success("Service deleted successfully! / सेवा सफलतापूर्वक हटा दी गई!");
      clearCache();
      if (activeService && activeService._id === id) {
        setActiveService(null);
        setActiveBrand("");
      }
      fetchRepairPricing().catch(console.error);
    } catch (err) {
      console.error(err);
      showToast.error(err.response?.data?.message || "Failed to delete service / सेवा हटाने में विफल");
      setRepairPricingList(rollbackPricing);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const brandName = newBrandName.trim();
    if (activeService.brands && activeService.brands[brandName]) {
      showToast.error("Brand already exists! / ब्रांड पहले से मौजूद है!");
      return;
    }
    const updatedBrands = {
      ...(activeService.brands || {}),
      [brandName]: {},
    };

    const originalService = activeService;
    const updatedService = { ...activeService, brands: updatedBrands };
    setActiveService(updatedService);
    setRepairPricingList((prev) =>
      prev.map((s) => (s._id === activeService._id ? updatedService : s))
    );
    setNewBrandName("");

    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Brand ${brandName} added! / ब्रांड ${brandName} जोड़ा गया!`);
      clearCache();
      setActiveService(res.data);
      setRepairPricingList((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to add brand / ब्रांड जोड़ने में विफल");
      setActiveService(originalService);
      setRepairPricingList((prev) =>
        prev.map((s) => (s._id === originalService._id ? originalService : s))
      );
    }
  };

  const handleRenameBrand = async (oldName, newName) => {
    if (!newName.trim() || oldName === newName.trim()) return;
    const cleanNewName = newName.trim();
    if (activeService.brands[cleanNewName]) {
      showToast.error("Brand name already exists! / ब्रांड नाम पहले से मौजूद है!");
      return;
    }
    const updatedBrands = { ...activeService.brands };
    updatedBrands[cleanNewName] = { ...updatedBrands[oldName] };
    delete updatedBrands[oldName];

    const originalService = activeService;
    const updatedService = { ...activeService, brands: updatedBrands };
    setActiveService(updatedService);
    setRepairPricingList((prev) =>
      prev.map((s) => (s._id === activeService._id ? updatedService : s))
    );
    if (activeBrand === oldName) {
      setActiveBrand(cleanNewName);
    }
    setEditingBrandName("");

    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success("Brand renamed! / ब्रांड का नाम बदला गया!");
      clearCache();
      setActiveService(res.data);
      setRepairPricingList((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to rename brand / ब्रांड का नाम बदलने में विफल");
      setActiveService(originalService);
      setRepairPricingList((prev) =>
        prev.map((s) => (s._id === originalService._id ? originalService : s))
      );
      if (activeBrand === cleanNewName) {
        setActiveBrand(oldName);
      }
    }
  };

  const handleDeleteBrand = async (brandName) => {
    if (!window.confirm(`Are you sure you want to delete brand "${brandName}" and all its models? / क्या आप वाकई ब्रांड "${brandName}" और इसके सभी मॉडलों को हटाना चाहते हैं?`)) return;
    const updatedBrands = { ...activeService.brands };
    delete updatedBrands[brandName];

    const originalService = activeService;
    const updatedService = { ...activeService, brands: updatedBrands };
    setActiveService(updatedService);
    setRepairPricingList((prev) =>
      prev.map((s) => (s._id === activeService._id ? updatedService : s))
    );
    const originalActiveBrand = activeBrand;
    if (activeBrand === brandName) {
      setActiveBrand("");
    }

    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Brand ${brandName} deleted! / ब्रांड ${brandName} हटाया गया!`);
      clearCache();
      setActiveService(res.data);
      setRepairPricingList((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to delete brand / ब्रांड हटाने में विफल");
      setActiveService(originalService);
      setRepairPricingList((prev) =>
        prev.map((s) => (s._id === originalService._id ? originalService : s))
      );
      if (originalActiveBrand === brandName) {
        setActiveBrand(originalActiveBrand);
      }
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!newModelName.trim() || !newModelPrice) {
      showToast.error("Please enter both model name and price / कृपया मॉडल का नाम और कीमत दोनों दर्ज करें");
      return;
    }
    const modelName = newModelName.trim();
    const price = parseInt(newModelPrice);
    if (activeService.brands[activeBrand] && activeService.brands[activeBrand][modelName] !== undefined) {
      showToast.error("Model already exists! / मॉडल पहले से मौजूद है!");
      return;
    }
    const updatedBrands = { ...activeService.brands };
    updatedBrands[activeBrand] = {
      ...(updatedBrands[activeBrand] || {}),
      [modelName]: price,
    };

    const originalService = activeService;
    const updatedService = { ...activeService, brands: updatedBrands };
    setActiveService(updatedService);
    setRepairPricingList((prev) =>
      prev.map((s) => (s._id === activeService._id ? updatedService : s))
    );
    setNewModelName("");
    setNewModelPrice("");

    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Model ${modelName} added! / मॉडल ${modelName} जोड़ा गया!`);
      clearCache();
      setActiveService(res.data);
      setRepairPricingList((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to add model / मॉडल जोड़ने में विफल");
      setActiveService(originalService);
      setRepairPricingList((prev) =>
        prev.map((s) => (s._id === originalService._id ? originalService : s))
      );
    }
  };

  const handleEditModelPrice = async (modelName, newPrice) => {
    const price = parseInt(newPrice);
    if (isNaN(price)) return;
    const updatedBrands = { ...activeService.brands };
    updatedBrands[activeBrand] = {
      ...updatedBrands[activeBrand],
      [modelName]: price,
    };

    const originalService = activeService;
    const updatedService = { ...activeService, brands: updatedBrands };
    setActiveService(updatedService);
    setRepairPricingList((prev) =>
      prev.map((s) => (s._id === activeService._id ? updatedService : s))
    );
    setEditingModelName("");
    setEditingModelPrice("");

    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Updated ${modelName} price to ₹${price}! / ₹${price} पर ${modelName} की कीमत अपडेट की गई!`);
      clearCache();
      setActiveService(res.data);
      setRepairPricingList((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to update price / कीमत अपडेट करने में विफल");
      setActiveService(originalService);
      setRepairPricingList((prev) =>
        prev.map((s) => (s._id === originalService._id ? originalService : s))
      );
    }
  };

  const handleDeleteModel = async (modelName) => {
    if (!window.confirm(`Are you sure you want to delete model "${modelName}"? / क्या आप वाकई मॉडल "${modelName}" को हटाना चाहते हैं?`)) return;
    const updatedBrands = { ...activeService.brands };
    updatedBrands[activeBrand] = { ...updatedBrands[activeBrand] };
    delete updatedBrands[activeBrand][modelName];

    const originalService = activeService;
    const updatedService = { ...activeService, brands: updatedBrands };
    setActiveService(updatedService);
    setRepairPricingList((prev) =>
      prev.map((s) => (s._id === activeService._id ? updatedService : s))
    );

    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Model ${modelName} deleted! / मॉडल ${modelName} हटाया गया!`);
      clearCache();
      setActiveService(res.data);
      setRepairPricingList((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to delete model / मॉडल हटाने में विफल");
      setActiveService(originalService);
      setRepairPricingList((prev) =>
        prev.map((s) => (s._id === originalService._id ? originalService : s))
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn text-left">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            {currentLang === "hi" ? "मोबाइल रिपेयर सेवाएं और मूल्य निर्धारण" : "Mobile Repair Services & Pricing"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {currentLang === "hi"
              ? "सेवा श्रेणियां, ब्रांड और व्यक्तिगत मॉडल कीमतों को गतिशील रूप से प्रबंधित करें।"
              : "Dynamically manage service categories, brands, and individual model pricing."}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setSrvKey("");
            setSrvCategory("");
            setSrvTitleEn("");
            setSrvTitleHi("");
            setSrvDescEn("");
            setSrvDescHi("");
            srvTitleEnDirty.current = false;
            srvTitleHiManual.current = false;
            srvDescEnDirty.current = false;
            srvDescHiManual.current = false;
            setShowServiceModal(true);
          }}
          className="px-4 py-2.5 text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/95 text-white rounded flex items-center gap-1.5 shadow border-0 cursor-pointer transition-all"
        >
          <Plus size={14} /> {currentLang === "hi" ? "नई सेवा जोड़ें" : "Add New Service"}
        </button>
      </div>

      {/* 3-Column Manager Layout */}
      <div className="grid gap-1 grid-cols-1 md:grid-cols-3 items-start">
        {/* Column 1: Service Categories */}
        <div className="glass-card p-5 rounded flex flex-col gap-4 shadow-sm h-[600px] bg-white border border-slate-200/80">
          <h4 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
            <span>1. {currentLang === "hi" ? "सेवा श्रेणी" : "Service Category"}</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
              {repairPricingList.length}
            </span>
          </h4>
          <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2">
            {repairPricingList.map((service) => (
              <div
                key={service._id}
                onClick={() => {
                  setActiveService(service);
                  setActiveBrand("");
                }}
                className={`p-3.5 rounded cursor-pointer transition-all border text-left ${
                  activeService?._id === service._id
                    ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan font-bold"
                    : "bg-white/5 border-slate-100 hover:bg-slate-50 text-slate-700 font-normal"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-xs truncate">
                      {currentLang === "hi" ? service.title.hi : service.title.en}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate font-normal">
                      {service.category} ({service.serviceKey})
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditServiceClick(service)}
                      className="p-1 text-brand-cyan hover:bg-brand-cyan/5 rounded border-0 cursor-pointer"
                      title="Edit Service"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded border-0 cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {repairPricingList.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-8">
                {currentLang === "hi" ? "कोई सेवा उपलब्ध नहीं है" : "No services available"}
              </p>
            )}
          </div>
        </div>

        {/* Column 2: Brands */}
        <div className="glass-card p-5 rounded flex flex-col gap-4 shadow-sm h-[600px] bg-white border border-slate-200/80">
          <h4 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
            <span>2. {currentLang === "hi" ? "ब्रांड" : "Brands"}</span>
            {activeService && (
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                {Object.keys(activeService.brands || {}).length}
              </span>
            )}
          </h4>

          {!activeService ? (
            <div className="flex-grow flex items-center justify-center text-center p-6">
              <p className="text-xs text-slate-400">
                {currentLang === "hi"
                  ? "👈 ब्रांड देखने और प्रबंधित करने के लिए एक सेवा चुनें।"
                  : "👈 Select a service to view and manage brands."}
              </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col gap-4 min-h-0">
              <form onSubmit={handleAddBrand} className="flex gap-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan text-xs"
                  placeholder={currentLang === "hi" ? "उदा. Apple, Samsung" : "e.g. Apple, Samsung"}
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-brand-cyan hover:bg-brand-cyan/95 text-white rounded text-xs font-bold shadow cursor-pointer transition-all border-0 flex-shrink-0"
                >
                  {currentLang === "hi" ? "जोड़ें" : "Add"}
                </button>
              </form>

              <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2">
                {Object.keys(activeService.brands || {}).map((brandName) => (
                  <div
                    key={brandName}
                    onClick={() => {
                      if (editingBrandName !== brandName) {
                        setActiveBrand(brandName);
                      }
                    }}
                    className={`p-3 rounded cursor-pointer transition-all border text-left flex justify-between items-center gap-2 ${
                      activeBrand === brandName
                        ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan font-bold"
                        : "bg-white/5 border-slate-100 hover:bg-slate-50 text-slate-700 font-normal"
                    }`}
                  >
                    {editingBrandName === brandName ? (
                      <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 text-xs focus:border-brand-cyan outline-none"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameBrand(brandName, newBrandName);
                          }}
                          className="px-2 py-1 bg-brand-cyan text-white text-[10px] rounded border-0 cursor-pointer font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBrandName("");
                            setNewBrandName("");
                          }}
                          className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] rounded border-0 cursor-pointer font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-xs truncate">{brandName}</span>
                        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingBrandName(brandName);
                              setNewBrandName(brandName);
                            }}
                            className="p-1 text-brand-cyan hover:bg-brand-cyan/5 rounded border-0 cursor-pointer"
                            title="Rename Brand"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brandName)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded border-0 cursor-pointer"
                            title="Delete Brand"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {Object.keys(activeService.brands || {}).length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-8 font-semibold">
                    {currentLang === "hi" ? "कोई ब्रांड पंजीकृत नहीं है" : "No brands registered"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Models & Pricing */}
        <div className="glass-card p-5 rounded flex flex-col gap-4 shadow-sm h-[600px] bg-white border border-slate-200/80">
          <h4 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
            <span>3. {currentLang === "hi" ? "मॉडल और कीमतें" : "Models & Prices"}</span>
            {activeService && activeBrand && (
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                {Object.keys(activeService.brands[activeBrand] || {}).length}
              </span>
            )}
          </h4>

          {!activeService || !activeBrand ? (
            <div className="flex-grow flex items-center justify-center text-center p-6">
              <p className="text-xs text-slate-400">
                {currentLang === "hi"
                  ? "👈 मॉडल और कीमतें प्रबंधित करने के लिए एक ब्रांड चुनें।"
                  : "👈 Select a brand to manage models and pricing."}
              </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col gap-4 min-h-0">
              <form onSubmit={handleAddModel} className="flex flex-col gap-2 p-3 bg-slate-50/50 border border-slate-100 rounded">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider text-left">
                  {currentLang === "hi" ? "नया मॉडल जोड़ें" : "Add New Model"}
                </p>
                <div className="grid gap-1 grid-cols-1 sm:grid-cols-2">
                  <input
                    type="text"
                    className="px-3 py-2 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan text-xs"
                    placeholder={currentLang === "hi" ? "मॉडल (उदा. iPhone 13)" : "Model (e.g. iPhone 13)"}
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="px-3 py-2 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan text-xs"
                    placeholder={currentLang === "hi" ? "कीमत (₹)" : "Price (₹)"}
                    value={newModelPrice}
                    onChange={(e) => setNewModelPrice(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-brand-cyan hover:bg-brand-cyan/95 text-white rounded text-xs font-bold shadow cursor-pointer transition-all border-0"
                >
                  {currentLang === "hi" ? "मॉडल सहेजें" : "Save Model"}
                </button>
              </form>

              <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2">
                {Object.entries(activeService.brands[activeBrand] || {}).map(([modelName, price]) => (
                  <div
                    key={modelName}
                    className="p-3 rounded border border-slate-100 bg-white/5 flex justify-between items-center gap-2"
                  >
                    <div className="flex-grow min-w-0 text-left">
                      {editingModelName === modelName ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs truncate max-w-[120px] text-slate-800">{modelName}</span>
                          <input
                            type="number"
                            className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 text-xs focus:border-brand-cyan outline-none"
                            value={editingModelPrice}
                            onChange={(e) => setEditingModelPrice(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditModelPrice(modelName, editingModelPrice)}
                            className="px-2 py-1 bg-brand-cyan text-white text-[10px] rounded border-0 cursor-pointer font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingModelName("")}
                            className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] rounded border-0 cursor-pointer font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="font-bold text-xs text-slate-800 truncate">{modelName}</p>
                      )}
                    </div>

                    {editingModelName !== modelName && (
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs text-brand-cyan font-mono">₹{price}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingModelName(modelName);
                              setEditingModelPrice(price.toString());
                            }}
                            className="p-1 text-brand-cyan hover:bg-brand-cyan/5 rounded border-0 cursor-pointer"
                            title="Edit Price"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteModel(modelName)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded border-0 cursor-pointer"
                            title="Delete Model"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {Object.keys(activeService.brands[activeBrand] || {}).length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-8 font-semibold">
                    {currentLang === "hi" ? "कोई मॉडल सूचीबद्ध नहीं है" : "No models listed"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 bg-blue-50/50 border border-blue-100 rounded shadow-sm text-left">
        <h5 className="font-heading text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">
          💡 {currentLang === "hi" ? "व्यवस्थापक मार्गदर्शिका (Directions for Admin):" : "Directions for Admin:"}
        </h5>
        <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
          <li>{currentLang === "hi" ? "चरण 1: बाईं ओर 'नई सेवा जोड़ें' पर क्लिक करके रिपेयर सेवा श्रेणी बनाएं या संपादित करें।" : "Step 1: Create or edit a repair service category using 'Add New Service' on the left."}</li>
          <li>{currentLang === "hi" ? "चरण 2: संबंधित सेवा पर क्लिक करें, फिर बीच के कॉलम में उस सेवा के लिए समर्थित ब्रांड (उदा. Apple, Samsung) जोड़ें।" : "Step 2: Click on a service, then add supported brands (e.g. Apple, Samsung) for that service in the middle column."}</li>
          <li>{currentLang === "hi" ? "चरण 3: किसी ब्रांड पर क्लिक करें, फिर दाएं कॉलम में व्यक्तिगत फोन मॉडल और उनकी संबंधित रिपेयरिंग कीमतों को जोड़ें/संपादित करें।" : "Step 3: Click on a brand, then add/edit individual phone models and their respective repair prices in the right column."}</li>
          <li>{currentLang === "hi" ? "मॉडल की कीमतों में बदलाव तुरंत सहेज लिए जाते हैं और ग्राहक बुकिंग विजार्ड में लाइव हो जाते हैं।" : "Model pricing edits are saved instantly and reflect live in the customer booking wizard."}</li>
        </ul>
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingService ? "Edit Service Category / सेवा श्रेणी संपादित करें" : "Add Service Category / नई सेवा श्रेणी जोड़ें"}
              </h3>
              <button
                type="button"
                onClick={() => !isSaving && setShowServiceModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer"
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="flex flex-col gap-4 text-xs">
              <div className="grid gap-1 grid-cols-1 sm:grid-cols-2">
                {/* Service Key */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">Service Key (English unique key) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingService}
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="e.g. motherboard_repair"
                    value={srvKey}
                    onChange={(e) => setSrvKey(e.target.value)}
                  />
                </div>

                {/* Service Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">Category Category Name *</label>
                  <input
                    type="text"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="e.g. Hardware repair"
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1 grid-cols-1 sm:grid-cols-2">
                {/* Title EN */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">Service Title (English) *</label>
                  <input
                    type="text"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="e.g. Motherboard IC Level Repair"
                    value={srvTitleEn}
                    onChange={(e) => {
                      srvTitleEnDirty.current = true;
                      setSrvTitleEn(e.target.value);
                    }}
                  />
                </div>

                {/* Title HI */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">सेवा शीर्षक (हिंदी) *</label>
                  <input
                    type="text"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="उदा. मदरबोर्ड आईसी चिप-लेवल मरम्मत"
                    value={srvTitleHi}
                    onChange={(e) => {
                      srvTitleHiManual.current = true;
                      setSrvTitleHi(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-1 grid-cols-1 sm:grid-cols-2">
                {/* Desc EN */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">Description (English) *</label>
                  <textarea
                    required
                    rows="3"
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan resize-none"
                    placeholder="e.g. Micro-soldering, water damage recovery..."
                    value={srvDescEn}
                    onChange={(e) => {
                      srvDescEnDirty.current = true;
                      setSrvDescEn(e.target.value);
                    }}
                  />
                </div>

                {/* Desc HI */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">विवरण (हिंदी) *</label>
                  <textarea
                    required
                    rows="3"
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan resize-none"
                    placeholder="उदा. माइक्रो-सोल्डरिंग, लिक्विड डैमेज रिकवरी..."
                    value={srvDescHi}
                    onChange={(e) => {
                      srvDescHiManual.current = true;
                      setSrvDescHi(e.target.value);
                    }}
                  />
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

export default React.memo(RepairServicesTab);

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
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

const cscIconList = [
  "FileText",
  "Shield",
  "User",
  "CreditCard",
  "BookOpen",
  "Briefcase",
  "Home",
  "Heart",
  "Globe",
  "Smartphone",
  "MapPin",
  "Calendar",
  "Activity",
  "Award",
];

const CscServicesTab = ({
  cscServicesList,
  t,
  currentLang,
  fetchCscServices,
  setLoading,
}) => {
  const [showCscModal, setShowCscModal] = useState(false);
  const [editingCscService, setEditingCscService] = useState(null);

  // Form states
  const [cscTitleEn, setCscTitleEn] = useState("");
  const [cscTitleHi, setCscTitleHi] = useState("");
  const [cscDescEn, setCscDescEn] = useState("");
  const [cscDescHi, setCscDescHi] = useState("");
  const [cscFeeEn, setCscFeeEn] = useState("");
  const [cscFeeHi, setCscFeeHi] = useState("");
  const [cscDocsEn, setCscDocsEn] = useState("");
  const [cscDocsHi, setCscDocsHi] = useState("");
  const [cscIcon, setCscIcon] = useState("FileText");

  // Auto-translate refs
  const cscTitleEnDirty = useRef(false);
  const cscTitleHiManual = useRef(false);
  const cscDescEnDirty = useRef(false);
  const cscDescHiManual = useRef(false);

  // Auto-translate CSC Service Title
  useEffect(() => {
    if (!cscTitleEnDirty.current || cscTitleHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (cscTitleEn.trim()) {
        const translated = await translateToHindi(cscTitleEn);
        if (translated && !cscTitleHiManual.current) {
          setCscTitleHi(translated);
        }
      } else {
        setCscTitleHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [cscTitleEn]);

  // Auto-translate CSC Service Description
  useEffect(() => {
    if (!cscDescEnDirty.current || cscDescHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (cscDescEn.trim()) {
        const translated = await translateToHindi(cscDescEn);
        if (translated && !cscDescHiManual.current) {
          setCscDescHi(translated);
        }
      } else {
        setCscDescHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [cscDescEn]);

  const handleEditCscClick = (service) => {
    setEditingCscService(service);
    setCscTitleEn(service.title.en);
    setCscTitleHi(service.title.hi);
    setCscDescEn(service.desc.en);
    setCscDescHi(service.desc.hi);
    setCscFeeEn(service.fee.en);
    setCscFeeHi(service.fee.hi);
    setCscDocsEn(service.documents?.en?.join(", ") || "");
    setCscDocsHi(service.documents?.hi?.join(", ") || "");
    setCscIcon(service.icon || "FileText");
    cscTitleEnDirty.current = false;
    cscTitleHiManual.current = false;
    cscDescEnDirty.current = false;
    cscDescHiManual.current = false;
    setShowCscModal(true);
  };

  const handleSaveCscService = async (e) => {
    e.preventDefault();
    if (!cscTitleEn || !cscTitleHi || !cscDescEn || !cscDescHi || !cscFeeEn || !cscFeeHi || !cscIcon) {
      showToast.error("Please fill all required fields / कृपया सभी आवश्यक फ़ील्ड भरें");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: { en: cscTitleEn, hi: cscTitleHi },
        desc: { en: cscDescEn, hi: cscDescHi },
        fee: { en: cscFeeEn, hi: cscFeeHi },
        documents: {
          en: cscDocsEn.split(",").map((d) => d.trim()).filter(Boolean),
          hi: cscDocsHi.split(",").map((d) => d.trim()).filter(Boolean),
        },
        icon: cscIcon,
      };

      if (editingCscService) {
        await api.put(`/csc/services/${editingCscService._id}`, payload);
        showToast.success("CSC Service updated successfully! / सीएससी सेवा सफलतापूर्वक अपडेट की गई!");
      } else {
        await api.post("/csc/services", payload);
        showToast.success("CSC Service created successfully! / सीएससी सेवा सफलतापूर्वक बनाई गई!");
      }

      setShowCscModal(false);
      setEditingCscService(null);
      setCscTitleEn("");
      setCscTitleHi("");
      setCscDescEn("");
      setCscDescHi("");
      setCscFeeEn("");
      setCscFeeHi("");
      setCscDocsEn("");
      setCscDocsHi("");
      setCscIcon("FileText");
      await fetchCscServices();
      clearCache();
    } catch (err) {
      console.error(err);
      showToast.error("Failed to save CSC service / सीएससी सेवा सहेजने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCscService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this CSC Service? / क्या आप वाकई इस सीएससी सेवा को हटाना चाहते हैं?")) return;
    setLoading(true);
    try {
      await api.delete(`/csc/services/${id}`);
      showToast.success("CSC Service deleted! / सीएससी सेवा हटा दी गई!");
      await fetchCscServices();
      clearCache();
    } catch (err) {
      console.error(err);
      showToast.error("Failed to delete CSC service / सीएससी सेवा हटाने में विफल");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn text-left">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            {currentLang === "hi" ? "सीएससी सेवाएं सूची" : "CSC Services Catalog"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {currentLang === "hi"
              ? "सीएससी पोर्टल पर प्रदर्शित सरकारी डिजिटल सेवाओं, शुल्कों और आवश्यक दस्तावेजों को प्रबंधित करें।"
              : "Manage digital government services, fees, and required documents shown on the CSC portal."}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCscService(null);
            setCscTitleEn("");
            setCscTitleHi("");
            setCscDescEn("");
            setCscDescHi("");
            setCscFeeEn("");
            setCscFeeHi("");
            setCscDocsEn("");
            setCscDocsHi("");
            setCscIcon("FileText");
            cscTitleEnDirty.current = false;
            cscTitleHiManual.current = false;
            cscDescEnDirty.current = false;
            cscDescHiManual.current = false;
            setShowCscModal(true);
          }}
          className="px-4 py-2.5 text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/95 text-white rounded-xl flex items-center gap-1.5 shadow border-0 cursor-pointer transition-all"
        >
          <Plus size={14} /> {currentLang === "hi" ? "नई सेवा जोड़ें" : "Add New Service"}
        </button>
      </div>

      {/* CSC Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cscServicesList.map((service) => {
          const IconComponent = LucideIcons[service.icon] || LucideIcons.FileText;
          return (
            <div
              key={service._id}
              className="flex flex-col p-6 bg-white border border-slate-200/80 rounded-2xl gap-3 relative shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl flex justify-center items-center">
                  <IconComponent size={20} className="text-blue-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditCscClick(service)}
                    className="p-1.5 text-brand-cyan hover:bg-brand-cyan/5 rounded border-0 cursor-pointer transition-all bg-transparent"
                    title="Edit Service"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCscService(service._id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded border-0 cursor-pointer transition-all bg-transparent"
                    title="Delete Service"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-heading text-base font-bold text-slate-800">
                  {service.title[currentLang]}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
                  {service.desc[currentLang]}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {currentLang === "hi" ? "शुल्क: " : "Fee: "}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {service.fee[currentLang]}
                  </span>
                </div>
                {service.documents &&
                  ((service.documents.en && service.documents.en.length > 0) ||
                    (service.documents.hi && service.documents.hi.length > 0)) && (
                    <>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                        {currentLang === "hi" ? "आवश्यक दस्तावेज:" : "Required Documents:"}
                      </p>
                      <ul className="list-none p-0 m-0 flex flex-col gap-1">
                        {(service.documents[currentLang] || []).map((doc, dIdx) => (
                          <li key={dIdx} className="text-xs text-slate-700 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <span className="truncate">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
              </div>
            </div>
          );
        })}
        {cscServicesList.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 font-semibold bg-white border border-slate-100 rounded-2xl">
            {currentLang === "hi" ? "कोई सीएससी सेवाएं नहीं मिलीं।" : "No CSC services found."}
          </div>
        )}
      </div>

      {/* CSC Modal */}
      {showCscModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-5 text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingCscService ? "Edit CSC Service / सीएससी सेवा संपादित करें" : "Add CSC Service / नई सीएससी सेवा जोड़ें"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCscModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCscService} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title EN */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">Service Title (English) *</label>
                  <input
                    type="text"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="e.g. Caste Certificate"
                    value={cscTitleEn}
                    onChange={(e) => {
                      cscTitleEnDirty.current = true;
                      setCscTitleEn(e.target.value);
                    }}
                  />
                </div>

                {/* Title HI */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">सेवा शीर्षक (हिंदी) *</label>
                  <input
                    type="text"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="उदा. जाति प्रमाण पत्र"
                    value={cscTitleHi}
                    onChange={(e) => {
                      cscTitleHiManual.current = true;
                      setCscTitleHi(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desc EN */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">Description (English) *</label>
                  <textarea
                    required
                    rows="3"
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan resize-none"
                    placeholder="e.g. Application for government certified caste document..."
                    value={cscDescEn}
                    onChange={(e) => {
                      cscDescEnDirty.current = true;
                      setCscDescEn(e.target.value);
                    }}
                  />
                </div>

                {/* Desc HI */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">विवरण (हिंदी) *</label>
                  <textarea
                    required
                    rows="3"
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan resize-none"
                    placeholder="उदा. सरकारी प्रमाणित जाति प्रमाण पत्र के लिए आवेदन..."
                    value={cscDescHi}
                    onChange={(e) => {
                      cscDescHiManual.current = true;
                      setCscDescHi(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fee EN */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">Service Fee (English) *</label>
                  <input
                    type="text"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="e.g. ₹50 (Government charge)"
                    value={cscFeeEn}
                    onChange={(e) => setCscFeeEn(e.target.value)}
                  />
                </div>

                {/* Fee HI */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">सेवा शुल्क (हिंदी) *</label>
                  <input
                    type="text"
                    required
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="उदा. ₹50 (सरकारी शुल्क)"
                    value={cscFeeHi}
                    onChange={(e) => setCscFeeHi(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Docs EN */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">Required Docs (English, comma-separated)</label>
                  <input
                    type="text"
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="Aadhaar Card, Photo, Self Declaration"
                    value={cscDocsEn}
                    onChange={(e) => setCscDocsEn(e.target.value)}
                  />
                </div>

                {/* Docs HI */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500">आवश्यक दस्तावेज (हिंदी, अल्पविराम-अलग)</label>
                  <input
                    type="text"
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan"
                    placeholder="आधार कार्ड, फोटो, स्व घोषणा पत्र"
                    value={cscDocsHi}
                    onChange={(e) => setCscDocsHi(e.target.value)}
                  />
                </div>
              </div>

              {/* Icon select */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-500">Service Icon *</label>
                <div className="grid grid-cols-5 gap-2 max-h-[100px] overflow-y-auto p-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                  {cscIconList.map((ic) => {
                    const TempIcon = LucideIcons[ic] || LucideIcons.FileText;
                    return (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setCscIcon(ic)}
                        className={`p-2.5 rounded-lg flex justify-center items-center cursor-pointer transition-colors border ${
                          cscIcon === ic
                            ? "bg-brand-cyan text-white border-brand-cyan"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <TempIcon size={16} />
                      </button>
                    );
                  })}
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

export default React.memo(CscServicesTab);

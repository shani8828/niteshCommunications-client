import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { showToast } from "../utils/toast";
import { getCachedData, setCachedData } from "../utils/cache";
import QuickLinksBanner from "../components/common/QuickLinksBanner";
import CscServicesGrid from "../components/csc/CscServicesGrid";
import Xerox from "../components/xerox/Xerox";
import { Printer } from "lucide-react";

const CscService = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isXeroxOpen, setIsXeroxOpen] = useState(false);

  // SEO Updates
  useEffect(() => {
    document.title =
      "CSC Digital Government Services | सीएससी डिजिटल सरकारी सेवाएं | Nitesh Communications";

    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Aadhaar correction, PAN card application, banking services, and government schemes in Ayodhya. आधार सुधार, पैन कार्ड आवेदन, बैंकिंग और सरकारी डिजिटल सेवाएं।",
    );

    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", `${window.location.origin}/csc`);
  }, [currentLang]);

  // Fetch CSC Services
  useEffect(() => {
    const fetchServices = async () => {
      const cacheKey = "csc_services_list";
      const cached = getCachedData(cacheKey);
      if (cached) {
        setServicesList(cached);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/csc/services");
        setServicesList(res.data || []);
        setCachedData(cacheKey, res.data || [], 10 * 60 * 1000); // Cache for 10 minutes
      } catch (err) {
        console.error(err);
        showToast.error(
          "Failed to load CSC services / सीएससी सेवाएं लोड करने में विफल",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 relative flex flex-col gap-8">
      {loading && <Loader fullPage />}

      {/* Premium Document Printout / Xerox Promo Hero Card */}
      <div className="bg-blue-100 text-blue-500 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-blue-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col gap-2 max-w-xl text-center md:text-left">
          <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-3 py-1 rounded-full border border-blue-500/30 w-fit mx-auto md:mx-0 uppercase tracking-widest">
            Doorstep Delivery
          </span>
          <h2 className="font-heading text-xl md:text-2xl font-extrabold tracking-tight mt-1">
            Online Document Printing & Xerox
          </h2>
          <p className="text-xs   leading-relaxed mt-1">
            Need documents printed quickly? Upload files (PDF, images, docx)
            online, select copies and color preferences, and get them delivered
            to your home.
            <span className="block mt-1 font-semibold text-brand-cyan">
              ✓ Black & White at ₹5/page | ✓ Coloured at ₹7/page
            </span>
          </p>
        </div>

        <button
          onClick={() => setIsXeroxOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-brand-cyan hover:bg-brand-cyan-dark text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-brand-cyan/20 cursor-pointer border-0 flex-shrink-0"
        >
          <Printer size={16} /> Print / Xerox Documents Now
        </button>
      </div>

      <CscServicesGrid
        servicesList={servicesList}
        loading={loading}
        currentLang={currentLang}
      />

      <QuickLinksBanner currentType="csc" />

      {/* Xerox/Printout Wizard Modal */}
      <Xerox isOpen={isXeroxOpen} onClose={() => setIsXeroxOpen(false)} />
    </div>
  );
};

export default CscService;

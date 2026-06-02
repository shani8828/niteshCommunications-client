import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { showToast } from "../utils/toast";
import { getCachedData, setCachedData } from "../utils/cache";
import QuickLinksBanner from "../components/common/QuickLinksBanner";
import CscServicesGrid from "../components/csc/CscServicesGrid";

const CscService = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "hi";

  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);

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
      "Aadhaar correction, PAN card application, banking services, and government schemes in Ayodhya. आधार सुधार, पैन कार्ड आवेदन, बैंकिंग और सरकारी डिजिटल सेवाएं।"
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
        showToast.error("Failed to load CSC services / सीएससी सेवाएं लोड करने में विफल");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 relative">
      {loading && <Loader fullPage />}
      <div className="text-center mb-12 flex flex-col items-center gap-2">
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
          {t("common:csc")}
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          {t("csc:subtitle")}
        </p>
      </div>

      <CscServicesGrid servicesList={servicesList} loading={loading} currentLang={currentLang} />
      
      <QuickLinksBanner currentType="csc" />
    </div>
  );
};

export default CscService;

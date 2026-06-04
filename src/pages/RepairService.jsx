import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { getCachedData, setCachedData } from "../utils/cache";
import QuickLinksBanner from "../components/common/QuickLinksBanner";
import RepairWizardModal from "../components/repair/RepairWizardModal";
import RepairFaq from "../components/repair/RepairFaq";

const RepairService = () => {
  const { t, i18n } = useTranslation(["repair", "common"]);
  const { user } = useAuth();
  const currentLang = i18n.language || "en";
  const location = useLocation();

  // SEO & Head Metadata
  useEffect(() => {
    document.title =
      "Mobile Repair Services | मोबाइल रिपेयरिंग सेवाएं | Nitesh Communications";

    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Expert mobile screen replacement, battery replacement, software flashing, and glass repair services in Ayodhya. अयोध्या में विशेषज्ञ मोबाइल स्क्रीन रिप्लेसमेंट, बैटरी रिप्लेसमेंट और रिपेयरिंग सेवाएं।",
    );
  }, [currentLang]);

  // Dynamic Repair Pricing Data
  const [repairPricingData, setRepairPricingData] = useState(null);

  // Active Category Selection
  const [selectedServiceKey, setSelectedServiceKey] = useState(null);

  // Fetch repair pricing data from backend on mount
  useEffect(() => {
    const fetchPricing = async () => {
      const cacheKey = "repair_pricing_data";
      const cached = getCachedData(cacheKey);
      if (cached) {
        setRepairPricingData(cached);
        return;
      }
      try {
        const response = await api.get("/repairs/pricing-data");
        setRepairPricingData(response.data);
        setCachedData(cacheKey, response.data, 10 * 60 * 1000); // Cache for 10 minutes
      } catch (err) {
        console.error("Error loading repair pricing data:", err);
        showToast.error("Failed to load repair services. Please try again.");
      }
    };
    fetchPricing();
  }, []);

  const handleResetWizard = useCallback(() => {
    setSelectedServiceKey(null);
  }, []);

  if (!repairPricingData) {
    return <Loader fullPage />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white relative">
      {/* Main Categories Selector Grid */}
      <div className="max-w-4xl mx-auto">
        <div className=" ">
          <h3 className="font-heading text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            {currentLang === "hi"
              ? "मरम्मत सेवा चुनें"
              : "Select Repair Service"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(repairPricingData).map(([key, item]) => {
              const isSelected = selectedServiceKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedServiceKey(key)}
                  className={`p-5 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer outline-none ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 shadow-sm"
                      : "border-slate-200/80 bg-white hover:border-blue-200 hover:bg-slate-50/30"
                  }`}
                >
                  <div>
                    <h4 className="font-heading text-sm font-bold text-slate-800 leading-tight">
                      {item.title[currentLang]}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {item.desc[currentLang]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Steps Overlay Modal (Brands, models, pickup address, forms) */}
      {selectedServiceKey && (
        <RepairWizardModal
          selectedServiceKey={selectedServiceKey}
          repairPricingData={repairPricingData}
          onClose={handleResetWizard}
          user={user}
          location={location}
          currentLang={currentLang}
          t={t}
        />
      )}

      {/* Frequently Asked Questions */}
      <RepairFaq currentLang={currentLang} t={t} />

      <QuickLinksBanner currentType="repair" />
    </div>
  );
};

export default RepairService;

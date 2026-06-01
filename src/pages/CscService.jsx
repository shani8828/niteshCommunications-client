import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import QuickLinksBanner from "../components/common/QuickLinksBanner";

const CscService = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "hi";

  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = currentLang === "hi"
      ? "सीएससी डिजिटल सरकारी सेवाएं | Nitesh Communications"
      : "CSC Digital Government Services | Nitesh Communications";

    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      currentLang === "hi"
        ? "आधार सुधार, पैन कार्ड आवेदन, बैंकिंग सेवाएं और अयोध्या में सरकारी योजनाओं के फॉर्म प्रिंटिंग।"
        : "Aadhaar correction, PAN card application, banking services, and government scheme printing in Ayodhya."
    );

    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", `${window.location.origin}/csc`);
  }, [currentLang]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/csc/services");
        setServicesList(res.data || []);
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

      <div className="flex flex-col gap-6">
        <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          {currentLang === 'hi' ? 'सभी डिजिटल सेवाएं और दस्तावेज' : 'All Digital Services & Documents'}
        </h3>
        {servicesList.length === 0 && !loading ? (
          <div className="text-center py-12 text-slate-500 font-semibold">
            {currentLang === 'hi' ? 'कोई सेवा उपलब्ध नहीं है।' : 'No services available.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((item) => {
              return (
                <div
                  key={item._id}
                  className="flex flex-col p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:shadow-md hover:border-blue-200/80 gap-3 relative group"
                >
                  <div className="flex justify-end items-start gap-4">
                    <span className="text-[10px] bg-slate-50 text-slate-500 font-bold px-2.5 py-1 rounded-full border border-slate-200/60">
                      {currentLang === 'hi' ? 'शुल्क: ' : 'Fee: '}{item.fee[currentLang]}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-bold text-slate-800">
                      {item.title[currentLang]}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
                      {item.desc[currentLang]}
                    </p>
                  </div>

                  {item.documents && ((item.documents.en && item.documents.en.length > 0) || (item.documents.hi && item.documents.hi.length > 0)) && (
                    <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-1.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {currentLang === 'hi' ? 'आवश्यक दस्तावेज:' : 'Required Documents:'}
                      </p>
                      <ul className="list-none p-0 m-0 flex flex-col gap-1">
                        {(item.documents[currentLang] || []).map((doc, dIdx) => (
                          <li key={dIdx} className="text-xs text-slate-700 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <QuickLinksBanner currentType="csc" />
    </div>
  );
};

export default CscService;

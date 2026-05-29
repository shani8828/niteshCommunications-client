import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { FileText, Shield, CreditCard, Landmark, Printer } from "lucide-react";

const CscService = () => {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Online Forms");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !service || !details) {
      showToast.error(
        t(
          "csc:error_fill_fields",
          "Please enter all details / कृपया सभी विवरण भरें",
        ),
      );
      return;
    }
    setLoading(true);

    try {
      await api.post("/csc", {
        name,
        phone,
        serviceName: service,
        queryDetails: details,
      });

      showToast.success(
        `${t("csc:success_alert")} - ${t("csc:success_desc")}`,
      );
      setName("");
      setPhone("");
      setDetails("");
    } catch (err) {
      const errorMessage = err.response?.data?.message || t(
        "csc:error_failed",
        "Failed to submit inquiry / पूछताछ सबमिट करने में विफल",
      );
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const servicesList = [
    { titleKey: "srv_forms", descKey: "srv_forms_desc", icon: FileText },
    { titleKey: "srv_pan", descKey: "srv_pan_desc", icon: CreditCard },
    { titleKey: "srv_aadhaar", descKey: "srv_aadhaar_desc", icon: Shield },
    {
      titleKey: "srv_certificates",
      descKey: "srv_certificates_desc",
      icon: FileText,
    },
    { titleKey: "srv_pension", descKey: "srv_pension_desc", icon: Printer },
    { titleKey: "srv_banking", descKey: "srv_banking_desc", icon: Landmark },
  ];

  if (loading) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
      <div className="text-center mb-12 flex flex-col items-center gap-2">
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
          {t("common:csc")}
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          {t("csc:subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.1fr] gap-10">
        {/* Left Column: Digital Service Offerings Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {servicesList.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-start gap-3 p-6 glass-card rounded-2xl transition-all hover:shadow-md"
              >
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-lg flex justify-center items-center">
                  <IconComponent size={24} className="text-blue-600" />
                </div>
                <h4 className="font-heading text-base font-bold text-slate-900">
                  {t(`csc:${item.titleKey}`)}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t(`csc:${item.descKey}`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="flex flex-col">
          <div className="p-6 md:p-8 glass-card rounded-2xl h-fit sticky top-24">
            <h3 className="font-heading text-lg font-bold text-slate-900">
              {t("csc:inquiry_form")}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed mb-6">
              {t("csc:subtitle")}
            </p>

            <form
              onSubmit={handleInquirySubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  {t("csc:full_name")} *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  placeholder={t("csc:full_name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  {t("csc:phone")} *
                </label>
                <input
                  type="tel"
                  maxLength="10"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  placeholder="e.g. 9125949456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  {t("csc:service_type")} *
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none cursor-pointer text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="Online Forms">{t("csc:srv_forms")}</option>
                  <option value="PAN Card">{t("csc:srv_pan")}</option>
                  <option value="Aadhaar Services">
                    {t("csc:srv_aadhaar")}
                  </option>
                  <option value="Government Certificates">
                    {t("csc:srv_certificates")}
                  </option>
                  <option value="Banking Assistance">
                    {t("csc:srv_banking")}
                  </option>
                  <option value="Welfare & Pensions">
                    {t("csc:srv_pension")}
                  </option>
                  <option value="Other">
                    {t("csc:srv_other", "Other Services / अन्य सेवाएं")}
                  </option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  {t("csc:details")} *
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  rows="4"
                  placeholder={t("csc:placeholder_details")}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 font-heading font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-full hover:brightness-110 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
              >
                {t("csc:btn_submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CscService;

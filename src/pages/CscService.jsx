import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { FileText, Shield, CreditCard, Landmark, Printer } from "lucide-react";

const CscService = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "hi";

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
    {
      title: { en: "Aadhaar Services", hi: "आधार सेवाएं" },
      desc: { en: "Lamination, Aadhaar print, biometric updates, and details rectification assistance.", hi: "लेमिनेशन, आधार प्रिंट, बायोमेट्रिक अपडेट और विवरण सुधार सहायता।" },
      fee: { en: "₹30 - ₹100", hi: "₹30 - ₹100" },
      documents: {
        en: ["Linked Mobile Number", "Identity Proof (Voter ID, PAN)", "Address Proof"],
        hi: ["लिंक्ड मोबाइल नंबर", "पहचान पत्र (वोटर आईडी, पैन)", "पता प्रमाण"]
      },
      icon: Shield
    },
    {
      title: { en: "PAN Card Services", hi: "पैन कार्ड सेवाएं" },
      desc: { en: "Applications for new Permanent Account Number (PAN) cards and correction of existing cards.", hi: "नए परमानेंट अकाउंट नंबर (पैन) कार्ड के लिए आवेदन और मौजूदा कार्डों में सुधार।" },
      fee: { en: "₹150 - ₹200", hi: "₹150 - ₹200" },
      documents: {
        en: ["Aadhaar Card", "2 Passport Photos", "Signature"],
        hi: ["आधार कार्ड", "2 पासपोर्ट साइज फोटो", "हस्ताक्षर"]
      },
      icon: CreditCard
    },
    {
      title: { en: "Income Certificate (आय प्रमाण पत्र)", hi: "आय प्रमाण पत्र (Income Certificate)" },
      desc: { en: "Official state certification of family or personal income levels for schemes and admissions.", hi: "योजनाओं और प्रवेशों के लिए परिवार या व्यक्तिगत आय स्तर का आधिकारिक राज्य प्रमाण पत्र।" },
      fee: { en: "₹50 - ₹80", hi: "₹50 - ₹80" },
      documents: {
        en: ["Aadhaar Card", "Self-declaration of Income", "Ration Card", "Salary Slip (if applicable)"],
        hi: ["आधार कार्ड", "आय की स्व-घोषणा", "राशन कार्ड", "वेतन पर्ची (यदि लागू हो)"]
      },
      icon: FileText
    },
    {
      title: { en: "Caste Certificate (जाति प्रमाण पत्र)", hi: "जाति प्रमाण पत्र (Caste Certificate)" },
      desc: { en: "State certification of community/caste category for reservation benefits and scholarships.", hi: "आरक्षण लाभों और छात्रवृत्ति के लिए समुदाय/जाति श्रेणी का राज्य प्रमाण पत्र।" },
      fee: { en: "₹50 - ₹80", hi: "₹50 - ₹80" },
      documents: {
        en: ["Aadhaar Card", "Father's Caste Certificate / Old Caste Record", "Self-declaration"],
        hi: ["आधार कार्ड", "पिता का जाति प्रमाण पत्र / पुराना जाति रिकॉर्ड", "स्व-घोषणा"]
      },
      icon: FileText
    },
    {
      title: { en: "Domicile Certificate (निवास प्रमाण पत्र)", hi: "निवास प्रमाण पत्र (Domicile Certificate)" },
      desc: { en: "State residency certificate proving regional domicile status for local employment/education.", hi: "स्थानीय रोजगार/शिक्षा के लिए क्षेत्रीय निवास स्थिति साबित करने वाला राज्य निवास प्रमाण पत्र।" },
      fee: { en: "₹50 - ₹80", hi: "₹50 - ₹80" },
      documents: {
        en: ["Aadhaar Card", "Voter ID / School Marksheet", "Electricity Bill / Land Record"],
        hi: ["आधार कार्ड", "वोटर आईडी / स्कूल की मार्कशीट", "बिजली बिल / भूमि रिकॉर्ड"]
      },
      icon: FileText
    },
    {
      title: { en: "Voter ID Card Services", hi: "वोटर आईडी कार्ड सेवाएं" },
      desc: { en: "Registration of new voter card, corrections, and PVC card printing services.", hi: "नए वोटर कार्ड का पंजीकरण, सुधार और पीवीसी कार्ड प्रिंटिंग सेवाएं।" },
      fee: { en: "₹30 - ₹50", hi: "₹30 - ₹50" },
      documents: {
        en: ["Aadhaar Card", "Age Proof (10th Marksheet/Birth Certificate)", "Passport Photo"],
        hi: ["आधार कार्ड", "आयु प्रमाण (10वीं मार्कशीट/जन्म प्रमाण पत्र)", "पासपोर्ट फोटो"]
      },
      icon: CreditCard
    },
    {
      title: { en: "Ration Card Services", hi: "राशन कार्ड सेवाएं" },
      desc: { en: "New Ration Card applications, member addition/deletion, and details modifications.", hi: "नए राशन कार्ड के आवेदन, सदस्य को जोड़ना/हटाना और विवरण में बदलाव।" },
      fee: { en: "₹50 - ₹100", hi: "₹50 - ₹100" },
      documents: {
        en: ["Aadhaar Cards of all members", "Family Head Photo", "Bank Passbook", "Income Certificate"],
        hi: ["सभी सदस्यों के आधार कार्ड", "परिवार के मुखिया की फोटो", "बैंक पासबुक", "आय प्रमाण पत्र"]
      },
      icon: Landmark
    },
    {
      title: { en: "Welfare & Pensions", hi: "कल्याणकारी योजनाएं और पेंशन" },
      desc: { en: "Enrollment in national and state welfare schemes, Old Age, Widow, and Disability pensions.", hi: "राष्ट्रीय और राज्य कल्याणकारी योजनाओं, वृद्धावस्था, विधवा और विकलांगता पेंशन में नामांकन।" },
      fee: { en: "₹50 - ₹100", hi: "₹50 - ₹100" },
      documents: {
        en: ["Aadhaar Card", "Bank Account Details", "Income Certificate", "Disability Certificate (if applicable)"],
        hi: ["आधार कार्ड", "बैंक खाता विवरण", "आय प्रमाण पत्र", "विकलांगता प्रमाण पत्र (यदि लागू हो)"]
      },
      icon: Printer
    },
    {
      title: { en: "Utility & Bill Payments", hi: "बिजली, पानी व रिचार्ज" },
      desc: { en: "Payment of electricity, gas, water, internet bills, DTH, and mobile recharges.", hi: "बिजली, गैस, पानी, इंटरनेट बिल, डीटीएच और मोबाइल रिचार्ज का भुगतान।" },
      fee: { en: "₹0 - ₹10 (Service charge)", hi: "₹0 - ₹10 (सेवा शुल्क)" },
      documents: {
        en: ["Consumer ID / Account Number", "Bill Copy"],
        hi: ["उपभोक्ता आईडी / खाता संख्या", "बिल कॉपी"]
      },
      icon: CreditCard
    },
    {
      title: { en: "Passport Online Services", hi: "पासपोर्ट ऑनलाइन आवेदन" },
      desc: { en: "Online registration, document uploads, fee payment, and passport office appointments.", hi: "ऑनलाइन पंजीकरण, दस्तावेज अपलोड, शुल्क भुगतान और पासपोर्ट कार्यालय नियुक्ति।" },
      fee: { en: "₹100 (Service charge) + Gov fee", hi: "₹100 (सेवा शुल्क) + सरकारी शुल्क" },
      documents: {
        en: ["Aadhaar Card", "PAN Card", "10th Marksheet", "Address Proof"],
        hi: ["आधार कार्ड", "पैन कार्ड", "10वीं मार्कशीट", "पता प्रमाण"]
      },
      icon: FileText
    }
  ];

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
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.1fr] gap-10">
        {/* Left Column: Digital Service Offerings Showcase */}
        <div className="flex flex-col gap-6">
          <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            {currentLang === 'hi' ? 'सभी डिजिटल सेवाएं और दस्तावेज' : 'All Digital Services & Documents'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {servicesList.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:shadow-md hover:border-blue-200/80 gap-3 relative group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl flex justify-center items-center">
                      <IconComponent size={20} className="text-blue-600" />
                    </div>
                    <span className="text-[10px] bg-slate-50 text-slate-500 font-bold px-2.5 py-1 rounded-full border border-slate-200/60">
                      {currentLang === 'hi' ? 'शुल्क: ' : 'Fee: '}{item.fee[currentLang]}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-bold text-slate-800">
                      {item.title[currentLang]}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc[currentLang]}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-1.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {currentLang === 'hi' ? 'आवश्यक दस्तावेज:' : 'Required Documents:'}
                    </p>
                    <ul className="list-none p-0 m-0 flex flex-col gap-1">
                      {item.documents[currentLang].map((doc, dIdx) => (
                        <li key={dIdx} className="text-xs text-slate-700 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
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
                disabled={loading}
                className="w-full py-3 mt-2 font-heading font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-full hover:brightness-110 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("common:submitting", "Submitting...") : t("csc:btn_submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CscService;

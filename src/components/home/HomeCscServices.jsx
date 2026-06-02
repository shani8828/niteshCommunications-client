import React from "react";
import { Link } from "react-router-dom";
import { Shield, CreditCard, FileText, Landmark, Printer, Users } from "lucide-react";

const cscServicesFeatured = [
  {
    icon: Shield,
    title: { en: "Aadhaar Services", hi: "आधार सेवाएं" },
    desc: {
      en: "Biometric updates, demographic corrections & print support.",
      hi: "बायोमेट्रिक अपडेट, जनसांख्यिकीय सुधार और प्रिंट सहायता।",
    },
  },
  {
    icon: CreditCard,
    title: { en: "PAN Card Services", hi: "पैन कार्ड सेवाएं" },
    desc: {
      en: "Application for new PAN card and corrections on existing card.",
      hi: "नए पैन कार्ड के लिए आवेदन और मौजूदा कार्ड में सुधार।",
    },
  },
  {
    icon: FileText,
    title: { en: "Govt Certificates", hi: "सरकारी प्रमाण पत्र" },
    desc: {
      en: "Apply for Income, Caste, and Domicile certificates quickly.",
      hi: "आय, जाति और निवास प्रमाण पत्र के लिए त्वरित आवेदन करें।",
    },
  },
  {
    icon: Landmark,
    title: { en: "Ration Card & Banking", hi: "राशन कार्ड और बैंकिंग" },
    desc: {
      en: "New applications, member modifications & banking withdrawals.",
      hi: "नए आवेदन, सदस्य संशोधन और बैंकिंग निकासी सहायता।",
    },
  },
  {
    icon: Printer,
    title: { en: "Online Forms & Printing", hi: "ऑनलाइन फॉर्म और प्रिंटिंग" },
    desc: {
      en: "Job application form filling, printouts & document lamination.",
      hi: "नौकरी आवेदन पत्र भरना, प्रिंटआउट और दस्तावेज लेमिनेशन।",
    },
  },
  {
    icon: Users,
    title: { en: "Welfare & Pensions", hi: "कल्याणकारी योजनाएं" },
    desc: {
      en: "Old Age, Widow and Disability pension registration assistance.",
      hi: "वृद्धावस्था, विधवा और विकलांगता पेंशन पंजीकरण सहायता।",
    },
  },
];

const HomeCscServices = ({ currentLang }) => {
  return (
    <section className="w-full bg-gradient-to-b from-white to-slate-50/40 py-20 px-6 border-t border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 flex flex-col items-center gap-2">
          <h2 className="font-heading text-3xl font-extrabold text-slate-900 mt-1">
            {currentLang === "hi"
              ? "जन सेवा केंद्र सेवाएं"
              : "Jan Seva Kendra Services"}
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            {currentLang === "hi"
              ? "अयोध्या में विश्वसनीय सरकारी प्रमाण पत्र, पहचान पत्र सुधार, ऑनलाइन फॉर्म और डिजिटल बैंकिंग सेवाएं।"
              : "Reliable government certificate application, identity card correction, online form filling, and digital banking right in Ayodhya."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cscServicesFeatured.map((service, idx) => {
            const IconComp = service.icon;
            return (
              <Link
                key={idx}
                to="/csc"
                className="p-6 flex flex-col gap-4 bg-white border border-slate-200/80 rounded-2xl hover:shadow-lg hover:border-blue-300/80 hover:scale-[1.02] transition-all cursor-pointer group text-left"
              >
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 w-fit flex justify-center items-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                  <IconComp
                    size={24}
                    className="text-blue-600 group-hover:text-white transition-all duration-300"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <h4 className="font-heading text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {service.title[currentLang]}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {service.desc[currentLang]}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <Link to="/csc" className="flex justify-center items-center mt-10">
          <div className="px-8 py-3.5 font-heading font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 rounded-full text-center transition-all duration-300 shadow-md shadow-blue-500/10">
            {currentLang === "hi"
              ? "सभी जन सेवा केंद्र सेवाएं देखें"
              : "View All Jan Seva Kendra Services"}
          </div>
        </Link>
      </div>
    </section>
  );
};

export default React.memo(HomeCscServices);

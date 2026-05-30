import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Wrench, FileText, ChevronRight } from "lucide-react";

const QuickLinksBanner = ({ currentType }) => {
  const { t } = useTranslation();

  const configs = {
    shop: [
      {
        to: "/repairs",
        title: t("common:promo_repair_title"),
        desc: t("common:promo_repair_desc"),
        icon: Wrench,
        colorClass: "text-blue-600 bg-blue-50 border-blue-100",
        btnText: t("common:repair")
      },
      {
        to: "/csc",
        title: t("common:promo_csc_title"),
        desc: t("common:promo_csc_desc"),
        icon: FileText,
        colorClass: "text-cyan-600 bg-cyan-50 border-cyan-100",
        btnText: t("common:csc")
      }
    ],
    repair: [
      {
        to: "/shop",
        title: t("common:promo_shop_title"),
        desc: t("common:promo_shop_desc"),
        icon: ShoppingBag,
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
        btnText: t("common:shop")
      },
      {
        to: "/csc",
        title: t("common:promo_csc_title"),
        desc: t("common:promo_csc_desc"),
        icon: FileText,
        colorClass: "text-cyan-600 bg-cyan-50 border-cyan-100",
        btnText: t("common:csc")
      }
    ],
    csc: [
      {
        to: "/shop",
        title: t("common:promo_shop_title"),
        desc: t("common:promo_shop_desc"),
        icon: ShoppingBag,
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
        btnText: t("common:shop")
      },
      {
        to: "/repairs",
        title: t("common:promo_repair_title"),
        desc: t("common:promo_repair_desc"),
        icon: Wrench,
        colorClass: "text-blue-600 bg-blue-50 border-blue-100",
        btnText: t("common:repair")
      }
    ]
  };

  const currentLinks = configs[currentType] || [];

  return (
    <div className="max-w-6xl mx-auto mt-16 pt-12 border-t border-slate-100">
      <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-800 mb-2 text-center">
        {t("common:brand")} - {t("common:tagline")}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mb-8 text-center max-w-lg mx-auto">
        {t("common:cta_seva")}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentLinks.map((link, idx) => {
          const IconComponent = link.icon;
          return (
            <Link
              key={idx}
              to={link.to}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-blue-300 group"
            >
              <div className={`p-4 rounded-2xl border flex justify-center items-center flex-shrink-0 ${link.colorClass}`}>
                <IconComponent size={28} />
              </div>
              <div className="flex-grow flex flex-col gap-1.5">
                <h4 className="font-heading font-bold text-base text-slate-800 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                  {link.title}
                  <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {link.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickLinksBanner;

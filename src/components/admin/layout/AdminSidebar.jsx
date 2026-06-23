import React from "react";
import {
  BarChart3,
  Package,
  Wrench,
  FileText,
  Settings,
  ShoppingBag,
  Users,
  Sliders,
  Printer,
} from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab, loadTabData, currentLang, t }) => {
  return (
    <aside className="flex flex-row lg:flex-col flex-wrap gap-1.5 h-fit w-full lg:w-[240px] flex-shrink-0">
      <button
        onClick={() => {
          setActiveTab("overview");
          loadTabData("overview");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "overview"
            ? "bg-gray-300 text-brand-cyan border border-l-4 border-blue-500"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <BarChart3 size={16} /> {t("admin:nav_overview", "Overview")}
      </button>
      <button
        onClick={() => {
          setActiveTab("orders");
          loadTabData("orders");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0  font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "orders"
            ? "bg-gray-300 text-brand-cyan border border-l-4 border-blue-500"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <ShoppingBag size={16} /> {t("admin:nav_orders", "Orders")}
      </button>
      <button
        onClick={() => {
          setActiveTab("products");
          loadTabData("products");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "products"
            ? "bg-gray-300 text-brand-cyan border border-l-4 border-blue-500"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <Package size={16} /> {t("admin:nav_products")}
      </button>
      <button
        onClick={() => {
          setActiveTab("categories");
          loadTabData("categories");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "categories"
            ? "bg-gray-300 text-brand-cyan border border-l-4 border-blue-500"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <Settings size={16} /> {t("admin:category")}
      </button>
      <button
        onClick={() => {
          setActiveTab("repairs");
          loadTabData("repairs");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "repairs"
            ? "bg-gray-300 text-brand-cyan border border-l-4 border-blue-500"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <Wrench size={16} /> {t("admin:nav_repairs")}
      </button>
      <button
        onClick={() => {
          setActiveTab("repair-services");
          loadTabData("repair-services");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "repair-services"
            ? "bg-gray-300 text-brand-cyan border border-l-4 border-blue-500"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <Sliders size={16} /> {currentLang === "hi" ? "रिपेयर सेवाएं" : "Repair Services"}
      </button>
      {/* <button
        onClick={() => {
          setActiveTab("csc");
          loadTabData("csc");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "csc"
            ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <FileText size={16} /> {t("admin:nav_csc")}
      </button> */}
      <button
        onClick={() => {
          setActiveTab("csc-services");
          loadTabData("csc-services");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "csc-services"
            ? "bg-gray-300 text-brand-cyan border border-l-4 border-blue-500"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <Sliders size={16} /> {currentLang === "hi" ? "सीएससी सेवाएं" : "CSC Services"}
      </button>
      <button
        onClick={() => {
          setActiveTab("printouts");
          loadTabData("printouts");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "printouts"
            ? "bg-gray-300 text-brand-cyan border border-l-4 border-blue-500"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <Printer size={16} /> {currentLang === "hi" ? "प्रिंटआउट" : "Printouts"}
      </button>
      <button
        onClick={() => {
          setActiveTab("users");
          loadTabData("users");
        }}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === "users"
            ? "bg-gray-300 text-brand-cyan border border-l-4 border-blue-500"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <Users size={16} /> {t("admin:nav_users", "Users")}
      </button>
    </aside>
  );
};

export default React.memo(AdminSidebar);

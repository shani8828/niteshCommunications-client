import React from "react";

const OverviewTab = ({ analytics, t, currentLang }) => {
  if (!analytics) return null;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Custom Bar Chart (Flex Heights) */}
      <div className="p-6 md:p-8 glass-card rounded-2xl shadow-sm">
        <h4 className="font-heading text-sm font-bold text-slate-800 mb-6">
          {t("admin:monthly_revenue", "Monthly Revenue Trend")}
        </h4>
        <div className="flex justify-around items-end h-[220px] pt-8 border-b-2 border-slate-100 gap-2 md:gap-4 flex-wrap">
          {analytics.monthlyData && analytics.monthlyData.length > 0 ? (
            analytics.monthlyData.map((data, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 min-w-[50px] max-w-[80px]"
              >
                <div className="w-7 h-[130px] bg-slate-100 rounded-t-lg relative overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-brand-blue to-brand-cyan absolute bottom-0 rounded-t-lg transition-all duration-700"
                    style={{
                      height: `${Math.max(10, Math.min(100, (data.revenue / 200000) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-2 font-bold">
                  {data.label}
                </span>
                <span className="text-[10px] text-brand-cyan font-bold">
                  ₹{data.revenue}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 pb-4">
              {t("admin:no_data")}
            </p>
          )}
        </div>
      </div>

      {/* Low stock alerts list */}
      <div className="p-6 md:p-8 glass-card rounded-2xl shadow-sm">
        <h4 className="font-heading text-sm font-bold text-rose-500 mb-4">
          {t("admin:low_stock_alerts", "Low Stock Alerts")}
        </h4>
        <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                <th className="px-4 py-3 text-left">
                  {t("admin:product_name_en", "Product Name")}
                </th>
                <th className="px-4 py-3 text-left">
                  {t("admin:category", "Category")}
                </th>
                <th className="px-4 py-3 text-left">
                  {t("admin:stock", "Stock")}
                </th>
                <th className="px-4 py-3 text-left">
                  {t("admin:price", "Price")}
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.lowStockProducts?.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                    {item.name?.[currentLang] || item.name?.en}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                    {item.category?.name?.[currentLang] || item.category?.name?.en || "N/A"}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-rose-500 font-bold">
                    {item.stock} left
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                    ₹{item.price}
                  </td>
                </tr>
              ))}
              {(!analytics.lowStockProducts ||
                analytics.lowStockProducts.length === 0) && (
                <tr>
                  <td
                    colSpan="4"
                    className="border-b border-slate-100 px-4 py-4 text-xs text-slate-500 text-center font-semibold"
                  >
                    {t(
                      "admin:all_well_stocked",
                      "All products are well stocked!",
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OverviewTab);

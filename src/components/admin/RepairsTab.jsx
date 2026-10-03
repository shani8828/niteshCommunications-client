import React from "react";
import AdminPagination from "./AdminPagination";
import useDebouncedSearch from "./useDebouncedSearch";
import { Search } from "lucide-react";

const RepairsTab = ({ repairs, t, currentLang, handleUpdateRepairStatus, query, meta, onQueryChange }) => {
  // Search, filter and pagination run on the server (see AdminDashboard)
  const [searchInput, setSearchInput] = useDebouncedSearch(query.search, (search) =>
    onQueryChange({ search, page: 1 }),
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded border border-slate-200/60">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-slate-200 flex-grow max-w-md">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder={currentLang === "hi" ? "ग्राहक, फ़ोन या डिवाइस नाम से खोजें..." : "Search by customer, phone or device..."}
            className="border-0 outline-none text-xs w-full bg-transparent"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          <select
            value={query.status}
            onChange={(e) => {
              onQueryChange({ status: e.target.value, page: 1 });
            }}
            className="px-3 py-2 bg-white border border-slate-200 rounded text-xs outline-none focus:border-brand-cyan"
          >
            <option value="all">{currentLang === "hi" ? "सभी बुकिंग" : "All Status"}</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Repaired">Repaired</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded border border-slate-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <th className="px-4 py-3 text-left">{t("admin:customer", "Customer")}</th>
              <th className="px-4 py-3 text-left">{t("common:phone", "Phone")}</th>
              <th className="px-4 py-3 text-left">{t("repair:device_brand", "Device")}</th>
              <th className="px-4 py-3 text-left">{t("admin:category", "Category")}</th>
              <th className="px-4 py-3 text-left">{t("repair:estimate", "Estimate")}</th>
              <th className="px-4 py-3 text-left">{t("admin:status", "Status")}</th>
              <th className="px-4 py-3 text-left">{t("admin:actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((rep) => (
              <tr key={rep._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                  {rep.customerName}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {rep.customerPhone}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {rep.deviceBrand} {rep.deviceModel}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {rep.serviceCategory}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-brand-cyan font-bold">
                  <div>
                    <span>₹{rep.estimatedPrice}</span>
                    {rep.discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        (₹{rep.discountAmount} off)
                      </span>
                    )}
                    {rep.deliveryCharge > 0 && (
                      <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                        (₹{rep.deliveryCharge} pickup)
                      </span>
                    )}
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-700"
                        : rep.status === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {rep.status}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <select
                    value={rep.status}
                    onChange={(e) =>
                      handleUpdateRepairStatus(rep._id, e.target.value)
                    }
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 outline-none cursor-pointer text-xs focus:border-brand-cyan"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Repaired">Repaired</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {repairs.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="border-b border-slate-100 px-4 py-6 text-xs text-slate-500 text-center font-semibold"
                >
                  {t("admin:no_data")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (server-side) */}
      <AdminPagination
        page={query.page}
        pages={meta.pages}
        total={meta.total}
        onPageChange={(page) => onQueryChange({ page })}
        currentLang={currentLang}
      />
    </div>
  );
};

export default React.memo(RepairsTab);

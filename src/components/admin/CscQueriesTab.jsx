import React from "react";
import AdminPagination from "./AdminPagination";
import useDebouncedSearch from "./useDebouncedSearch";
import { Search } from "lucide-react";

const CscQueriesTab = ({ cscQueries, t, currentLang, handleUpdateCscStatus, query, meta, onQueryChange }) => {
  // Search, filter and pagination run on the server (see AdminDashboard)
  const [searchInput, setSearchInput] = useDebouncedSearch(query.search, (search) =>
    onQueryChange({ search, page: 1 }),
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 flex-grow max-w-md">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder={currentLang === "hi" ? "ग्राहक, फ़ोन या सेवा के नाम से खोजें..." : "Search by customer, phone or service..."}
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
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-cyan"
          >
            <option value="all">{currentLang === "hi" ? "सभी पूछताछ" : "All Status"}</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-slate-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <th className="px-4 py-3 text-left">{t("admin:customer", "Customer")}</th>
              <th className="px-4 py-3 text-left">{t("common:phone", "Phone")}</th>
              <th className="px-4 py-3 text-left">{t("csc:service_type", "Service Type")}</th>
              <th className="px-4 py-3 text-left">{t("csc:details", "Details")}</th>
              <th className="px-4 py-3 text-left">{t("admin:status", "Status")}</th>
              <th className="px-4 py-3 text-left">{t("admin:actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {cscQueries.map((inquiry) => (
              <tr key={inquiry._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                  {inquiry.name}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {inquiry.phone}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {inquiry.serviceName}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate" title={inquiry.queryDetails}>
                  {inquiry.queryDetails}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inquiry.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : inquiry.status === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <select
                    value={inquiry.status}
                    onChange={(e) =>
                      handleUpdateCscStatus(inquiry._id, e.target.value)
                    }
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 outline-none cursor-pointer text-xs focus:border-brand-cyan"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {cscQueries.length === 0 && (
              <tr>
                <td
                  colSpan="6"
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

export default React.memo(CscQueriesTab);

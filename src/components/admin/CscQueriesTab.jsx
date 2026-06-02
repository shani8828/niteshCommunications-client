import React, { useState } from "react";
import { Search } from "lucide-react";

const CscQueriesTab = ({ cscQueries, t, currentLang, handleUpdateCscStatus }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter
  const filteredQueries = cscQueries.filter((query) => {
    const nameMatch = query.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = query.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const serviceMatch = query.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    const detailMatch = query.queryDetails?.toLowerCase().includes(searchTerm.toLowerCase());
    const searchMatch = nameMatch || phoneMatch || serviceMatch || detailMatch;

    const statusMatch = statusFilter === "all" || query.status === statusFilter;
    return searchMatch && statusMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQueries = filteredQueries.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
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
            {currentQueries.map((query) => (
              <tr key={query._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                  {query.name}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {query.phone}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {query.serviceName}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate" title={query.queryDetails}>
                  {query.queryDetails}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      query.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : query.status === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {query.status}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <select
                    value={query.status}
                    onChange={(e) =>
                      handleUpdateCscStatus(query._id, e.target.value)
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
            {filteredQueries.length === 0 && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            {currentLang === "hi" ? "पिछला" : "Prev"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                currentPage === page
                  ? "bg-brand-cyan border-brand-cyan text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            {currentLang === "hi" ? "अगला" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(CscQueriesTab);

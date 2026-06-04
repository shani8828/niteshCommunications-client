import React, { useState } from "react";
import {
  Search,
  MapPin,
  ExternalLink,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Download,
} from "lucide-react";

const PrintoutsTab = ({
  printouts,
  t,
  currentLang,
  handleUpdatePrintoutStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logic
  const filteredPrintouts = printouts.filter((item) => {
    const nameMatch = item.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const phoneMatch = item.phone
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const addressMatch = item.address
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const searchMatch = nameMatch || phoneMatch || addressMatch;

    const statusMatch =
      statusFilter === "all" || item.deliveryStatus === statusFilter;
    return searchMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPrintouts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrintouts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Out For Delivery":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Confirmed":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getDownloadUrl = (doc) => {
    if (!doc || !doc.fileUrl) return "";
    const { fileUrl, fileName } = doc;
    const serverUrl = window.location.origin.includes("5173")
      ? "http://localhost:5000"
      : window.location.origin;
    return `${serverUrl}/api/printouts/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(fileName)}`;
  };

  const getViewUrl = (doc) => {
    if (!doc || !doc.fileUrl) return "";
    const { fileUrl, fileName, resourceType, format } = doc;

    const isPdf =
      (format && format.toLowerCase() === "pdf") ||
      (fileName && fileName.toLowerCase().endsWith(".pdf")) ||
      (fileUrl && fileUrl.toLowerCase().endsWith(".pdf")) ||
      fileUrl.toLowerCase().endsWith(".pdf.txt");

    const isImage =
      resourceType === "image" ||
      (format && ["jpg", "jpeg", "png", "gif", "webp"].includes(format.toLowerCase())) ||
      (fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) ||
      /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

    const isCloudinary = fileUrl.includes("cloudinary");

    // Images on Cloudinary can open directly.
    if (isCloudinary && isImage) {
      return fileUrl;
    }

    // PDFs, local files, and other raw formats should route through the server proxy
    // to override headers (Content-Type/Content-Disposition) for proper inline view/download
    const serverUrl = window.location.origin.includes("5173")
      ? "http://localhost:5000"
      : window.location.origin;
    return `${serverUrl}/api/printouts/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(fileName)}&view=true`;
  };

  return (
    <div className="flex flex-col gap-2 max-w-4xl animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 flex-grow max-w-md">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder={
              currentLang === "hi"
                ? "ग्राहक का नाम, फ़ोन या पता से खोजें..."
                : "Search by name, phone or address..."
            }
            className="border-0 outline-none text-xs w-full bg-transparent font-semibold text-slate-700"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-cyan font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">All Deliveries</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="max-w-5xl overflow-x-auto rounded-xl border border-slate-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <th className="p-1 text-left min-w-[140px]">Customer</th>
              <th className="p-1 text-left min-w-[130px]">Contact info</th>
              <th className="p-1 text-left min-w-[280px]">Files & Settings</th>
              <th className="p-1 text-left min-w-[220px]">
                Address / Coordinates
              </th>
              <th className="p-1 text-left min-w-[180px]">Delivery Timing</th>
              <th className="p-1 text-left min-w-[130px]">Amount & Payment</th>
              <th className="p-1 text-left min-w-[130px]">Delivery Status</th>
              <th className="p-1 text-left min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-slate-50/50 transition-colors text-slate-700 border-b border-slate-100"
              >
                <td className="p-1 text-xs font-semibold">{item.name}</td>
                <td className="p-1 text-xs">
                  <p className="font-mono">{item.phone}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Order ID: {item.razorpayOrderId || "N/A"}
                  </p>
                </td>
                <td className="p-1 text-xs max-w-[280px]">
                  <div className="flex flex-col gap-1">
                    {item.documents.map((doc, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex flex-col p-2 bg-slate-50 border border-slate-200/60 rounded-xl gap-2"
                      >
                        <div
                          className="flex items-center justify-between gap-1.5 text-[11px] font-bold text-slate-800 px-0.5 truncate"
                          title={doc.fileName}
                        >
                          <div className="flex gap-1 items-center justify-evenly">
                            <FileText
                              size={13}
                              className="text-slate-500 flex-shrink-0"
                            />
                            <span className="truncate">{doc.fileName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <a
                              href={getViewUrl(doc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1 px-1.5 text-[10px] font-bold text-slate-700 border border-blue-300 bg-blue-200 hover:bg-slate-100 rounded-lg text-center transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                              title="Click to view file inline (PDF / Images)"
                            >
                              <Eye size={11} className="text-blue-600" />
                            </a>
                            <a
                              href={getDownloadUrl(doc)}
                              className="py-1 px-1.5 text-[10px] font-bold text-slate-700 border border-slate-300 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                              title="Click to download file directly"
                              download={doc.fileName}
                            >
                              <Download size={11} className="text-slate-600" />
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold px-0.5 border-t border-slate-200/40 pt-1.5 mt-0.5">
                          <span>{doc.pages} Pages</span>
                          <span>•</span>
                          <span>{doc.copies} Copies</span>
                          <span>•</span>
                          <span className="capitalize">
                            {doc.colorPreference === "color" ? "Color" : "B&W"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-1 text-xs max-w-[200px]">
                  <p className="leading-relaxed truncate" title={item.address}>
                    {item.address}
                  </p>
                  {item.coordinates && item.coordinates.latitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${item.coordinates.latitude},${item.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-brand-cyan hover:underline font-bold flex items-center gap-1 mt-1"
                    >
                      <MapPin size={10} /> View Map Coordinates ({item.distance}{" "}
                      km)
                    </a>
                  )}
                </td>
                <td className="p-1 text-xs">
                  {item.isTomorrowDelivery ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock size={10} /> Tomorrow Morning
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={10} /> Same-day Delivery
                    </span>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ordered:{" "}
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                </td>
                <td className="p-1 text-xs font-semibold">
                  <p className="text-slate-950 font-bold">
                    ₹{item.totalAmount}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5 capitalize">
                    {item.paymentStatus}
                  </p>
                </td>
                <td className="p-1 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(item.deliveryStatus)}`}
                  >
                    {item.deliveryStatus}
                  </span>
                </td>
                <td className="p-1 text-xs">
                  <select
                    value={item.deliveryStatus}
                    onChange={(e) =>
                      handleUpdatePrintoutStatus(item._id, e.target.value)
                    }
                    className="p-1 bg-white border border-slate-200 rounded text-slate-700 outline-none cursor-pointer text-xs focus:border-brand-cyan font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Out For Delivery">Out For Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {filteredPrintouts.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="p-1 text-xs text-slate-500 text-center font-semibold"
                >
                  No printout orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-4">
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

export default React.memo(PrintoutsTab);

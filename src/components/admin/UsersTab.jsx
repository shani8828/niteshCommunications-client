import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, Search } from "lucide-react";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";

const UsersTab = ({ users, t, currentLang, fetchUsers }) => {
  const [userSearchPhone, setUserSearchPhone] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // User details modal state
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("orders");
  const [userActivityDetail, setUserActivityDetail] = useState(null);
  const [loadingUserActivityDetail, setLoadingUserActivityDetail] = useState(false);

  // Pagination
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(userSearchPhone);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setUserSearchPhone("");
    fetchUsers("");
    setCurrentPage(1);
  };

  const handleViewUserActivity = async (user) => {
    setSelectedUserForDetail(user);
    setShowUserActivityModal(true);
    setActiveDetailTab("orders");
    setUserActivityDetail(null);
    setLoadingUserActivityDetail(true);
    try {
      const res = await api.get(`/dashboard/admin/users/${user._id}/activity`);
      setUserActivityDetail(res.data);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to load user activity details");
    } finally {
      setLoadingUserActivityDetail(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn text-left">
      {/* Search Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
        <div>
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            Total Users: <span className="font-bold text-slate-900">{users.length}</span>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-64">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              maxLength={10}
              placeholder={t("admin:search_placeholder", "Search 10-digit phone...")}
              className="border-0 outline-none text-xs w-full bg-transparent font-semibold"
              value={userSearchPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setUserSearchPhone(val);
              }}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/95 text-white rounded-xl shadow cursor-pointer transition-all border-0"
          >
            {t("common:search", "Search")}
          </button>
          {userSearchPhone && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-all border-0"
            >
              {t("common:clear", "Clear")}
            </button>
          )}
        </form>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-slate-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <th className="px-4 py-3 text-left">{t("admin:customer", "Name")}</th>
              <th className="px-4 py-3 text-left">{t("common:phone", "Phone")}</th>
              <th className="px-4 py-3 text-left">{t("common:email", "Email")}</th>
              <th className="px-4 py-3 text-left">{t("admin:registered_at", "Registered On")}</th>
              <th className="px-4 py-3 text-left">{t("admin:activity_summary", "Activity")}</th>
              <th className="px-4 py-3 text-left">{t("admin:actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                  {user.name}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-mono">
                  {user.mobile}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                  {user.email || "N/A"}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                  {new Date(user.createdAt).toLocaleDateString()}{" "}
                  {new Date(user.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[10px]">
                      {user.activityCounts?.orders || 0} Orders
                    </span>
                    <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-medium text-[10px]">
                      {user.activityCounts?.repairs || 0} Repairs
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-medium text-[10px]">
                      {user.activityCounts?.csc || 0} CSC
                    </span>
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <button
                    onClick={() => handleViewUserActivity(user)}
                    className="px-3 py-1.5 text-xs font-bold text-brand-cyan hover:text-brand-cyan/80 bg-brand-cyan/5 hover:bg-brand-cyan/10 rounded-lg cursor-pointer transition-all border-0"
                  >
                    {t("admin:view_activity", "View History")}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="border-b border-slate-100 px-4 py-8 text-xs text-slate-500 text-center font-semibold"
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

      {/* MODAL 3: Detailed Activity Logs for a single User */}
      {showUserActivityModal && selectedUserForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-[800px] p-6 md:p-8 max-h-[90vh] overflow-y-auto bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col gap-5 text-left animate-fadeIn">
            <div className="flex justify-between items-start mb-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  {selectedUserForDetail.name}
                </h3>
                <p className="text-xs text-slate-500 flex gap-2.5 mt-1 font-semibold flex-wrap">
                  <span>Phone: {selectedUserForDetail.mobile}</span>
                  {selectedUserForDetail.email && (
                    <span>Email: {selectedUserForDetail.email}</span>
                  )}
                  <span>
                    Joined: {new Date(selectedUserForDetail.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUserActivityModal(false);
                  setSelectedUserForDetail(null);
                }}
                className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer flex transition-all p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pb-3 mb-2 flex-wrap">
              <button
                onClick={() => setActiveDetailTab("orders")}
                className={`px-4 py-2 border-0 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDetailTab === "orders"
                    ? "bg-brand-cyan text-white shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                Orders ({selectedUserForDetail.activityCounts?.orders || 0})
              </button>
              <button
                onClick={() => setActiveDetailTab("repairs")}
                className={`px-4 py-2 border-0 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDetailTab === "repairs"
                    ? "bg-brand-cyan text-white shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                Repairs ({selectedUserForDetail.activityCounts?.repairs || 0})
              </button>
              <button
                onClick={() => setActiveDetailTab("csc")}
                className={`px-4 py-2 border-0 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDetailTab === "csc"
                    ? "bg-brand-cyan text-white shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                CSC Inquiries ({selectedUserForDetail.activityCounts?.csc || 0})
              </button>
            </div>

            {/* Tab content renders */}
            <div className="w-full">
              {loadingUserActivityDetail ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cyan"></div>
                </div>
              ) : !userActivityDetail ? (
                <p className="text-center py-8 text-xs text-slate-500 font-semibold">
                  Failed to load activity log.
                </p>
              ) : (
                <>
                  {activeDetailTab === "orders" && (
                    <div className="flex flex-col gap-4">
                      {userActivityDetail.orders?.length > 0 ? (
                        <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                                <th className="px-4 py-3 text-left">Order ID</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Items</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Payment</th>
                                <th className="px-4 py-3 text-left">Delivery</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userActivityDetail.orders.map((ord) => (
                                <tr key={ord._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-blue-600">
                                    <Link to={`/order-tracking/${ord._id}`} target="_blank" className="hover:underline">
                                      {ord.orderId}
                                    </Link>
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                                    {new Date(ord.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 max-w-[200px] truncate">
                                    {ord.items?.map((item) => item.product?.name?.[currentLang] || item.product?.name?.en).join(", ")}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-900 font-bold">
                                    ₹{ord.totalAmount}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                                    {ord.paymentType} ({ord.paymentStatus})
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                                      {ord.deliveryStatus}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-6 text-slate-400 text-xs font-semibold">No orders found.</p>
                      )}
                    </div>
                  )}

                  {activeDetailTab === "repairs" && (
                    <div className="flex flex-col gap-4">
                      {userActivityDetail.repairs?.length > 0 ? (
                        <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                                <th className="px-4 py-3 text-left">Device</th>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-left">Price</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Booked On</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userActivityDetail.repairs.map((rep) => (
                                <tr key={rep._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                                    {rep.deviceBrand} {rep.deviceModel}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                                    {rep.serviceCategory}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-brand-cyan font-bold">
                                    ₹{rep.estimatedPrice}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-bold">
                                    {rep.status}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                                    {new Date(rep.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-6 text-slate-400 text-xs font-semibold">No repair requests found.</p>
                      )}
                    </div>
                  )}

                  {activeDetailTab === "csc" && (
                    <div className="flex flex-col gap-4">
                      {userActivityDetail.cscInquiries?.length > 0 ? (
                        <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                                <th className="px-4 py-3 text-left">Service</th>
                                <th className="px-4 py-3 text-left">Details</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Requested On</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userActivityDetail.cscInquiries.map((q) => (
                                <tr key={q._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                                    {q.serviceName}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600 max-w-[250px] truncate" title={q.queryDetails}>
                                    {q.queryDetails}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-bold">
                                    {q.status}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                                    {new Date(q.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-6 text-slate-400 text-xs font-semibold">No CSC inquiries found.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(UsersTab);

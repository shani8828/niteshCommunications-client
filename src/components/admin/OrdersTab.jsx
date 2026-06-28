import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Search } from "lucide-react";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";

const OrdersTab = ({ orders, t, currentLang, handleUpdateOrderStatus }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const itemsPerPage = 10;

  // Filter logic
  const filteredOrders = orders.filter((ord) => {
    const orderIdMatch = ord.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    const nameMatch = ord.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = ord.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());
    const searchMatch = orderIdMatch || nameMatch || phoneMatch;

    const statusMatch = statusFilter === "all" || ord.deliveryStatus === statusFilter;

    return searchMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDownloadReceipt = async (ord) => {
    setDownloadingReceiptId(ord._id);
    try {
      const response = await api.get(`/orders/${ord._id}`);
      const fullOrder = response.data;
      if (!fullOrder || !fullOrder.items) {
        showToast.error(
          "Order details are incomplete / ऑर्डर विवरण अपूर्ण हैं"
        );
        return;
      }
      generateReceipt(fullOrder);
    } catch (err) {
      console.error(err);
      showToast.error(
        "Failed to fetch receipt details / रसीद विवरण प्राप्त करने में विफल"
      );
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const generateReceipt = (ord) => {
    let iframe = document.getElementById("receipt-print-iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "receipt-print-iframe";
      iframe.style.position = "absolute";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();

    const invoiceNo = ord.orderId
      ? ord.orderId
      : `INV-${ord._id.substring(18).toUpperCase()}`;
    const orderDate = new Date(ord.createdAt).toLocaleString(
      currentLang === "hi" ? "hi-IN" : "en-US"
    );
    const customerName = ord.user?.name || "Guest Customer";
    const customerPhone = ord.customerPhone || "N/A";
    const customerAddress = ord.customerAddress || "N/A";
    const nameofuser = customerName.toLowerCase().replace(/\s+/g, "-");

    const itemsHtml = ord.items
      .map((item, idx) => {
        const prodName =
          item.product?.name[currentLang] ||
          item.product?.name?.en ||
          "Product";
        const unitPrice = item.price;
        const qty = item.quantity;
        const total = unitPrice * qty;
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${idx + 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${prodName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${unitPrice}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">₹${total}</td>
          </tr>
        `;
      })
      .join("");

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>invoice-${nameofuser}-${invoiceNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            color: #334155;
            background-color: #ffffff;
            font-size: 13px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
          }
          .invoice-card {
            max-width: 800px;
            margin: 0 auto;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .logo-cell {
            width: 55%;
            vertical-align: top;
          }
          .logo-img {
            height: 55px;
            object-fit: contain;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 18px;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: -0.5px;
            margin: 0 0 4px 0;
          }
          .company-details {
            font-size: 11px;
            color: #64748b;
            margin: 0;
          }
          .meta-cell {
            width: 45%;
            text-align: right;
            vertical-align: top;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: -0.5px;
          }
          .meta-item {
            font-size: 12px;
            margin: 3px 0;
          }
          .meta-label {
            color: #64748b;
            font-weight: 500;
          }
          .meta-value {
            font-weight: 700;
            color: #0f172a;
          }
          .billing-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background-color: #f8fafc;
            border-radius: 12px;
            border: 1px solid #f1f5f9;
          }
          .billing-cell {
            padding: 20px;
            vertical-align: top;
            width: 100%;
          }
          .billing-title {
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          .billing-details {
            font-size: 12px;
            margin: 4px 0;
          }
          .billing-details strong {
            color: #0f172a;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background-color: #2563eb;
            color: #ffffff;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            padding: 12px 10px;
          }
          .items-table th:first-child {
            border-radius: 8px 0 0 8px;
          }
          .items-table th:last-child {
            border-radius: 0 8px 8px 0;
          }
          .totals-table {
            width: 320px;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .totals-row td {
            padding: 8px 10px;
            font-size: 12px;
          }
          .totals-label {
            color: #64748b;
            font-weight: 500;
          }
          .totals-val {
            text-align: right;
            font-weight: 600;
            color: #0f172a;
          }
          .grand-total-row td {
            padding: 12px 10px;
            font-size: 15px;
            border-top: 2px solid #e2e8f0;
            border-bottom: 2px solid #e2e8f0;
          }
          .grand-total-label {
            color: #2563eb;
            font-weight: 800;
          }
          .grand-total-val {
            text-align: right;
            font-weight: 800;
            color: #2563eb;
          }
          .footer-section {
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 25px;
            margin-top: 50px;
          }
          .footer-thanks {
            font-size: 14px;
            font-weight: 700;
            color: #2563eb;
            margin: 0 0 5px 0;
          }
          .footer-note {
            font-size: 10px;
            color: #94a3b8;
            margin: 0;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <!-- Header details -->
          <table class="header-table">
            <tr>
              <td class="logo-cell">
                <h1 class="company-name">NITESH COMMUNICATIONS</h1>
                <p class="company-details">
                  Patkhauli Chauraha, Karamdanda Mod, Ayodhya, UP - 224123<br />
                  Phone: +91 9125949456 | Email: info.niteshcommunications@gmail.com
                </p>
              </td>
              <td class="meta-cell">
                <div class="invoice-title">Invoice / Receipt</div>
                <div class="meta-item"><span class="meta-label">Invoice No:</span> <span class="meta-value">${invoiceNo}</span></div>
                <div class="meta-item"><span class="meta-label">Order Date:</span> <span class="meta-value">${orderDate}</span></div>
                <div class="meta-item"><span class="meta-label">Payment Mode:</span> <span class="meta-value">${ord.paymentType}</span></div>
              </td>
            </tr>
          </table>

          <!-- Billing Info -->
          <table class="billing-table">
            <tr>
              <td class="billing-cell">
                <div class="billing-title">Bill To (Customer Details)</div>
                <div class="billing-details"><strong>Name:</strong> ${customerName}</div>
                <div class="billing-details"><strong>Phone:</strong> ${customerPhone}</div>
                <div class="billing-details"><strong>Shipping Address:</strong> ${customerAddress}</div>
              </td>
            </tr>
          </table>

          <!-- Ordered Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 8%; text-align: center;">S.No</th>
                <th style="width: 52%; text-align: left;">Item Description</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Unit Price</th>
                <th style="width: 15%; text-align: right;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Summary Calculations -->
          <table class="totals-table">
            <tr class="totals-row">
              <td class="totals-label">Subtotal</td>
              <td class="totals-val">₹${ord.items ? ord.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) : ord.totalAmount}</td>
            </tr>
            ${ord.discountAmount > 0 ? `
            <tr class="totals-row">
              <td class="totals-label" style="color: #10b981;">Online Discount</td>
              <td class="totals-val" style="color: #10b981;">-₹${ord.discountAmount}</td>
            </tr>
            ` : ''}
            <tr class="totals-row">
              <td class="totals-label">Delivery Charges</td>
              <td class="totals-val" style="color: #10b981;">FREE</td>
            </tr>
            <tr class="totals-row">
              <td class="totals-label">Taxes</td>
              <td class="totals-val">₹0.00</td>
            </tr>
            <tr class="grand-total-row">
              <td class="grand-total-label">Grand Total</td>
              <td class="grand-total-val">₹${ord.totalAmount}</td>
            </tr>
          </table>

          <!-- Footer Legal disclaimer -->
          <div class="footer-section">
            <p class="footer-thanks">हमें दोबारा सेवा का अवसर दें।</p>
            <p class="footer-note">This is a computer-generated invoice/receipt. No physical signature is required.</p>
          </div>
        </div>

        <script>
          (function() {
            window.focus();
            setTimeout(function() {
              window.print();
            }, 300);
          })();
        </script>
      </body>
      </html>
    `;

    doc.write(receiptHtml);
    doc.close();
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Filtering and Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded border border-slate-200/60">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-slate-200 flex-grow max-w-md">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder={currentLang === "hi" ? "ऑर्डर आईडी, ग्राहक का नाम या फ़ोन से खोजें..." : "Search by Order ID, name or phone..."}
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
            className="px-3 py-2 bg-white border border-slate-200 rounded text-xs outline-none focus:border-brand-cyan"
          >
            <option value="all">{currentLang === "hi" ? "सभी ऑर्डर्स" : "All Status"}</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Waiting Pickup">Waiting Pickup</option>
            <option value="Picked Up">Picked Up</option>
            <option value="On The Way">On The Way</option>
            <option value="Delivered">Delivered</option>
            <option value="Return Requested">Return Requested</option>
            <option value="Replacement Requested">Replacement Requested</option>
            <option value="Returned">Returned</option>
            <option value="Replaced">Replaced</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded border border-slate-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <th className="px-4 py-3 text-left">
                {t("admin:order_id", "Order ID")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:customer", "Customer")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:phone", "Phone")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:amount", "Amount")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("cart:select_payment", "Payment")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:status", "Status")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("admin:actions", "Actions")}
              </th>
              <th className="px-4 py-3 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((ord) => (
              <tr
                key={ord._id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-blue-600">
                  <Link
                    to={`/order-tracking/${ord._id}`}
                    className="hover:underline"
                  >
                    {ord.orderId}
                  </Link>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                  {ord.user?.name || "Guest"}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  {ord.customerPhone}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-900 font-bold">
                  <div>
                    <span>₹{ord.totalAmount}</span>
                    {ord.discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        (₹{ord.discountAmount} off)
                      </span>
                    )}
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-800">
                      {ord.paymentType}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        ord.paymentStatus === "Paid"
                          ? "text-emerald-600"
                          : ord.paymentStatus === "Failed"
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.deliveryStatus === "Delivered" || ord.deliveryStatus === "Replaced"
                        ? "bg-emerald-100 text-emerald-700"
                        : ord.deliveryStatus === "Cancelled" || ord.deliveryStatus === "Returned"
                        ? "bg-rose-100 text-rose-700"
                        : ord.deliveryStatus === "Return Requested" || ord.deliveryStatus === "Replacement Requested"
                        ? "bg-purple-100 text-purple-700"
                        : ord.deliveryStatus === "Order Placed"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {ord.deliveryStatus}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                  <select
                    value={ord.deliveryStatus}
                    onChange={(e) =>
                      handleUpdateOrderStatus(ord._id, e.target.value)
                    }
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 outline-none cursor-pointer text-xs focus:border-brand-cyan"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packed">Packed</option>
                    <option value="Waiting Pickup">Waiting Pickup</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="On The Way">On The Way</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Return Requested">Return Requested</option>
                    <option value="Replacement Requested">Replacement Requested</option>
                    <option value="Returned">Returned</option>
                    <option value="Replaced">Replaced</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-center">
                  <button
                    onClick={() => handleDownloadReceipt(ord)}
                    disabled={downloadingReceiptId === ord._id}
                    className="mx-auto p-1.5 bg-slate-100 border border-slate-200 rounded text-blue-600 hover:bg-blue-50 flex items-center justify-center cursor-pointer transition-all disabled:opacity-50"
                  >
                    {downloadingReceiptId === ord._id ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent rounded-full" />
                    ) : (
                      <FileText size={14} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="border-b border-slate-100 px-4 py-6 text-xs text-slate-500 text-center font-semibold"
                >
                  {t("admin:no_data")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
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

export default React.memo(OrdersTab);

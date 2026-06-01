import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import * as LucideIcons from "lucide-react";
import {
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Package,
  Wrench,
  FileText,
  Settings,
  X,
  Upload,
  RefreshCw,
  ShoppingBag,
  Users,
  Sliders,
} from "lucide-react";
import { getCachedData, setCachedData, clearCache } from "../utils/cache";

const translateToHindi = async (text) => {
  if (!text || !text.trim()) return "";
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text.trim())}`,
    );
    if (!response.ok) throw new Error("Translation request failed");
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map((item) => item[0]).join("");
    }
    return "";
  } catch (error) {
    console.error("Translation error:", error);
    return "";
  }
};

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "hi";

  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [cscQueries, setCscQueries] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearchPhone, setUserSearchPhone] = useState("");
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("orders");
  const [loading, setLoading] = useState(true);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [prodNameEn, setProdNameEn] = useState("");
  const [prodNameHi, setProdNameHi] = useState("");
  const [prodDescEn, setProdDescEn] = useState("");
  const [prodDescHi, setProdDescHi] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodReturnPolicy, setProdReturnPolicy] = useState("Replace");
  const [prodImages, setProdImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [catNameEn, setCatNameEn] = useState("");
  const [catNameHi, setCatNameHi] = useState("");
  const [catImage, setCatImage] = useState(null);
  const [existingCatImage, setExistingCatImage] = useState("");
  const [removeCatImage, setRemoveCatImage] = useState(false);
  const [userActivityDetail, setUserActivityDetail] = useState(null);
  const [loadingUserActivityDetail, setLoadingUserActivityDetail] =
    useState(false);

  // Repair Services Configuration States
  const [repairPricingList, setRepairPricingList] = useState([]);
  const [activeService, setActiveService] = useState(null);
  const [activeBrand, setActiveBrand] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // CSC Services Configuration States
  const [cscServicesList, setCscServicesList] = useState([]);
  const [showCscModal, setShowCscModal] = useState(false);
  const [editingCscService, setEditingCscService] = useState(null);

  // Form states for CSC service CRUD
  const [cscTitleEn, setCscTitleEn] = useState("");
  const [cscTitleHi, setCscTitleHi] = useState("");
  const [cscDescEn, setCscDescEn] = useState("");
  const [cscDescHi, setCscDescHi] = useState("");
  const [cscFeeEn, setCscFeeEn] = useState("");
  const [cscFeeHi, setCscFeeHi] = useState("");
  const [cscDocsEn, setCscDocsEn] = useState("");
  const [cscDocsHi, setCscDocsHi] = useState("");
  const [cscIcon, setCscIcon] = useState("FileText");

  // Service Category Form State
  const [srvKey, setSrvKey] = useState("");
  const [srvCategory, setSrvCategory] = useState("");
  const [srvTitleEn, setSrvTitleEn] = useState("");
  const [srvTitleHi, setSrvTitleHi] = useState("");
  const [srvDescEn, setSrvDescEn] = useState("");
  const [srvDescHi, setSrvDescHi] = useState("");

  // Brand Form State
  const [newBrandName, setNewBrandName] = useState("");
  const [editingBrandName, setEditingBrandName] = useState("");
  const [oldBrandName, setOldBrandName] = useState("");

  // Model Form State
  const [newModelName, setNewModelName] = useState("");
  const [newModelPrice, setNewModelPrice] = useState("");
  const [editingModelName, setEditingModelName] = useState("");
  const [editingModelPrice, setEditingModelPrice] = useState("");

  const activeTabRef = React.useRef(activeTab);

  // Refs for tracking user modifications and dirty states for auto-translation
  const catNameEnDirty = React.useRef(false);
  const catNameHiManual = React.useRef(false);

  const prodNameEnDirty = React.useRef(false);
  const prodNameHiManual = React.useRef(false);

  const prodDescEnDirty = React.useRef(false);
  const prodDescHiManual = React.useRef(false);

  const srvTitleEnDirty = React.useRef(false);
  const srvTitleHiManual = React.useRef(false);
  const srvDescEnDirty = React.useRef(false);
  const srvDescHiManual = React.useRef(false);

  const cscTitleEnDirty = React.useRef(false);
  const cscTitleHiManual = React.useRef(false);
  const cscDescEnDirty = React.useRef(false);
  const cscDescHiManual = React.useRef(false);

  // Auto-translate Category Name
  useEffect(() => {
    if (!catNameEnDirty.current || catNameHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (catNameEn.trim()) {
        const translated = await translateToHindi(catNameEn);
        if (translated && !catNameHiManual.current) {
          setCatNameHi(translated);
        }
      } else {
        setCatNameHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [catNameEn]);

  // Auto-translate Product Name
  useEffect(() => {
    if (!prodNameEnDirty.current || prodNameHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (prodNameEn.trim()) {
        const translated = await translateToHindi(prodNameEn);
        if (translated && !prodNameHiManual.current) {
          setProdNameHi(translated);
        }
      } else {
        setProdNameHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [prodNameEn]);

  // Auto-translate Product Description
  useEffect(() => {
    if (!prodDescEnDirty.current || prodDescHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (prodDescEn.trim()) {
        const translated = await translateToHindi(prodDescEn);
        if (translated && !prodDescHiManual.current) {
          setProdDescHi(translated);
        }
      } else {
        setProdDescHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [prodDescEn]);

  // Auto-translate Service Title
  useEffect(() => {
    if (!srvTitleEnDirty.current || srvTitleHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (srvTitleEn.trim()) {
        const translated = await translateToHindi(srvTitleEn);
        if (translated && !srvTitleHiManual.current) {
          setSrvTitleHi(translated);
        }
      } else {
        setSrvTitleHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [srvTitleEn]);

  // Auto-translate Service Description
  useEffect(() => {
    if (!srvDescEnDirty.current || srvDescHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (srvDescEn.trim()) {
        const translated = await translateToHindi(srvDescEn);
        if (translated && !srvDescHiManual.current) {
          setSrvDescHi(translated);
        }
      } else {
        setSrvDescHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [srvDescEn]);

  // Auto-translate CSC Service Title
  useEffect(() => {
    if (!cscTitleEnDirty.current || cscTitleHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (cscTitleEn.trim()) {
        const translated = await translateToHindi(cscTitleEn);
        if (translated && !cscTitleHiManual.current) {
          setCscTitleHi(translated);
        }
      } else {
        setCscTitleHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [cscTitleEn]);

  // Auto-translate CSC Service Description
  useEffect(() => {
    if (!cscDescEnDirty.current || cscDescHiManual.current) return;
    const delayDebounce = setTimeout(async () => {
      if (cscDescEn.trim()) {
        const translated = await translateToHindi(cscDescEn);
        if (translated && !cscDescHiManual.current) {
          setCscDescHi(translated);
        }
      } else {
        setCscDescHi("");
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [cscDescEn]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/dashboard/admin");
      setAnalytics(response.data);
      setCachedData("admin_analytics", response.data, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async () => {
    try {
      const pRes = await api.get("/products?limit=100");
      const productsData = pRes.data.products || [];
      setProducts(productsData);
      setCachedData("admin_products", productsData, 5 * 60 * 1000);

      const cRes = await api.get("/products/categories");
      const categoriesData = cRes.data || [];
      setCategories(categoriesData);
      setCachedData("admin_categories", categoriesData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRepairsAndCsc = async () => {
    try {
      const repRes = await api.get("/repairs");
      const repairsData = repRes.data || [];
      setRepairs(repairsData);
      setCachedData("admin_repairs", repairsData, 5 * 60 * 1000);

      const cscRes = await api.get("/csc");
      const cscData = cscRes.data || [];
      setCscQueries(cscData);
      setCachedData("admin_csc", cscData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      const ordersData = response.data || [];
      setOrders(ordersData);
      setCachedData("admin_orders", ordersData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async (searchVal = "") => {
    try {
      const isSearch = searchVal.trim() !== "";
      const url = isSearch
        ? `/dashboard/admin/users?phone=${searchVal.trim()}`
        : "/dashboard/admin/users";
      const response = await api.get(url);
      const usersData = response.data || [];
      setUsers(usersData);
      if (!isSearch) {
        setCachedData("admin_users", usersData, 5 * 60 * 1000);
      }
    } catch (err) {
      console.error(err);
      showToast.error(t("admin:error_users_fetch", "Failed to fetch users"));
    }
  };

  const loadTabData = async (tab, forceRefresh = false, silent = false) => {
    let hasCache = false;

    // Check if cached data exists for the tab, unless forceRefresh is true
    if (!forceRefresh) {
      if (tab === "overview") {
        const cached = getCachedData("admin_analytics");
        if (cached) {
          setAnalytics(cached);
          hasCache = true;
        }
      } else if (tab === "orders") {
        const cached = getCachedData("admin_orders");
        if (cached) {
          setOrders(cached);
          hasCache = true;
        }
      } else if (tab === "products" || tab === "categories") {
        const cachedP = getCachedData("admin_products");
        const cachedC = getCachedData("admin_categories");
        if (cachedP && cachedC) {
          setProducts(cachedP);
          setCategories(cachedC);
          hasCache = true;
        }
      } else if (tab === "repairs" || tab === "csc") {
        const cachedRep = getCachedData("admin_repairs");
        const cachedCsc = getCachedData("admin_csc");
        if (cachedRep && cachedCsc) {
          setRepairs(cachedRep);
          setCscQueries(cachedCsc);
          hasCache = true;
        }
      } else if (tab === "users") {
        const cached = getCachedData("admin_users");
        if (cached) {
          setUsers(cached);
          hasCache = true;
        }
      } else if (tab === "repair-services") {
        const cached = getCachedData("admin_repair_pricing");
        if (cached) {
          setRepairPricingList(cached);
          hasCache = true;
        }
      } else if (tab === "csc-services") {
        const cached = getCachedData("admin_csc_services");
        if (cached) {
          setCscServicesList(cached);
          hasCache = true;
        }
      }
    }

    if (!hasCache && !silent) {
      setLoading(true);
    }

    try {
      if (tab === "overview") {
        await fetchAnalytics();
      } else if (tab === "orders") {
        await fetchOrders();
      } else if (tab === "products" || tab === "categories") {
        await fetchInventory();
      } else if (tab === "repairs" || tab === "csc") {
        await fetchRepairsAndCsc();
      } else if (tab === "users") {
        await fetchUsers("");
      } else if (tab === "repair-services") {
        await fetchRepairPricing();
      } else if (tab === "csc-services") {
        await fetchCscServices();
      }
    } catch (err) {
      console.error(`Error loading tab data for ${tab}:`, err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    setLoading(true);
    try {
      await api.put(`/orders/${id}/status`, { status });
      showToast.success(
        t("admin:success_status_update", "Status updated successfully"),
      );
      clearCache();
      await fetchOrders();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (ord) => {
    setDownloadingReceiptId(ord._id);
    try {
      const response = await api.get(`/orders/${ord._id}`);
      const fullOrder = response.data;
      if (!fullOrder || !fullOrder.items) {
        showToast.error(
          "Order details are incomplete / ऑर्डर विवरण अपूर्ण हैं",
        );
        return;
      }
      generateReceipt(fullOrder);
    } catch (err) {
      console.error(err);
      showToast.error(
        "Failed to fetch receipt details / रसीद विवरण प्राप्त करने में विफल",
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
      currentLang === "hi" ? "hi-IN" : "en-US",
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
                <img class="logo-img" src="/branding/logo.png" alt="Logo" id="invoice-logo" />
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
              <td class="totals-val">₹${ord.totalAmount}</td>
            </tr>
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
            const logo = document.getElementById('invoice-logo');
            function doPrint() {
              window.focus();
              window.print();
            }
            if (logo) {
              if (logo.complete) {
                setTimeout(doPrint, 300);
              } else {
                logo.onload = doPrint;
                logo.onerror = doPrint;
              }
            } else {
              doPrint();
            }
          })();
        </script>
      </body>
      </html>
    `;

    doc.write(receiptHtml);
    doc.close();
  };

  useEffect(() => {
    loadTabData("overview");

    // Auto-poll dashboard data silently in the background every 30 seconds for the active tab to fetch latest status
    const pollInterval = setInterval(() => {
      loadTabData(activeTabRef.current, true, true).catch((err) =>
        console.error("Silent background dashboard data refresh failed:", err),
      );
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catNameHi || !catNameEn) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("nameHi", catNameHi);
    formData.append("nameEn", catNameEn);
    if (catImage) {
      formData.append("image", catImage);
    } else if (removeCatImage) {
      formData.append("removeImage", "true");
    }

    try {
      if (editingCategory) {
        await api.put(`/products/categories/${editingCategory._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast.success(
          t("admin:success_category_update", "Category updated successfully!"),
        );
      } else {
        await api.post("/products/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast.success(
          t("admin:success_category_create", "Category created successfully!"),
        );
      }

      clearCache();
      setCatNameHi("");
      setCatNameEn("");
      setCatImage(null);
      setExistingCatImage("");
      setRemoveCatImage(false);
      setEditingCategory(null);
      setShowCategoryModal(false);
      fetchInventory();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        t("admin:error_category_save", "Category save failed");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat);
    setCatNameEn(cat.name.en);
    setCatNameHi(cat.name.hi);
    setCatImage(null);
    setExistingCatImage(cat.image || "");
    setRemoveCatImage(false);
    // Reset translation flags
    catNameEnDirty.current = false;
    catNameHiManual.current = false;
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (
      !window.confirm(
        t(
          "admin:confirm_delete_category",
          "Are you sure you want to delete this category?",
        ),
      )
    )
      return;
    setLoading(true);
    try {
      await api.delete(`/products/categories/${id}`);
      showToast.success(
        t("admin:success_category_delete", "Category deleted successfully"),
      );
      clearCache();
      fetchInventory();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        t("admin:error_category_delete", "Delete failed");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (existingImages.length === 0 && newImages.length === 0) {
      showToast.error(
        t("admin:error_no_images", "Please upload at least one image"),
      );
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("nameEn", prodNameEn);
    formData.append("nameHi", prodNameHi);
    formData.append("descriptionEn", prodDescEn);
    formData.append("descriptionHi", prodDescHi);
    formData.append("price", prodPrice);
    formData.append("originalPrice", prodOriginalPrice);
    formData.append("category", prodCategory);
    formData.append("stock", prodStock);
    formData.append("returnPolicy", prodReturnPolicy);

    if (editingProduct) {
      existingImages.forEach((img) => {
        formData.append("keptImages", img);
      });
    }

    if (newImages && newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        formData.append("images", newImages[i]);
      }
    }

    try {
      const url = editingProduct
        ? `/products/${editingProduct._id}`
        : "/products";
      const method = editingProduct ? "put" : "post";

      await api({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast.success(
        t("admin:success_product_save", "Product saved successfully!"),
      );
      clearCache();
      setShowProductModal(false);
      setEditingProduct(null);
      setProdNameEn("");
      setProdNameHi("");
      setProdDescEn("");
      setProdDescHi("");
      setProdPrice("");
      setProdOriginalPrice("");
      setProdCategory("");
      setProdStock("");
      setExistingImages([]);
      setNewImages([]);
      fetchInventory();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        t("admin:error_product_save", "Product save failed");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProdNameEn("");
    setProdNameHi("");
    setProdDescEn("");
    setProdDescHi("");
    setProdPrice("");
    setProdOriginalPrice("");
    setProdCategory("");
    setProdStock("");
    setProdReturnPolicy("Replace");
    setExistingImages([]);
    setNewImages([]);
    // Reset translation flags
    prodNameEnDirty.current = false;
    prodNameHiManual.current = false;
    prodDescEnDirty.current = false;
    prodDescHiManual.current = false;
    setShowProductModal(true);
  };

  const handleEditProductClick = (prod) => {
    setEditingProduct(prod);
    setProdNameEn(prod.name.en);
    setProdNameHi(prod.name.hi);
    setProdDescEn(prod.description.en);
    setProdDescHi(prod.description.hi);
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalPrice);
    setProdCategory(prod.category?._id || "");
    setProdStock(prod.stock);
    setProdReturnPolicy(prod.returnPolicy);
    setExistingImages(prod.images || []);
    setNewImages([]);
    // Reset translation flags
    prodNameEnDirty.current = false;
    prodNameHiManual.current = false;
    prodDescEnDirty.current = false;
    prodDescHiManual.current = false;
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (
      !window.confirm(
        t(
          "admin:confirm_delete_product",
          "Are you sure you want to delete this product?",
        ),
      )
    )
      return;
    setLoading(true);
    try {
      await api.delete(`/products/${id}`);
      showToast.success(
        t("admin:success_product_delete", "Product deleted successfully"),
      );
      clearCache();
      fetchInventory();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        t("admin:error_product_delete", "Delete failed");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRepairStatus = async (id, status) => {
    try {
      await api.put(`/repairs/${id}`, { status });
      showToast.success(
        t("admin:success_status_update", "Status updated successfully"),
      );
      fetchRepairsAndCsc();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    }
  };

  const handleUpdateCscStatus = async (id, status) => {
    try {
      await api.put(`/csc/${id}`, { status });
      showToast.success(
        t("admin:success_status_update", "Status updated successfully"),
      );
      fetchRepairsAndCsc();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    }
  };

  const fetchRepairPricing = async () => {
    try {
      const response = await api.get("/repairs/pricing/all");
      const pricingData = response.data || [];
      setRepairPricingList(pricingData);
      setCachedData("admin_repair_pricing", pricingData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
      showToast.error(t("admin:error_repair_pricing_fetch", "Failed to fetch repair services"));
    }
  };

  const fetchCscServices = async () => {
    try {
      const response = await api.get("/csc/services");
      const servicesData = response.data || [];
      setCscServicesList(servicesData);
      setCachedData("admin_csc_services", servicesData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to fetch CSC services / सीएससी सेवाएं प्राप्त करने में विफल");
    }
  };

  const handleEditCscClick = (service) => {
    setEditingCscService(service);
    setCscTitleEn(service.title.en);
    setCscTitleHi(service.title.hi);
    setCscDescEn(service.desc.en);
    setCscDescHi(service.desc.hi);
    setCscFeeEn(service.fee.en);
    setCscFeeHi(service.fee.hi);
    setCscDocsEn(service.documents?.en?.join(", ") || "");
    setCscDocsHi(service.documents?.hi?.join(", ") || "");
    setCscIcon(service.icon || "FileText");
    // Reset translation flags
    cscTitleEnDirty.current = false;
    cscTitleHiManual.current = false;
    cscDescEnDirty.current = false;
    cscDescHiManual.current = false;
    setShowCscModal(true);
  };

  const handleSaveCscService = async (e) => {
    e.preventDefault();
    if (!cscTitleEn || !cscTitleHi || !cscDescEn || !cscDescHi || !cscFeeEn || !cscFeeHi || !cscIcon) {
      showToast.error("Please fill all required fields / कृपया सभी आवश्यक फ़ील्ड भरें");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: { en: cscTitleEn, hi: cscTitleHi },
        desc: { en: cscDescEn, hi: cscDescHi },
        fee: { en: cscFeeEn, hi: cscFeeHi },
        documents: {
          en: cscDocsEn.split(",").map(d => d.trim()).filter(Boolean),
          hi: cscDocsHi.split(",").map(d => d.trim()).filter(Boolean),
        },
        icon: cscIcon,
      };

      if (editingCscService) {
        await api.put(`/csc/services/${editingCscService._id}`, payload);
        showToast.success("CSC Service updated successfully! / सीएससी सेवा सफलतापूर्वक अपडेट की गई!");
      } else {
        await api.post("/csc/services", payload);
        showToast.success("CSC Service created successfully! / सीएससी सेवा सफलतापूर्वक बनाई गई!");
      }

      clearCache();
      setShowCscModal(false);
      setEditingCscService(null);
      setCscTitleEn("");
      setCscTitleHi("");
      setCscDescEn("");
      setCscDescHi("");
      setCscFeeEn("");
      setCscFeeHi("");
      setCscDocsEn("");
      setCscDocsHi("");
      setCscIcon("FileText");
      await fetchCscServices();
    } catch (err) {
      console.error(err);
      showToast.error("Failed to save CSC service / सीएससी सेवा सहेजने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCscService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this CSC Service? / क्या आप वाकई इस सीएससी सेवा को हटाना चाहते हैं?")) return;
    setLoading(true);
    try {
      await api.delete(`/csc/services/${id}`);
      showToast.success("CSC Service deleted! / सीएससी सेवा हटा दी गई!");
      clearCache();
      await fetchCscServices();
    } catch (err) {
      console.error(err);
      showToast.error("Failed to delete CSC service / सीएससी सेवा हटाने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleEditServiceClick = (service) => {
    setEditingService(service);
    setSrvKey(service.serviceKey);
    setSrvCategory(service.category);
    setSrvTitleEn(service.title.en);
    setSrvTitleHi(service.title.hi);
    setSrvDescEn(service.desc.en);
    setSrvDescHi(service.desc.hi);
    // Reset translation flags
    srvTitleEnDirty.current = false;
    srvTitleHiManual.current = false;
    srvDescEnDirty.current = false;
    srvDescHiManual.current = false;
    setShowServiceModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!srvKey || !srvCategory || !srvTitleEn || !srvTitleHi || !srvDescEn || !srvDescHi) {
      showToast.error("Please fill all required fields / कृपया सभी आवश्यक फ़ील्ड भरें");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        serviceKey: srvKey.trim(),
        category: srvCategory.trim(),
        title: { en: srvTitleEn.trim(), hi: srvTitleHi.trim() },
        desc: { en: srvDescEn.trim(), hi: srvDescHi.trim() },
      };
      let res;
      if (editingService) {
        payload.brands = editingService.brands;
        res = await api.put(`/repairs/pricing/${editingService._id}`, payload);
        showToast.success("Service updated successfully! / सेवा सफलतापूर्वक अपडेट की गई!");
      } else {
        payload.brands = {};
        res = await api.post("/repairs/pricing", payload);
        showToast.success("Service added successfully! / सेवा सफलतापूर्वक जोड़ी गई!");
      }
      clearCache();
      setShowServiceModal(false);
      setEditingService(null);
      setSrvKey("");
      setSrvCategory("");
      setSrvTitleEn("");
      setSrvTitleHi("");
      setSrvDescEn("");
      setSrvDescHi("");
      
      await fetchRepairPricing();
      
      if (editingService && activeService && activeService._id === editingService._id) {
        setActiveService(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast.error(err.response?.data?.message || "Failed to save service / सेवा सहेजने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this repair service category? This will delete all its brands and models too. / क्या आप वाकई इस रिपेयर सेवा श्रेणी को हटाना चाहते हैं? इससे इसके सभी ब्रांड और मॉडल भी हट जाएंगे।")) return;
    setLoading(true);
    try {
      await api.delete(`/repairs/pricing/${id}`);
      showToast.success("Service deleted successfully! / सेवा सफलतापूर्वक हटा दी गई!");
      clearCache();
      if (activeService && activeService._id === id) {
        setActiveService(null);
        setActiveBrand("");
      }
      await fetchRepairPricing();
    } catch (err) {
      console.error(err);
      showToast.error(err.response?.data?.message || "Failed to delete service / सेवा हटाने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const brandName = newBrandName.trim();
    if (activeService.brands && activeService.brands[brandName]) {
      showToast.error("Brand already exists! / ब्रांड पहले से मौजूद है!");
      return;
    }
    const updatedBrands = {
      ...(activeService.brands || {}),
      [brandName]: {}
    };
    setLoading(true);
    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Brand ${brandName} added! / ब्रांड ${brandName} जोड़ा गया!`);
      clearCache();
      setActiveService(res.data);
      setNewBrandName("");
      setRepairPricingList(prev => prev.map(s => s._id === res.data._id ? res.data : s));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to add brand / ब्रांड जोड़ने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleRenameBrand = async (oldName, newName) => {
    if (!newName.trim() || oldName === newName.trim()) return;
    const cleanNewName = newName.trim();
    if (activeService.brands[cleanNewName]) {
      showToast.error("Brand name already exists! / ब्रांड नाम पहले से मौजूद है!");
      return;
    }
    const updatedBrands = { ...activeService.brands };
    updatedBrands[cleanNewName] = { ...updatedBrands[oldName] };
    delete updatedBrands[oldName];
    
    setLoading(true);
    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success("Brand renamed! / ब्रांड का नाम बदला गया!");
      clearCache();
      setActiveService(res.data);
      if (activeBrand === oldName) {
        setActiveBrand(cleanNewName);
      }
      setEditingBrandName("");
      setNewBrandName("");
      setRepairPricingList(prev => prev.map(s => s._id === res.data._id ? res.data : s));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to rename brand / ब्रांड का नाम बदलने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandName) => {
    if (!window.confirm(`Are you sure you want to delete brand "${brandName}" and all its models? / क्या आप वाकई ब्रांड "${brandName}" और इसके सभी मॉडलों को हटाना चाहते हैं?`)) return;
    const updatedBrands = { ...activeService.brands };
    delete updatedBrands[brandName];
    
    setLoading(true);
    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Brand ${brandName} deleted! / ब्रांड ${brandName} हटाया गया!`);
      clearCache();
      setActiveService(res.data);
      if (activeBrand === brandName) {
        setActiveBrand("");
      }
      setRepairPricingList(prev => prev.map(s => s._id === res.data._id ? res.data : s));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to delete brand / ब्रांड हटाने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!newModelName.trim() || !newModelPrice) {
      showToast.error("Please enter both model name and price / कृपया मॉडल का नाम और कीमत दोनों दर्ज करें");
      return;
    }
    const modelName = newModelName.trim();
    const price = parseInt(newModelPrice);
    if (activeService.brands[activeBrand] && activeService.brands[activeBrand][modelName] !== undefined) {
      showToast.error("Model already exists! / मॉडल पहले से मौजूद है!");
      return;
    }
    const updatedBrands = { ...activeService.brands };
    updatedBrands[activeBrand] = {
      ...(updatedBrands[activeBrand] || {}),
      [modelName]: price
    };
    
    setLoading(true);
    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Model ${modelName} added! / मॉडल ${modelName} जोड़ा गया!`);
      clearCache();
      setActiveService(res.data);
      setNewModelName("");
      setNewModelPrice("");
      setRepairPricingList(prev => prev.map(s => s._id === res.data._id ? res.data : s));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to add model / मॉडल जोड़ने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleEditModelPrice = async (modelName, newPrice) => {
    const price = parseInt(newPrice);
    if (isNaN(price)) return;
    const updatedBrands = { ...activeService.brands };
    updatedBrands[activeBrand] = {
      ...updatedBrands[activeBrand],
      [modelName]: price
    };
    
    setLoading(true);
    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Updated ${modelName} price to ₹${price}! / ₹${price} पर ${modelName} की कीमत अपडेट की गई!`);
      clearCache();
      setActiveService(res.data);
      setEditingModelName("");
      setEditingModelPrice("");
      setRepairPricingList(prev => prev.map(s => s._id === res.data._id ? res.data : s));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to update price / कीमत अपडेट करने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (modelName) => {
    if (!window.confirm(`Are you sure you want to delete model "${modelName}"? / क्या आप वाकई मॉडल "${modelName}" को हटाना चाहते हैं?`)) return;
    const updatedBrands = { ...activeService.brands };
    updatedBrands[activeBrand] = { ...updatedBrands[activeBrand] };
    delete updatedBrands[activeBrand][modelName];
    
    setLoading(true);
    try {
      const res = await api.put(`/repairs/pricing/${activeService._id}`, { brands: updatedBrands });
      showToast.success(`Model ${modelName} deleted! / मॉडल ${modelName} हटाया गया!`);
      clearCache();
      setActiveService(res.data);
      setRepairPricingList(prev => prev.map(s => s._id === res.data._id ? res.data : s));
    } catch (err) {
      console.error(err);
      showToast.error("Failed to delete model / मॉडल हटाने में विफल");
    } finally {
      setLoading(false);
    }
  };

  if (!analytics) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
      {loading && <Loader fullPage />}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="font-heading text-2xl font-extrabold text-slate-900">
          {t("admin:dashboard_title")}
        </h2>
        <button
          onClick={() => loadTabData(activeTab, true)}
          className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-brand-cyan border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
          {t("common:loading", "Refresh")}
        </button>
      </div>

      {/* Dashboard Analytics widgets grid */}
      {analytics && (
        <div className={`grid gap-4 mb-8 ${
          analytics.totalPayouts > 0 
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" 
            : "grid-cols-2 md:grid-cols-4"
        }`}>
          <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t("admin:total_sales")}
            </span>
            <h3 className="text-2xl font-extrabold text-brand-cyan font-heading">
              ₹{analytics.totalRevenue}
            </h3>
          </div>
          <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t("admin:total_orders")}
            </span>
            <h3 className="text-2xl font-extrabold text-brand-cyan font-heading">
              {analytics.totalOrders}
            </h3>
          </div>
          <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t("admin:customer")}
            </span>
            <h3 className="text-2xl font-extrabold text-brand-cyan font-heading">
              {analytics.totalUsers}
            </h3>
          </div>
          <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t("admin:nav_products")}
            </span>
            <h3 className="text-2xl font-extrabold text-brand-cyan font-heading">
              {analytics.totalProducts}
            </h3>
          </div>
          {analytics.totalPayouts > 0 && (
            <>
              <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm border border-red-500/10">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t("admin:payouts")}
                </span>
                <h3 className="text-2xl font-extrabold text-red-500 font-heading">
                  ₹{analytics.totalPayouts}
                </h3>
              </div>
              <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm border border-emerald-500/10">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t("admin:net_effective")}
                </span>
                <h3 className="text-2xl font-extrabold text-emerald-500 font-heading">
                  ₹{analytics.netEffective}
                </h3>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tabs panels layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Navigation Sidebar */}
        <aside className="flex flex-row lg:flex-col flex-wrap gap-1.5 h-fit w-full lg:w-[240px] flex-shrink-0">
          <button
            onClick={() => {
              setActiveTab("overview");
              loadTabData("overview");
            }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10"
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
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10"
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
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "products"
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10"
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
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10"
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
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "repairs"
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10"
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
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "repair-services"
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Sliders size={16} /> {currentLang === "hi" ? "रिपेयर सेवाएं" : "Repair Services"}
          </button>
          <button
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
          </button>
          <button
            onClick={() => {
              setActiveTab("csc-services");
              loadTabData("csc-services");
            }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "csc-services"
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Sliders size={16} /> {currentLang === "hi" ? "सीएससी सेवाएं" : "CSC Services"}
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              loadTabData("users");
            }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Users size={16} /> {t("admin:nav_users", "Users")}
          </button>
        </aside>

        {/* Content body */}
        <main className="flex-grow w-full">
          {/* Tab 1: Overview Summary */}
          {activeTab === "overview" && analytics && (
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
                          {t("admin:product_name_en")}
                        </th>
                        <th className="px-4 py-3 text-left">
                          {t("admin:category")}
                        </th>
                        <th className="px-4 py-3 text-left">
                          {t("admin:stock")}
                        </th>
                        <th className="px-4 py-3 text-left">
                          {t("admin:price")}
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
                            {item.name.en}
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                            {item.category?.name?.en || "N/A"}
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
          )}

          {/* Tab: Orders Panel */}
          {activeTab === "orders" && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  {t("admin:nav_orders", "Orders")}
                </h3>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Total Orders:{" "}
                    <span className="font-bold text-slate-900">
                      {orders.length}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Placed / Active:{" "}
                    <span className="font-bold text-slate-900">
                      {
                        orders.filter(
                          (o) =>
                            o.deliveryStatus !== "Delivered" &&
                            o.deliveryStatus !== "Cancelled" &&
                            o.deliveryStatus !== "Returned",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Delivered:{" "}
                    <span className="font-bold text-slate-900">
                      {
                        orders.filter((o) => o.deliveryStatus === "Delivered")
                          .length
                      }
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Cancelled:{" "}
                    <span className="font-bold text-slate-900">
                      {
                        orders.filter((o) => o.deliveryStatus === "Cancelled")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
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
                      <th className="px-4 py-3 text-left">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
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
                          ₹{ord.totalAmount}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-800">
                              {ord.paymentType}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${ord.paymentStatus === "Paid" ? "text-emerald-600" : ord.paymentStatus === "Failed" ? "text-rose-600" : "text-amber-600"}`}
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
                          <div className="flex items-center gap-2">
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
                              <option value="Waiting Pickup">
                                Waiting Pickup
                              </option>
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
                        </td>
                        <td>
                          <button
                            onClick={() => handleDownloadReceipt(ord)}
                            disabled={downloadingReceiptId === ord._id}
                            className="p-1.5 bg-slate-100 border border-slate-200 rounded text-blue-600 hover:bg-blue-50 flex cursor-pointer transition-all disabled:opacity-50"
                            title={
                              currentLang === "hi"
                                ? "रसीद डाउनलोड करें"
                                : "Download Receipt"
                            }
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
                    {orders.length === 0 && (
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
            </div>
          )}

          {/* Tab 2: Products CRUD Panel */}
          {activeTab === "products" && (
            <div className="flex flex-col gap-6 w-full">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {t("admin:inventory_control", "Inventory Control")}
                  </h3>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Total Products:{" "}
                      <span className="font-bold text-slate-900">
                        {products.length}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Out of Stock:{" "}
                      <span className="font-bold text-slate-900">
                        {products.filter((p) => p.stock === 0).length}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Low Stock (≤ 5):{" "}
                      <span className="font-bold text-slate-900">
                        {
                          products.filter((p) => p.stock > 0 && p.stock <= 5)
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddProductClick}
                  className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg hover:brightness-110 shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} /> {t("admin:add_product")}
                </button>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">
                        {t("admin:image_url", "Image")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:product_name_en")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:category")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:price")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:stock")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr
                        key={prod._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <img
                            src={prod.images[0]}
                            alt={prod.name.en}
                            className="w-9 h-9 rounded object-contain bg-slate-100 border border-slate-200"
                          />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                          {prod.name.en}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          {prod.category?.name?.en}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-900 font-bold">
                          ₹{prod.price}
                        </td>
                        <td
                          className={`border-b border-slate-100 px-4 py-3 text-xs font-extrabold ${
                            prod.stock === 0
                              ? "text-rose-500"
                              : prod.stock <= 5
                                ? "text-amber-500"
                                : "text-emerald-500"
                          }`}
                        >
                          {prod.stock}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProductClick(prod)}
                              className="p-1.5 bg-slate-100 border border-slate-200 rounded text-brand-cyan hover:bg-slate-200 flex cursor-pointer transition-all"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="p-1.5 bg-slate-100 border border-slate-200 rounded text-rose-500 hover:bg-rose-50 flex cursor-pointer transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Categories CRUD Panel */}
          {activeTab === "categories" && (
            <div className="flex flex-col gap-6 w-full">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {t("admin:categories_setup", "Categories Setup")}
                  </h3>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    <div className="px-3 py-1.5 bg-brand-cyan/5 border border-brand-cyan/25 text-brand-cyan rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
                      Total Categories:{" "}
                      <span className="font-bold text-slate-900">
                        {categories.length}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCatNameEn("");
                    setCatNameHi("");
                    setCatImage(null);
                    setExistingCatImage("");
                    setRemoveCatImage(false);
                    // Reset translation flags
                    catNameEnDirty.current = false;
                    catNameHiManual.current = false;
                    setShowCategoryModal(true);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg hover:brightness-110 shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} /> {t("admin:add_category", "Add Category")}
                </button>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">
                        {t("admin:image_url", "Image")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:product_name_hi")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:product_name_en")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:actions", "Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr
                        key={cat._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name.en}
                              className="w-9 h-9 rounded object-contain bg-slate-100 border border-slate-200"
                            />
                          ) : (
                            t("admin:no_image", "No Image")
                          )}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          {cat.name.hi}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                          {cat.name.en}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCategoryClick(cat)}
                              className="p-1.5 bg-slate-100 border border-slate-200 rounded text-brand-cyan hover:bg-slate-200 flex cursor-pointer transition-all"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="p-1.5 bg-slate-100 border border-slate-200 rounded text-rose-500 hover:bg-rose-50 flex cursor-pointer transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Repairs Service Tracker */}
          {activeTab === "repairs" && (
            <div className="flex flex-col gap-6 w-full">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  {t("admin:repairs_bookings", "Mobile Repair Bookings")}
                </h3>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Total Repair Requests:{" "}
                    <span className="font-bold text-slate-900">
                      {repairs.length}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Finalized Requests:{" "}
                    <span className="font-bold text-slate-900">
                      {
                        repairs.filter(
                          (r) =>
                            r.status === "Delivered" || r.status === "Repaired",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Pending Requests:{" "}
                    <span className="font-bold text-slate-900">
                      {repairs.filter((r) => r.status === "Pending").length}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    In Progress:{" "}
                    <span className="font-bold text-slate-900">
                      {
                        repairs.filter(
                          (r) =>
                            r.status === "In Progress" ||
                            r.status === "Approved",
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">
                        {t("admin:customer")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("common:phone")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("repair:device_brand", "Device")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:category")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("repair:estimate", "Estimate")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:status")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.map((rep) => (
                      <tr
                        key={rep._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
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
                          ₹{rep.estimatedPrice}
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
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: CSC Jan Seva Kendra Queries */}
          {activeTab === "csc" && (
            <div className="flex flex-col gap-6 w-full">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  {t("admin:nav_csc")}
                </h3>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Total Inquiries:{" "}
                    <span className="font-bold text-slate-900">
                      {cscQueries.length}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Pending:{" "}
                    <span className="font-bold text-slate-900">
                      {cscQueries.filter((q) => q.status === "Pending").length}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Processing:{" "}
                    <span className="font-bold text-slate-900">
                      {
                        cscQueries.filter((q) => q.status === "Processing")
                          .length
                      }
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Completed:{" "}
                    <span className="font-bold text-slate-900">
                      {
                        cscQueries.filter((q) => q.status === "Completed")
                          .length
                      }
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Cancelled:{" "}
                    <span className="font-bold text-slate-900">
                      {
                        cscQueries.filter((q) => q.status === "Cancelled")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">
                        {t("admin:customer")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("common:phone")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("csc:service_type")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("csc:details")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:status")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cscQueries.map((query) => (
                      <tr
                        key={query._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                          {query.name}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          {query.phone}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          {query.serviceName}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate">
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
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 8: Repair Services & Pricing CRUD Manager */}
          {activeTab === "repair-services" && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {currentLang === "hi" ? "मोबाइल रिपेयर सेवाएं और मूल्य निर्धारण" : "Mobile Repair Services & Pricing"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentLang === "hi" 
                      ? "सेवा श्रेणियां, ब्रांड और व्यक्तिगत मॉडल कीमतों को गतिशील रूप से प्रबंधित करें।" 
                      : "Dynamically manage service categories, brands, and individual model pricing."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setSrvKey("");
                    setSrvCategory("");
                    setSrvTitleEn("");
                    setSrvTitleHi("");
                    setSrvDescEn("");
                    setSrvDescHi("");
                    srvTitleEnDirty.current = false;
                    srvTitleHiManual.current = false;
                    srvDescEnDirty.current = false;
                    srvDescHiManual.current = false;
                    setShowServiceModal(true);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg hover:brightness-110 shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} /> {currentLang === "hi" ? "नई सेवा जोड़ें" : "Add New Service"}
                </button>
              </div>

              {/* 3-Column Manager Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* Column 1: Service Categories */}
                <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 shadow-sm h-[600px]">
                  <h4 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
                    <span>1. {currentLang === "hi" ? "सेवा श्रेणी" : "Service Category"}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                      {repairPricingList.length}
                    </span>
                  </h4>
                  <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2">
                    {repairPricingList.map((service) => (
                      <div
                        key={service._id}
                        onClick={() => {
                          setActiveService(service);
                          setActiveBrand("");
                        }}
                        className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left ${
                          activeService?._id === service._id
                            ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan font-bold"
                            : "bg-white/5 border-slate-100 hover:bg-slate-50 text-slate-700 font-normal"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-xs truncate">
                              {currentLang === "hi" ? service.title.hi : service.title.en}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 truncate font-normal">
                              {service.category} ({service.serviceKey})
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditServiceClick(service);
                              }}
                              className="p-1 text-brand-cyan hover:bg-brand-cyan/5 rounded border-0 cursor-pointer"
                              title="Edit Service"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteService(service._id);
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded border-0 cursor-pointer"
                              title="Delete Service"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {repairPricingList.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-8">
                        {currentLang === "hi" ? "कोई सेवा उपलब्ध नहीं है" : "No services available"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Column 2: Brands */}
                <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 shadow-sm h-[600px]">
                  <h4 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
                    <span>2. {currentLang === "hi" ? "ब्रांड" : "Brands"}</span>
                    {activeService && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        {Object.keys(activeService.brands || {}).length}
                      </span>
                    )}
                  </h4>

                  {!activeService ? (
                    <div className="flex-grow flex items-center justify-center text-center p-6">
                      <p className="text-xs text-slate-400">
                        {currentLang === "hi" 
                          ? "👈 ब्रांड देखने और प्रबंधित करने के लिए एक सेवा चुनें।" 
                          : "👈 Select a service to view and manage brands."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col gap-4 min-h-0">
                      <form onSubmit={handleAddBrand} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-grow px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan text-xs"
                          placeholder={currentLang === "hi" ? "उदा. Apple, Samsung" : "e.g. Apple, Samsung"}
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          required
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-xl text-xs font-bold shadow cursor-pointer transition-all border-0 flex-shrink-0"
                        >
                          {currentLang === "hi" ? "जोड़ें" : "Add"}
                        </button>
                      </form>

                      <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2">
                        {Object.keys(activeService.brands || {}).map((brandName) => (
                          <div
                            key={brandName}
                            onClick={() => {
                              if (editingBrandName !== brandName) {
                                setActiveBrand(brandName);
                              }
                            }}
                            className={`p-3 rounded-xl cursor-pointer transition-all border text-left flex justify-between items-center gap-2 ${
                              activeBrand === brandName
                                ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan font-bold"
                                : "bg-white/5 border-slate-100 hover:bg-slate-50 text-slate-700 font-normal"
                            }`}
                          >
                            {editingBrandName === brandName ? (
                              <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 text-xs focus:border-brand-cyan outline-none"
                                  value={newBrandName}
                                  onChange={(e) => setNewBrandName(e.target.value)}
                                  autoFocus
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameBrand(brandName, newBrandName);
                                  }}
                                  className="px-2 py-1 bg-brand-cyan text-white text-[10px] rounded border-0 cursor-pointer font-bold"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingBrandName("");
                                    setNewBrandName("");
                                  }}
                                  className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] rounded border-0 cursor-pointer font-bold"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="font-bold text-xs truncate">{brandName}</span>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingBrandName(brandName);
                                      setNewBrandName(brandName);
                                    }}
                                    className="p-1 text-brand-cyan hover:bg-brand-cyan/5 rounded border-0 cursor-pointer"
                                    title="Rename Brand"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBrand(brandName);
                                    }}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded border-0 cursor-pointer"
                                    title="Delete Brand"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        {Object.keys(activeService.brands || {}).length === 0 && (
                          <p className="text-center text-xs text-slate-400 py-8 font-semibold">
                            {currentLang === "hi" ? "कोई ब्रांड पंजीकृत नहीं है" : "No brands registered"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 3: Models & Pricing */}
                <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 shadow-sm h-[600px]">
                  <h4 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
                    <span>3. {currentLang === "hi" ? "मॉडल और कीमतें" : "Models & Prices"}</span>
                    {activeService && activeBrand && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        {Object.keys(activeService.brands[activeBrand] || {}).length}
                      </span>
                    )}
                  </h4>

                  {!activeService || !activeBrand ? (
                    <div className="flex-grow flex items-center justify-center text-center p-6">
                      <p className="text-xs text-slate-400">
                        {currentLang === "hi" 
                          ? "👈 मॉडल और कीमतें प्रबंधित करने के लिए एक ब्रांड चुनें।" 
                          : "👈 Select a brand to manage models and pricing."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col gap-4 min-h-0">
                      <form onSubmit={handleAddModel} className="flex flex-col gap-2 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                          {currentLang === "hi" ? "नया मॉडल जोड़ें" : "Add New Model"}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan text-xs"
                            placeholder={currentLang === "hi" ? "मॉडल (उदा. iPhone 13 Pro)" : "Model (e.g. iPhone 13 Pro)"}
                            value={newModelName}
                            onChange={(e) => setNewModelName(e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan text-xs"
                            placeholder={currentLang === "hi" ? "कीमत (₹)" : "Price (₹)"}
                            value={newModelPrice}
                            onChange={(e) => setNewModelPrice(e.target.value)}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-xl text-xs font-bold shadow cursor-pointer transition-all border-0"
                        >
                          {currentLang === "hi" ? "मॉडल सहेजें" : "Save Model"}
                        </button>
                      </form>

                      <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2">
                        {Object.entries(activeService.brands[activeBrand] || {}).map(([modelName, price]) => (
                          <div
                            key={modelName}
                            className="p-3 rounded-xl border border-slate-100 bg-white/5 flex justify-between items-center gap-2"
                          >
                            <div className="flex-grow min-w-0 text-left">
                              {editingModelName === modelName ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs truncate max-w-[120px] text-slate-800">{modelName}</span>
                                  <input
                                    type="number"
                                    className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 text-xs focus:border-brand-cyan outline-none"
                                    value={editingModelPrice}
                                    onChange={(e) => setEditingModelPrice(e.target.value)}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleEditModelPrice(modelName, editingModelPrice)}
                                    className="px-2 py-1 bg-brand-cyan text-white text-[10px] rounded border-0 cursor-pointer font-bold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingModelName("")}
                                    className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] rounded border-0 cursor-pointer font-bold"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <p className="font-bold text-xs text-slate-800 truncate">{modelName}</p>
                              )}
                            </div>
                            
                            {editingModelName !== modelName && (
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-xs text-brand-cyan font-mono">₹{price}</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingModelName(modelName);
                                      setEditingModelPrice(price.toString());
                                    }}
                                    className="p-1 text-brand-cyan hover:bg-brand-cyan/5 rounded border-0 cursor-pointer"
                                    title="Edit Price"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteModel(modelName)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded border-0 cursor-pointer"
                                    title="Delete Model"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {Object.keys(activeService.brands[activeBrand] || {}).length === 0 && (
                          <p className="text-center text-xs text-slate-400 py-8 font-semibold">
                            {currentLang === "hi" ? "कोई मॉडल सूचीबद्ध नहीं है" : "No models listed"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl shadow-sm text-left">
                <h5 className="font-heading text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">
                  💡 {currentLang === "hi" ? "व्यवस्थापक मार्गदर्शिका (Directions for Admin):" : "Directions for Admin:"}
                </h5>
                <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                  <li>{currentLang === "hi" ? "चरण 1: बाईं ओर 'नई सेवा जोड़ें' पर क्लिक करके रिपेयर सेवा श्रेणी बनाएं या संपादित करें।" : "Step 1: Create or edit a repair service category using 'Add New Service' on the left."}</li>
                  <li>{currentLang === "hi" ? "चरण 2: संबंधित सेवा पर क्लिक करें, फिर बीच के कॉलम में उस सेवा के लिए समर्थित ब्रांड (उदा. Apple, Samsung) जोड़ें।" : "Step 2: Click on a service, then add supported brands (e.g. Apple, Samsung) for that service in the middle column."}</li>
                  <li>{currentLang === "hi" ? "चरण 3: किसी ब्रांड पर क्लिक करें, फिर दाएं कॉलम में व्यक्तिगत फोन मॉडल और उनकी संबंधित रिपेयरिंग कीमतों को जोड़ें/संपादित करें।" : "Step 3: Click on a brand, then add/edit individual phone models and their respective repair prices in the right column."}</li>
                  <li>{currentLang === "hi" ? "मॉडल की कीमतों में बदलाव तुरंत सहेज लिए जाते हैं और ग्राहक बुकिंग विजार्ड में लाइव हो जाते हैं।" : "Model pricing edits are saved instantly and reflect live in the customer booking wizard."}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab: CSC Services Catalog Manager */}
          {activeTab === "csc-services" && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {currentLang === "hi" ? "सीएससी सेवाएं सूची" : "CSC Services Catalog"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentLang === "hi"
                      ? "सीएससी पोर्टल पर प्रदर्शित सरकारी डिजिटल सेवाओं, शुल्कों और आवश्यक दस्तावेजों को प्रबंधित करें।"
                      : "Manage digital government services, fees, and required documents shown on the CSC portal."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCscService(null);
                    setCscTitleEn("");
                    setCscTitleHi("");
                    setCscDescEn("");
                    setCscDescHi("");
                    setCscFeeEn("");
                    setCscFeeHi("");
                    setCscDocsEn("");
                    setCscDocsHi("");
                    setCscIcon("FileText");
                    // Reset translation flags
                    cscTitleEnDirty.current = false;
                    cscTitleHiManual.current = false;
                    cscDescEnDirty.current = false;
                    cscDescHiManual.current = false;
                    setShowCscModal(true);
                  }}
                  className="px-4 py-2.5 text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-xl flex items-center gap-1.5 shadow cursor-pointer transition-all border-0"
                >
                  <Plus size={14} /> {currentLang === "hi" ? "नई सेवा जोड़ें" : "Add New Service"}
                </button>
              </div>

              {/* CSC Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cscServicesList.map((service) => {
                  const IconComponent = LucideIcons[service.icon] || LucideIcons.FileText;
                  return (
                    <div
                      key={service._id}
                      className="flex flex-col p-6 bg-white border border-slate-200/80 rounded-2xl gap-3 relative shadow-sm hover:shadow-md transition-all text-left"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl flex justify-center items-center">
                          <IconComponent size={20} className="text-blue-600" />
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditCscClick(service)}
                            className="p-1.5 text-brand-cyan hover:bg-brand-cyan/5 rounded border-0 cursor-pointer transition-all"
                            title="Edit Service"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCscService(service._id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded border-0 cursor-pointer transition-all"
                            title="Delete Service"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="font-heading text-base font-bold text-slate-800">
                          {service.title[currentLang]}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
                          {service.desc[currentLang]}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {currentLang === 'hi' ? 'शुल्क: ' : 'Fee: '}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {service.fee[currentLang]}
                          </span>
                        </div>
                        {service.documents && ((service.documents.en && service.documents.en.length > 0) || (service.documents.hi && service.documents.hi.length > 0)) && (
                          <>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                              {currentLang === 'hi' ? 'आवश्यक दस्तावेज:' : 'Required Documents:'}
                            </p>
                            <ul className="list-none p-0 m-0 flex flex-col gap-1">
                              {(service.documents[currentLang] || []).map((doc, dIdx) => (
                                <li key={dIdx} className="text-xs text-slate-700 flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                  <span className="truncate">{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {cscServicesList.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-400 font-semibold bg-white border border-slate-100 rounded-2xl">
                    {currentLang === "hi" ? "कोई सीएससी सेवाएं नहीं मिलीं।" : "No CSC services found."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Registered Users & Activities Panel */}
          {activeTab === "users" && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {t("admin:nav_users", "Registered Users")}
                  </h3>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Total Users:{" "}
                      <span className="font-bold text-slate-900">
                        {users.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phone Search form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchUsers(userSearchPhone);
                  }}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <input
                    type="text"
                    maxLength={10}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan text-sm w-full sm:w-64"
                    placeholder={t(
                      "admin:search_placeholder",
                      "Search 10-digit phone number...",
                    )}
                    value={userSearchPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setUserSearchPhone(val);
                    }}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-xl shadow cursor-pointer transition-all"
                  >
                    {t("common:search", "Search")}
                  </button>
                  {userSearchPhone && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserSearchPhone("");
                        fetchUsers("");
                      }}
                      className="px-3 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-all"
                    >
                      {t("common:clear", "Clear")}
                    </button>
                  )}
                </form>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">
                        {t("admin:customer", "Name")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("common:phone", "Phone")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("common:email", "Email")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:registered_at", "Registered On")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:activity_summary", "Activity")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {t("admin:actions", "Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
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
                            onClick={async () => {
                              setSelectedUserForDetail(user);
                              setShowUserActivityModal(true);
                              setActiveDetailTab("orders");
                              setUserActivityDetail(null);
                              setLoadingUserActivityDetail(true);
                              try {
                                const res = await api.get(
                                  `/dashboard/admin/users/${user._id}/activity`,
                                );
                                setUserActivityDetail(res.data);
                              } catch (err) {
                                console.error(err);
                                showToast.error(
                                  "Failed to load user activity details",
                                );
                              } finally {
                                setLoadingUserActivityDetail(false);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-brand-cyan hover:text-brand-cyan/80 bg-brand-cyan/5 hover:bg-brand-cyan/10 rounded-lg cursor-pointer transition-all"
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
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: Product Add / Edit Dialog */}
      {showProductModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-slate-950/80 flex justify-center items-center z-[500] backdrop-blur-md overflow-y-auto p-4 animate-fadeIn">
          <div className="w-full max-w-[600px] p-6 md:p-8 max-h-[90vh] overflow-y-auto glass-card rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingProduct
                  ? t("admin:edit_product")
                  : t("admin:add_product")}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer flex transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    {t("admin:product_name_en")} *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="e.g. Redmi cover"
                    value={prodNameEn}
                    onChange={(e) => {
                      setProdNameEn(e.target.value);
                      prodNameEnDirty.current = true;
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    {t("admin:product_name_hi")} *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="उदा. रेडमी कवर"
                    value={prodNameHi}
                    onChange={(e) => {
                      setProdNameHi(e.target.value);
                      prodNameHiManual.current = true;
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    {t("admin:price")} *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    {t("admin:original_price")} *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    {t("admin:category")} *
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none cursor-pointer text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    required
                  >
                    <option value="">
                      {t("admin:select_category", "Select Category")}
                    </option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    {t("admin:stock")} *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  {t("product:return_policy", "Return Policy")} *
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none cursor-pointer text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all"
                  value={prodReturnPolicy}
                  onChange={(e) => setProdReturnPolicy(e.target.value)}
                >
                  <option value="Return">Returnable (refund/replace)</option>
                  <option value="Replace">Replace only</option>
                  <option value="Non-returnable">Non-returnable</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    {t("admin:description_en")} *
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none text-xs focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all"
                    rows="2"
                    value={prodDescEn}
                    onChange={(e) => {
                      setProdDescEn(e.target.value);
                      prodDescEnDirty.current = true;
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    {t("admin:description_hi")} *
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none text-xs focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all"
                    rows="2"
                    value={prodDescHi}
                    onChange={(e) => {
                      setProdDescHi(e.target.value);
                      prodDescHiManual.current = true;
                    }}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Upload size={16} className="text-brand-cyan" />{" "}
                  {t("admin:image_url", "Product Images")} *
                </label>

                {/* Grid of existing + new images and + button */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-1.5">
                  {/* Existing Images */}
                  {existingImages.map((imgUrl, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative w-full aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 group overflow-hidden"
                    >
                      <img
                        src={imgUrl}
                        alt={`Product ${index}`}
                        className="max-w-full max-h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExistingImages((prev) =>
                            prev.filter((img) => img !== imgUrl),
                          )
                        }
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer border-0 shadow hover:bg-rose-600 transition-colors p-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* New Images */}
                  {newImages.map((file, index) => {
                    const tempUrl = URL.createObjectURL(file);
                    return (
                      <div
                        key={`new-${index}`}
                        className="relative w-full aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 group overflow-hidden"
                      >
                        <img
                          src={tempUrl}
                          alt={`New Product ${index}`}
                          className="max-w-full max-h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewImages((prev) =>
                              prev.filter((_, idx) => idx !== index),
                            )
                          }
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer border-0 shadow hover:bg-rose-600 transition-colors p-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Plus Card for adding new files */}
                  {existingImages.length + newImages.length < 5 && (
                    <label className="relative w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-brand-cyan hover:bg-slate-50/50 transition-all gap-1 text-slate-400 hover:text-brand-cyan">
                      <Plus size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {currentLang === "hi" ? "जोड़ें" : "Add"}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files);
                            // Ensure total images doesn't exceed 5
                            const limitLeft =
                              5 - (existingImages.length + newImages.length);
                            setNewImages((prev) => [
                              ...prev,
                              ...files.slice(0, limitLeft),
                            ]);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  {currentLang === "hi"
                    ? "आप अधिकतम 5 छवियां अपलोड कर सकते हैं। परिवर्तनों को लागू करने के लिए 'सहेजें' पर क्लिक करें।"
                    : "You can upload up to 5 images. Click 'Save' to apply changes."}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 font-heading font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-full hover:brightness-110 shadow-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("common:submitting", "Submitting...")
                  : t("admin:save_changes")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Category Add / Edit Dialog */}
      {showCategoryModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-slate-950/80 flex justify-center items-center z-[500] backdrop-blur-md overflow-y-auto p-4 animate-fadeIn">
          <div className="w-full max-w-[450px] p-6 md:p-8 glass-card rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingCategory
                  ? currentLang === "hi"
                    ? "श्रेणी संपादित करें"
                    : "Edit Category"
                  : t("admin:add_category", "Add New Category")}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer flex transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  {t("admin:product_name_en")} *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                  placeholder="e.g. Phone Glass"
                  value={catNameEn}
                  onChange={(e) => {
                    setCatNameEn(e.target.value);
                    catNameEnDirty.current = true;
                  }}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  {t("admin:product_name_hi")} *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                  placeholder="उदा. फ़ोन ग्लास"
                  value={catNameHi}
                  onChange={(e) => {
                    setCatNameHi(e.target.value);
                    catNameHiManual.current = true;
                  }}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Upload size={16} className="text-brand-cyan" />{" "}
                  {t("admin:image_url", "Category Image")}
                </label>

                {/* Grid of existing + new image and + button */}
                <div className="grid grid-cols-3 gap-3 mt-1.5">
                  {/* Existing Image */}
                  {existingCatImage && (
                    <div className="relative w-full aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 group overflow-hidden">
                      <img
                        src={existingCatImage}
                        alt="Category"
                        className="max-w-full max-h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setExistingCatImage("");
                          setRemoveCatImage(true);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer border-0 shadow hover:bg-rose-600 transition-colors p-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {/* New Image */}
                  {catImage && (
                    <div className="relative w-full aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 group overflow-hidden">
                      <img
                        src={URL.createObjectURL(catImage)}
                        alt="New Category"
                        className="max-w-full max-h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setCatImage(null)}
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer border-0 shadow hover:bg-rose-600 transition-colors p-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {/* Plus Card for adding a file */}
                  {!existingCatImage && !catImage && (
                    <label className="relative w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-brand-cyan hover:bg-slate-50/50 transition-all gap-1 text-slate-400 hover:text-brand-cyan">
                      <Plus size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {currentLang === "hi" ? "जोड़ें" : "Add"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setCatImage(e.target.files[0]);
                            setRemoveCatImage(false);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 font-heading font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-full hover:brightness-110 shadow-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("common:submitting", "Submitting...")
                  : editingCategory
                    ? currentLang === "hi"
                      ? "सहेजें"
                      : "Save Category"
                    : t("admin:add_category", "Create Category")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Detailed Activity Logs for a single User */}
      {showUserActivityModal && selectedUserForDetail && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-slate-950/80 flex justify-center items-center z-[500] backdrop-blur-md overflow-y-auto p-4 animate-fadeIn">
          <div className="w-full max-w-[800px] p-6 md:p-8 max-h-[90vh] overflow-y-auto glass-card rounded-2xl shadow-2xl">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-200">
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
                    Joined:{" "}
                    {new Date(
                      selectedUserForDetail.createdAt,
                    ).toLocaleDateString()}
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
            <div className="flex gap-2 border-b border-slate-100 pb-3 mb-6 flex-wrap">
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
                                <th className="px-4 py-3 text-left">
                                  Order ID
                                </th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Items</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Payment</th>
                                <th className="px-4 py-3 text-left">
                                  Delivery
                                </th>
                                <th className="px-4 py-3 text-center">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {userActivityDetail.orders.map((ord) => (
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
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                                    {new Date(
                                      ord.createdAt,
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 max-w-[200px]">
                                    <div className="flex flex-col gap-1">
                                      {ord.items?.map((item, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-1.5"
                                        >
                                          {item.product?.images?.[0] && (
                                            <img
                                              src={item.product.images[0]}
                                              alt={item.product.name?.en}
                                              className="w-5 h-5 rounded object-contain bg-slate-100 border border-slate-200"
                                            />
                                          )}
                                          <span className="truncate">
                                            {item.product?.name?.en ||
                                              "Product"}{" "}
                                            (x{item.quantity})
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-900 font-bold">
                                    ₹{ord.totalAmount}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-slate-800">
                                        {ord.paymentType}
                                      </span>
                                      <span
                                        className={`text-[10px] font-bold ${ord.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}
                                      >
                                        {ord.paymentStatus}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        ord.deliveryStatus === "Delivered" || ord.deliveryStatus === "Replaced"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : ord.deliveryStatus === "Cancelled" || ord.deliveryStatus === "Returned"
                                            ? "bg-rose-100 text-rose-700"
                                            : ord.deliveryStatus === "Return Requested" || ord.deliveryStatus === "Replacement Requested"
                                              ? "bg-purple-100 text-purple-700"
                                              : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {ord.deliveryStatus}
                                    </span>
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-center">
                                    <button
                                      onClick={() => handleDownloadReceipt(ord)}
                                      disabled={
                                        downloadingReceiptId === ord._id
                                      }
                                      className="inline-flex p-1.5 bg-slate-100 border border-slate-200 rounded text-blue-600 hover:bg-blue-50 cursor-pointer transition-all disabled:opacity-50"
                                      title={
                                        currentLang === "hi"
                                          ? "रसीद डाउनलोड करें"
                                          : "Download Receipt"
                                      }
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
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-8 text-xs text-slate-500 font-semibold">
                          No orders found.
                        </p>
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
                                <th className="px-4 py-3 text-left">
                                  Category
                                </th>
                                <th className="px-4 py-3 text-left">Problem</th>
                                <th className="px-4 py-3 text-left">
                                  Estimate
                                </th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userActivityDetail.repairs.map((rep) => (
                                <tr
                                  key={rep._id}
                                  className="hover:bg-slate-50/50 transition-colors"
                                >
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                                    {rep.deviceBrand} {rep.deviceModel}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                                    {rep.serviceCategory}
                                  </td>
                                  <td
                                    className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate"
                                    title={rep.problemDescription}
                                  >
                                    {rep.problemDescription}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-brand-cyan font-bold">
                                    ₹{rep.estimatedPrice}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs">
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
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">
                                    {new Date(
                                      rep.createdAt,
                                    ).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-8 text-xs text-slate-500 font-semibold">
                          No repair requests found.
                        </p>
                      )}
                    </div>
                  )}

                  {activeDetailTab === "csc" && (
                    <div className="flex flex-col gap-4">
                      {userActivityDetail.csc?.length > 0 ? (
                        <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                                <th className="px-4 py-3 text-left">Service</th>
                                <th className="px-4 py-3 text-left">Details</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userActivityDetail.csc.map((query) => (
                                <tr
                                  key={query._id}
                                  className="hover:bg-slate-50/50 transition-colors"
                                >
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                                    {query.serviceName}
                                  </td>
                                  <td
                                    className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600 max-w-[300px] truncate"
                                    title={query.queryDetails}
                                  >
                                    {query.queryDetails}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs">
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
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">
                                    {new Date(
                                      query.createdAt,
                                    ).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-8 text-xs text-slate-500 font-semibold">
                          No CSC inquiries found.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Repair Service Add / Edit Dialog */}
      {showServiceModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-slate-950/80 flex justify-center items-center z-[500] backdrop-blur-md overflow-y-auto p-4 animate-fadeIn">
          <div className="w-full max-w-[600px] p-6 md:p-8 max-h-[90vh] overflow-y-auto glass-card rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingService
                  ? currentLang === "hi" ? "रिपेयर सेवा संपादित करें" : "Edit Repair Service"
                  : currentLang === "hi" ? "नई रिपेयर सेवा जोड़ें" : "Add New Repair Service"}
              </h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer flex transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="flex flex-col gap-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Service Key (Unique URL string, lowercase) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="e.g. screen_repair"
                    value={srvKey}
                    onChange={(e) => setSrvKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    required
                    disabled={!!editingService}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Category Name (Backend Category Identifier) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="e.g. Display repair"
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="e.g. Screen / Folder Replacement"
                    value={srvTitleEn}
                    onChange={(e) => {
                      setSrvTitleEn(e.target.value);
                      srvTitleEnDirty.current = true;
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Title (Hindi) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="उदा. स्क्रीन फोल्डर बदलना"
                    value={srvTitleHi}
                    onChange={(e) => {
                      setSrvTitleHi(e.target.value);
                      srvTitleHiManual.current = true;
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Description (English) *
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-xs"
                    placeholder="e.g. Fix broken, flickering, color bleeding displays"
                    rows="3"
                    value={srvDescEn}
                    onChange={(e) => {
                      setSrvDescEn(e.target.value);
                      srvDescEnDirty.current = true;
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Description (Hindi) *
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-xs"
                    placeholder="उदा. टूटी हुई या झिलमिलाती स्क्रीन ठीक करें"
                    rows="3"
                    value={srvDescHi}
                    onChange={(e) => {
                      setSrvDescHi(e.target.value);
                      srvDescHiManual.current = true;
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 font-heading font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-full hover:brightness-110 shadow-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("common:submitting", "Submitting...")
                  : editingService
                    ? currentLang === "hi" ? "सहेजें" : "Save Changes"
                    : currentLang === "hi" ? "सृजन करें" : "Create Service"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 5: CSC Service Add / Edit Dialog */}
      {showCscModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-slate-950/80 flex justify-center items-center z-[500] backdrop-blur-md overflow-y-auto p-4 animate-fadeIn">
          <div className="w-full max-w-[650px] p-6 md:p-8 max-h-[90vh] overflow-y-auto glass-card rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingCscService
                  ? currentLang === "hi" ? "सीएससी सेवा संपादित करें" : "Edit CSC Service"
                  : currentLang === "hi" ? "नई सीएससी सेवा जोड़ें" : "Add New CSC Service"}
              </h3>
              <button
                onClick={() => setShowCscModal(false)}
                className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer flex transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCscService} className="flex flex-col gap-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="e.g. Aadhaar Services"
                    value={cscTitleEn}
                    onChange={(e) => {
                      setCscTitleEn(e.target.value);
                      cscTitleEnDirty.current = true;
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Title (Hindi) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="उदा. आधार सेवाएं"
                    value={cscTitleHi}
                    onChange={(e) => {
                      setCscTitleHi(e.target.value);
                      cscTitleHiManual.current = true;
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Description (English) *
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-xs"
                    placeholder="e.g. biometric updates and lamination"
                    rows="3"
                    value={cscDescEn}
                    onChange={(e) => {
                      setCscDescEn(e.target.value);
                      cscDescEnDirty.current = true;
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Description (Hindi) *
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-xs"
                    placeholder="उदा. बायोमेट्रिक अपडेट और लेमिनेशन"
                    rows="3"
                    value={cscDescHi}
                    onChange={(e) => {
                      setCscDescHi(e.target.value);
                      cscDescHiManual.current = true;
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Fee (English) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="e.g. ₹30 - ₹100"
                    value={cscFeeEn}
                    onChange={(e) => setCscFeeEn(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Fee (Hindi) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="उदा. ₹30 - ₹100"
                    value={cscFeeHi}
                    onChange={(e) => setCscFeeHi(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Required Documents (English, comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="e.g. Aadhaar Card, Photo, Signature"
                    value={cscDocsEn}
                    onChange={(e) => setCscDocsEn(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                    Required Documents (Hindi, comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    placeholder="उदा. आधार कार्ड, फोटो, हस्ताक्षर"
                    value={cscDocsHi}
                    onChange={(e) => setCscDocsHi(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  Icon component (Lucide Icon name) *
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none cursor-pointer text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all"
                  value={cscIcon}
                  onChange={(e) => setCscIcon(e.target.value)}
                >
                  <option value="FileText">FileText (Default Document)</option>
                  <option value="Shield">Shield (Secure/Aadhaar)</option>
                  <option value="CreditCard">CreditCard (Card/PAN/Voter)</option>
                  <option value="Landmark">Landmark (Government/Bank/Ration)</option>
                  <option value="Printer">Printer (Welfare/Print)</option>
                  <option value="Scale">Scale (Affidavit/Legal)</option>
                  <option value="User">User (Registration)</option>
                  <option value="BookOpen">BookOpen (Educational/Marksheet)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 font-heading font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-full hover:brightness-110 shadow-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("common:submitting", "Submitting...")
                  : editingCscService
                    ? currentLang === "hi" ? "सहेजें" : "Save Changes"
                    : currentLang === "hi" ? "सृजन करें" : "Create Service"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

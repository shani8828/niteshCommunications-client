import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { getCachedData, setCachedData } from "../utils/cache";
import { RefreshCw } from "lucide-react";

// Tab Subcomponents
import OverviewTab from "../components/admin/OverviewTab";
import OrdersTab from "../components/admin/OrdersTab";
import ProductsTab from "../components/admin/ProductsTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import RepairsTab from "../components/admin/RepairsTab";
import CscQueriesTab from "../components/admin/CscQueriesTab";
import RepairServicesTab from "../components/admin/RepairServicesTab";
import CscServicesTab from "../components/admin/CscServicesTab";
import UsersTab from "../components/admin/UsersTab";
import PrintoutsTab from "../components/admin/PrintoutsTab";
import AdminSkeleton from "../components/admin/AdminSkeleton";

// Layout Subcomponents
import AdminSidebar from "../components/admin/layout/AdminSidebar";
import AdminAnalyticsWidgets from "../components/admin/layout/AdminAnalyticsWidgets";

import { showToast } from "../utils/toast";

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [cscQueries, setCscQueries] = useState([]);
  const [users, setUsers] = useState([]);
  const [repairPricingList, setRepairPricingList] = useState([]);
  const [cscServicesList, setCscServicesList] = useState([]);
  const [printouts, setPrintouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/admin");
      setAnalytics(response.data);
      setCachedData("admin_analytics", response.data, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
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
  }, []);

  const fetchRepairsAndCsc = useCallback(async () => {
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
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get("/orders");
      const ordersData = response.data || [];
      setOrders(ordersData);
      setCachedData("admin_orders", ordersData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUsers = useCallback(async (searchVal = "") => {
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
  }, [t]);

  const fetchRepairPricing = useCallback(async () => {
    try {
      const response = await api.get("/repairs/pricing/all");
      const pricingData = response.data || [];
      setRepairPricingList(pricingData);
      setCachedData("admin_repair_pricing", pricingData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
      showToast.error(t("admin:error_repair_pricing_fetch", "Failed to fetch repair services"));
    }
  }, [t]);

  const fetchCscServices = useCallback(async () => {
    try {
      const response = await api.get("/csc/services");
      const servicesData = response.data || [];
      setCscServicesList(servicesData);
      setCachedData("admin_csc_services", servicesData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to fetch CSC services");
    }
  }, []);

  const fetchPrintouts = useCallback(async () => {
    try {
      const response = await api.get("/printouts");
      const printoutsData = response.data || [];
      setPrintouts(printoutsData);
      setCachedData("admin_printouts", printoutsData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to fetch printouts");
    }
  }, []);

  const loadTabData = useCallback(async (tab, forceRefresh = false, silent = false) => {
    let hasCache = false;

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
      } else if (tab === "printouts") {
        const cached = getCachedData("admin_printouts");
        if (cached) {
          setPrintouts(cached);
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
      } else if (tab === "printouts") {
        await fetchPrintouts();
      }
    } catch (err) {
      console.error(`Error loading tab data for ${tab}:`, err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [
    fetchAnalytics,
    fetchOrders,
    fetchInventory,
    fetchRepairsAndCsc,
    fetchUsers,
    fetchRepairPricing,
    fetchCscServices,
  ]);

  const handleUpdateOrderStatus = useCallback(async (id, status) => {
    let rollbackOrders;
    setOrders((prev) => {
      rollbackOrders = prev;
      return prev.map((ord) =>
        ord._id === id ? { ...ord, deliveryStatus: status } : ord
      );
    });

    try {
      await api.put(`/orders/${id}/status`, { status });
      showToast.success(t("admin:success_status_update", "Status updated successfully"));
      fetchOrders().catch(console.error);
    } catch (err) {
      if (rollbackOrders) setOrders(rollbackOrders);
      const errorMessage = err.response?.data?.message || t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    }
  }, [fetchOrders, t]);

  const handleUpdateRepairStatus = useCallback(async (id, status) => {
    let rollbackRepairs;
    setRepairs((prev) => {
      rollbackRepairs = prev;
      return prev.map((rep) =>
        rep._id === id ? { ...rep, status: status } : rep
      );
    });

    try {
      await api.put(`/repairs/${id}`, { status });
      showToast.success(t("admin:success_status_update", "Status updated successfully"));
      fetchRepairsAndCsc().catch(console.error);
    } catch (err) {
      if (rollbackRepairs) setRepairs(rollbackRepairs);
      const errorMessage = err.response?.data?.message || t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    }
  }, [fetchRepairsAndCsc, t]);

  const handleUpdateCscStatus = useCallback(async (id, status) => {
    let rollbackCsc;
    setCscQueries((prev) => {
      rollbackCsc = prev;
      return prev.map((csc) =>
        csc._id === id ? { ...csc, status: status } : csc
      );
    });

    try {
      await api.put(`/csc/${id}`, { status });
      showToast.success(t("admin:success_status_update", "Status updated successfully"));
      fetchRepairsAndCsc().catch(console.error);
    } catch (err) {
      if (rollbackCsc) setCscQueries(rollbackCsc);
      const errorMessage = err.response?.data?.message || t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    }
  }, [fetchRepairsAndCsc, t]);

  const handleUpdatePrintoutStatus = useCallback(async (id, status) => {
    let rollbackPrintouts;
    setPrintouts((prev) => {
      rollbackPrintouts = prev;
      return prev.map((pr) =>
        pr._id === id ? { ...pr, status: status } : pr
      );
    });

    try {
      await api.put(`/printouts/${id}/status`, { status });
      showToast.success(t("admin:success_status_update", "Status updated successfully"));
      fetchPrintouts().catch(console.error);
    } catch (err) {
      if (rollbackPrintouts) setPrintouts(rollbackPrintouts);
      const errorMessage = err.response?.data?.message || t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    }
  }, [fetchPrintouts, t]);

  useEffect(() => {
    loadTabData("overview");

    const pollInterval = setInterval(() => {
      loadTabData(activeTabRef.current, true, true).catch((err) =>
        console.error("Silent background dashboard data refresh failed:", err)
      );
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [loadTabData]);

  const isTabEmpty = useCallback((tab) => {
    if (tab === "overview") return !analytics;
    if (tab === "orders") return orders.length === 0;
    if (tab === "products") return products.length === 0;
    if (tab === "categories") return categories.length === 0;
    if (tab === "repairs") return repairs.length === 0;
    if (tab === "repair-services") return repairPricingList.length === 0;
    if (tab === "csc") return cscQueries.length === 0;
    if (tab === "csc-services") return cscServicesList.length === 0;
    if (tab === "users") return users.length === 0;
    if (tab === "printouts") return printouts.length === 0;
    return true;
  }, [
    analytics,
    orders,
    products,
    categories,
    repairs,
    repairPricingList,
    cscQueries,
    cscServicesList,
    users,
    printouts,
  ]);

  const renderTabContent = () => {
    if (loading && isTabEmpty(activeTab)) {
      if (activeTab === "overview") return <AdminSkeleton type="overview" />;
      if (activeTab === "orders") return <AdminSkeleton type="table" cols={8} rows={6} />;
      if (activeTab === "products") return <AdminSkeleton type="table" cols={6} rows={6} />;
      if (activeTab === "categories") return <AdminSkeleton type="table" cols={4} rows={6} />;
      if (activeTab === "repairs") return <AdminSkeleton type="table" cols={6} rows={6} />;
      if (activeTab === "repair-services") return <AdminSkeleton type="table" cols={3} rows={6} />;
      if (activeTab === "csc") return <AdminSkeleton type="table" cols={5} rows={6} />;
      if (activeTab === "csc-services") return <AdminSkeleton type="table" cols={4} rows={6} />;
      if (activeTab === "users") return <AdminSkeleton type="table" cols={5} rows={6} />;
      if (activeTab === "printouts") return <AdminSkeleton type="table" cols={6} rows={6} />;
    }

    switch (activeTab) {
      case "overview":
        return analytics && <OverviewTab analytics={analytics} t={t} currentLang={currentLang} />;
      case "orders":
        return (
          <OrdersTab
            orders={orders}
            t={t}
            currentLang={currentLang}
            handleUpdateOrderStatus={handleUpdateOrderStatus}
          />
        );
      case "products":
        return (
          <ProductsTab
            products={products}
            setProducts={setProducts}
            categories={categories}
            t={t}
            currentLang={currentLang}
            fetchInventory={fetchInventory}
            setLoading={setLoading}
          />
        );
      case "categories":
        return (
          <CategoriesTab
            categories={categories}
            setCategories={setCategories}
            t={t}
            currentLang={currentLang}
            fetchInventory={fetchInventory}
            setLoading={setLoading}
          />
        );
      case "repairs":
        return (
          <RepairsTab
            repairs={repairs}
            t={t}
            currentLang={currentLang}
            handleUpdateRepairStatus={handleUpdateRepairStatus}
          />
        );
      case "repair-services":
        return (
          <RepairServicesTab
            repairPricingList={repairPricingList}
            setRepairPricingList={setRepairPricingList}
            t={t}
            currentLang={currentLang}
            fetchRepairPricing={fetchRepairPricing}
            setLoading={setLoading}
          />
        );
      case "csc":
        return (
          <CscQueriesTab
            cscQueries={cscQueries}
            t={t}
            currentLang={currentLang}
            handleUpdateCscStatus={handleUpdateCscStatus}
          />
        );
      case "csc-services":
        return (
          <CscServicesTab
            cscServicesList={cscServicesList}
            setCscServicesList={setCscServicesList}
            t={t}
            currentLang={currentLang}
            fetchCscServices={fetchCscServices}
            setLoading={setLoading}
          />
        );
      case "users":
        return (
          <UsersTab
            users={users}
            t={t}
            currentLang={currentLang}
            fetchUsers={fetchUsers}
          />
        );
      case "printouts":
        return (
          <PrintoutsTab
            printouts={printouts}
            t={t}
            currentLang={currentLang}
            handleUpdatePrintoutStatus={handleUpdatePrintoutStatus}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 relative">
      {/* Premium background top loading progress bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-100 z-[9999] overflow-hidden">
          <div className="h-full w-full bg-brand-cyan shimmer-bg" />
        </div>
      )}

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
      {analytics ? (
        <AdminAnalyticsWidgets analytics={analytics} t={t} />
      ) : (
        <AdminSkeleton type="analytics" count={4} />
      )}

      {/* Tabs panels layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Navigation Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          loadTabData={loadTabData}
          currentLang={currentLang}
          t={t}
        />

        {/* Content body */}
        <main className="flex-grow w-full">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

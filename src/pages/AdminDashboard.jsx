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

// Layout Subcomponents
import AdminSidebar from "../components/admin/layout/AdminSidebar";
import AdminAnalyticsWidgets from "../components/admin/layout/AdminAnalyticsWidgets";

import { showToast } from "../utils/toast";

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
  const [repairPricingList, setRepairPricingList] = useState([]);
  const [cscServicesList, setCscServicesList] = useState([]);
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
    setLoading(true);
    try {
      await api.put(`/orders/${id}/status`, { status });
      showToast.success(t("admin:success_status_update", "Status updated successfully"));
      await fetchOrders();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, t]);

  const handleUpdateRepairStatus = useCallback(async (id, status) => {
    setLoading(true);
    try {
      await api.put(`/repairs/${id}`, { status });
      showToast.success(t("admin:success_status_update", "Status updated successfully"));
      await fetchRepairsAndCsc();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchRepairsAndCsc, t]);

  const handleUpdateCscStatus = useCallback(async (id, status) => {
    setLoading(true);
    try {
      await api.put(`/csc/${id}`, { status });
      showToast.success(t("admin:success_status_update", "Status updated successfully"));
      await fetchRepairsAndCsc();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("admin:error_status_update", "Update failed");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchRepairsAndCsc, t]);

  useEffect(() => {
    loadTabData("overview");

    const pollInterval = setInterval(() => {
      loadTabData(activeTabRef.current, true, true).catch((err) =>
        console.error("Silent background dashboard data refresh failed:", err)
      );
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [loadTabData]);

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
      <AdminAnalyticsWidgets analytics={analytics} t={t} />

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
          {/* Tab 1: Overview Summary */}
          {activeTab === "overview" && analytics && (
            <OverviewTab analytics={analytics} t={t} currentLang={currentLang} />
          )}

          {/* Tab: Orders Panel */}
          {activeTab === "orders" && (
            <OrdersTab
              orders={orders}
              t={t}
              currentLang={currentLang}
              handleUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {/* Tab 2: Products CRUD Panel */}
          {activeTab === "products" && (
            <ProductsTab
              products={products}
              categories={categories}
              t={t}
              currentLang={currentLang}
              fetchInventory={fetchInventory}
              setLoading={setLoading}
            />
          )}

          {/* Tab 3: Categories CRUD Panel */}
          {activeTab === "categories" && (
            <CategoriesTab
              categories={categories}
              t={t}
              currentLang={currentLang}
              fetchInventory={fetchInventory}
              setLoading={setLoading}
            />
          )}

          {/* Tab 4: Repairs Service Tracker */}
          {activeTab === "repairs" && (
            <RepairsTab
              repairs={repairs}
              t={t}
              currentLang={currentLang}
              handleUpdateRepairStatus={handleUpdateRepairStatus}
            />
          )}

          {/* Tab 8: Repair Services & Pricing CRUD Manager */}
          {activeTab === "repair-services" && (
            <RepairServicesTab
              repairPricingList={repairPricingList}
              setRepairPricingList={setRepairPricingList}
              t={t}
              currentLang={currentLang}
              fetchRepairPricing={fetchRepairPricing}
              setLoading={setLoading}
            />
          )}

          {/* Tab 5: CSC Jan Seva Kendra Queries */}
          {activeTab === "csc" && (
            <CscQueriesTab
              cscQueries={cscQueries}
              t={t}
              currentLang={currentLang}
              handleUpdateCscStatus={handleUpdateCscStatus}
            />
          )}

          {/* Tab: CSC Services Catalog Manager */}
          {activeTab === "csc-services" && (
            <CscServicesTab
              cscServicesList={cscServicesList}
              t={t}
              currentLang={currentLang}
              fetchCscServices={fetchCscServices}
              setLoading={setLoading}
            />
          )}

          {/* Tab 6: Registered Users & Activities Panel */}
          {activeTab === "users" && (
            <UsersTab
              users={users}
              t={t}
              currentLang={currentLang}
              fetchUsers={fetchUsers}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

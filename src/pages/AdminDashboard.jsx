import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import OffersTab from "../components/admin/OffersTab";
import AdminSkeleton from "../components/admin/AdminSkeleton";

// Layout Subcomponents
import AdminSidebar from "../components/admin/layout/AdminSidebar";
import AdminAnalyticsWidgets from "../components/admin/layout/AdminAnalyticsWidgets";

import { showToast } from "../utils/toast";
import useVisiblePolling from "../utils/useVisiblePolling";

// Admin lists are paginated, searched and filtered on the server.
const ADMIN_PAGE_SIZE = 10;
const LIST_CONFIG = {
  orders: { url: "/orders", params: (q) => ({ search: q.search, status: q.status }) },
  products: { url: "/products/admin/list", params: (q) => ({ search: q.search, category: q.category }) },
  repairs: { url: "/repairs", params: (q) => ({ search: q.search, status: q.status }) },
  csc: { url: "/csc", params: (q) => ({ search: q.search, status: q.status }) },
  printouts: { url: "/printouts", params: (q) => ({ search: q.search, status: q.status }) },
  users: { url: "/dashboard/admin/users", params: (q) => ({ phone: q.search }) },
};
const DEFAULT_LIST_QUERIES = {
  orders: { page: 1, search: "", status: "all" },
  products: { page: 1, search: "", category: "all" },
  repairs: { page: 1, search: "", status: "all" },
  csc: { page: 1, search: "", status: "all" },
  printouts: { page: 1, search: "", status: "all" },
  users: { page: 1, search: "" },
};
const DEFAULT_LIST_META = Object.fromEntries(
  Object.keys(DEFAULT_LIST_QUERIES).map((list) => [list, { total: 0, pages: 1 }]),
);
const listCacheKey = (list, query) => `admin_${list}:${JSON.stringify(query)}`;

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
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listQueries, setListQueries] = useState(DEFAULT_LIST_QUERIES);
  const [listMeta, setListMeta] = useState(DEFAULT_LIST_META);
  const listQueriesRef = useRef(DEFAULT_LIST_QUERIES);
  const listRequestSeq = useRef({});

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

  const listSetters = {
    orders: setOrders,
    products: setProducts,
    repairs: setRepairs,
    csc: setCscQueries,
    printouts: setPrintouts,
    users: setUsers,
  };

  // Fetch the current page of one admin list using its saved search/filter query
  const fetchList = useCallback(async (list) => {
    const seq = (listRequestSeq.current[list] || 0) + 1;
    listRequestSeq.current[list] = seq;

    for (let attempt = 0; attempt < 2; attempt++) {
      const query = listQueriesRef.current[list];
      const params = { page: query.page, limit: ADMIN_PAGE_SIZE };
      Object.entries(LIST_CONFIG[list].params(query)).forEach(([key, value]) => {
        if (value && value !== "all") params[key] = value;
      });

      const { data } = await api.get(LIST_CONFIG[list].url, { params });
      // A newer request for this list (e.g. a quick page click) replaced this one
      if (listRequestSeq.current[list] !== seq) return;

      // The page no longer exists (e.g. its last item was deleted): show the last page
      if (query.page > data.pages && attempt === 0) {
        listQueriesRef.current = {
          ...listQueriesRef.current,
          [list]: { ...query, page: data.pages },
        };
        setListQueries(listQueriesRef.current);
        continue;
      }

      const meta = { total: data.total, pages: data.pages };
      listSetters[list](data.items || []);
      setListMeta((prev) => ({ ...prev, [list]: meta }));
      setCachedData(listCacheKey(list, query), { items: data.items || [], meta }, 5 * 60 * 1000);
      return;
    }
  }, []);

  // Show a cached page instantly (if any) while the fresh one loads
  const restoreCachedList = (list) => {
    const cached = getCachedData(listCacheKey(list, listQueriesRef.current[list]));
    if (!cached) return false;
    listSetters[list](cached.items);
    setListMeta((prev) => ({ ...prev, [list]: cached.meta }));
    return true;
  };

  const fetchCategories = useCallback(async () => {
    const cRes = await api.get("/products/categories");
    const categoriesData = cRes.data || [];
    setCategories(categoriesData);
    setCachedData("admin_categories", categoriesData, 5 * 60 * 1000);
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      await Promise.all([fetchList("products"), fetchCategories()]);
    } catch (err) {
      console.error(err);
    }
  }, [fetchList, fetchCategories]);

  const fetchRepairsAndCsc = useCallback(async () => {
    try {
      await Promise.all([fetchList("repairs"), fetchList("csc")]);
    } catch (err) {
      console.error(err);
    }
  }, [fetchList]);

  const fetchOrders = useCallback(async () => {
    try {
      await fetchList("orders");
    } catch (err) {
      console.error(err);
    }
  }, [fetchList]);

  const fetchUsers = useCallback(async () => {
    try {
      await fetchList("users");
    } catch (err) {
      console.error(err);
      showToast.error(t("admin:error_users_fetch", "Failed to fetch users"));
    }
  }, [fetchList, t]);

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
      await fetchList("printouts");
    } catch (err) {
      console.error(err);
      showToast.error("Failed to fetch printouts");
    }
  }, [fetchList]);

  const fetchOffers = useCallback(async () => {
    try {
      const response = await api.get("/offers/admin");
      const offersData = response.data || [];
      setOffers(offersData);
      setCachedData("admin_offers", offersData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to fetch offers");
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
        hasCache = restoreCachedList("orders");
      } else if (tab === "products" || tab === "categories") {
        const cachedC = getCachedData("admin_categories");
        if (cachedC) setCategories(cachedC);
        hasCache = restoreCachedList("products") && !!cachedC;
      } else if (tab === "repairs" || tab === "csc") {
        const hasRepairs = restoreCachedList("repairs");
        const hasCsc = restoreCachedList("csc");
        hasCache = hasRepairs && hasCsc;
      } else if (tab === "users") {
        hasCache = restoreCachedList("users");
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
        hasCache = restoreCachedList("printouts");
      } else if (tab === "offers") {
        const cached = getCachedData("admin_offers");
        if (cached) {
          setOffers(cached);
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
        await fetchUsers();
      } else if (tab === "repair-services") {
        await fetchRepairPricing();
      } else if (tab === "csc-services") {
        await fetchCscServices();
      } else if (tab === "printouts") {
        await fetchPrintouts();
      } else if (tab === "offers") {
        await fetchOffers();
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
    fetchPrintouts,
    fetchOffers,
  ]);

  const listFetchers = {
    orders: fetchOrders,
    products: fetchInventory,
    repairs: fetchRepairsAndCsc,
    csc: fetchRepairsAndCsc,
    printouts: fetchPrintouts,
    users: fetchUsers,
  };
  const listFetchersRef = useRef(listFetchers);
  listFetchersRef.current = listFetchers;

  const updateListQuery = useCallback(async (list, patch) => {
    listQueriesRef.current = {
      ...listQueriesRef.current,
      [list]: { ...listQueriesRef.current[list], ...patch },
    };
    setListQueries(listQueriesRef.current);
    setLoading(true);
    try {
      await listFetchersRef.current[list]();
    } finally {
      setLoading(false);
    }
  }, []);

  // Stable per-list callbacks so memoised tabs don't re-render needlessly
  const queryHandlers = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(DEFAULT_LIST_QUERIES).map((list) => [
          list,
          (patch) => updateListQuery(list, patch),
        ]),
      ),
    [updateListQuery],
  );

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
  }, [loadTabData]);

  // Silently refresh the open tab every 30 seconds while the browser tab is visible
  useVisiblePolling(() => {
    loadTabData(activeTabRef.current, true, true).catch((err) =>
      console.error("Silent background dashboard data refresh failed:", err)
    );
  }, 30000);

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
    if (tab === "offers") return offers.length === 0;
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
    offers,
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
      if (activeTab === "offers") return <AdminSkeleton type="table" cols={4} rows={6} />;
    }

    switch (activeTab) {
      case "overview":
        return analytics && <OverviewTab analytics={analytics} t={t} currentLang={currentLang} />;
      case "orders":
        return (
          <OrdersTab
            orders={orders}
            query={listQueries.orders}
            meta={listMeta.orders}
            onQueryChange={queryHandlers.orders}
            t={t}
            currentLang={currentLang}
            handleUpdateOrderStatus={handleUpdateOrderStatus}
          />
        );
      case "products":
        return (
          <ProductsTab
            products={products}
            query={listQueries.products}
            meta={listMeta.products}
            onQueryChange={queryHandlers.products}
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
            query={listQueries.repairs}
            meta={listMeta.repairs}
            onQueryChange={queryHandlers.repairs}
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
            query={listQueries.csc}
            meta={listMeta.csc}
            onQueryChange={queryHandlers.csc}
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
            query={listQueries.users}
            meta={listMeta.users}
            onQueryChange={queryHandlers.users}
            t={t}
            currentLang={currentLang}
            fetchUsers={fetchUsers}
          />
        );
      case "printouts":
        return (
          <PrintoutsTab
            printouts={printouts}
            query={listQueries.printouts}
            meta={listMeta.printouts}
            onQueryChange={queryHandlers.printouts}
            t={t}
            currentLang={currentLang}
            handleUpdatePrintoutStatus={handleUpdatePrintoutStatus}
          />
        );
      case "offers":
        return (
          <OffersTab
            offers={offers}
            setOffers={setOffers}
            t={t}
            currentLang={currentLang}
            fetchOffers={fetchOffers}
            setLoading={setLoading}
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
          className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-brand-cyan border border-slate-200  flex items-center gap-1.5 cursor-pointer transition-all"
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
      <div className="grid gap-1 grid-cols-1 lg:grid-cols-[240px_1fr]">
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

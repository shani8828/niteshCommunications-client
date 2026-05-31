import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import Loader from '../components/common/Loader';
import api from '../utils/api';
import { BarChart3, Plus, Edit, Trash2, Package, Wrench, FileText, Settings, X, Upload, RefreshCw, ShoppingBag, Users } from 'lucide-react';
import { getCachedData, setCachedData, clearCache } from '../utils/cache';

const translateToHindi = async (text) => {
  if (!text || !text.trim()) return '';
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text.trim())}`
    );
    if (!response.ok) throw new Error('Translation request failed');
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    return '';
  } catch (error) {
    console.error('Translation error:', error);
    return '';
  }
};

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'hi';

  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [cscQueries, setCscQueries] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearchPhone, setUserSearchPhone] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [prodNameEn, setProdNameEn] = useState('');
  const [prodNameHi, setProdNameHi] = useState('');
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodDescHi, setProdDescHi] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodReturnPolicy, setProdReturnPolicy] = useState('Replace');
  const [prodImages, setProdImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [catNameEn, setCatNameEn] = useState('');
  const [catNameHi, setCatNameHi] = useState('');
  const [catImage, setCatImage] = useState(null);
  const [existingCatImage, setExistingCatImage] = useState('');
  const [removeCatImage, setRemoveCatImage] = useState(false);
  const [userActivityDetail, setUserActivityDetail] = useState(null);
  const [loadingUserActivityDetail, setLoadingUserActivityDetail] = useState(false);

  const activeTabRef = React.useRef(activeTab);
  
  // Refs for tracking user modifications and dirty states for auto-translation
  const catNameEnDirty = React.useRef(false);
  const catNameHiManual = React.useRef(false);
  
  const prodNameEnDirty = React.useRef(false);
  const prodNameHiManual = React.useRef(false);
  
  const prodDescEnDirty = React.useRef(false);
  const prodDescHiManual = React.useRef(false);

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
        setCatNameHi('');
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
        setProdNameHi('');
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
        setProdDescHi('');
      }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [prodDescEn]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      setAnalytics(response.data);
      setCachedData('admin_analytics', response.data, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async () => {
    try {
      const pRes = await api.get('/products?limit=100');
      const productsData = pRes.data.products || [];
      setProducts(productsData);
      setCachedData('admin_products', productsData, 5 * 60 * 1000);

      const cRes = await api.get('/products/categories');
      const categoriesData = cRes.data || [];
      setCategories(categoriesData);
      setCachedData('admin_categories', categoriesData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRepairsAndCsc = async () => {
    try {
      const repRes = await api.get('/repairs');
      const repairsData = repRes.data || [];
      setRepairs(repairsData);
      setCachedData('admin_repairs', repairsData, 5 * 60 * 1000);

      const cscRes = await api.get('/csc');
      const cscData = cscRes.data || [];
      setCscQueries(cscData);
      setCachedData('admin_csc', cscData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      const ordersData = response.data || [];
      setOrders(ordersData);
      setCachedData('admin_orders', ordersData, 5 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async (searchVal = '') => {
    try {
      const isSearch = searchVal.trim() !== '';
      const url = isSearch ? `/dashboard/admin/users?phone=${searchVal.trim()}` : '/dashboard/admin/users';
      const response = await api.get(url);
      const usersData = response.data || [];
      setUsers(usersData);
      if (!isSearch) {
        setCachedData('admin_users', usersData, 5 * 60 * 1000);
      }
    } catch (err) {
      console.error(err);
      showToast.error(t('admin:error_users_fetch', 'Failed to fetch users'));
    }
  };

  const loadTabData = async (tab, forceRefresh = false) => {
    let hasCache = false;
    
    // Check if cached data exists for the tab, unless forceRefresh is true
    if (!forceRefresh) {
      if (tab === 'overview') {
        const cached = getCachedData('admin_analytics');
        if (cached) { setAnalytics(cached); hasCache = true; }
      } else if (tab === 'orders') {
        const cached = getCachedData('admin_orders');
        if (cached) { setOrders(cached); hasCache = true; }
      } else if (tab === 'products' || tab === 'categories') {
        const cachedP = getCachedData('admin_products');
        const cachedC = getCachedData('admin_categories');
        if (cachedP && cachedC) {
          setProducts(cachedP);
          setCategories(cachedC);
          hasCache = true;
        }
      } else if (tab === 'repairs' || tab === 'csc') {
        const cachedRep = getCachedData('admin_repairs');
        const cachedCsc = getCachedData('admin_csc');
        if (cachedRep && cachedCsc) {
          setRepairs(cachedRep);
          setCscQueries(cachedCsc);
          hasCache = true;
        }
      } else if (tab === 'users') {
        const cached = getCachedData('admin_users');
        if (cached) { setUsers(cached); hasCache = true; }
      }
    }

    if (!hasCache) {
      setLoading(true);
    }

    try {
      if (tab === 'overview') {
        await fetchAnalytics();
      } else if (tab === 'orders') {
        await fetchOrders();
      } else if (tab === 'products' || tab === 'categories') {
        await fetchInventory();
      } else if (tab === 'repairs' || tab === 'csc') {
        await fetchRepairsAndCsc();
      } else if (tab === 'users') {
        await fetchUsers('');
      }
    } catch (err) {
      console.error(`Error loading tab data for ${tab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    setLoading(true);
    try {
      await api.put(`/orders/${id}/status`, { status });
      showToast.success(t('admin:success_status_update', 'Status updated successfully'));
      clearCache();
      await fetchOrders();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_status_update', 'Update failed');
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData('overview');

    // Auto-poll dashboard data silently in the background every 30 seconds for the active tab to fetch latest status
    const pollInterval = setInterval(() => {
      loadTabData(activeTabRef.current, true).catch((err) =>
        console.error('Silent background dashboard data refresh failed:', err)
      );
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catNameHi || !catNameEn) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('nameHi', catNameHi);
    formData.append('nameEn', catNameEn);
    if (catImage) {
      formData.append('image', catImage);
    } else if (removeCatImage) {
      formData.append('removeImage', 'true');
    }

    try {
      if (editingCategory) {
        await api.put(`/products/categories/${editingCategory._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast.success(t('admin:success_category_update', 'Category updated successfully!'));
      } else {
        await api.post('/products/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast.success(t('admin:success_category_create', 'Category created successfully!'));
      }

      clearCache();
      setCatNameHi('');
      setCatNameEn('');
      setCatImage(null);
      setExistingCatImage('');
      setRemoveCatImage(false);
      setEditingCategory(null);
      setShowCategoryModal(false);
      fetchInventory();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_category_save', 'Category save failed');
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
    setExistingCatImage(cat.image || '');
    setRemoveCatImage(false);
    // Reset translation flags
    catNameEnDirty.current = false;
    catNameHiManual.current = false;
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm(t('admin:confirm_delete_category', 'Are you sure you want to delete this category?'))) return;
    setLoading(true);
    try {
      await api.delete(`/products/categories/${id}`);
      showToast.success(t('admin:success_category_delete', 'Category deleted successfully'));
      clearCache();
      fetchInventory();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_category_delete', 'Delete failed');
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (existingImages.length === 0 && newImages.length === 0) {
      showToast.error(t('admin:error_no_images', 'Please upload at least one image'));
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('nameEn', prodNameEn);
    formData.append('nameHi', prodNameHi);
    formData.append('descriptionEn', prodDescEn);
    formData.append('descriptionHi', prodDescHi);
    formData.append('price', prodPrice);
    formData.append('originalPrice', prodOriginalPrice);
    formData.append('category', prodCategory);
    formData.append('stock', prodStock);
    formData.append('returnPolicy', prodReturnPolicy);

    if (editingProduct) {
      existingImages.forEach((img) => {
        formData.append('keptImages', img);
      });
    }

    if (newImages && newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        formData.append('images', newImages[i]);
      }
    }

    try {
      const url = editingProduct ? `/products/${editingProduct._id}` : '/products';
      const method = editingProduct ? 'put' : 'post';

      await api({
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast.success(t('admin:success_product_save', 'Product saved successfully!'));
      clearCache();
      setShowProductModal(false);
      setEditingProduct(null);
      setProdNameEn('');
      setProdNameHi('');
      setProdDescEn('');
      setProdDescHi('');
      setProdPrice('');
      setProdOriginalPrice('');
      setProdCategory('');
      setProdStock('');
      setExistingImages([]);
      setNewImages([]);
      fetchInventory();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_product_save', 'Product save failed');
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProdNameEn('');
    setProdNameHi('');
    setProdDescEn('');
    setProdDescHi('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdCategory('');
    setProdStock('');
    setProdReturnPolicy('Replace');
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
    setProdCategory(prod.category?._id || '');
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
    if (!window.confirm(t('admin:confirm_delete_product', 'Are you sure you want to delete this product?'))) return;
    setLoading(true);
    try {
      await api.delete(`/products/${id}`);
      showToast.success(t('admin:success_product_delete', 'Product deleted successfully'));
      clearCache();
      fetchInventory();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_product_delete', 'Delete failed');
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRepairStatus = async (id, status) => {
    try {
      await api.put(`/repairs/${id}`, { status });
      showToast.success(t('admin:success_status_update', 'Status updated successfully'));
      fetchRepairsAndCsc();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_status_update', 'Update failed');
      showToast.error(errorMessage);
    }
  };

  const handleUpdateCscStatus = async (id, status) => {
    try {
      await api.put(`/csc/${id}`, { status });
      showToast.success(t('admin:success_status_update', 'Status updated successfully'));
      fetchRepairsAndCsc();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_status_update', 'Update failed');
      showToast.error(errorMessage);
    }
  };

  if (!analytics) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
      {loading && <Loader fullPage />}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="font-heading text-2xl font-extrabold text-slate-900">
          {t('admin:dashboard_title')}
        </h2>
        <button
          onClick={() => loadTabData(activeTab, true)}
          className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-brand-cyan border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t('common:loading', 'Refresh')}
        </button>
      </div>

      {/* Dashboard Analytics widgets grid */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin:total_sales')}</span>
            <h3 className="text-2xl font-extrabold text-brand-cyan font-heading">₹{analytics.totalRevenue}</h3>
          </div>
          <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin:total_orders')}</span>
            <h3 className="text-2xl font-extrabold text-brand-cyan font-heading">{analytics.totalOrders}</h3>
          </div>
          <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin:customer')}</span>
            <h3 className="text-2xl font-extrabold text-brand-cyan font-heading">{analytics.totalUsers}</h3>
          </div>
          <div className="p-5 glass-card rounded-2xl flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin:nav_products')}</span>
            <h3 className="text-2xl font-extrabold text-brand-cyan font-heading">{analytics.totalProducts}</h3>
          </div>
        </div>
      )}

      {/* Tabs panels layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Navigation Sidebar */}
        <aside className="flex flex-row lg:flex-col flex-wrap gap-1.5 h-fit w-full lg:w-[240px] flex-shrink-0">
          <button
            onClick={() => { setActiveTab('overview'); loadTabData('overview'); }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <BarChart3 size={16} /> {t('admin:nav_overview', 'Overview')}
          </button>
          <button
            onClick={() => { setActiveTab('orders'); loadTabData('orders'); }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <ShoppingBag size={16} /> {t('admin:nav_orders', 'Orders')}
          </button>
          <button
            onClick={() => { setActiveTab('products'); loadTabData('products'); }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Package size={16} /> {t('admin:nav_products')}
          </button>
          <button
            onClick={() => { setActiveTab('categories'); loadTabData('categories'); }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'categories' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Settings size={16} /> {t('admin:category')}
          </button>
          <button
            onClick={() => { setActiveTab('repairs'); loadTabData('repairs'); }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'repairs' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Wrench size={16} /> {t('admin:nav_repairs')}
          </button>
          <button
            onClick={() => { setActiveTab('csc'); loadTabData('csc'); }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'csc' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <FileText size={16} /> {t('admin:nav_csc')}
          </button>
          <button
            onClick={() => { setActiveTab('users'); loadTabData('users'); }}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Users size={16} /> {t('admin:nav_users', 'Users')}
          </button>
        </aside>

        {/* Content body */}
        <main className="flex-grow w-full">
          {/* Tab 1: Overview Summary */}
          {activeTab === 'overview' && analytics && (
            <div className="flex flex-col gap-8 w-full">
              {/* Custom Bar Chart (Flex Heights) */}
              <div className="p-6 md:p-8 glass-card rounded-2xl shadow-sm">
                <h4 className="font-heading text-sm font-bold text-slate-800 mb-6">{t('admin:monthly_revenue', 'Monthly Revenue Trend')}</h4>
                <div className="flex justify-around items-end h-[220px] pt-8 border-b-2 border-slate-100 gap-2 md:gap-4 flex-wrap">
                  {analytics.monthlyData && analytics.monthlyData.length > 0 ? (
                    analytics.monthlyData.map((data, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 min-w-[50px] max-w-[80px]">
                        <div className="w-7 h-[130px] bg-slate-100 rounded-t-lg relative overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-brand-blue to-brand-cyan absolute bottom-0 rounded-t-lg transition-all duration-700"
                            style={{ height: `${Math.max(10, Math.min(100, (data.revenue / 200000) * 100))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-2 font-bold">{data.label}</span>
                        <span className="text-[10px] text-brand-cyan font-bold">₹{data.revenue}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 pb-4">{t('admin:no_data')}</p>
                  )}
                </div>
              </div>

              {/* Low stock alerts list */}
              <div className="p-6 md:p-8 glass-card rounded-2xl shadow-sm">
                <h4 className="font-heading text-sm font-bold text-rose-500 mb-4">{t('admin:low_stock_alerts', 'Low Stock Alerts')}</h4>
                <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                        <th className="px-4 py-3 text-left">{t('admin:product_name_en')}</th>
                        <th className="px-4 py-3 text-left">{t('admin:category')}</th>
                        <th className="px-4 py-3 text-left">{t('admin:stock')}</th>
                        <th className="px-4 py-3 text-left">{t('admin:price')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.lowStockProducts?.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">{item.name.en}</td>
                          <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">{item.category?.name?.en || 'N/A'}</td>
                          <td className="border-b border-slate-100 px-4 py-3 text-xs text-rose-500 font-bold">{item.stock} left</td>
                          <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">₹{item.price}</td>
                        </tr>
                      ))}
                      {(!analytics.lowStockProducts || analytics.lowStockProducts.length === 0) && (
                        <tr>
                          <td colSpan="4" className="border-b border-slate-100 px-4 py-4 text-xs text-slate-500 text-center font-semibold">
                            {t('admin:all_well_stocked', 'All products are well stocked!')}
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
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:nav_orders', 'Orders')}</h3>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Total Orders: <span className="font-bold text-slate-900">{orders.length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Placed / Active: <span className="font-bold text-slate-900">{orders.filter(o => o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Cancelled' && o.deliveryStatus !== 'Returned').length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Delivered: <span className="font-bold text-slate-900">{orders.filter(o => o.deliveryStatus === 'Delivered').length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Cancelled: <span className="font-bold text-slate-900">{orders.filter(o => o.deliveryStatus === 'Cancelled').length}</span>
                  </div>
                </div>
              </div>
              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">{t('admin:order_id', 'Order ID')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:customer', 'Customer')}</th>
                      <th className="px-4 py-3 text-left">{t('common:phone', 'Phone')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:amount', 'Amount')}</th>
                      <th className="px-4 py-3 text-left">{t('cart:select_payment', 'Payment')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:status', 'Status')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-blue-600">
                          <Link to={`/order-tracking/${ord._id}`} className="hover:underline">
                            NC-{ord.orderId}
                          </Link>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">{ord.user?.name || 'Guest'}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">{ord.customerPhone}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-900 font-bold">₹{ord.totalAmount}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-800">{ord.paymentType}</span>
                            <span className={`text-[10px] font-bold ${ord.paymentStatus === 'Paid' ? 'text-emerald-600' : ord.paymentStatus === 'Failed' ? 'text-rose-600' : 'text-amber-600'}`}>
                              {ord.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.deliveryStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-700'
                                : ord.deliveryStatus === 'Cancelled'
                                ? 'bg-rose-100 text-rose-700'
                                : ord.deliveryStatus === 'Order Placed'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {ord.deliveryStatus}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <select
                            value={ord.deliveryStatus}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 outline-none cursor-pointer text-xs focus:border-brand-cyan"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Packed">Packed</option>
                            <option value="Waiting Pickup">Waiting Pickup</option>
                            <option value="Picked Up">Picked Up</option>
                            <option value="On The Way">On The Way</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Returned">Returned</option>
                            <option value="Replaced">Replaced</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="border-b border-slate-100 px-4 py-6 text-xs text-slate-500 text-center font-semibold">
                          {t('admin:no_data')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Products CRUD Panel */}
          {activeTab === 'products' && (
            <div className="flex flex-col gap-6 w-full">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:inventory_control', 'Inventory Control')}</h3>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Total Products: <span className="font-bold text-slate-900">{products.length}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Out of Stock: <span className="font-bold text-slate-900">{products.filter(p => p.stock === 0).length}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Low Stock (≤ 5): <span className="font-bold text-slate-900">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddProductClick}
                  className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg hover:brightness-110 shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} /> {t('admin:add_product')}
                </button>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">{t('admin:image_url', 'Image')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:product_name_en')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:category')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:price')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:stock')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <img src={prod.images[0]} alt={prod.name.en} className="w-9 h-9 rounded object-contain bg-slate-100 border border-slate-200" />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">{prod.name.en}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">{prod.category?.name?.en}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-900 font-bold">₹{prod.price}</td>
                        <td
                          className={`border-b border-slate-100 px-4 py-3 text-xs font-extrabold ${
                            prod.stock === 0 ? 'text-rose-500' : prod.stock <= 5 ? 'text-amber-500' : 'text-emerald-500'
                          }`}
                        >
                          {prod.stock}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditProductClick(prod)} className="p-1.5 bg-slate-100 border border-slate-200 rounded text-brand-cyan hover:bg-slate-200 flex cursor-pointer transition-all">
                              <Edit size={12} />
                            </button>
                            <button onClick={() => handleDeleteProduct(prod._id)} className="p-1.5 bg-slate-100 border border-slate-200 rounded text-rose-500 hover:bg-rose-50 flex cursor-pointer transition-all">
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
          {activeTab === 'categories' && (
            <div className="flex flex-col gap-6 w-full">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:categories_setup', 'Categories Setup')}</h3>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    <div className="px-3 py-1.5 bg-brand-cyan/5 border border-brand-cyan/25 text-brand-cyan rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
                      Total Categories: <span className="font-bold text-slate-900">{categories.length}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCatNameEn('');
                    setCatNameHi('');
                    setCatImage(null);
                    setExistingCatImage('');
                    setRemoveCatImage(false);
                    // Reset translation flags
                    catNameEnDirty.current = false;
                    catNameHiManual.current = false;
                    setShowCategoryModal(true);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg hover:brightness-110 shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} /> {t('admin:add_category', 'Add Category')}
                </button>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">{t('admin:image_url', 'Image')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:product_name_hi')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:product_name_en')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name.en} className="w-9 h-9 rounded object-contain bg-slate-100 border border-slate-200" />
                          ) : (
                            t('admin:no_image', 'No Image')
                          )}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">{cat.name.hi}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">{cat.name.en}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditCategoryClick(cat)} className="p-1.5 bg-slate-100 border border-slate-200 rounded text-brand-cyan hover:bg-slate-200 flex cursor-pointer transition-all">
                              <Edit size={12} />
                            </button>
                            <button onClick={() => handleDeleteCategory(cat._id)} className="p-1.5 bg-slate-100 border border-slate-200 rounded text-rose-500 hover:bg-rose-50 flex cursor-pointer transition-all">
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
          {activeTab === 'repairs' && (
            <div className="flex flex-col gap-6 w-full">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:repairs_bookings', 'Mobile Repair Bookings')}</h3>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Total Repair Requests: <span className="font-bold text-slate-900">{repairs.length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Finalized Requests: <span className="font-bold text-slate-900">{repairs.filter(r => r.status === 'Delivered' || r.status === 'Repaired').length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Pending Requests: <span className="font-bold text-slate-900">{repairs.filter(r => r.status === 'Pending').length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    In Progress: <span className="font-bold text-slate-900">{repairs.filter(r => r.status === 'In Progress' || r.status === 'Approved').length}</span>
                  </div>
                </div>
              </div>
              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">{t('admin:customer')}</th>
                      <th className="px-4 py-3 text-left">{t('common:phone')}</th>
                      <th className="px-4 py-3 text-left">{t('repair:device_brand', 'Device')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:category')}</th>
                      <th className="px-4 py-3 text-left">{t('repair:estimate', 'Estimate')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:status')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.map((rep) => (
                      <tr key={rep._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">{rep.customerName}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">{rep.customerPhone}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          {rep.deviceBrand} {rep.deviceModel}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">{rep.serviceCategory}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-brand-cyan font-bold">₹{rep.estimatedPrice}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rep.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-700'
                                : rep.status === 'Pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <select
                            value={rep.status}
                            onChange={(e) => handleUpdateRepairStatus(rep._id, e.target.value)}
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
          {activeTab === 'csc' && (
            <div className="flex flex-col gap-6 w-full">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:nav_csc')}</h3>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Total Inquiries: <span className="font-bold text-slate-900">{cscQueries.length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Pending: <span className="font-bold text-slate-900">{cscQueries.filter(q => q.status === 'Pending').length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Processing: <span className="font-bold text-slate-900">{cscQueries.filter(q => q.status === 'Processing').length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Completed: <span className="font-bold text-slate-900">{cscQueries.filter(q => q.status === 'Completed').length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Cancelled: <span className="font-bold text-slate-900">{cscQueries.filter(q => q.status === 'Cancelled').length}</span>
                  </div>
                </div>
              </div>
              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">{t('admin:customer')}</th>
                      <th className="px-4 py-3 text-left">{t('common:phone')}</th>
                      <th className="px-4 py-3 text-left">{t('csc:service_type')}</th>
                      <th className="px-4 py-3 text-left">{t('csc:details')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:status')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cscQueries.map((query) => (
                      <tr key={query._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">{query.name}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">{query.phone}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">{query.serviceName}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate">{query.queryDetails}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              query.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : query.status === 'Pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {query.status}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                          <select
                            value={query.status}
                            onChange={(e) => handleUpdateCscStatus(query._id, e.target.value)}
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

          {/* Tab 6: Registered Users & Activities Panel */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:nav_users', 'Registered Users')}</h3>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Total Users: <span className="font-bold text-slate-900">{users.length}</span>
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
                    placeholder={t('admin:search_placeholder', 'Search 10-digit phone number...')}
                    value={userSearchPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setUserSearchPhone(val);
                    }}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-xl shadow cursor-pointer transition-all"
                  >
                    {t('common:search', 'Search')}
                  </button>
                  {userSearchPhone && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserSearchPhone('');
                        fetchUsers('');
                      }}
                      className="px-3 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-all"
                    >
                      {t('common:clear', 'Clear')}
                    </button>
                  )}
                </form>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <th className="px-4 py-3 text-left">{t('admin:customer', 'Name')}</th>
                      <th className="px-4 py-3 text-left">{t('common:phone', 'Phone')}</th>
                      <th className="px-4 py-3 text-left">{t('common:email', 'Email')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:registered_at', 'Registered On')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:activity_summary', 'Activity')}</th>
                      <th className="px-4 py-3 text-left">{t('admin:actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">{user.name}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-mono">{user.mobile}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">{user.email || 'N/A'}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                              setActiveDetailTab('orders');
                              setUserActivityDetail(null);
                              setLoadingUserActivityDetail(true);
                              try {
                                const res = await api.get(`/dashboard/admin/users/${user._id}/activity`);
                                setUserActivityDetail(res.data);
                              } catch (err) {
                                console.error(err);
                                showToast.error('Failed to load user activity details');
                              } finally {
                                setLoadingUserActivityDetail(false);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-brand-cyan hover:text-brand-cyan/80 bg-brand-cyan/5 hover:bg-brand-cyan/10 rounded-lg cursor-pointer transition-all"
                          >
                            {t('admin:view_activity', 'View History')}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="6" className="border-b border-slate-100 px-4 py-8 text-xs text-slate-500 text-center font-semibold">
                          {t('admin:no_data')}
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
                {editingProduct ? t('admin:edit_product') : t('admin:add_product')}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer flex transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:product_name_en')} *</label>
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
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:product_name_hi')} *</label>
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
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:price')} *</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:original_price')} *</label>
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
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:category')} *</label>
                  <select
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none cursor-pointer text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    required
                  >
                    <option value="">{t('admin:select_category', 'Select Category')}</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:stock')} *</label>
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
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('product:return_policy', 'Return Policy')} *</label>
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
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:description_en')} *</label>
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
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:description_hi')} *</label>
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
                  <Upload size={16} className="text-brand-cyan" /> {t('admin:image_url', 'Product Images')} *
                </label>

                {/* Grid of existing + new images and + button */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-1.5">
                  {/* Existing Images */}
                  {existingImages.map((imgUrl, index) => (
                    <div key={`existing-${index}`} className="relative w-full aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 group overflow-hidden">
                      <img src={imgUrl} alt={`Product ${index}`} className="max-w-full max-h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setExistingImages(prev => prev.filter(img => img !== imgUrl))}
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
                      <div key={`new-${index}`} className="relative w-full aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 group overflow-hidden">
                        <img src={tempUrl} alt={`New Product ${index}`} className="max-w-full max-h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== index))}
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer border-0 shadow hover:bg-rose-600 transition-colors p-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Plus Card for adding new files */}
                  {(existingImages.length + newImages.length) < 5 && (
                    <label className="relative w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-brand-cyan hover:bg-slate-50/50 transition-all gap-1 text-slate-400 hover:text-brand-cyan">
                      <Plus size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {currentLang === 'hi' ? 'जोड़ें' : 'Add'}
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
                            const limitLeft = 5 - (existingImages.length + newImages.length);
                            setNewImages(prev => [...prev, ...files.slice(0, limitLeft)]);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  {currentLang === 'hi'
                    ? "आप अधिकतम 5 छवियां अपलोड कर सकते हैं। परिवर्तनों को लागू करने के लिए 'सहेजें' पर क्लिक करें।"
                    : "You can upload up to 5 images. Click 'Save' to apply changes."}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 font-heading font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-full hover:brightness-110 shadow-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common:submitting', 'Submitting...') : t('admin:save_changes')}
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
                {editingCategory ? (currentLang === 'hi' ? 'श्रेणी संपादित करें' : 'Edit Category') : t('admin:add_category', 'Add New Category')}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer flex transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:product_name_en')} *</label>
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
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:product_name_hi')} *</label>
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
                  <Upload size={16} className="text-brand-cyan" /> {t('admin:image_url', 'Category Image')}
                </label>

                {/* Grid of existing + new image and + button */}
                <div className="grid grid-cols-3 gap-3 mt-1.5">
                  {/* Existing Image */}
                  {existingCatImage && (
                    <div className="relative w-full aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 group overflow-hidden">
                      <img src={existingCatImage} alt="Category" className="max-w-full max-h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setExistingCatImage('');
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
                      <img src={URL.createObjectURL(catImage)} alt="New Category" className="max-w-full max-h-full object-contain" />
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
                        {currentLang === 'hi' ? 'जोड़ें' : 'Add'}
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
                {loading ? t('common:submitting', 'Submitting...') : editingCategory ? (currentLang === 'hi' ? 'सहेजें' : 'Save Category') : t('admin:add_category', 'Create Category')}
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
                  {selectedUserForDetail.email && <span>Email: {selectedUserForDetail.email}</span>}
                  <span>Joined: {new Date(selectedUserForDetail.createdAt).toLocaleDateString()}</span>
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
                onClick={() => setActiveDetailTab('orders')}
                className={`px-4 py-2 border-0 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDetailTab === 'orders'
                    ? 'bg-brand-cyan text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Orders ({selectedUserForDetail.activityCounts?.orders || 0})
              </button>
              <button
                onClick={() => setActiveDetailTab('repairs')}
                className={`px-4 py-2 border-0 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDetailTab === 'repairs'
                    ? 'bg-brand-cyan text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Repairs ({selectedUserForDetail.activityCounts?.repairs || 0})
              </button>
              <button
                onClick={() => setActiveDetailTab('csc')}
                className={`px-4 py-2 border-0 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDetailTab === 'csc'
                    ? 'bg-brand-cyan text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
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
                <p className="text-center py-8 text-xs text-slate-500 font-semibold">Failed to load activity log.</p>
              ) : (
                <>
                  {activeDetailTab === 'orders' && (
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
                                    <Link to={`/order-tracking/${ord._id}`} className="hover:underline">
                                      NC-{ord.orderId}
                                    </Link>
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                                    {new Date(ord.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 max-w-[200px]">
                                    <div className="flex flex-col gap-1">
                                      {ord.items?.map((item, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                          {item.product?.images?.[0] && (
                                            <img
                                              src={item.product.images[0]}
                                              alt={item.product.name?.en}
                                              className="w-5 h-5 rounded object-contain bg-slate-100 border border-slate-200"
                                            />
                                          )}
                                          <span className="truncate">
                                            {item.product?.name?.en || 'Product'} (x{item.quantity})
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
                                      <span className="font-semibold text-slate-800">{ord.paymentType}</span>
                                      <span className={`text-[10px] font-bold ${ord.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {ord.paymentStatus}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        ord.deliveryStatus === 'Delivered'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : ord.deliveryStatus === 'Cancelled'
                                          ? 'bg-rose-100 text-rose-700'
                                          : 'bg-blue-100 text-blue-700'
                                      }`}
                                    >
                                      {ord.deliveryStatus}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-8 text-xs text-slate-500 font-semibold">No orders found.</p>
                      )}
                    </div>
                  )}

                  {activeDetailTab === 'repairs' && (
                    <div className="flex flex-col gap-4">
                      {userActivityDetail.repairs?.length > 0 ? (
                        <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                                <th className="px-4 py-3 text-left">Device</th>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-left">Problem</th>
                                <th className="px-4 py-3 text-left">Estimate</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userActivityDetail.repairs.map((rep) => (
                                <tr key={rep._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                                    {rep.deviceBrand} {rep.deviceModel}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                                    {rep.serviceCategory}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate" title={rep.problemDescription}>
                                    {rep.problemDescription}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-brand-cyan font-bold">
                                    ₹{rep.estimatedPrice}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        rep.status === 'Delivered'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : rep.status === 'Pending'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-blue-100 text-blue-700'
                                      }`}
                                    >
                                      {rep.status}
                                    </span>
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">
                                    {new Date(rep.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-8 text-xs text-slate-500 font-semibold">No repair requests found.</p>
                      )}
                    </div>
                  )}

                  {activeDetailTab === 'csc' && (
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
                                <tr key={query._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-semibold">
                                    {query.serviceName}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600 max-w-[300px] truncate" title={query.queryDetails}>
                                    {query.queryDetails}
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        query.status === 'Completed'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : query.status === 'Pending'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-blue-100 text-blue-700'
                                      }`}
                                    >
                                      {query.status}
                                    </span>
                                  </td>
                                  <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">
                                    {new Date(query.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-8 text-xs text-slate-500 font-semibold">No CSC inquiries found.</p>
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


export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import Loader from '../components/common/Loader';
import api from '../utils/api';
import { BarChart3, Plus, Edit, Trash2, Package, Wrench, FileText, Settings, X, Upload, RefreshCw, ShoppingBag } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [cscQueries, setCscQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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

  const [catNameEn, setCatNameEn] = useState('');
  const [catNameHi, setCatNameHi] = useState('');
  const [catImage, setCatImage] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      setAnalytics(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async () => {
    try {
      const pRes = await api.get('/products?limit=100');
      setProducts(pRes.data.products || []);

      const cRes = await api.get('/products/categories');
      setCategories(cRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRepairsAndCsc = async () => {
    try {
      const repRes = await api.get('/repairs');
      setRepairs(repRes.data || []);

      const cscRes = await api.get('/csc');
      setCscQueries(cscRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchInventory(), fetchRepairsAndCsc(), fetchOrders()]);
    setLoading(false);
  };

  const handleUpdateOrderStatus = async (id, status) => {
    setLoading(true);
    try {
      await api.put(`/orders/${id}/status`, { status });
      showToast.success(t('admin:success_status_update', 'Status updated successfully'));
      await fetchOrders();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_status_update', 'Update failed');
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Auto-poll dashboard data silently in the background every 30 seconds to fetch latest MongoDB status
    const pollInterval = setInterval(() => {
      Promise.all([fetchAnalytics(), fetchInventory(), fetchRepairsAndCsc(), fetchOrders()]).catch((err) =>
        console.error('Silent background dashboard data refresh failed:', err)
      );
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catNameHi || !catNameEn) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('nameHi', catNameHi);
    formData.append('nameEn', catNameEn);
    if (catImage) formData.append('image', catImage);

    try {
      await api.post('/products/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast.success(t('admin:success_category_create', 'Category created successfully!'));
      setCatNameHi('');
      setCatNameEn('');
      setCatImage(null);
      setShowCategoryModal(false);
      fetchInventory();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_category_create', 'Category creation failed');
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

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

    if (prodImages && prodImages.length > 0) {
      for (let i = 0; i < prodImages.length; i++) {
        formData.append('images', prodImages[i]);
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
      setProdImages([]);
      fetchInventory();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('admin:error_product_save', 'Product save failed');
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm(t('admin:confirm_delete_product', 'Are you sure you want to delete this product?'))) return;
    setLoading(true);
    try {
      await api.delete(`/products/${id}`);
      showToast.success(t('admin:success_product_delete', 'Product deleted successfully'));
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
          onClick={loadAllData}
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
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <BarChart3 size={16} /> {t('admin:nav_overview', 'Overview')}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <ShoppingBag size={16} /> {t('admin:nav_orders', 'Orders')}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Package size={16} /> {t('admin:nav_products')}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'categories' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Settings size={16} /> {t('admin:category')}
          </button>
          <button
            onClick={() => setActiveTab('repairs')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'repairs' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Wrench size={16} /> {t('admin:nav_repairs')}
          </button>
          <button
            onClick={() => setActiveTab('csc')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'csc' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <FileText size={16} /> {t('admin:nav_csc')}
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
              <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:nav_orders', 'Orders')}</h3>
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
                <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:inventory_control', 'Inventory Control')}</h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }}
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
                <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:categories_setup', 'Categories Setup')}</h3>
                <button onClick={() => setShowCategoryModal(true)} className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg hover:brightness-110 shadow-lg flex items-center gap-1.5 cursor-pointer">
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
              <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:repairs_bookings', 'Mobile Repair Bookings')}</h3>
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
              <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:nav_csc')}</h3>
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
                    onChange={(e) => setProdNameEn(e.target.value)}
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
                    onChange={(e) => setProdNameHi(e.target.value)}
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
                    onChange={(e) => setProdDescEn(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:description_hi')} *</label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none text-xs focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all"
                    rows="2"
                    value={prodDescHi}
                    onChange={(e) => setProdDescHi(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-700">
                  <Upload size={16} className="text-brand-cyan" /> {t('admin:image_url', 'Product Images')}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none text-xs focus:border-brand-cyan"
                  onChange={(e) => setProdImages(e.target.files)}
                  required={!editingProduct}
                />
                <span className="text-[10px] text-slate-500 mt-1">
                  Choose up to 5 images. Selecting new images will replace existing ones.
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

      {/* MODAL 2: Category Add Dialog */}
      {showCategoryModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-slate-950/80 flex justify-center items-center z-[500] backdrop-blur-md overflow-y-auto p-4 animate-fadeIn">
          <div className="w-full max-w-[450px] p-6 md:p-8 glass-card rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-lg font-bold text-slate-900">{t('admin:add_category', 'Add New Category')}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer flex transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">{t('admin:product_name_en')} *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-sm"
                  placeholder="e.g. Phone Glass"
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
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
                  onChange={(e) => setCatNameHi(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-700">
                  <Upload size={16} className="text-brand-cyan" /> {t('admin:image_url', 'Category Image')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none text-xs focus:border-brand-cyan"
                  onChange={(e) => setCatImage(e.target.files[0])}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 font-heading font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-full hover:brightness-110 shadow-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common:submitting', 'Submitting...') : t('admin:add_category', 'Create Category')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

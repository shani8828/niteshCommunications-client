import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { showToast } from '../utils/toast';
import Loader from '../components/common/Loader';
import api from '../utils/api';
import { User, ShoppingBag, MapPin, Phone, Mail, Edit, Save, ArrowRight, Compass, Heart, Trash2, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { t, i18n } = useTranslation(['cart', 'common', 'notifications', 'auth']);
  const { user, logout, updateUserProfile } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState(() => {
    const cached = localStorage.getItem('my_orders_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [repairs, setRepairs] = useState(() => {
    const cached = localStorage.getItem('my_repairs_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [repairsLoading, setRepairsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);

  const currentLang = i18n.language || 'hi';
  const isHindi = currentLang === 'hi';

  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    } else if (location.pathname === '/order-tracking/history') {
      setActiveTab('orders');
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.mobile || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      if (user.coordinates) {
        setCoordinates(user.coordinates);
      }
    }
  }, [user]);

  const fetchMyOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data || []);
      localStorage.setItem('my_orders_cache', JSON.stringify(response.data || []));
    } catch (err) {
      console.error('Error fetching orders:', err);
      showToast.error(isHindi ? 'ऑर्डर इतिहास लोड करने में विफल' : 'Failed to load order history');
    } finally {
      setOrdersLoading(false);
      setLoading(false);
    }
  };

  const fetchMyRepairs = async () => {
    if (!user || (!user.mobile && !user.phone)) return;
    setRepairsLoading(true);
    try {
      const userPhone = user.mobile || user.phone;
      const response = await api.get(`/repairs/my/${userPhone}`);
      setRepairs(response.data || []);
      localStorage.setItem('my_repairs_cache', JSON.stringify(response.data || []));
    } catch (err) {
      console.error('Error fetching repairs:', err);
      showToast.error(isHindi ? 'रिपेयर बुकिंग लोड करने में विफल' : 'Failed to load repair bookings');
    } finally {
      setRepairsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
      fetchMyRepairs();

      // Poll user orders & repairs silently in the background every 30 seconds to fetch latest MongoDB status
      const pollInterval = setInterval(() => {
        api.get('/orders/my-orders')
          .then((response) => {
            setOrders(response.data || []);
            localStorage.setItem('my_orders_cache', JSON.stringify(response.data || []));
          })
          .catch((err) => console.error('Silent background orders refresh failed:', err));

        const userPhone = user.mobile || user.phone;
        if (userPhone) {
          api.get(`/repairs/my/${userPhone}`)
            .then((response) => {
              setRepairs(response.data || []);
              localStorage.setItem('my_repairs_cache', JSON.stringify(response.data || []));
            })
            .catch((err) => console.error('Silent background repairs refresh failed:', err));
        }
      }, 30000);

      return () => clearInterval(pollInterval);
    }
  }, [user]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast.error(isHindi ? "लोकेशन का समर्थन नहीं है" : "Your browser does not support geolocation");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            showToast.success(isHindi ? "लोकेशन प्राप्त की गई" : "Location retrieved successfully");
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          console.error(err);
          setAddress(`${latitude}, ${longitude}`);
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        console.error(error);
        setGeolocating(false);
        showToast.error(isHindi ? "लोकेशन अनुमति नहीं मिली" : "Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      showToast.error(t('notifications:fill_all_fields'));
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.put('/auth/me', {
        name,
        mobile: phone,
        address,
        email,
        coordinates,
      });

      updateUserProfile(response.data.user);
      showToast.success(isHindi ? 'प्रोफाइल सफलतापूर्वक अपडेट की गई!' : 'Profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      showToast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = async (ord) => {
    if (ord.paymentStatus === 'Paid') {
      navigate(`/order-tracking/${ord._id}/return?cancel=true`);
    } else {
      const confirmCancel = window.confirm(
        isHindi
          ? 'क्या आप सचमुच इस ऑर्डर को रद्द करना चाहते हैं?'
          : 'Are you sure you want to cancel this order?'
      );
      if (!confirmCancel) return;

      setActionLoading(true);
      try {
        await api.post(`/orders/${ord._id}/cancel`);
        showToast.success(isHindi ? 'ऑर्डर सफलतापूर्वक रद्द कर दिया गया!' : 'Order cancelled successfully!');
        fetchMyOrders();
      } catch (err) {
        showToast.error(err.response?.data?.message || 'Cancellation failed');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCancelRepair = async (rep) => {
    if (rep.paymentMethod === 'Online' && rep.paymentStatus === 'Paid') {
      navigate(`/repairs/${rep._id}/cancel`);
    } else {
      const confirmCancel = window.confirm(
        isHindi
          ? 'क्या आप सचमुच इस रिपेयर बुकिंग को रद्द करना चाहते हैं?'
          : 'Are you sure you want to cancel this repair booking?'
      );
      if (!confirmCancel) return;

      setActionLoading(true);
      try {
        await api.post(`/repairs/${rep._id}/cancel`);
        showToast.success(isHindi ? 'रिपेयर बुकिंग सफलतापूर्वक रद्द की गई!' : 'Repair booking cancelled successfully!');
        fetchMyRepairs();
      } catch (err) {
        showToast.error(err.response?.data?.message || 'Cancellation failed');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading && !user) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 relative">
      {actionLoading && <Loader fullPage />}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-800">
            {isHindi ? 'मेरा अकाउंट / My Account' : 'My Account Dashboard'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isHindi ? 'अपने ऑर्डर्स ट्रैक करें और प्रोफाइल डिटेल्स मैनेज करें।' : 'Track your purchases and manage profile settings.'}
          </p>
        </div>
        <button
          onClick={logout}
          className="px-5 py-2.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-full transition-all cursor-pointer"
        >
          {t('common:logout')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Controls */}
        <aside className="flex flex-row lg:flex-col flex-wrap gap-1.5 h-fit w-full lg:w-[240px] flex-shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-blue-50 text-blue-600 border border-blue-50' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <ShoppingBag size={16} /> {isHindi ? 'मेरे ऑर्डर्स' : 'My Orders'}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-blue-50 text-blue-600 border border-blue-50' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <User size={16} /> {isHindi ? 'प्रोफाइल एडिट करें' : 'Edit Profile'}
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'wishlist' ? 'bg-blue-50 text-blue-600 border border-blue-50' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Heart size={16} /> {isHindi ? 'मेरी विशलिस्ट' : 'My Wishlist'}
          </button>
          <button
            onClick={() => setActiveTab('repairs')}
            className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'repairs' ? 'bg-blue-50 text-blue-600 border border-blue-50' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Wrench size={16} /> {isHindi ? 'रिपेयर बुकिंग्स' : 'Repair Bookings'}
          </button>
        </aside>

        {/* Content Panel */}
        <main className="flex-grow w-full">
          {/* Tab 1: Orders History */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                {isHindi ? 'ऑर्डर इतिहास' : 'Order History'}
              </h3>

              {ordersLoading && orders.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col items-center gap-4">
                  <ShoppingBag size={36} className="text-slate-300" />
                  <p className="text-sm text-slate-500">
                    {isHindi ? 'आपने अभी तक कोई ऑर्डर नहीं दिया है।' : 'You have not placed any orders yet.'}
                  </p>
                  <Link
                    to="/shop"
                    className="px-6 py-2.5 font-heading font-bold text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all border-0 shadow-sm"
                  >
                    {isHindi ? 'शॉपिंग करें' : 'Start Shopping'}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                            Order ID: {ord.orderId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 font-semibold mt-1">
                          {ord.items.map((item, idx) => (
                            <span key={item._id || idx} className="flex items-center gap-1">
                              {item.product ? (
                                <Link
                                  to={`/products/${item.product.slug || item.product.name.en.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                  {item.product.name[currentLang] || item.product.name['en']} (x{item.quantity})
                                </Link>
                              ) : (
                                <span className="text-slate-500">Item (x{item.quantity})</span>
                              )}
                              {idx < ord.items.length - 1 && <span className="text-slate-400">,</span>}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-xs">
                          <span className="font-bold text-slate-700">₹{ord.totalAmount}</span>
                          <span className="text-slate-400 font-semibold">|</span>
                          <span className="text-slate-500 font-semibold">Pay: {ord.paymentType}</span>
                        </div>
                      </div>

                      <div className="flex items-center sm:items-end flex-col gap-2.5 w-full sm:w-auto">
                        <div className="flex gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : ord.paymentStatus === 'Failed'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            Payment: {ord.paymentStatus}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.deliveryStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-700'
                                : ord.deliveryStatus === 'Cancelled'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            Status: {ord.deliveryStatus}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-1.5 w-full sm:w-auto">
                          <Link
                            to={`/order-tracking/${ord._id}`}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                          >
                            {isHindi ? 'ऑर्डर ट्रैक करें' : 'Track Order'} <ArrowRight size={12} />
                          </Link>
                          {['Order Placed', 'Confirmed', 'Packed', 'Waiting Pickup'].includes(ord.deliveryStatus) && (
                            <button
                              type="button"
                              onClick={() => handleCancelClick(ord)}
                              className="px-3 py-1 text-[11px] font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg cursor-pointer transition-all w-full sm:w-auto text-center"
                            >
                              {isHindi ? 'ऑर्डर रद्द करें' : 'Cancel Order'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Profile Form Settings */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                {isHindi ? 'प्रोफाइल सेटिंग्स' : 'Profile Settings'}
              </h3>

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 p-6 md:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                      {isHindi ? 'पूरा नाम' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                      {isHindi ? 'मोबाइल नंबर' : 'Mobile Number'} *
                    </label>
                    <input
                      type="tel"
                      maxLength="10"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                    {isHindi ? 'ईमेल पता' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-500">
                      {isHindi ? 'डिलीवरी पता' : 'Delivery Address'} *
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={geolocating}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-semibold disabled:text-slate-400 transition-colors"
                    >
                      <Compass size={14} className={geolocating ? "animate-spin" : ""} />
                      {geolocating ? (isHindi ? 'लोकेशन खोज रहे हैं...' : 'Locating...') : (isHindi ? 'सटीक लोकेशन प्राप्त करें' : 'Get Current Location')}
                    </button>
                  </div>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                  
                  {coordinates && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 shadow-inner h-44 w-full relative">
                      <iframe
                        title="Profile Location Map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={`https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`}
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3.5 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  <span>{isHindi ? 'प्रोफाइल सहेजें' : 'Save Details'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                {isHindi ? 'मेरी विशलिस्ट' : 'My Wishlist'}
              </h3>

              {wishlist.length === 0 ? (
                <div className="p-12 text-center bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col items-center gap-4">
                  <Heart size={36} className="text-slate-300" />
                  <p className="text-sm text-slate-500">
                    {isHindi ? 'आपकी विशलिस्ट खाली है।' : 'Your wishlist is empty.'}
                  </p>
                  <Link
                    to="/shop"
                    className="px-6 py-2.5 font-heading font-bold text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all border-0 shadow-sm"
                  >
                    {isHindi ? 'शॉपिंग करें' : 'Start Shopping'}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlist.map((prod) => (
                    <div
                      key={prod._id}
                      className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col relative"
                    >
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(prod)}
                        className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white text-rose-500 hover:text-rose-600 rounded-full border border-slate-100 shadow-sm transition-all backdrop-blur-sm cursor-pointer"
                        title={isHindi ? "विशलिस्ट से हटाएं" : "Remove from Wishlist"}
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Product Image */}
                      <div className="aspect-square w-full bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
                        <img
                          src={prod.images && prod.images[0] ? prod.images[0] : '/placeholder-product.png'}
                          alt={prod.name[currentLang] || prod.name['en']}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        {prod.stock === 0 && (
                          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-rose-200 uppercase tracking-wider">
                              {isHindi ? 'आउट ऑफ स्टॉक' : 'Out of Stock'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                            {typeof prod.category === 'object' ? (prod.category?.name[currentLang] || prod.category?.name?.en || 'N/A') : (prod.category || 'N/A')}
                          </span>
                          <Link to={`/products/${prod.slug || prod._id}`}>
                            <h4 className="font-heading text-sm font-bold text-slate-800 hover:text-blue-600 line-clamp-1 transition-colors">
                              {prod.name[currentLang] || prod.name['en']}
                            </h4>
                          </Link>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {prod.description[currentLang] || prod.description['en']}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 mt-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-extrabold text-slate-800">₹{prod.price}</span>
                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <span className="text-xs text-slate-400 line-through">₹{prod.originalPrice}</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => addToCart(prod)}
                            disabled={prod.stock === 0}
                            className="w-full py-2 px-3 text-xs font-heading font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-0 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag size={12} />
                            <span>{isHindi ? 'कार्ट में जोड़ें' : 'Add to Cart'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Repair Bookings */}
          {activeTab === 'repairs' && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                {isHindi ? 'रिपेयर बुकिंग इतिहास' : 'Repair Booking History'}
              </h3>

              {repairsLoading && repairs.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : repairs.length === 0 ? (
                <div className="p-12 text-center bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col items-center gap-4">
                  <Wrench size={36} className="text-slate-300" />
                  <p className="text-sm text-slate-500">
                    {isHindi ? 'आपने अभी तक कोई रिपेयर बुकिंग नहीं की है।' : 'You have not booked any repairs yet.'}
                  </p>
                  <Link
                    to="/repairs"
                    className="px-6 py-2.5 font-heading font-bold text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all border-0 shadow-sm"
                  >
                    {isHindi ? 'रिपेयर बुक करें' : 'Book a Repair'}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {repairs.map((rep) => (
                    <div
                      key={rep._id}
                      className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                            Booking ID: {rep._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(rep.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="font-heading text-sm font-bold text-slate-800 mt-1 truncate">
                          {rep.deviceBrand} {rep.deviceModel}
                        </h4>
                        <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded w-fit">
                          {rep.serviceCategory}
                        </span>

                        <p className="text-xs text-slate-500 mt-1 break-words">
                          <span className="font-semibold text-slate-700">{isHindi ? 'समस्या: ' : 'Problem: '}</span>
                          {rep.problemDescription}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="font-bold text-slate-800">₹{rep.estimatedPrice}</span>
                          <span className="text-slate-400 font-semibold">|</span>
                          <span className="text-slate-500 font-semibold">{isHindi ? `भुगतान: ${rep.paymentMethod}` : `Payment: ${rep.paymentMethod}`}</span>
                        </div>
                        
                        {rep.notes && (
                          <div className="mt-2 bg-amber-50/50 border border-amber-100 rounded-xl p-2.5 text-xs text-amber-800 break-words">
                            <span className="font-bold">{isHindi ? 'नोट: ' : 'Admin Note: '}</span>
                            {rep.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-start sm:items-end flex-col gap-2.5 w-full sm:w-auto flex-shrink-0 mt-3 sm:mt-0">
                        <div className="flex gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              rep.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : rep.paymentStatus === 'Refunded'
                                ? 'bg-amber-100 text-amber-700'
                                : rep.paymentStatus === 'Failed'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            Payment: {rep.paymentStatus}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              rep.status === 'Delivered' || rep.status === 'Repaired'
                                ? 'bg-emerald-100 text-emerald-700'
                                : rep.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            Status: {rep.status}
                          </span>
                        </div>

                        {['Pending', 'Approved'].includes(rep.status) && (
                          <button
                            type="button"
                            onClick={() => handleCancelRepair(rep)}
                            className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl cursor-pointer transition-all w-full sm:w-auto text-center"
                          >
                            {isHindi ? 'बुकिंग रद्द करें' : 'Cancel Booking'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;

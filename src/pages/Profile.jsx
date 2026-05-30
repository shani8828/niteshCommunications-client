import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { showToast } from '../utils/toast';
import Loader from '../components/common/Loader';
import api from '../utils/api';
import { User, ShoppingBag, MapPin, Phone, Mail, Edit, Save, ArrowRight, Compass, Heart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { t, i18n } = useTranslation(['cart', 'common', 'notifications', 'auth']);
  const { user, logout, updateUserProfile } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showToast.error(isHindi ? 'ऑर्डर इतिहास लोड करने में विफल' : 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();

      // Poll user orders silently in the background every 30 seconds to fetch latest MongoDB status
      const pollInterval = setInterval(() => {
        api.get('/orders/my-orders')
          .then((response) => setOrders(response.data || []))
          .catch((err) => console.error('Silent background orders refresh failed:', err));
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
        </aside>

        {/* Content Panel */}
        <main className="flex-grow w-full">
          {/* Tab 1: Orders History */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                {isHindi ? 'ऑर्डर इतिहास' : 'Order History'}
              </h3>

              {orders.length === 0 ? (
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
                            Order ID: NC-{ord.orderId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-500 font-medium">
                          {ord.items.map((item) => `${item.product?.name[currentLang] || 'Item'} (x${item.quantity})`).join(', ')}
                        </p>
                        
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

                        <Link
                          to={`/order-tracking/${ord._id}`}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                        >
                          {isHindi ? 'ऑर्डर ट्रैक करें' : 'Track Order'} <ArrowRight size={12} />
                        </Link>
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
        </main>
      </div>
    </div>
  );
};

export default Profile;

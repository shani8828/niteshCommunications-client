import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { showToast } from '../utils/toast';
import Loader from '../components/common/Loader';
import api from '../utils/api';

// Modular components
import ProfileSidebar from '../components/profile/ProfileSidebar';
import OrdersHistoryTab from '../components/profile/OrdersHistoryTab';
import ProfileEditTab from '../components/profile/ProfileEditTab';
import WishlistTab from '../components/profile/WishlistTab';
import RepairBookingsTab from '../components/profile/RepairBookingsTab';

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

  const currentLang = i18n.language || 'hi';
  const isHindi = currentLang === 'hi';

  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    } else if (location.pathname === '/order-tracking/history') {
      setActiveTab('orders');
    }
  }, [location]);

  const fetchMyOrders = useCallback(async () => {
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
  }, [isHindi]);

  const fetchMyRepairs = useCallback(async () => {
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
  }, [user, isHindi]);

  useEffect(() => {
    if (user) {
      fetchMyOrders();
      fetchMyRepairs();

      // Poll user orders & repairs silently in the background every 30 seconds
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
  }, [user, fetchMyOrders, fetchMyRepairs]);

  const handleUpdateProfile = useCallback(async (profileData) => {
    setActionLoading(true);
    try {
      const response = await api.put('/auth/me', profileData);
      updateUserProfile(response.data.user);
      showToast.success(isHindi ? 'प्रोफाइल सफलतापूर्वक अपडेट की गई!' : 'Profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      showToast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }, [updateUserProfile, isHindi]);

  const handleCancelClick = useCallback(async (ord) => {
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
  }, [navigate, isHindi, fetchMyOrders]);

  const handleCancelRepair = useCallback(async (rep) => {
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
  }, [navigate, isHindi, fetchMyRepairs]);

  if (loading && !user) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 relative">
      {actionLoading && <Loader fullPage />}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="text-left">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-800">
            {isHindi ? 'मेरा अकाउंट / My Account' : 'My Account Dashboard'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isHindi ? 'अपने ऑर्डर्स ट्रैक करें और प्रोफाइल डिटेल्स मैनेज करें।' : 'Track your purchases and manage profile settings.'}
          </p>
        </div>
        <button
          onClick={logout}
          className="px-5 py-2.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-full transition-all cursor-pointer outline-none"
        >
          {t('common:logout')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <ProfileSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isHindi={isHindi}
        />

        <main className="flex-grow w-full">
          {activeTab === 'orders' && (
            <OrdersHistoryTab
              orders={orders}
              ordersLoading={ordersLoading}
              isHindi={isHindi}
              currentLang={currentLang}
              handleCancelClick={handleCancelClick}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileEditTab
              user={user}
              isHindi={isHindi}
              t={t}
              onUpdateProfile={handleUpdateProfile}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'wishlist' && (
            <WishlistTab
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
              isHindi={isHindi}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'repairs' && (
            <RepairBookingsTab
              repairs={repairs}
              repairsLoading={repairsLoading}
              isHindi={isHindi}
              handleCancelRepair={handleCancelRepair}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;

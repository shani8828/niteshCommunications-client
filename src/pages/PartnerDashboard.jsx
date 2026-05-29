import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import Loader from '../components/common/Loader';
import api from '../utils/api';
import { Truck, Clock, MapPin, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';

const PartnerDashboard = () => {
  const { t } = useTranslation();
  
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusNotes, setStatusNotes] = useState({});

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/partner');
      const data = response.data;
      setActiveDeliveries(data.activeAssignments || []);
      setHistory(data.deliveryHistory || []);
      setProfile(data.partnerProfile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      const response = await api.put('/dashboard/partner/availability');
      const data = response.data;
      setProfile((prev) => ({ ...prev, isAvailable: data.isAvailable }));
      const statusLabel = data.isAvailable ? t('delivery:available', 'AVAILABLE') : t('delivery:offline', 'OFFLINE');
      showToast.success(`${t('delivery:status_updated', 'Status updated')}: ${statusLabel}`);
    } catch (err) {
      showToast.error(t('delivery:error_status', 'Failed to change status'));
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const note = statusNotes[orderId] || `Status updated to ${newStatus} by partner`;
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus, note });
      showToast.success(t('delivery:status_updated'));
      setStatusNotes((prev) => ({ ...prev, [orderId]: '' }));
      fetchDashboardData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('delivery:error_update_status', 'Failed to update status');
      showToast.error(errorMessage);
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
      {/* Profile Header */}
      {profile && (
        <div className="p-6 md:p-8 rounded-2xl glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-slate-900">
                {t('delivery:welcome', 'Welcome')}, {profile.name}
              </h2>
              <button
                onClick={fetchDashboardData}
                className="p-1.5 bg-slate-100 border border-slate-200 rounded text-brand-cyan hover:bg-slate-200 flex cursor-pointer transition-all"
                title={t('common:loading', 'Refresh')}
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {t('delivery:executive', 'Delivery Executive')} | {t('delivery:phone')}: {profile.mobile}
            </p>
          </div>

          <div className="flex items-center gap-3 text-slate-700 text-sm cursor-pointer" onClick={handleToggleAvailability}>
            <span>{t('delivery:availability')}: <strong className={profile.isAvailable ? 'text-emerald-500' : 'text-slate-500'}>{profile.isAvailable ? t('delivery:available', 'AVAILABLE') : t('delivery:offline', 'OFFLINE')}</strong></span>
            {profile.isAvailable ? (
              <ToggleRight size={38} className="text-emerald-500 cursor-pointer" />
            ) : (
              <ToggleLeft size={38} className="text-slate-400 cursor-pointer" />
            )}
          </div>
        </div>
      )}

      {/* Main layout grids */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        {/* Active Assignments */}
        <div className="w-full">
          <h3 className="font-heading text-lg font-bold text-slate-900 mb-5">{t('delivery:active_deliveries')} ({activeDeliveries.length})</h3>
          
          {activeDeliveries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 glass-card rounded-2xl text-sm">
              {t('delivery:no_shipments')}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeDeliveries.map((order) => (
                <div key={order._id} className="p-6 glass-card rounded-2xl flex flex-col gap-4">
                  {/* Summary */}
                  <div className="flex justify-between items-center text-sm text-slate-900">
                    <span>{t('delivery:order_id')}: <strong className="text-brand-cyan">{order.orderId}</strong></span>
                    <span className="bg-brand-cyan/20 text-brand-cyan text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {order.deliveryStatus}
                    </span>
                  </div>

                  {/* Customer details */}
                  <div className="flex flex-col gap-2.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{t('delivery:address')}: {order.customerAddress}</span>
                    </div>
                    {order.coordinates && order.coordinates.latitude && order.coordinates.longitude && (
                      <div className="pl-6">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${order.coordinates.latitude},${order.coordinates.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200/50 rounded-lg"
                        >
                          <MapPin size={12} />
                          <span>नक्शे पर देखें / Navigate on Map</span>
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-brand-cyan" />
                      <span>{t('delivery:phone')}: {order.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-brand-cyan" />
                      <span>{t('common:order_placed', 'Placed')}: {new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <hr className="border-t border-slate-100" />

                  {/* Actions status updates */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder={t('delivery:log_placeholder', 'Add delivery notes (optional)...')}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 transition-all text-xs"
                        value={statusNotes[order._id] || ''}
                        onChange={(e) => setStatusNotes({ ...statusNotes, [order._id]: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-2">
                      {order.deliveryStatus === 'Waiting Pickup' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Picked Up')}
                          className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg cursor-pointer hover:brightness-105 transition-all"
                        >
                          {t('delivery:mark_picked_up')}
                        </button>
                      )}
                      {order.deliveryStatus === 'Picked Up' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'On The Way')}
                          className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg cursor-pointer hover:brightness-105 transition-all"
                        >
                          {t('delivery:mark_on_the_way')}
                        </button>
                      )}
                      {order.deliveryStatus === 'On The Way' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                          className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer transition-all"
                        >
                          {t('delivery:mark_delivered')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="w-full">
          <h3 className="font-heading text-lg font-bold text-slate-900 mb-5">{t('delivery:delivery_history')}</h3>
          {history.length === 0 ? (
            <p className="text-xs text-slate-500">{t('delivery:no_past_deliveries', 'No past deliveries recorded yet.')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((order) => (
                <div key={order._id} className="p-4 glass-card rounded-xl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-950">{order.orderId}</span>
                    <span
                      className={`font-bold ${
                        order.deliveryStatus === 'Delivered' ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {order.deliveryStatus.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 truncate">
                    {t('delivery:address')}: {order.customerAddress}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {t('common:delivered', 'Delivered')}: {new Date(order.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import OrderTimeline from '../components/common/OrderTimeline';
import { showToast } from '../utils/toast';
import { ShoppingBag, CreditCard, User, Phone, MapPin, RefreshCw } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation(['cart', 'common', 'notifications']);
  const { getHeaders, user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setOrder(data);
      } else {
        showToast.error(data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== 'history') {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRetryPayment = async () => {
    setRetrying(true);
    try {
      const response = await fetch(`/api/orders/retry-payment/${id}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.message || 'Retry payment failed');
        setRetrying(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast.error('Razorpay SDK failed to load');
        setRetrying(false);
        return;
      }

      const options = {
        key: 'rzp_test_dummy_key_id',
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'NITESH COMMUNICATIONS',
        description: 'Retry Payment for order ' + order.orderId,
        order_id: data.razorpayOrder.id,
        prefill: {
          name: user.name,
          contact: order.customerPhone,
          email: user.email || '',
        },
        theme: {
          color: '#2563eb',
        },
        handler: async (response) => {
          setLoading(true);
          try {
            const verifyResponse = await fetch('/api/orders/verify', {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({
                orderId: order._id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              showToast.success('Payment Verified! Order confirmed.');
              fetchOrderDetails();
            } else {
              showToast.error('Signature verification failed');
            }
          } catch (err) {
            showToast.error('Error during signature verification');
          } finally {
            setLoading(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (error) {
      showToast.error('Failed to retry payment');
    } finally {
      setRetrying(false);
    }
  };

  const currentLang = i18n.language || 'hi';

  if (loading) return <Loader fullPage />;

  // User Order History redirection fallback
  if (id === 'history' || !order) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center bg-white">
        <h2 className="font-heading text-2xl font-extrabold text-slate-800 mb-2">Order Tracking & History</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          To track a specific order, please use the unique tracking link from your profile dashboard or order confirmation.
        </p>
        <Link to="/shop" className="px-6 py-2.5 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all border-0 shadow-sm inline-block">
          {t('cart:go_shopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">
            Order ID: {order.orderId}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            Tracking Details
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrderDetails}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-blue-600 border-slate-200 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer border-0"
            title="Refresh Order Status"
          >
            <RefreshCw size={14} /> Refresh Status
          </button>
          <Link to="/order-tracking/history" className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 block">
            Orders History
          </Link>
        </div>
      </div>

      {/* Stepper Timeline Panel */}
      <div className="bg-slate-50 border border-slate-200 p-6 md:p-8 rounded-2xl mb-8 shadow-sm">
        <OrderTimeline currentStatus={order.deliveryStatus} timeline={order.timeline} />
      </div>

      {/* Grid: Order summary & Customer info */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
        {/* Left Column: Order Items Summary */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm h-fit">
          <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
            <ShoppingBag size={18} className="text-blue-600" /> Items Ordered
          </h3>
          <div className="flex flex-col gap-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0">
                <div className="flex gap-4 items-center">
                  <img src={item.product?.images[0]} alt={item.product?.name.en} className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 object-contain flex-shrink-0 mix-blend-multiply" />
                  <div>
                    <p className="font-heading text-sm font-semibold text-slate-800">
                      {item.product?.name[currentLang]}
                    </p>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Price: ₹{item.price} | Qty: {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm text-slate-800">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <hr className="border-t border-slate-100 my-4" />

          <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-700">₹{order.totalAmount}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
            <span>Delivery</span>
            <span className="text-emerald-600 font-bold">FREE</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-slate-800 mt-4">
            <span>Total</span>
            <span className="text-base text-blue-600">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Right Column: Address and Payment Info */}
        <div className="flex flex-col gap-6">
          {/* Customer and Delivery address */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-4">
            <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
              <User size={18} className="text-blue-600" /> Customer & Delivery
            </h3>
            <div className="flex flex-col gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span>Customer Name: <strong>{order.user?.name}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                <span>Contact Phone: {order.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 mt-0.5" />
                <span className="leading-relaxed">Address: {order.customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Payment Status box */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-4">
            <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-blue-600" /> Payment Details
            </h3>
            <div className="flex flex-col gap-3 text-xs text-slate-600">
              <div>
                <span>Payment Mode: <strong>{order.paymentType}</strong></span>
              </div>
              <div>
                <span>
                  Payment Status:{' '}
                  <span
                    className={`font-bold ${
                      order.paymentStatus === 'Paid'
                        ? 'text-emerald-600'
                        : order.paymentStatus === 'Failed'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </span>
              </div>
              <div>
                <span>Date Placed: {new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {order.paymentType === 'Online' && order.paymentStatus !== 'Paid' && (
              <button
                onClick={handleRetryPayment}
                className="w-full py-2.5 mt-4 font-heading font-bold text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0"
                disabled={retrying}
              >
                {retrying ? 'Processing...' : 'Retry Razorpay Payment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

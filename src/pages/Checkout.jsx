import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import Loader from '../components/common/Loader';
import { CreditCard, Truck, MapPin } from 'lucide-react';

const Checkout = () => {
  const { t, i18n } = useTranslation(['cart', 'common', 'notifications']);
  const navigate = useNavigate();
  const { user, getHeaders } = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentType, setPaymentType] = useState('COD');
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setAddress(user.address || '');
      setPhone(user.mobile || '');
      if (user.coordinates && user.coordinates.latitude && user.coordinates.longitude) {
        setCoordinates({
          latitude: user.coordinates.latitude,
          longitude: user.coordinates.longitude
        });
      }
    }
  }, [user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast.error("आपका ब्राउज़र लोकेशन का समर्थन नहीं करता है / Your browser does not support geolocation");
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
            showToast.success("लोकेशन सफलतापूर्वक प्राप्त की गई / Location retrieved successfully");
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          console.error(err);
          setAddress(`${latitude}, ${longitude}`);
          showToast.warning("लोकेशन तो मिल गई, पर पता खोजने में समस्या हुई / Location retrieved, but failed to fetch address name");
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        console.error(error);
        setGeolocating(false);
        showToast.error("लोकेशन अनुमति अस्वीकृत या उपलब्ध नहीं है / Location permission denied or unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      showToast.error(t('notifications:fill_all_fields'));
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        paymentType,
        customerAddress: address,
        customerPhone: phone,
        coordinates,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (!response.ok) {
        showToast.error(data.message || t('notifications:server_error'));
        setLoading(false);
        return;
      }

      if (paymentType === 'COD') {
        clearCart();
        showToast.success(t('notifications:payment_success'));
        setLoading(false);
        navigate(`/order-tracking/${data.order._id}`);
      } else {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          showToast.error('Razorpay SDK failed to load. Are you offline?');
          setLoading(false);
          return;
        }

        const rzpKey = 'rzp_test_dummy_key_id';

        const options = {
          key: rzpKey,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: 'NITESH COMMUNICATIONS',
          description: 'Payment for order NC-' + data.order.orderId,
          order_id: data.razorpayOrder.id,
          prefill: {
            name: user.name,
            contact: phone,
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
                  orderId: data.order._id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyResponse.json();
              if (verifyResponse.ok) {
                clearCart();
                showToast.success(t('notifications:payment_success'));
                navigate(`/order-tracking/${data.order._id}`);
              } else {
                showToast.error(verifyData.message || 'Signature verification failed');
              }
            } catch (err) {
              showToast.error('Error during signature verification');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              showToast.warning('Payment window closed. Order is pending.');
              navigate(`/order-tracking/${data.order._id}`);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
        setLoading(false);
      }
    } catch (error) {
      showToast.error(t('notifications:server_error'));
      setLoading(false);
    }
  };

  const currentLang = i18n.language || 'hi';

  if (loading) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white">
      <h2 className="font-heading text-3xl font-extrabold text-slate-800 mb-6">
        Checkout
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-8">
        {/* Left Column: Form Details */}
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6 w-full">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="font-heading text-base font-bold text-slate-800 mb-2">{t('cart:billing_details')}</h3>
            <div className="flex flex-col">
              <label className="block mb-1.5 text-xs font-semibold text-slate-500">{t('common:phone')} *</label>
              <input
                type="tel"
                maxLength="10"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                placeholder="10 digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-500">{t('common:address')} *</label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geolocating}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-semibold disabled:text-slate-400 transition-colors"
                >
                  <MapPin size={14} className={geolocating ? "animate-bounce" : ""} />
                  {geolocating ? "खोज रहे हैं... / Locating..." : "वर्तमान लोकेशन / Use Location"}
                </button>
              </div>
              <textarea
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                rows="3"
                placeholder="House details, Landmark, Karamdanda Mod, Ayodhya..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              {coordinates && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-inner h-32 w-full relative">
                  <iframe
                    title="Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`}
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="font-heading text-base font-bold text-slate-800 mb-2">{t('cart:select_payment')}</h3>
            <div className="flex flex-col gap-3">
              {/* COD Option */}
              <div
                className={`flex items-start gap-4 border p-5 rounded-2xl cursor-pointer transition-colors ${
                  paymentType === 'COD' ? 'border-blue-600 bg-blue-50/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
                onClick={() => setPaymentType('COD')}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="COD"
                  checked={paymentType === 'COD'}
                  onChange={() => {}}
                  className="hidden"
                />
                <Truck size={20} className={`mt-0.5 ${paymentType === 'COD' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="flex flex-col gap-0.5 text-slate-800">
                  <p className="text-sm font-semibold">{t('cart:cod')}</p>
                  <p className="text-xs text-slate-500">Pay in cash at your doorstep when items arrive.</p>
                </div>
              </div>

              {/* Razorpay Option */}
              <div
                className={`flex items-start gap-4 border p-5 rounded-2xl cursor-pointer transition-colors ${
                  paymentType === 'Online' ? 'border-blue-600 bg-blue-50/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
                onClick={() => setPaymentType('Online')}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="Online"
                  checked={paymentType === 'Online'}
                  onChange={() => {}}
                  className="hidden"
                />
                <CreditCard size={20} className={`mt-0.5 ${paymentType === 'Online' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="flex flex-col gap-0.5 text-slate-800">
                  <p className="text-sm font-semibold">{t('cart:online')}</p>
                  <p className="text-xs text-slate-500">Pay instantly via UPI, Credit/Debit cards, Net Banking.</p>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 mt-2 font-heading font-bold text-base bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0">
            {t('cart:place_order')} (₹{cartSubtotal})
          </button>
        </form>

        {/* Right Column: Order Items Summary */}
        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm h-fit w-full">
          <h3 className="font-heading text-base font-bold text-blue-600 mb-5">{t('cart:items_summary')}</h3>
          <div className="flex flex-col gap-3">
            {cartItems.map((item) => (
              <div key={item.product._id} className="flex justify-between items-center text-xs text-slate-600">
                <span className="max-w-[80%] truncate">
                  {item.product.name[currentLang]} <strong className="text-slate-500 font-bold ml-1">x{item.quantity}</strong>
                </span>
                <span className="font-semibold text-slate-800">₹{item.product.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <hr className="border-t border-slate-100 my-4" />

          <div className="flex justify-between items-center text-xs text-slate-600 mb-3">
            <span>{t('cart:subtotal')}</span>
            <span className="font-semibold text-slate-800">₹{cartSubtotal}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600 mb-4">
            <span>{t('cart:delivery_charges')}</span>
            <span className="text-emerald-600 font-bold">{t('cart:free')}</span>
          </div>

          <hr className="border-t border-slate-100 my-4" />

          <div className="flex justify-between items-center text-sm font-bold text-slate-800">
            <span>{t('cart:total')}</span>
            <span className="text-lg text-blue-600">₹{cartSubtotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const OrdersHistoryTab = ({
  orders,
  ordersLoading,
  isHindi,
  currentLang,
  handleCancelClick,
}) => {
  if (ordersLoading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col items-center gap-4 animate-fadeIn">
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
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        {isHindi ? 'ऑर्डर इतिहास' : 'Order History'}
      </h3>

      <div className="flex flex-col gap-4">
        {orders.map((ord) => (
          <div
            key={ord._id}
            className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
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
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors truncate max-w-[200px]"
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

            <div className="flex items-center sm:items-end flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
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
    </div>
  );
};

export default React.memo(OrdersHistoryTab);

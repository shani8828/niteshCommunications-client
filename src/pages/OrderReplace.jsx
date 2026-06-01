import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../context/BreadcrumbContext';
import Loader from '../components/common/Loader';
import { showToast } from '../utils/toast';
import api from '../utils/api';
import { ArrowLeft, CheckSquare, Square, ShieldAlert } from 'lucide-react';

const OrderReplace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['cart', 'common']);
  const { setCrumbs } = useBreadcrumbs();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Replace Form State
  const [selectedItems, setSelectedItems] = useState({}); // { productId: quantity }
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        const ord = response.data;
        setOrder(ord);

        // Pre-select replaceable items
        const initialSelected = {};
        ord.items.forEach((item) => {
          if (item.product?.returnPolicy === 'Replace') {
            initialSelected[item.product._id] = item.quantity;
          }
        });
        setSelectedItems(initialSelected);

        setCrumbs([
          { label: t('common:order_summary'), link: '/order-tracking/history' },
          { label: `Order #${ord.orderId}`, link: `/order-tracking/${ord._id}` },
          { label: 'Request Replacement' },
        ]);
      } catch (err) {
        showToast.error(err.response?.data?.message || 'Failed to load order');
        navigate('/order-tracking/history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate, setCrumbs, t]);

  const toggleItem = (prodId, maxQty) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[prodId]) {
        delete copy[prodId];
      } else {
        copy[prodId] = maxQty;
      }
      return copy;
    });
  };

  const handleQtyChange = (prodId, qty) => {
    setSelectedItems((prev) => ({
      ...prev,
      [prodId]: Number(qty),
    }));
  };

  const validateForm = () => {
    const selectedList = Object.keys(selectedItems);
    if (selectedList.length === 0) {
      showToast.error('Please select at least one item to replace');
      return false;
    }

    if (!reason) {
      showToast.error('Please select a reason for replacement');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const itemsPayload = Object.entries(selectedItems).map(([productId, quantity]) => ({
        product: productId,
        quantity,
      }));

      const payload = {
        type: 'Replace',
        reason: `${reason}${comments ? ` - Comments: ${comments}` : ''}`,
        items: itemsPayload,
      };

      await api.post(`/orders/${id}/return-replace`, payload);
      showToast.success('Replacement request submitted successfully!');
      navigate(`/order-tracking/${id}`);
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to submit replacement request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!order) return null;

  const replaceableItems = order.items.filter((item) => item.product?.returnPolicy === 'Replace');

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-20 bg-white">
      <Link
        to={`/order-tracking/${order._id}`}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm mb-6 font-semibold"
      >
        <ArrowLeft size={16} /> Back to Order Details
      </Link>

      <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">
        Request Product Replacement
      </h2>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        Please fill out this form to request a replacement for eligible items in Order #{order.orderId}.
      </p>

      {replaceableItems.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
          <ShieldAlert className="flex-shrink-0 mt-0.5" size={18} />
          <div>
            <strong>No items eligible for replacement:</strong> There are no products in this order that allow replacements. Non-replaceable products cannot be exchanged.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Select Items */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
              1. Select Items to Replace
            </h3>
            <div className="flex flex-col gap-4">
              {replaceableItems.map((item) => {
                const isSelected = !!selectedItems[item.product._id];
                return (
                  <div
                    key={item._id}
                    className={`flex items-start md:items-center justify-between p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-white border-blue-500 shadow-md shadow-blue-500/5'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.product._id, item.quantity)}
                        className="text-blue-600 focus:outline-none mt-1 md:mt-0"
                      >
                        {isSelected ? (
                          <CheckSquare size={20} className="fill-blue-100" />
                        ) : (
                          <Square size={20} className="text-slate-400" />
                        )}
                      </button>
                      <img
                        src={item.product?.images[0]}
                        alt={item.product?.name.en}
                        className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 object-contain flex-shrink-0 mix-blend-multiply"
                      />
                      <div>
                        <p className="font-heading text-sm font-semibold text-slate-800">
                          {item.product?.name.en}
                        </p>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Original Price: ₹{item.price} | Max Qty: {item.quantity}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2 mt-3 md:mt-0">
                        <label className="text-xs text-slate-500 font-semibold">Qty:</label>
                        <select
                          value={selectedItems[item.product._id]}
                          onChange={(e) => handleQtyChange(item.product._id, e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 outline-none text-xs focus:border-blue-500 cursor-pointer"
                        >
                          {Array.from({ length: item.quantity }, (_, index) => index + 1).map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason for Replacement */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
              2. Reason for Replacement
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-2">Select Reason *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500 cursor-pointer"
                  required
                >
                  <option value="">-- Choose Reason --</option>
                  <option value="Defective / Damaged product">Defective / Damaged product (दोषपूर्ण/क्षतिग्रस्त उत्पाद)</option>
                  <option value="Received wrong item">Received wrong item (गलत वस्तु प्राप्त हुई)</option>
                  <option value="Item not as described">Item not as described (विवरण के अनुसार नहीं)</option>
                  <option value="Other">Other (अन्य)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-2">Additional Comments (Optional)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500 resize-none"
                  placeholder="Provide details about the issue..."
                />
              </div>
            </div>

            {/* Replacement Processing Warnings */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-xs text-amber-800 leading-relaxed flex gap-3">
              <ShieldAlert className="flex-shrink-0 mt-0.5" size={16} />
              <div>
                <strong>Replacement Delivery Notice:</strong> Replacement products are dispatched within 24 to 48 hours once our support team validates the request and coordinates the reverse pick-up of the original items.
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 font-heading font-bold text-sm bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-md shadow-amber-500/10 cursor-pointer border-0 mt-2 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Submitting Request...' : 'Confirm Replacement Request'}
          </button>
        </form>
      )}
    </div>
  );
};

export default OrderReplace;

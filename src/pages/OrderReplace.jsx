import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../context/BreadcrumbContext';
import Loader from '../components/common/Loader';
import { showToast } from '../utils/toast';
import api from '../utils/api';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

// Modular Components
import ReplaceItemsSelector from '../components/orders/ReplaceItemsSelector';
import ReplaceReasonForm from '../components/orders/ReplaceReasonForm';

const OrderReplace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['cart', 'common']);
  const { setCrumbs } = useBreadcrumbs();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Replace Form State - Managed via Ref to bypass parent keystroke re-renders
  const [selectedItems, setSelectedItems] = useState({}); // { productId: quantity }
  const formValuesRef = React.useRef({
    reason: "",
    comments: "",
  });

  const handleUpdateFormValues = useCallback((updates) => {
    formValuesRef.current = {
      ...formValuesRef.current,
      ...updates,
    };
  }, []);

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
          { label: t('common:order_summary'), link: '/orders' },
          { label: `Order #${ord.orderId}`, link: `/order-tracking/${ord._id}` },
          { label: 'Request Replacement' },
        ]);
      } catch (err) {
        showToast.error(err.response?.data?.message || 'Failed to load order');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate, setCrumbs, t]);

  const toggleItem = useCallback((prodId, maxQty) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[prodId]) {
        delete copy[prodId];
      } else {
        copy[prodId] = maxQty;
      }
      return copy;
    });
  }, []);

  const handleQtyChange = useCallback((prodId, qty) => {
    setSelectedItems((prev) => ({
      ...prev,
      [prodId]: Number(qty),
    }));
  }, []);

  const validateForm = () => {
    const selectedList = Object.keys(selectedItems);
    if (selectedList.length === 0) {
      showToast.error('Please select at least one item to replace');
      return false;
    }

    const { reason } = formValuesRef.current;
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

      const { reason, comments } = formValuesRef.current;

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

      <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 mb-2 text-left">
        Request Product Replacement
      </h2>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed text-left">
        Please fill out this form to request a replacement for eligible items in Order #{order.orderId}.
      </p>

      {replaceableItems.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded text-sm mb-6 flex gap-3 text-left">
          <ShieldAlert className="flex-shrink-0 mt-0.5" size={18} />
          <div>
            <strong>No items eligible for replacement:</strong> There are no products in this order that allow replacements. Non-replaceable products cannot be exchanged.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <ReplaceItemsSelector
            replaceableItems={replaceableItems}
            selectedItems={selectedItems}
            toggleItem={toggleItem}
            handleQtyChange={handleQtyChange}
          />

          <ReplaceReasonForm
            onUpdate={handleUpdateFormValues}
          />

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 font-heading font-bold text-sm bg-amber-600 text-white rounded hover:bg-amber-700 shadow-md shadow-amber-500/10 cursor-pointer border-0 mt-2 disabled:opacity-50 transition-all"
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

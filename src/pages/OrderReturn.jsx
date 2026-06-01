import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../context/BreadcrumbContext';
import Loader from '../components/common/Loader';
import { showToast } from '../utils/toast';
import api from '../utils/api';
import { ArrowLeft, CheckSquare, Square, CreditCard, ShieldAlert } from 'lucide-react';

const OrderReturn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['cart', 'common']);
  const { setCrumbs } = useBreadcrumbs();

  const queryParams = new URLSearchParams(location.search);
  const isCancelMode = queryParams.get('cancel') === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Return Form State
  const [selectedItems, setSelectedItems] = useState({}); // { productId: quantity }
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [refundMethod, setRefundMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        const ord = response.data;
        setOrder(ord);

        // Pre-select returnable items
        const initialSelected = {};
        ord.items.forEach((item) => {
          if (isCancelMode || item.product?.returnPolicy === 'Return') {
            initialSelected[item.product._id] = item.quantity;
          }
        });
        setSelectedItems(initialSelected);

        setCrumbs([
          { label: t('common:order_summary'), link: '/order-tracking/history' },
          { label: `Order #${ord.orderId}`, link: `/order-tracking/${ord._id}` },
          { label: isCancelMode ? 'Order Cancellation Refund' : 'Request Return' },
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

  const handleInputChange = (field, val) => {
    setBankDetails((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const validateForm = () => {
    const selectedList = Object.keys(selectedItems);
    if (selectedList.length === 0) {
      showToast.error('Please select at least one item to return');
      return false;
    }

    if (!reason) {
      showToast.error('Please select a reason for return');
      return false;
    }

    if (refundMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        showToast.error('Please enter a valid UPI ID (e.g. name@upi)');
        return false;
      }
    } else {
      if (!bankDetails.accountHolderName.trim()) {
        showToast.error('Please enter account holder name');
        return false;
      }
      if (!bankDetails.accountNumber.trim()) {
        showToast.error('Please enter account number');
        return false;
      }
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        showToast.error('Account numbers do not match');
        return false;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(bankDetails.ifscCode.trim().toUpperCase())) {
        showToast.error('Please enter a valid 11-digit IFSC code (e.g. SBIN0001234)');
        return false;
      }
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
        type: 'Return',
        reason: `${reason}${comments ? ` - Comments: ${comments}` : ''}`,
        items: itemsPayload,
        refundMethod,
        upiId: refundMethod === 'UPI' ? upiId.trim() : undefined,
        bankDetails:
          refundMethod === 'Bank'
            ? {
                accountHolderName: bankDetails.accountHolderName.trim(),
                accountNumber: bankDetails.accountNumber.trim(),
                ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
              }
            : undefined,
      };

      if (isCancelMode) {
        await api.post(`/orders/${id}/cancel`, payload);
        showToast.success('Order cancelled and refund requested successfully!');
      } else {
        await api.post(`/orders/${id}/return-replace`, payload);
        showToast.success('Return request submitted successfully!');
      }
      navigate(`/order-tracking/${id}`);
    } catch (err) {
      showToast.error(
        err.response?.data?.message ||
          (isCancelMode ? 'Failed to cancel order' : 'Failed to submit return request')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!order) return null;

  const returnableItems = isCancelMode
    ? order.items
    : order.items.filter((item) => item.product?.returnPolicy === 'Return');

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-20 bg-white">
      <Link
        to={`/order-tracking/${order._id}`}
        className="items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm mb-6 inline-flex font-semibold"
      >
        <ArrowLeft size={16} /> Back to Order Details
      </Link>

      <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">
        {isCancelMode ? 'Cancel Order & Request Refund' : 'Request Return & Refund'}
      </h2>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        {isCancelMode
          ? `Please fill out this form to cancel Order #${order.orderId} and request your online payment refund.`
          : `Please fill out this form to request a return and refund for eligible items in Order #${order.orderId}.`}
      </p>

      {returnableItems.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
          <ShieldAlert className="flex-shrink-0 mt-0.5" size={18} />
          <div>
            <strong>No items eligible for return:</strong> There are no products in this order that allow returns. Non-returnable products cannot be returned.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Select Items */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
              {isCancelMode ? 'Items to be Cancelled' : '1. Select Items to Return'}
            </h3>
            <div className="flex flex-col gap-4">
              {returnableItems.map((item) => {
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
                      {!isCancelMode && (
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
                      )}
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
                      <div className="flex items-center gap-2 mt-3 md:mt-0 text-xs font-semibold text-slate-600">
                        <span>Qty:</span>
                        {isCancelMode ? (
                          <span>{item.quantity}</span>
                        ) : (
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
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason for Return */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
              {isCancelMode ? 'Reason for Cancellation' : '2. Reason for Return'}
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
                  {isCancelMode ? (
                    <>
                      <option value="">-- Choose Reason --</option>
                      <option value="Ordered by mistake">Ordered by mistake (गलती से ऑर्डर हो गया)</option>
                      <option value="Incorrect shipping details">Incorrect shipping details (गलत शिपिंग विवरण)</option>
                      <option value="Found better price elsewhere">Found better price elsewhere (कहीं और बेहतर कीमत मिली)</option>
                      <option value="Changed my mind">Changed my mind (विचार बदल गया)</option>
                      <option value="Other">Other (अन्य)</option>
                    </>
                  ) : (
                    <>
                      <option value="">-- Choose Reason --</option>
                      <option value="Defective / Damaged product">Defective / Damaged product (दोषपूर्ण/क्षतिग्रस्त उत्पाद)</option>
                      <option value="Received wrong item">Received wrong item (गलत वस्तु प्राप्त हुई)</option>
                      <option value="Item not as described">Item not as described (विवरण के अनुसार नहीं)</option>
                      <option value="Changed my mind">Changed my mind (विचार बदल गया)</option>
                      <option value="Other">Other (अन्य)</option>
                    </>
                  )}
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
          </div>

          {/* Refund Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" /> 3. Refund Destination Details
            </h3>

            <div className="flex items-center gap-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
                <input
                  type="radio"
                  name="refundMethod"
                  value="UPI"
                  checked={refundMethod === 'UPI'}
                  onChange={() => setRefundMethod('UPI')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                UPI ID
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
                <input
                  type="radio"
                  name="refundMethod"
                  value="Bank"
                  checked={refundMethod === 'Bank'}
                  onChange={() => setRefundMethod('Bank')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                Bank Account Transfer
              </label>
            </div>

            {refundMethod === 'UPI' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-2">UPI ID *</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
                    placeholder="example@upi"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter your complete UPI ID (e.g. mobileNumber@ybl, name@paytm).
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs text-slate-500 font-semibold block mb-2">Account Holder Name *</label>
                  <input
                    type="text"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
                    placeholder="As registered in bank passbook"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-2">Bank Account Number *</label>
                  <input
                    type="password"
                    value={bankDetails.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
                    placeholder="Enter account number"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-2">Confirm Bank Account Number *</label>
                  <input
                    type="text"
                    value={bankDetails.confirmAccountNumber}
                    onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
                    placeholder="Confirm account number"
                    required
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs text-slate-500 font-semibold block mb-2">Bank IFSC Code *</label>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
                    placeholder="SBIN0001234"
                    maxLength={11}
                    required
                  />
                </div>
              </div>
            )}

            {/* Warning Details */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-xs text-amber-800 leading-relaxed flex gap-3">
              <ShieldAlert className="flex-shrink-0 mt-0.5" size={16} />
              <div>
                <strong>Verify Transfer Information Carefully:</strong> Please ensure all entered UPI/Bank Account details are 100% correct. Nitesh Communications will not be held responsible for refunds sent to incorrect credentials. Refunds are processed securely within 5 to 7 working days once return logistics verify the items.
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 font-heading font-bold text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md shadow-red-500/10 cursor-pointer border-0 mt-2 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting
              ? (isCancelMode ? 'Cancelling Order...' : 'Submitting Return...')
              : (isCancelMode ? 'Confirm Order Cancellation & Refund' : 'Confirm Return & Refund')}
          </button>
        </form>
      )}
    </div>
  );
};

export default OrderReturn;

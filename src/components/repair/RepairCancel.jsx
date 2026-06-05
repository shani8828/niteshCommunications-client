import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../../context/BreadcrumbContext';
import Loader from '../common/Loader';
import { showToast } from '../../utils/toast';
import api from '../../utils/api';
import { ArrowLeft, CreditCard, ShieldAlert } from 'lucide-react';

const RepairCancel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['cart', 'common']);
  const { setCrumbs } = useBreadcrumbs();

  const currentLang = i18n.language || 'en';
  const isHindi = currentLang === 'hi';

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Refund Form State
  const [refundMethod, setRefundMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
  });

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        const response = await api.get(`/repairs/${id}`);
        setRepair(response.data);

        setCrumbs([
          { label: isHindi ? 'रिपेयर बुकिंग्स' : 'Repair Bookings', link: '/repair-bookings' },
          { label: isHindi ? 'बुकिंग रद्द करें' : 'Cancel Booking' },
        ]);
      } catch (err) {
        showToast.error(err.response?.data?.message || (isHindi ? 'रिपेयर बुकिंग लोड करने में विफल' : 'Failed to load repair booking'));
        navigate('/repair-bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [id, navigate, setCrumbs, isHindi]);

  const handleInputChange = (field, val) => {
    setBankDetails((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const validateForm = () => {
    if (refundMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        showToast.error(isHindi ? 'कृपया एक वैध UPI ID दर्ज करें (उदा. name@upi)' : 'Please enter a valid UPI ID (e.g. name@upi)');
        return false;
      }
    } else {
      if (!bankDetails.accountHolderName.trim()) {
        showToast.error(isHindi ? 'कृपया खाताधारक का नाम दर्ज करें' : 'Please enter account holder name');
        return false;
      }
      if (!bankDetails.accountNumber.trim()) {
        showToast.error(isHindi ? 'कृपया बैंक खाता नंबर दर्ज करें' : 'Please enter account number');
        return false;
      }
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        showToast.error(isHindi ? 'खाता नंबर मेल नहीं खाते' : 'Account numbers do not match');
        return false;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(bankDetails.ifscCode.trim().toUpperCase())) {
        showToast.error(isHindi ? 'कृपया एक वैध 11-अंकीय IFSC कोड दर्ज करें' : 'Please enter a valid 11-digit IFSC code (e.g. SBIN0001234)');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const confirmCancel = window.confirm(
      isHindi
        ? 'क्या आप सचमुच इस रिपेयर बुकिंग को रद्द करना चाहते हैं?'
        : 'Are you sure you want to cancel this repair booking?'
    );
    if (!confirmCancel) return;

    setSubmitting(true);
    try {
      const payload = {
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

      await api.post(`/repairs/${id}/cancel`, payload);
      showToast.success(isHindi ? 'रिपेयर बुकिंग रद्द कर दी गई है और रिफंड अनुरोध सबमिट हो गया है!' : 'Repair booking cancelled and refund requested successfully!');
      navigate('/repair-bookings');
    } catch (err) {
      showToast.error(err.response?.data?.message || (isHindi ? 'बुकिंग रद्द करने में विफल' : 'Failed to cancel repair booking'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!repair) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-20 bg-white">
      <Link
        to="/repair-bookings"
        className="items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm mb-6 inline-flex font-semibold"
      >
        <ArrowLeft size={16} /> {isHindi ? 'पीछे जाएं' : 'Back to Repair Bookings'}
      </Link>

      <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">
        {isHindi ? 'रिपेयर बुकिंग रद्द करें और रिफंड अनुरोध करें' : 'Cancel Repair Booking & Request Refund'}
      </h2>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        {isHindi
          ? `कृपया रिपेयर बुकिंग ID: ${repair._id.slice(-6).toUpperCase()} को रद्द करने और अपना रिफंड वापस पाने के लिए यह फ़ॉर्म भरें।`
          : `Please fill out this form to cancel Repair Booking ID: ${repair._id.slice(-6).toUpperCase()} and request your online payment refund.`}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Booking details card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-heading text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
            {isHindi ? 'बुकिंग विवरण' : 'Booking Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-500">{isHindi ? 'डिवाइस: ' : 'Device: '}</span>
              <span className="text-slate-800 font-bold">{repair.deviceBrand} {repair.deviceModel}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{isHindi ? 'रिपेयर श्रेणी: ' : 'Category: '}</span>
              <span className="text-slate-800 font-bold">{repair.serviceCategory}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{isHindi ? 'अनुमानित मूल्य: ' : 'Estimated Cost: '}</span>
              <span className="text-slate-800 font-bold">₹{repair.estimatedPrice}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{isHindi ? 'भुगतान स्थिति: ' : 'Payment Status: '}</span>
              <span className="text-emerald-600 font-bold">{repair.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Refund Details Form */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-heading text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={16} className="text-blue-600" />
            {isHindi ? 'रिफंड प्राप्ति का विवरण' : 'Refund Destination Details'}
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
              {isHindi ? 'बैंक ट्रांसफर' : 'Bank Account Transfer'}
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
                  {isHindi
                    ? 'कृपया अपनी पूरी UPI ID दर्ज करें (जैसे mobileNumber@ybl, name@paytm)।'
                    : 'Enter your complete UPI ID (e.g. mobileNumber@ybl, name@paytm).'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs text-slate-500 font-semibold block mb-2">
                  {isHindi ? 'खाताधारक का नाम *' : 'Account Holder Name *'}
                </label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
                  placeholder={isHindi ? 'बैंक पासबुक के अनुसार दर्ज करें' : 'As registered in bank passbook'}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-2">
                  {isHindi ? 'बैंक खाता संख्या *' : 'Bank Account Number *'}
                </label>
                <input
                  type="password"
                  value={bankDetails.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
                  placeholder={isHindi ? 'खाता नंबर दर्ज करें' : 'Enter account number'}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-2">
                  {isHindi ? 'खाता संख्या की पुष्टि करें *' : 'Confirm Bank Account Number *'}
                </label>
                <input
                  type="text"
                  value={bankDetails.confirmAccountNumber}
                  onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
                  placeholder={isHindi ? 'खाता नंबर पुनः दर्ज करें' : 'Confirm account number'}
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs text-slate-500 font-semibold block mb-2">
                  {isHindi ? 'बैंक IFSC कोड *' : 'Bank IFSC Code *'}
                </label>
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

          {/* Warning Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-xs text-amber-800 leading-relaxed flex gap-3">
            <ShieldAlert className="flex-shrink-0 mt-0.5" size={16} />
            <div>
              <strong>{isHindi ? 'सूचना:' : 'Verify Transfer Information Carefully:'}</strong>{' '}
              {isHindi
                ? 'कृपया सुनिश्चित करें कि दर्ज किया गया विवरण 100% सही है। गलत विवरण के लिए नितेश कम्युनिकेशंस जिम्मेदार नहीं होगा। रिफंड की प्रक्रिया 5 से 7 कार्य दिवसों में पूरी की जाती है।'
                : 'Please ensure all entered UPI/Bank Account details are 100% correct. Nitesh Communications will not be held responsible for refunds sent to incorrect credentials. Refunds are processed securely within 5 to 7 working days.'}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 font-heading font-bold text-sm bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-md shadow-rose-500/10 cursor-pointer border-0 mt-2 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting
            ? (isHindi ? 'रद्द किया जा रहा है...' : 'Cancelling booking...')
            : (isHindi ? 'बुकिंग रद्द करने और रिफंड की पुष्टि करें' : 'Confirm Cancellation & Request Refund')}
        </button>
      </form>
    </div>
  );
};

export default RepairCancel;

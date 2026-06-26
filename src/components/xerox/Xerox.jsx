import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toast';
import api from '../../utils/api';

// Steps components
import XeroxSetupStep from './XeroxSetupStep';
import XeroxLocationStep from './XeroxLocationStep';
import XeroxSummaryStep from './XeroxSummaryStep';

const Xerox = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [documents, setDocuments] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.mobile) setPhone(user.mobile);
      
      const userAddresses = user.addresses || [];
      const defaultAddr = userAddresses.find((a) => a.isDefault) || userAddresses[0];

      if (defaultAddr) {
        setAddress(defaultAddr.address || "");
        setLandmark(defaultAddr.landmark || "");
        if (defaultAddr.coordinates && defaultAddr.coordinates.latitude) {
          setCoordinates({
            latitude: defaultAddr.coordinates.latitude,
            longitude: defaultAddr.coordinates.longitude,
          });
        }
      } else if (user.address) {
        setAddress(user.address);
        if (user.coordinates && user.coordinates.latitude) {
          setCoordinates({
            latitude: user.coordinates.latitude,
            longitude: user.coordinates.longitude,
          });
        }
      }
    }
  }, [user]);

  // Load Razorpay checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCreateOrder = async (isBypassed = false) => {
    if (!name.trim() || !phone.trim()) {
      showToast.error('Please enter name and phone number');
      return;
    }
    if (phone.trim().length !== 10) {
      showToast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setProcessing(true);
    try {
      const fullAddress = landmark.trim()
        ? `${address} [Landmark/Detail: ${landmark.trim()}]`
        : address;

      // 1. Initialize printout payment (verifies range/time and creates Razorpay order without DB record)
      const res = await api.post('/printouts/initialize', {
        documents,
        coordinates,
      });

      const { razorpayOrder, totalAmount, isTomorrowDelivery, distance, razorpayKeyId } = res.data;

      if (isBypassed) {
        // Submit directly to bypass payment modal
        await api.post('/printouts', {
          name,
          phone,
          documents,
          address: fullAddress,
          coordinates,
          distance,
          isTomorrowDelivery,
          totalAmount,
          razorpayOrderId: razorpayOrder?.id || `dummy_order_${Date.now()}`,
          razorpayPaymentId: `dummy_payment_${Date.now()}`,
          razorpaySignature: 'bypass_payment',
        });

        showToast.success('Test order placed successfully (Bypassed)!');
        handleReset();
        onClose();
        return;
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast.error('Failed to load payment checkout. Please try again.');
        setProcessing(false);
        return;
      }

      // 3. Configure Razorpay modal
      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Nitesh Communications',
        description: 'Xerox & Document Printing Services',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            setProcessing(true);
            // Verify payment and create the order on successful signature only
            const verifyRes = await api.post('/printouts', {
              name,
              phone,
              documents,
              address: fullAddress,
              coordinates,
              distance,
              isTomorrowDelivery,
              totalAmount,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            showToast.success('Payment successful! Xerox order registered.');
            handleReset();
            onClose();
          } catch (verifyErr) {
            console.error(verifyErr);
            showToast.error(
              verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.'
            );
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name,
          contact: phone,
          email: user?.email || '',
        },
        theme: {
          color: '#0bc5ea', // brand-cyan color
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            showToast.warning('Checkout cancelled by user.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      showToast.error(err.response?.data?.message || 'Failed to place order.');
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setDocuments([]);
    setCoordinates(user?.coordinates && user.coordinates.latitude ? {
      latitude: user.coordinates.latitude,
      longitude: user.coordinates.longitude,
    } : null);
    setAddress(user?.address || '');
    setLandmark('');
    setName(user?.name || '');
    setPhone(user?.mobile || '');
    setProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
            <span className="font-heading font-extrabold text-sm text-slate-800 tracking-tight">
              Xerox & Printout Service
            </span>
          </div>

          <button
            onClick={() => {
              if (!processing) onClose();
            }}
            disabled={processing}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all border-0 bg-transparent cursor-pointer disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Progress Steps Indicator */}
        <div className="px-6 pt-5 pb-1 bg-slate-50/50 flex items-center justify-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 1 ? 'bg-brand-cyan text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > 1 ? <Check size={10} /> : '1'}
            </span>
            <span className="text-[10px] font-bold text-slate-600">Setup</span>
          </div>
          <div className="h-px bg-slate-200 w-12" />
          <div className="flex items-center gap-2">
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 2 ? 'bg-brand-cyan text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > 2 ? <Check size={10} /> : '2'}
            </span>
            <span className="text-[10px] font-bold text-slate-600">Location</span>
          </div>
          <div className="h-px bg-slate-200 w-12" />
          <div className="flex items-center gap-2">
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 3 ? 'bg-brand-cyan text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </span>
            <span className="text-[10px] font-bold text-slate-600">Confirm</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          {step === 1 && (
            <XeroxSetupStep
              documents={documents}
              setDocuments={setDocuments}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <XeroxLocationStep
              coordinates={coordinates}
              setCoordinates={setCoordinates}
              address={address}
              setAddress={setAddress}
              landmark={landmark}
              setLandmark={setLandmark}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              user={user}
            />
          )}

          {step === 3 && (
            <XeroxSummaryStep
              documents={documents}
              address={address}
              landmark={landmark}
              user={user}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              onBack={() => setStep(2)}
              onSubmit={handleCreateOrder}
              processing={processing}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Xerox;

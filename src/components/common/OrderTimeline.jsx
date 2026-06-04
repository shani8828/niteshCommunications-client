import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Package, Truck, Smile, ShieldAlert } from 'lucide-react';

/**
 * Stepper Timeline component showing current order status milestones
 * @param {string} currentStatus - Active status of the order
 * @param {Array} timeline - Complete log of updates
 */
const OrderTimeline = ({ currentStatus, timeline = [] }) => {
  const { t, i18n } = useTranslation(['common']);
  const currentLang = i18n.language || 'en';

  const isReturnFlow = currentStatus === 'Return Requested' || currentStatus === 'Returned';
  const isReplaceFlow = currentStatus === 'Replacement Requested' || currentStatus === 'Replaced';

  // 1. Return Steps (Delivered -> Return Requested -> Returned/Refunded)
  const returnSteps = [
    { key: 'Delivered', label: currentLang === 'hi' ? 'उत्पाद वितरित' : 'Item Delivered', icon: Check },
    { key: 'Return Requested', label: currentLang === 'hi' ? 'रिटर्न अनुरोध प्राप्त' : 'Return Request Received', icon: Clock },
    { key: 'Returned', label: currentLang === 'hi' ? 'वापसी और रिफंड पूरा' : 'Returned & Refunded', icon: Smile },
  ];

  // 2. Replacement Steps (Delivered -> Replacement Requested -> Replaced/Dispatched)
  const replaceSteps = [
    { key: 'Delivered', label: currentLang === 'hi' ? 'उत्पाद वितरित' : 'Item Delivered', icon: Check },
    { key: 'Replacement Requested', label: currentLang === 'hi' ? 'रिप्लेसमेंट अनुरोध प्राप्त' : 'Replacement Request Received', icon: Clock },
    { key: 'Replaced', label: currentLang === 'hi' ? 'रिप्लेसमेंट वितरित' : 'Replacement Delivered', icon: Smile },
  ];

  // 3. Standard Delivery Steps
  const standardSteps = [
    { key: 'Order Placed', label: t('order_placed'), icon: Clock },
    { key: 'Confirmed', label: t('confirmed'), icon: Check },
    { key: 'Packed', label: t('packed'), icon: Package },
    { key: 'On The Way', label: t('on_the_way'), icon: Truck },
    { key: 'Delivered', label: t('delivered'), icon: Smile },
  ];

  // Get current active index and steps list
  let steps = standardSteps;
  let currentIndex = 0;

  if (isReturnFlow) {
    steps = returnSteps;
    currentIndex = currentStatus === 'Return Requested' ? 1 : 2;
  } else if (isReplaceFlow) {
    steps = replaceSteps;
    currentIndex = currentStatus === 'Replacement Requested' ? 1 : 2;
  } else {
    // Standard status indexing
    switch (currentStatus) {
      case 'Order Placed':
        currentIndex = 0;
        break;
      case 'Confirmed':
        currentIndex = 1;
        break;
      case 'Packed':
        currentIndex = 2;
        break;
      case 'Waiting Pickup':
      case 'Picked Up':
      case 'On The Way':
        currentIndex = 3;
        break;
      case 'Delivered':
        currentIndex = 4;
        break;
      default:
        currentIndex = 0;
    }
  }

  // Helper to extract timeline timestamps
  const getTimelineDate = (stepKey) => {
    let match = null;
    if (stepKey === 'On The Way') {
      match = timeline.find(
        (t) =>
          t.status === 'On The Way' ||
          t.status === 'Picked Up' ||
          t.status === 'Waiting Pickup'
      );
    } else {
      match = timeline.find((t) => t.status === stepKey);
    }
    return match ? new Date(match.timestamp).toLocaleString(currentLang === 'hi' ? 'hi-IN' : 'en-US') : '';
  };

  // Compile banner messages and colors
  let bannerClass = '';
  let bannerText = '';
  let bannerSubtext = '';

  if (currentStatus === 'Cancelled') {
    bannerClass = 'bg-rose-50 border-rose-200 text-rose-700';
    bannerText = currentLang === 'hi' ? 'ऑर्डर रद्द कर दिया गया है' : 'Order Cancelled';
    bannerSubtext = currentLang === 'hi' ? 'यह ऑर्डर रद्द कर दिया गया है और अब आगे संसाधित नहीं किया जा सकता।' : 'This order has been cancelled and cannot be processed further.';
  } else if (currentStatus === 'Return Requested') {
    bannerClass = 'bg-purple-50 border-purple-200 text-purple-700';
    bannerText = currentLang === 'hi' ? 'रिटर्न अनुरोध लंबित' : 'Return Request Pending';
    bannerSubtext = currentLang === 'hi' ? 'आपका रिटर्न और रिफंड अनुरोध प्राप्त हो गया है। गुणवत्ता टीम जल्द ही मूल उत्पाद की जांच करेगी।' : 'Your return and refund request has been received. Our team will verify the original item shortly.';
  } else if (currentStatus === 'Returned') {
    bannerClass = 'bg-red-50 border-red-200 text-red-700';
    bannerText = currentLang === 'hi' ? 'लौटाया गया और रिफंड पूरा' : 'Returned & Refund Processed';
    bannerSubtext = currentLang === 'hi' ? 'उत्पाद वापस ले लिया गया है और रिफंड आपके चुने हुए माध्यम (UPI/बैंक) में संसाधित कर दिया गया है।' : 'The item has been returned and your refund has been successfully processed to your selected destination (UPI/Bank).';
  } else if (currentStatus === 'Replacement Requested') {
    bannerClass = 'bg-amber-50 border-amber-200 text-amber-700';
    bannerText = currentLang === 'hi' ? 'रिप्लेसमेंट अनुरोध लंबित' : 'Replacement Request Pending';
    bannerSubtext = currentLang === 'hi' ? 'आपका रिप्लेसमेंट अनुरोध लंबित है। हमारे प्रतिनिधि प्रतिस्थापन उत्पाद की डिलीवरी की तैयारी कर रहे हैं।' : 'Your replacement request is pending. Our support team is arranging the dispatch of your new exchange item.';
  } else if (currentStatus === 'Replaced') {
    bannerClass = 'bg-emerald-50 border-emerald-200 text-emerald-700';
    bannerText = currentLang === 'hi' ? 'उत्पाद सफलतापूर्वक प्रतिस्थापित' : 'Replacement Completed';
    bannerSubtext = currentLang === 'hi' ? 'प्रतिस्थापन उत्पाद आपको सफलतापूर्वक वितरित कर दिया गया है। हमारे साथ खरीदारी करने के लिए धन्यवाद!' : 'The exchange product has been successfully delivered to you. Thank you for shopping with us!';
  }

  return (
    <div className="w-full my-6 bg-white">
      {/* Banner Notifications */}
      {bannerText && (
        <div className={`p-4 rounded-xl text-center mb-8 border flex flex-col items-center justify-center ${bannerClass}`}>
          <span className="font-heading font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert size={16} /> {bannerText}
          </span>
          <p className="text-xs text-slate-600 mt-1 font-medium">{bannerSubtext}</p>
        </div>
      )}

      {/* Stepper Grid */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8 sm:gap-4 relative w-full px-4">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          const timestamp = getTimelineDate(step.key);

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 min-w-[120px] relative w-full">
              {/* Connector Line */}
              {idx > 0 && (
                <div
                  className={`hidden sm:block absolute top-[18px] left-[-50%] w-full h-[2px] z-0 ${
                    isCompleted ? 'bg-blue-600' : 'bg-slate-100'
                  }`}
                />
              )}

              {/* Icon Circle */}
              <div
                className={`w-9 h-9 rounded-full flex justify-center items-center z-10 transition-all shadow-sm border-2 ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                    : isCompleted
                    ? 'bg-blue-50 border-blue-600 text-blue-600'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                <StepIcon size={16} />
              </div>

              {/* Step Label */}
              <div className="text-center mt-3 z-10">
                <p
                  className={`font-heading font-bold text-xs sm:text-sm ${
                    isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                {timestamp && <span className="block text-[10px] text-slate-500 mt-1">{timestamp}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;

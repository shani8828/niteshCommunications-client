import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Package, Truck, Smile } from 'lucide-react';

/**
 * Stepper Timeline component showing current order status milestones
 * @param {string} currentStatus - Active status of the order
 * @param {Array} timeline - Complete log of updates
 */
const OrderTimeline = ({ currentStatus, timeline = [] }) => {
  const { t } = useTranslation();

  const steps = [
    { key: 'Order Placed', label: t('order_placed'), icon: Clock },
    { key: 'Confirmed', label: t('confirmed'), icon: Check },
    { key: 'Packed', label: t('packed'), icon: Package },
    { key: 'On The Way', label: t('on_the_way'), icon: Truck },
    { key: 'Delivered', label: t('delivered'), icon: Smile },
  ];

  const getStatusIndex = (status) => {
    switch (status) {
      case 'Order Placed': return 0;
      case 'Confirmed': return 1;
      case 'Packed': return 2;
      case 'Waiting Pickup':
      case 'Picked Up':
      case 'On The Way': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);

  const getTimelineDate = (stepKey) => {
    let match = null;
    if (stepKey === 'On The Way') {
      match = timeline.find((t) => t.status === 'On The Way' || t.status === 'Picked Up' || t.status === 'Waiting Pickup');
    } else {
      match = timeline.find((t) => t.status === stepKey);
    }
    return match ? new Date(match.timestamp).toLocaleString() : '';
  };

  return (
    <div className="w-full my-6 bg-white">
      {/* Handle Cancelled, Returned, Replaced states */}
      {(currentStatus === 'Cancelled' || currentStatus === 'Returned' || currentStatus === 'Replaced') && (
        <div className={`p-4 rounded-xl text-center mb-8 border ${
          currentStatus === 'Cancelled' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <span className="font-heading font-extrabold text-sm uppercase tracking-wider">{currentStatus}</span>
          <p className="text-xs text-slate-600 mt-1">
            This order status has been updated to <strong>{currentStatus}</strong>.
          </p>
        </div>
      )}

      {/* Stepper Grid */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8 sm:gap-4 relative w-full">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          const timestamp = getTimelineDate(step.key);

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 min-w-[120px] relative w-full">
              {/* Connector Line */}
              {idx > 0 && (
                <div className={`hidden sm:block absolute top-[18px] left-[-50%] w-full h-[2px] z-0 ${
                  isCompleted ? 'bg-blue-600' : 'bg-slate-100'
                }`} />
              )}

              {/* Icon Circle */}
              <div className={`w-9 h-9 rounded-full flex justify-center items-center z-10 transition-all shadow-sm border-2 ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                  : isCompleted
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                <StepIcon size={16} />
              </div>

              {/* Step Label */}
              <div className="text-center mt-3 z-10">
                <p className={`font-heading font-bold text-xs sm:text-sm ${
                  isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}>{step.label}</p>
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

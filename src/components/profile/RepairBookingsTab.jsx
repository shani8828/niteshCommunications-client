import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const RepairBookingsTab = ({
  repairs,
  repairsLoading,
  isHindi,
  handleCancelRepair,
}) => {
  if (repairsLoading && repairs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (repairs.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col items-center gap-4 animate-fadeIn">
        <Wrench size={36} className="text-slate-300" />
        <p className="text-sm text-slate-500">
          {isHindi ? 'आपने अभी तक कोई रिपेयर बुकिंग नहीं की है।' : 'You have not booked any repairs yet.'}
        </p>
        <Link
          to="/repairs"
          className="px-6 py-2.5 font-heading font-bold text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all border-0 shadow-sm"
        >
          {isHindi ? 'रिपेयर बुक करें' : 'Book a Repair'}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        {isHindi ? 'रिपेयर बुकिंग इतिहास' : 'Repair Booking History'}
      </h3>

      <div className="flex flex-col gap-4">
        {repairs.map((rep) => (
          <div
            key={rep._id}
            className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                  Booking ID: {rep._id.slice(-6).toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {new Date(rep.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 className="font-heading text-sm font-bold text-slate-800 mt-1 truncate">
                {rep.deviceBrand} {rep.deviceModel}
              </h4>
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded w-fit">
                {rep.serviceCategory}
              </span>

              <p className="text-xs text-slate-500 mt-1 break-words leading-relaxed">
                <span className="font-semibold text-slate-700">{isHindi ? 'समस्या: ' : 'Problem: '}</span>
                {rep.problemDescription}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="font-bold text-slate-800">₹{rep.estimatedPrice}</span>
                <span className="text-slate-400 font-semibold">|</span>
                <span className="text-slate-500 font-semibold">{isHindi ? `भुगतान: ${rep.paymentMethod}` : `Payment: ${rep.paymentMethod}`}</span>
              </div>
              
              {rep.notes && (
                <div className="mt-2 bg-amber-50/50 border border-amber-100 rounded-xl p-2.5 text-xs text-amber-800 break-words leading-relaxed">
                  <span className="font-bold">{isHindi ? 'नोट: ' : 'Admin Note: '}</span>
                  {rep.notes}
                </div>
              )}
            </div>

            <div className="flex items-start sm:items-end flex-col gap-2.5 w-full sm:w-auto flex-shrink-0 mt-3 sm:mt-0">
              <div className="flex gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rep.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-700'
                      : rep.paymentStatus === 'Refunded'
                      ? 'bg-amber-100 text-amber-700'
                      : rep.paymentStatus === 'Failed'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  Payment: {rep.paymentStatus}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rep.status === 'Delivered' || rep.status === 'Repaired'
                      ? 'bg-emerald-100 text-emerald-700'
                      : rep.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  Status: {rep.status}
                </span>
              </div>

              {['Pending', 'Approved'].includes(rep.status) && (
                <button
                  type="button"
                  onClick={() => handleCancelRepair(rep)}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl cursor-pointer transition-all w-full sm:w-auto text-center"
                >
                  {isHindi ? 'बुकिंग रद्द करें' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RepairBookingsTab);

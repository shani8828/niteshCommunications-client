import React, { useState } from "react";
import { CreditCard, ShieldAlert } from "lucide-react";

const RefundDestinationForm = ({
  onUpdate,
}) => {
  const [refundMethod, setRefundMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
  });

  const handleRefundMethodChange = (method) => {
    setRefundMethod(method);
    onUpdate({ refundMethod: method });
  };

  const handleUpiChange = (e) => {
    const val = e.target.value;
    setUpiId(val);
    onUpdate({ upiId: val });
  };

  const handleBankFieldChange = (field, val) => {
    const updatedDetails = { ...bankDetails, [field]: val };
    setBankDetails(updatedDetails);
    onUpdate({ bankDetails: updatedDetails });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm text-left animate-fadeIn">
      <h3 className="font-heading text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
        <CreditCard size={16} className="text-blue-600" /> 3. Refund Destination Details
      </h3>

      <div className="flex items-center gap-6 mb-6">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
          <input
            type="radio"
            name="refundMethod"
            value="UPI"
            checked={refundMethod === "UPI"}
            onChange={() => handleRefundMethodChange("UPI")}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          UPI ID
        </label>
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
          <input
            type="radio"
            name="refundMethod"
            value="Bank"
            checked={refundMethod === "Bank"}
            onChange={() => handleRefundMethodChange("Bank")}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          Bank Account Transfer
        </label>
      </div>

      {refundMethod === "UPI" ? (
        <div className="flex flex-col gap-4 text-xs md:text-sm">
          <div>
            <label className="text-xs text-slate-500 font-semibold block mb-2">
              UPI ID *
            </label>
            <input
              type="text"
              value={upiId}
              onChange={handleUpiChange}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-slate-500 font-semibold block mb-2">
              Account Holder Name *
            </label>
            <input
              type="text"
              value={bankDetails.accountHolderName}
              onChange={(e) =>
                handleBankFieldChange("accountHolderName", e.target.value)
              }
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
              placeholder="As registered in bank passbook"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-semibold block mb-2">
              Bank Account Number *
            </label>
            <input
              type="password"
              value={bankDetails.accountNumber}
              onChange={(e) =>
                handleBankFieldChange("accountNumber", e.target.value)
              }
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
              placeholder="Enter account number"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-semibold block mb-2">
              Confirm Bank Account Number *
            </label>
            <input
              type="text"
              value={bankDetails.confirmAccountNumber}
              onChange={(e) =>
                handleBankFieldChange("confirmAccountNumber", e.target.value)
              }
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500"
              placeholder="Confirm account number"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-slate-500 font-semibold block mb-2">
              Bank IFSC Code *
            </label>
            <input
              type="text"
              value={bankDetails.ifscCode}
              onChange={(e) =>
                handleBankFieldChange("ifscCode", e.target.value.toUpperCase())
              }
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
  );
};

export default React.memo(RefundDestinationForm);

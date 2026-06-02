import React, { useState } from "react";

const ReturnReasonForm = ({
  onUpdate,
  isCancelMode,
}) => {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");

  const handleReasonChange = (e) => {
    const val = e.target.value;
    setReason(val);
    onUpdate({ reason: val });
  };

  const handleCommentsChange = (e) => {
    const val = e.target.value;
    setComments(val);
    onUpdate({ comments: val });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
      <h3 className="font-heading text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
        {isCancelMode ? "Reason for Cancellation" : "2. Reason for Return"}
      </h3>
      <div className="flex flex-col gap-4 text-xs md:text-sm">
        <div>
          <label className="text-xs text-slate-500 font-semibold block mb-2">
            Select Reason *
          </label>
          <select
            value={reason}
            onChange={handleReasonChange}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500 cursor-pointer"
            required
          >
            {isCancelMode ? (
              <>
                <option value="">-- Choose Reason --</option>
                <option value="Ordered by mistake">
                  Ordered by mistake (गलती से ऑर्डर हो गया)
                </option>
                <option value="Incorrect shipping details">
                  Incorrect shipping details (गलत शिपिंग विवरण)
                </option>
                <option value="Found better price elsewhere">
                  Found better price elsewhere (कहीं और बेहतर कीमत मिली)
                </option>
                <option value="Changed my mind">
                  Changed my mind (विचार बदल गया)
                </option>
                <option value="Other">Other (अन्य)</option>
              </>
            ) : (
              <>
                <option value="">-- Choose Reason --</option>
                <option value="Defective / Damaged product">
                  Defective / Damaged product (दोषपूर्ण/क्षतिग्रस्त उत्पाद)
                </option>
                <option value="Received wrong item">
                  Received wrong item (गलत वस्तु प्राप्त हुई)
                </option>
                <option value="Item not as described">
                  Item not as described (विवरण के अनुसार नहीं)
                </option>
                <option value="Changed my mind">
                  Changed my mind (विचार बदल गया)
                </option>
                <option value="Other">Other (अन्य)</option>
              </>
            )}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-semibold block mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            value={comments}
            onChange={handleCommentsChange}
            rows="3"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none text-sm focus:border-blue-500 resize-none"
            placeholder="Provide details about the issue..."
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ReturnReasonForm);

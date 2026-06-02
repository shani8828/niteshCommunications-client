import React from "react";
import { CheckSquare, Square } from "lucide-react";

const ReplaceItemsSelector = ({
  replaceableItems,
  selectedItems,
  toggleItem,
  handleQtyChange,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm text-left animate-fadeIn">
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
                  ? "bg-white border-blue-500 shadow-md shadow-blue-500/5"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex gap-4 items-start">
                <button
                  type="button"
                  onClick={() => toggleItem(item.product._id, item.quantity)}
                  className="text-blue-600 focus:outline-none mt-1 md:mt-0 cursor-pointer border-0 bg-transparent"
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
                <div className="flex items-center gap-2 mt-3 md:mt-0 text-xs font-semibold text-slate-600">
                  <span>Qty:</span>
                  <select
                    value={selectedItems[item.product._id]}
                    onChange={(e) =>
                      handleQtyChange(item.product._id, e.target.value)
                    }
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 outline-none text-xs focus:border-blue-500 cursor-pointer"
                  >
                    {Array.from(
                      { length: item.quantity },
                      (_, index) => index + 1,
                    ).map((val) => (
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
  );
};

export default React.memo(ReplaceItemsSelector);

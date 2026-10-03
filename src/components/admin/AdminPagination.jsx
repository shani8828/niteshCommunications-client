import React from "react";

// Page numbers to show around the current page, e.g. 1 … 4 5 6 … 94
const getPageItems = (page, pages) => {
  const items = [];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);

  items.push(1);
  if (start > 2) items.push("start-gap");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < pages - 1) items.push("end-gap");
  if (pages > 1) items.push(pages);
  return items;
};

/**
 * Server-driven pagination for admin tables.
 */
const AdminPagination = ({ page, pages, total, onPageChange, currentLang }) => {
  if (!pages || pages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="flex justify-center items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
        >
          {currentLang === "hi" ? "पिछला" : "Prev"}
        </button>
        {getPageItems(page, pages).map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                page === item
                  ? "bg-brand-cyan border-brand-cyan text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="px-1 text-xs text-slate-400">
              …
            </span>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
        >
          {currentLang === "hi" ? "अगला" : "Next"}
        </button>
      </div>
      {typeof total === "number" && (
        <span className="text-[11px] text-slate-400">
          {currentLang === "hi" ? `कुल ${total}` : `${total} total`}
        </span>
      )}
    </div>
  );
};

export default React.memo(AdminPagination);

import React from "react";

const CscServiceCard = ({ item, currentLang }) => {
  const documentsList = item.documents?.[currentLang] || [];
  const hasDocuments = documentsList.length > 0;

  return (
    <div className="flex flex-col p-6 bg-white border border-slate-200/80 rounded-2xl transition-all hover:shadow-md hover:border-blue-200/80 gap-3 relative group w-full">
      <div className="flex justify-end items-start gap-4">
        <span className="text-[10px] bg-slate-50 text-slate-500 font-bold px-2.5 py-1 rounded-full border border-slate-200/60">
          {currentLang === "hi" ? "शुल्क: " : "Fee: "}
          {item.fee[currentLang] || item.fee.en}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="font-heading text-base font-bold text-slate-800">
          {item.title[currentLang] || item.title.en}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
          {item.desc[currentLang] || item.desc.en}
        </p>
      </div>

      {hasDocuments && (
        <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-1.5">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {currentLang === "hi" ? "आवश्यक दस्तावेज:" : "Required Documents:"}
          </p>
          <ul className="list-none p-0 m-0 flex flex-col gap-1">
            {documentsList.map((doc, dIdx) => (
              <li key={dIdx} className="text-xs text-slate-700 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(CscServiceCard, (prevProps, nextProps) => {
  return (
    prevProps.currentLang === nextProps.currentLang &&
    prevProps.item._id === nextProps.item._id &&
    prevProps.item.fee?.[prevProps.currentLang] === nextProps.item.fee?.[nextProps.currentLang] &&
    prevProps.item.title?.[prevProps.currentLang] === nextProps.item.title?.[nextProps.currentLang] &&
    prevProps.item.desc?.[prevProps.currentLang] === nextProps.item.desc?.[nextProps.currentLang] &&
    (prevProps.item.documents?.[prevProps.currentLang]?.join(",") === nextProps.item.documents?.[nextProps.currentLang]?.join(","))
  );
});

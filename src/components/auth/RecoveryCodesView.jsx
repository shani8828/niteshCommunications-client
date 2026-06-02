import React from "react";
import { CheckCircle, Copy, Download, Printer } from "lucide-react";

const RecoveryCodesView = ({
  generatedCodes,
  onCopy,
  onDownload,
  onPrint,
  onContinue,
}) => {
  return (
    <div className="w-full max-w-[500px] p-8 bg-white border border-slate-200/80 shadow-md rounded-2xl">
      <div className="flex flex-col items-center text-center">
        <CheckCircle className="text-emerald-500 w-14 h-14 mb-4" />
        <h2 className="text-xl font-heading font-extrabold text-slate-800 mb-2">
          महत्वपूर्ण सुरक्षा कोड / Recovery Codes
        </h2>
        <p className="text-xs text-rose-600 font-semibold mb-6 max-w-sm">
          इन कोडों को अभी सुरक्षित कर लें! पासवर्ड भूलने पर अकाउंट रीसेट
          करने के लिए केवल यही तरीका काम करेगा।
          <br />
          <span className="text-slate-500 font-normal">
            Save these codes now! If you forget your password, this is the
            only way to recover your account.
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 font-mono text-center">
        {generatedCodes.map((c, i) => (
          <div
            key={i}
            className="flex justify-between items-center px-4 py-2 bg-white border border-slate-100 rounded-lg shadow-sm"
          >
            <span className="text-xs text-slate-400">Code {i + 1}</span>
            <span className="font-bold text-slate-800 tracking-wider select-all">
              {c}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="flex flex-col items-center gap-1 justify-center py-2.5 px-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold text-[11px] cursor-pointer outline-none"
          >
            <Copy size={16} />
            <span>कॉपी / Copy</span>
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="flex flex-col items-center gap-1 justify-center py-2.5 px-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold text-[11px] cursor-pointer outline-none"
          >
            <Download size={16} />
            <span>डाउनलोड / Save TXT</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="flex flex-col items-center gap-1 justify-center py-2.5 px-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold text-[11px] cursor-pointer outline-none"
          >
            <Printer size={16} />
            <span>प्रिंट / Print</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full py-3 mt-4 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all border-0 cursor-pointer text-center outline-none"
        >
          आगे बढ़ें / Continue to Home
        </button>
      </div>
    </div>
  );
};

export default React.memo(RecoveryCodesView);

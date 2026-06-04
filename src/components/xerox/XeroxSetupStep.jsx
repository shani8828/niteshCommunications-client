import React, { useRef, useState } from 'react';
import { Upload, Trash2, Plus, FileText, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { showToast } from '../../utils/toast';
import { FileUploadSkeleton } from './XeroxSkeletons';

const XeroxSetupStep = ({ documents, setDocuments, onNext }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      const res = await api.post('/printouts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data && res.data.url) {
        setDocuments((prev) => [
          ...prev,
          {
            fileUrl: res.data.url,
            fileName: res.data.fileName || file.name,
            publicId: res.data.publicId || null,
            resourceType: res.data.resourceType || null,
            format: res.data.format || null,
            originalName: res.data.fileName || file.name,
            copies: 1,
            pages: 1,
            colorPreference: 'bw',
          },
        ]);
        showToast.success('Document uploaded successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateDoc = (index, key, value) => {
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleRemoveDoc = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Pricing calculations
  const calculateDocCost = (doc) => {
    const rate = doc.colorPreference === 'color' ? 7 : 5;
    return doc.pages * doc.copies * rate;
  };

  const subtotal = documents.reduce((sum, doc) => sum + calculateDocCost(doc), 0);
  const tax = 2;
  const total = subtotal > 0 ? subtotal + tax : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center md:text-left">
        <h3 className="font-heading text-lg font-bold text-slate-800">
          Upload & Setup Documents
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload documents of any format (PDF, JPG, PNG, DOCX, etc.). Configure print preferences per file.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
      />

      {/* Document List */}
      <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl transition-all hover:border-blue-200 hover:bg-blue-50/10 group relative"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-blue-100/60 rounded-xl text-blue-600 flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate" title={doc.fileName}>
                    {doc.fileName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Est. Cost: <span className="font-bold text-blue-600">₹{calculateDocCost(doc)}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveDoc(idx)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-3 gap-3 border-t border-slate-200/40 pt-3 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pages
                </label>
                <input
                  type="number"
                  min="1"
                  value={doc.pages}
                  onChange={(e) => handleUpdateDoc(idx, 'pages', Math.max(1, parseInt(e.target.value) || 1))}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Copies
                </label>
                <input
                  type="number"
                  min="1"
                  value={doc.copies}
                  onChange={(e) => handleUpdateDoc(idx, 'copies', Math.max(1, parseInt(e.target.value) || 1))}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Color Type
                </label>
                <select
                  value={doc.colorPreference}
                  onChange={(e) => handleUpdateDoc(idx, 'colorPreference', e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-cyan cursor-pointer w-full"
                >
                  <option value="bw">B&W (₹5/pg)</option>
                  <option value="color">Coloured (₹7/pg)</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* Upload Skeleton loader */}
        {uploading && <FileUploadSkeleton />}

        {documents.length === 0 && !uploading && (
          <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-full">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">No documents uploaded yet</p>
              <p className="text-[10px] text-slate-400 mt-1">Upload files to get started with xerox services</p>
            </div>
            <button
              type="button"
              onClick={handleUploadClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all border-0 shadow-sm shadow-blue-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Upload First File
            </button>
          </div>
        )}
      </div>

      {documents.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center bg-blue-50/40 p-4 border border-blue-100 rounded-2xl">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold transition-all border-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add More Document
            </button>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block">
                Total (Subtotal: ₹{subtotal} + Tax: ₹{tax})
              </span>
              <span className="text-base font-extrabold text-slate-900">
                ₹{total}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={uploading || documents.length === 0}
            className="w-full py-3 bg-brand-cyan hover:bg-brand-cyan-dark text-white rounded-2xl text-sm font-bold shadow-md shadow-brand-cyan/20 transition-all border-0 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-1.5 cursor-pointer mt-2"
          >
            Continue to Delivery Address <CheckCircle size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default XeroxSetupStep;

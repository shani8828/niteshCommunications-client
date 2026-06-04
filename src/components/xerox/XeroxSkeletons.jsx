import React from 'react';

export const PulseSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />
);

export const FileUploadSkeleton = () => (
  <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl w-full">
    <div className="flex justify-between items-center">
      <PulseSkeleton className="h-5 w-1/3" />
      <PulseSkeleton className="h-6 w-16" />
    </div>
    <div className="grid grid-cols-3 gap-3 mt-2">
      <div className="flex flex-col gap-1.5">
        <PulseSkeleton className="h-3 w-1/2" />
        <PulseSkeleton className="h-9 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <PulseSkeleton className="h-3 w-1/2" />
        <PulseSkeleton className="h-9 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <PulseSkeleton className="h-3 w-1/2" />
        <PulseSkeleton className="h-9 w-full" />
      </div>
    </div>
  </div>
);

export const AddressSkeleton = () => (
  <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl w-full">
    <PulseSkeleton className="h-4 w-1/4" />
    <PulseSkeleton className="h-10 w-full" />
    <PulseSkeleton className="h-3 w-1/2 mt-1" />
  </div>
);

export const ReceiptSkeleton = () => (
  <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl w-full">
    <PulseSkeleton className="h-5 w-1/3 mb-2" />
    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
      <PulseSkeleton className="h-4 w-1/4" />
      <PulseSkeleton className="h-4 w-12" />
    </div>
    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
      <PulseSkeleton className="h-4 w-1/4" />
      <PulseSkeleton className="h-4 w-12" />
    </div>
    <div className="flex justify-between items-center mt-1">
      <PulseSkeleton className="h-5 w-1/3" />
      <PulseSkeleton className="h-5 w-16" />
    </div>
  </div>
);

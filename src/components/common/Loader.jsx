import React from 'react';

/**
 * Reusable Global Loader Component
 * @param {boolean} fullPage - If true, displays a dark glassmorphic overlay over the entire viewport.
 */
const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen bg-slate-950/80 flex justify-center items-center z-[9999] backdrop-blur-md">
        <div className="bg-slate-900/75 border border-white/10 rounded-2xl p-10 flex flex-col items-center shadow-2xl gap-4">
          <div className="loader-spinner"></div>
          <p className="font-heading font-bold text-xl text-brand-cyan tracking-wider mt-2">NITESH COMMUNICATIONS</p>
          <span className="font-sans text-xs text-slate-400 text-center">Ek baar seva ka awsar awashya dein.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8 w-full">
      <div className="loader-spinner"></div>
    </div>
  );
};

export default Loader;

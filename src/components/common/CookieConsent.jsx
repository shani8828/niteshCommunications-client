import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Info, X } from 'lucide-react';

const CookieConsent = () => {
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const currentLang = i18n.language || 'en';
  const isHindi = currentLang === 'hi';

  useEffect(() => {
    const consent = localStorage.getItem('nitesh_consent_accepted');
    if (consent !== 'true') {
      // Trigger slide-in shortly after mount for premium feel
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Play the exit transition, then unmount
  const hide = () => {
    setIsLeaving(true);
    setTimeout(() => setIsVisible(false), 200);
  };

  const handleAccept = () => {
    localStorage.setItem('nitesh_consent_accepted', 'true');
    hide();
  };

  if (!isVisible) return null;

  return (
        <div
          className={`${isLeaving ? 'consent-leaving' : 'animate-consent-in'} fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-white border border-slate-200/90 shadow-2xl rounded-2xl p-5 z-[99999] flex flex-col gap-4 text-slate-700`}
        >
          <div className="flex gap-3 items-start">
            <div className="bg-blue-50 border border-blue-100 p-2 rounded-xl flex justify-center items-center text-blue-600 flex-shrink-0">
              <Info size={18} />
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <h4 className="font-heading text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isHindi ? 'कुकीज़ और नीति सहमति / Policy Consent' : 'Cookie & Terms Consent'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isHindi ? (
                  <>
                    हम आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करते हैं। साइट ब्राउज़ करके आप हमारे{' '}
                    <Link to="/terms-conditions" className="text-blue-600 font-semibold hover:underline">नियम और शर्तें</Link>{' '}
                    और{' '}
                    <Link to="/privacy-policy" className="text-blue-600 font-semibold hover:underline">गोपनीयता नीति</Link>{' '}
                    से सहमत होते हैं।
                  </>
                ) : (
                  <>
                    We use cookies to optimize your experience. By continuing, you agree to our{' '}
                    <Link to="/terms-conditions" className="text-blue-600 font-semibold hover:underline">Terms & Conditions</Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link>.
                  </>
                )}
              </p>
            </div>
            <button 
              onClick={hide}
              className="bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer flex transition-colors p-0.5"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2 justify-end w-full">
            <button
              onClick={handleAccept}
              className="px-5 py-2 text-xs font-heading font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10 cursor-pointer border-0 transition-all w-full text-center"
            >
              {isHindi ? 'स्वीकार करें / Accept' : 'Accept & Continue'}
            </button>
          </div>
        </div>
  );
};

export default CookieConsent;

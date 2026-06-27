import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { useTranslation } from 'react-i18next';
import Loader from '../components/common/Loader';
import { ShieldAlert } from 'lucide-react';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../config/firebase';
import api from '../utils/api';

const AdminLogin = () => {
  const { t } = useTranslation(['auth', 'common', 'notifications']);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Clean up recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'admin-recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          showToast.error("reCAPTCHA expired. Please try again.");
        }
      });
    } catch (error) {
      console.error("Error setting up Recaptcha:", error);
    }
  };

  const handleSendOtp = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (mobile.length !== 10) {
      showToast.error("कृपया 10 अंकों का मोबाइल नंबर दर्ज करें / Please enter a 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formatPhone = `+91${mobile}`;
      const confirmation = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      showToast.success("एडमिन सत्यापन ओटीपी भेजा गया! / Admin verification OTP sent!");
      try {
        await api.post("/auth/log-otp-sent", { mobile });
      } catch (err) {
        console.error("Failed to log OTP sent status to server:", err);
      }
    } catch (error) {
      console.error("Error sending admin OTP:", error);
      showToast.error(error.message || "Failed to send OTP. Please try again.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    } finally {
      setLoading(false);
    }
  }, [mobile]);

  const handleVerifyOtp = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      showToast.error("कृपया 6 अंकों का ओटीपी दर्ज करें / Please enter a 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const firebaseToken = await user.getIdToken();
      
      const loginResult = await adminLogin(firebaseToken);
      if (loginResult.success) {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error("Error verifying admin OTP:", error);
      showToast.error("गलत ओटीपी! कृपया दोबारा प्रयास करें। / Invalid OTP! Please try again.");
    } finally {
      setLoading(false);
    }
  }, [otp, confirmationResult, adminLogin, navigate]);

  const handleBackToMobile = useCallback(() => {
    setOtpSent(false);
    setOtp('');
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  }, []);

  const handleAutofillDemo = () => {
    setMobile('9125949456');
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 py-12 bg-slate-50 relative">
      {loading && <Loader fullPage />}
      <div className="w-full max-w-[420px] bg-white border border-slate-200/80 p-8 shadow-md rounded-2xl">
        <div className="flex justify-center mb-2">
          <ShieldAlert size={36} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
          एडमिन लॉगिन / Admin Login
        </h2>
        <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
          {otpSent
            ? "दर्ज किए गए मोबाइल नंबर पर एक ओटीपी भेजा गया है / An OTP has been sent to your mobile number"
            : "केवल अधिकृत एडमिन उपयोगकर्ताओं के लिए / For Authorized Admins Only"}
        </p>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="flex flex-col text-left">
              <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                पंजीकृत मोबाइल नंबर / Mobile Number *
              </label>
              <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="bg-slate-50 px-4 py-2.5 text-sm text-slate-500 font-bold border-r border-slate-200 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength="10"
                  className="w-full px-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none text-sm border-0 font-medium"
                  placeholder="e.g. 9125949456"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || mobile.length !== 10}
              className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "ओटीपी भेज रहे हैं... / Sending OTP..." : "ओटीपी भेजें / Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col text-left">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-500">
                  OTP Code / वन-टाइम पासवर्ड *
                </label>
                <button
                  type="button"
                  onClick={handleBackToMobile}
                  className="bg-transparent border-0 text-blue-600 text-[11px] font-semibold cursor-pointer hover:underline"
                >
                  नंबर बदलें / Change Number
                </button>
              </div>
              <input
                type="text"
                maxLength="6"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-center font-bold tracking-widest"
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "सत्यापित कर रहे हैं... / Verifying..." : "एडमिन लॉगिन करें / Verify & Login"}
            </button>
          </form>
        )}

        {/* Invisible ReCaptcha Container */}
        <div id="admin-recaptcha-container" className="flex justify-center mt-2"></div>

        {import.meta.env.DEV && !otpSent && (
          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-center">
            <p className="text-xs text-blue-700 mb-2 font-semibold">विकास मोड / Development Autofill</p>
            <button
              onClick={handleAutofillDemo}
              className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border-0 cursor-pointer"
            >
              Autofill Admin Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;

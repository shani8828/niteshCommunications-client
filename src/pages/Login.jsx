import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { useTranslation } from 'react-i18next';
import Loader from '../components/common/Loader';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation(['auth', 'common', 'notifications']);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [mobile, setMobile] = useState(location.state?.prefilledMobile || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      showToast.error(t('auth:fill_all_fields'));
      return;
    }
    setLoading(true);
    const result = await login(mobile, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || !resetCode || !newPassword) {
      showToast.error(t('auth:fill_all_fields'));
      return;
    }
    setLoading(true);
    const success = await resetPassword(mobile, resetCode.toUpperCase().trim(), newPassword);
    setLoading(false);
    if (success) {
      setShowForgotPassword(false);
      setResetCode('');
      setNewPassword('');
      showToast.success("पासवर्ड सफलतापूर्वक बदल गया! / Password reset successfully!");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 py-12 bg-slate-50 relative">
      {loading && <Loader fullPage />}
      <div className="w-full max-w-[420px] bg-white border border-slate-200/80 p-8 shadow-md rounded-2xl">
        {/* Standard User Login Form */}
        {!showForgotPassword && (
          <>
            <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
              {t('common:login')}
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              {t('common:tagline')}
            </p>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                  {t('auth:phone_number')}
                </label>
                <input
                  type="tel"
                  maxLength="10"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  placeholder={t('auth:enter_phone')}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="flex flex-col relative">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    {t('auth:password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="bg-transparent border-0 text-blue-600 text-[11px] font-semibold cursor-pointer hover:underline"
                  >
                    {t('auth:forgot_password')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    placeholder={t('auth:enter_password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-0 cursor-pointer flex items-center"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common:submitting', 'Submitting...') : t('common:login')}
              </button>
            </form>

            <p className="text-center mt-6 text-xs text-slate-500">
              {t('auth:new_to_shop')}{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                {t('common:register')}
              </Link>
            </p>
          </>
        )}

        {/* Forgot Password (Recovery Codes style) */}
        {showForgotPassword && (
          <>
            <div className="flex justify-center mb-2">
              <KeyRound size={36} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
              रिकवरी कोड द्वारा रीसेट करें / Reset via Recovery Code
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              पासवर्ड रीसेट करने के लिए अपना पंजीकृत मोबाइल नंबर, रिकवरी कोड (NC-XXXX-XXXX) और नया पासवर्ड दर्ज करें।
              <br/>
              <span className="text-[10px] text-slate-400">
                Enter your mobile number, a recovery code, and your new password to reset.
              </span>
            </p>
            
            <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                  {t('auth:phone_number')} *
                </label>
                <input
                  type="tel"
                  maxLength="10"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  placeholder={t('auth:enter_phone')}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                  रिकवरी कोड / Recovery Code (NC-XXXX-XXXX) *
                </label>
                <input
                  type="text"
                  maxLength="14"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-mono tracking-wider uppercase"
                  placeholder="NC-XXXX-XXXX"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col relative">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                  नया पासवर्ड / New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-0 cursor-pointer flex items-center"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common:submitting', 'Submitting...') : t('auth:confirm_reset')}
              </button>
            </form>

            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetCode('');
                setNewPassword('');
              }}
              className="bg-transparent border-0 text-slate-500 text-xs cursor-pointer hover:underline mx-auto mt-6 block font-semibold"
            >
              {t('auth:back_to_login')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;

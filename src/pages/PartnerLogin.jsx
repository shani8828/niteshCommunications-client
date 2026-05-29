import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { useTranslation } from 'react-i18next';
import Loader from '../components/common/Loader';
import { Eye, EyeOff, Truck } from 'lucide-react';

const PartnerLogin = () => {
  const { t } = useTranslation(['auth', 'common', 'notifications']);
  const { partnerLogin } = useAuth();
  const navigate = useNavigate();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      showToast.error(t('auth:fill_all_fields'));
      return;
    }
    setLoading(true);
    const result = await partnerLogin(mobile, password);
    setLoading(false);

    if (result.success) {
      navigate('/partner/dashboard');
    }
  };

  const handleAutofillDemo = () => {
    setMobile('9555439091');
    setPassword('Shani@123');
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 py-12 bg-slate-50">
      <div className="w-full max-w-[420px] bg-white border border-slate-200/80 p-8 shadow-md rounded-2xl">
        <div className="flex justify-center mb-2">
          <Truck size={36} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
          डिलिवरी पार्टनर लॉगिन / Partner Login
        </h2>
        <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
          केवल पंजीकृत डिलीवरी पार्टनर्स के लिए / For Registered Delivery Partners Only
        </p>

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              पंजीकृत मोबाइल नंबर / Mobile Number
            </label>
            <input
              type="tel"
              maxLength="10"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              placeholder="e.g. 9555439091"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div className="flex flex-col relative">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              पासवर्ड / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                placeholder="••••••••"
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
            className="w-full py-3 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer border-0"
          >
            लॉगिन करें / Login as Partner
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-center">
            <p className="text-xs text-blue-700 mb-2 font-semibold">विकास मोड / Development Autofill</p>
            <button
              onClick={handleAutofillDemo}
              className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border-0 cursor-pointer"
            >
              Autofill Partner Credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerLogin;

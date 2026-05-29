import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { useTranslation } from 'react-i18next';
import Loader from '../components/common/Loader';
import { Eye, EyeOff, MapPin, Copy, Download, Printer, CheckCircle } from 'lucide-react';

const Register = () => {
  const { t } = useTranslation(['auth', 'common', 'notifications']);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast.error("आपका ब्राउज़र लोकेशन का समर्थन नहीं करता है / Your browser does not support geolocation");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            showToast.success("लोकेशन सफलतापूर्वक प्राप्त की गई / Location retrieved successfully");
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          console.error(err);
          setAddress(`${latitude}, ${longitude}`);
          showToast.warning("लोकेशन तो मिल गई, पर पता खोजने में समस्या हुई / Location retrieved, but failed to fetch address name");
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        console.error(error);
        setGeolocating(false);
        showToast.error("लोकेशन अनुमति अस्वीकृत या उपलब्ध नहीं है / Location permission denied or unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile || !password || !address) {
      showToast.error(t('auth:fill_all_fields'));
      return;
    }
    if (mobile.length !== 10) {
      showToast.error(t('auth:enter_phone'));
      return;
    }

    setLoading(true);
    const result = await register(name, mobile, password, address, email, coordinates);
    setLoading(false);

    if (result.success) {
      if (result.recoveryCodes && result.recoveryCodes.length > 0) {
        setGeneratedCodes(result.recoveryCodes);
      } else {
        navigate('/');
      }
    }
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    showToast.success("सभी कोड कॉपी हो गए! / All codes copied to clipboard!");
  };

  const handleDownloadCodes = () => {
    const text = `NITESH COMMUNICATIONS RECOVERY CODES\n======================================\nGenerated on: ${new Date().toLocaleString()}\n\nKeep these codes secure. They are the only way to reset your password if you lose it.\n\n${generatedCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n======================================`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nitesh-recovery-codes-${mobile}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast.success("फ़ाइल डाउनलोड हो गई! / File downloaded!");
  };

  const handlePrintCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast.error("पॉपअप अवरोधित है! कृपया प्रिंट के लिए पॉपअप की अनुमति दें। / Popup blocked! Please allow popups to print.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Nitesh Communications - Recovery Codes</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #2563eb; font-size: 24px; margin-bottom: 5px; }
            .tagline { color: #64748b; font-size: 14px; margin-bottom: 20px; }
            .box { border: 2px dashed #2563eb; padding: 25px; display: inline-block; border-radius: 12px; background: #f8fafc; }
            .code { font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 1px; margin: 12px 0; color: #1e293b; }
            .note { color: #dc2626; font-weight: bold; margin-top: 20px; max-width: 500px; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>Nitesh Communications</h1>
          <div class="tagline">रिकवरी कोड / Security Recovery Codes</div>
          <p><strong>ग्राहक का नाम / Customer:</strong> ${name}</p>
          <p><strong>मोबाइल नंबर / Mobile:</strong> ${mobile}</p>
          <p><strong>तारीख / Date:</strong> ${new Date().toLocaleDateString()}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>कृपया इन कोड्स को सुरक्षित रखें। पासवर्ड भूलने पर केवल इन्हीं से रीसेट हो सकेगा। प्रत्येक कोड केवल एक बार इस्तेमाल किया जा सकता है।</p>
          <p>Please keep these codes safe. If you forget your password, these codes are the only way to recover your account. Each code can only be used once.</p>
          <div class="box">
            ${generatedCodes.map((c, i) => `<div class="code">Code ${i + 1}: ${c}</div>`).join('')}
          </div>
          <div class="note">
            चेतावनी: इन कोडों को दोबारा नहीं देखा जा सकेगा। इन्हें सुरक्षित स्थान पर रखें।<br/>
            WARNING: These codes cannot be viewed again. Store them in a secure place.
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };



  if (generatedCodes.length > 0) {
    return (
      <div className="flex justify-center items-center min-h-[85vh] px-4 py-12 bg-slate-50">
        <div className="w-full max-w-[500px] p-8 bg-white border border-slate-200/80 shadow-md rounded-2xl">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="text-emerald-500 w-14 h-14 mb-4" />
            <h2 className="text-xl font-heading font-extrabold text-slate-800 mb-2">
              महत्वपूर्ण सुरक्षा कोड / Recovery Codes
            </h2>
            <p className="text-xs text-rose-600 font-semibold mb-6 max-w-sm">
              इन कोडों को अभी सुरक्षित कर लें! पासवर्ड भूलने पर अकाउंट रीसेट करने के लिए केवल यही तरीका काम करेगा।
              <br />
              <span className="text-slate-500 font-normal">
                Save these codes now! If you forget your password, this is the only way to recover your account.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 font-mono text-center">
            {generatedCodes.map((c, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                <span className="text-xs text-slate-400">Code {i+1}</span>
                <span className="font-bold text-slate-800 tracking-wider select-all">{c}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleCopyCodes}
                className="flex flex-col items-center gap-1 justify-center py-2.5 px-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold text-[11px] cursor-pointer"
              >
                <Copy size={16} />
                <span>कॉपी / Copy</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCodes}
                className="flex flex-col items-center gap-1 justify-center py-2.5 px-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold text-[11px] cursor-pointer"
              >
                <Download size={16} />
                <span>डाउनलोड / Save TXT</span>
              </button>
              <button
                type="button"
                onClick={handlePrintCodes}
                className="flex flex-col items-center gap-1 justify-center py-2.5 px-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold text-[11px] cursor-pointer"
              >
                <Printer size={16} />
                <span>प्रिंट / Print</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 mt-4 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all border-0 cursor-pointer text-center"
            >
              आगे बढ़ें / Continue to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[85vh] px-4 py-12 bg-slate-50 relative">
      {loading && <Loader fullPage />}
      <div className="w-full max-w-[450px] p-8 bg-white border border-slate-200/80 shadow-md rounded-2xl">
        <h2 className="text-2xl font-heading font-extrabold text-center text-blue-600 mb-1">
          {t('common:register')}
        </h2>
        <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
          {t('common:tagline')}
        </p>

        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t('auth:full_name')} *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              placeholder="e.g. Nitesh Maurya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t('auth:phone_number')} *
            </label>
            <input
              type="tel"
              maxLength="10"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              placeholder="e.g. 9125949456"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t('auth:password')} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-500">
                {t('auth:address')} *
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geolocating}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-semibold disabled:text-slate-400 transition-colors"
              >
                <MapPin size={14} className={geolocating ? "animate-bounce" : ""} />
                {geolocating ? "खोज रहे हैं... / Locating..." : "वर्तमान लोकेशन / Use Location"}
              </button>
            </div>
            <textarea
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              rows="2"
              placeholder="e.g. Karamdanda Mod, Patkhauli Chauraha, Ayodhya"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            {coordinates && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-inner h-32 w-full relative">
                <iframe
                  title="Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`}
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t('auth:email')}
            </label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              placeholder="e.g. info.niteshcommunications@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common:submitting', 'Submitting...') : t('auth:register_button')}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-slate-500">
          {t('auth:have_account')}{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            {t('common:login')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

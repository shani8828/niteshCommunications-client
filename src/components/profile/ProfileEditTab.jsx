import React, { useState, useEffect } from 'react';
import { Compass, Save } from 'lucide-react';
import { showToast } from '../../utils/toast';
import ProfileMap from './ProfileMap';

const ProfileEditTab = ({
  user,
  isHindi,
  t,
  onUpdateProfile,
  actionLoading,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [geolocating, setGeolocating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.mobile || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      if (user.coordinates) {
        setCoordinates(user.coordinates);
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fadeIn">
        <div className="h-6 w-36 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="flex flex-col gap-5 p-6 md:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm animate-pulse">
          <div className="grid gap-1 grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-12 bg-slate-200 rounded-full mt-2" />
        </div>
      </div>
    );
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast.error(isHindi ? "लोकेशन का समर्थन नहीं है" : "Your browser does not support geolocation");
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
            showToast.success(isHindi ? "लोकेशन प्राप्त की गई" : "Location retrieved successfully");
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          console.error(err);
          setAddress(`${latitude}, ${longitude}`);
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        console.error(error);
        setGeolocating(false);
        showToast.error(isHindi ? "लोकेशन अनुमति नहीं मिली" : "Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      showToast.error(t('notifications:fill_all_fields'));
      return;
    }
    onUpdateProfile({
      name,
      mobile: phone,
      address,
      email,
      coordinates,
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        {isHindi ? 'प्रोफाइल सेटिंग्स' : 'Profile Settings'}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 md:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="grid gap-1 grid-cols-1 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {isHindi ? 'पूरा नाम' : 'Full Name'} *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {isHindi ? 'मोबाइल नंबर' : 'Mobile Number'} *
            </label>
            <input
              type="tel"
              maxLength="10"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            {isHindi ? 'ईमेल पता' : 'Email Address'}
          </label>
          <input
            type="email"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. name@gmail.com"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
            <label className="text-xs font-semibold text-slate-500">
              {isHindi ? 'डिलीवरी पता' : 'Delivery Address'} *
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geolocating}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-semibold disabled:text-slate-400 transition-colors"
            >
              <Compass size={14} className={geolocating ? "animate-spin" : ""} />
              {geolocating ? (isHindi ? 'लोकेशन खोज रहे हैं...' : 'Locating...') : (isHindi ? 'सटीक लोकेशन प्राप्त करें' : 'Get Current Location')}
            </button>
          </div>
          <textarea
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm resize-y"
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          
          {coordinates && (
            <ProfileMap latitude={coordinates.latitude} longitude={coordinates.longitude} />
          )}
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full py-3.5 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {actionLoading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>
            {actionLoading
              ? (isHindi ? 'सहेज रहे हैं...' : 'Saving...')
              : (isHindi ? 'प्रोफाइल सहेजें' : 'Save Details')}
          </span>
        </button>
      </form>
    </div>
  );
};

export default React.memo(ProfileEditTab);

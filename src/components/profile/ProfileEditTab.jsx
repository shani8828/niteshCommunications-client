import React, { useState, useEffect } from 'react';
import { Compass, Save, MapPin, Plus, Trash2, Edit2, Star } from 'lucide-react';
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
  
  // Multiple addresses state
  const [addresses, setAddresses] = useState([]);
  
  // Sub-form state for adding/editing address
  const [newAddressText, setNewAddressText] = useState('');
  const [newCoordinates, setNewCoordinates] = useState(null);
  const [newLandmark, setNewLandmark] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [geolocating, setGeolocating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.mobile || '');
      setEmail(user.email || '');
      
      let initialAddresses = user.addresses || [];
      if (initialAddresses.length === 0 && user.address) {
        initialAddresses = [{
          address: user.address,
          coordinates: user.coordinates || { latitude: 26.671782, longitude: 82.008832 },
          landmark: '',
          isDefault: true
        }];
      }
      setAddresses(initialAddresses);
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

  const handleLocateNewAddress = () => {
    if (!navigator.geolocation) {
      showToast.error(isHindi ? "लोकेशन का समर्थन नहीं है" : "Your browser does not support geolocation");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setNewCoordinates({ latitude, longitude });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setNewAddressText(data.display_name);
            showToast.success(isHindi ? "लोकेशन प्राप्त की गई" : "Location retrieved successfully");
          } else {
            setNewAddressText(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          console.error(err);
          setNewAddressText(`${latitude}, ${longitude}`);
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

  const handleSaveAddressForm = () => {
    if (!newAddressText.trim()) {
      showToast.error(isHindi ? "कृपया पता दर्ज करें" : "Please enter address");
      return;
    }
    if (!newCoordinates) {
      showToast.error(isHindi ? "कृपया पहले 'सटीक लोकेशन प्राप्त करें' बटन का उपयोग करके लोकेशन सत्यापित करें" : "Please verify location using 'Get Current Location' first");
      return;
    }

    const newAddrObj = {
      address: newAddressText.trim(),
      coordinates: newCoordinates,
      landmark: newLandmark.trim(),
      isDefault: addresses.length === 0 || (editingIndex >= 0 && addresses[editingIndex].isDefault)
    };

    if (editingIndex >= 0) {
      // Editing existing address
      const updated = [...addresses];
      updated[editingIndex] = newAddrObj;
      setAddresses(updated);
      showToast.success(isHindi ? "पता अपडेट कर दिया गया है (स्थानीय रूप से)" : "Address updated (locally)");
    } else {
      // Adding new address
      if (addresses.length >= 3) {
        showToast.error(isHindi ? "अधिकतम 3 पते ही जोड़े जा सकते हैं" : "Maximum 3 addresses allowed");
        return;
      }
      setAddresses([...addresses, newAddrObj]);
      showToast.success(isHindi ? "नया पता जोड़ दिया गया है (स्थानीय रूप से)" : "New address added (locally)");
    }

    // Reset sub-form state
    setNewAddressText('');
    setNewCoordinates(null);
    setNewLandmark('');
    setIsAdding(false);
    setEditingIndex(-1);
  };

  const handleEditAddressClick = (idx) => {
    const addr = addresses[idx];
    setNewAddressText(addr.address);
    setNewCoordinates(addr.coordinates);
    setNewLandmark(addr.landmark || '');
    setEditingIndex(idx);
    setIsAdding(false);
  };

  const handleCancelForm = () => {
    setNewAddressText('');
    setNewCoordinates(null);
    setNewLandmark('');
    setIsAdding(false);
    setEditingIndex(-1);
  };

  const handleDeleteAddress = (idx) => {
    const isDef = addresses[idx].isDefault;
    const filtered = addresses.filter((_, i) => i !== idx);
    if (isDef && filtered.length > 0) {
      filtered[0].isDefault = true;
    }
    setAddresses(filtered);
    showToast.success(isHindi ? "पता हटा दिया गया है (स्थानीय रूप से)" : "Address removed (locally)");
  };

  const handleSetDefault = (idx) => {
    const updated = addresses.map((item, i) => ({
      ...item,
      isDefault: i === idx
    }));
    setAddresses(updated);
    showToast.success(isHindi ? "डिफ़ॉल्ट पता बदल दिया गया है" : "Default address updated");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast.error(t('notifications:fill_all_fields'));
      return;
    }
    if (addresses.length === 0) {
      showToast.error(isHindi ? "कृपया कम से कम एक डिलीवरी पता जोड़ें" : "Please add at least one delivery address");
      return;
    }

    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
    onUpdateProfile({
      name,
      mobile: phone,
      email,
      addresses,
      address: defaultAddr.address,
      coordinates: defaultAddr.coordinates,
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        {isHindi ? 'प्रोफाइल सेटिंग्स' : 'Profile Settings'}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 md:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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

        {/* Addresses Section */}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 mt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHindi ? 'वितरण पते (अधिकतम 3)' : 'Delivery Addresses (Max 3)'} *
            </label>
            {!isAdding && editingIndex === -1 && addresses.length < 3 && (
              <button
                type="button"
                onClick={() => { setIsAdding(true); setNewAddressText(''); setNewCoordinates(null); setNewLandmark(''); setEditingIndex(-1); }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-bold transition-all"
              >
                <Plus size={14} />
                {isHindi ? 'नया पता जोड़ें' : 'Add New Address'}
              </button>
            )}
          </div>

          {/* Addresses list */}
          <div className="flex flex-col gap-3">
            {addresses.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 border rounded-2xl flex flex-col gap-2 relative transition-all ${
                  item.isDefault ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-2.5 items-start">
                    <MapPin className={`mt-0.5 flex-shrink-0 ${item.isDefault ? 'text-blue-500' : 'text-slate-400'}`} size={16} />
                    <div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {isHindi ? `पता ${idx + 1}` : `Address ${idx + 1}`}
                        </span>
                        {item.isDefault && (
                          <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
                            {isHindi ? 'डिफ़ॉल्ट' : 'Default'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.address}</p>
                      {item.landmark && (
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                          {isHindi ? `लैंडमार्क: ${item.landmark}` : `Landmark: ${item.landmark}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {!item.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(idx)}
                        title={isHindi ? "डिफ़ॉल्ट सेट करें" : "Set as Default"}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-all border-0 bg-transparent cursor-pointer"
                      >
                        <Star size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEditAddressClick(idx)}
                      title={isHindi ? "बदलें" : "Edit"}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-all border-0 bg-transparent cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(idx)}
                        title={isHindi ? "हटाएं" : "Delete"}
                        className="p-1.5 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-700 transition-all border-0 bg-transparent cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit Sub-form */}
          {(isAdding || editingIndex >= 0) && (
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {editingIndex >= 0
                    ? (isHindi ? 'पता बदलें' : 'Edit Address')
                    : (isHindi ? 'नया पता जोड़ें' : 'Add New Address')}
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs font-bold text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <label className="text-[10px] font-bold text-slate-500">
                    {isHindi ? 'लोकेशन / पता *' : 'Location / Address *'}
                  </label>
                  <button
                    type="button"
                    onClick={handleLocateNewAddress}
                    disabled={geolocating}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-bold disabled:text-slate-400 transition-colors"
                  >
                    <Compass size={12} className={geolocating ? "animate-spin" : ""} />
                    {geolocating ? (isHindi ? 'खोज रहे हैं...' : 'Locating...') : (isHindi ? 'सटीक लोकेशन प्राप्त करें' : 'Get Current Location')}
                  </button>
                </div>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-semibold text-slate-800"
                  placeholder={isHindi ? "सटीक पता दर्ज करें या ऊपर से लोकेशन प्राप्त करें" : "Enter full address or fetch coordinates using button"}
                  value={newAddressText}
                  onChange={(e) => setNewAddressText(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">
                  {isHindi ? 'फ्लैट/मकान नंबर, बिल्डिंग और लैंडमार्क (वैकल्पिक)' : 'Flat/House No, Building & Landmark (Optional)'}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-semibold text-slate-800"
                  placeholder="e.g. Near Shiv Temple, House 12"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                />
              </div>

              {newCoordinates && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-mono">Coords: {newCoordinates.latitude.toFixed(6)}, {newCoordinates.longitude.toFixed(6)}</span>
                  <ProfileMap latitude={newCoordinates.latitude} longitude={newCoordinates.longitude} />
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveAddressForm}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all border-0 cursor-pointer self-start"
              >
                {isHindi ? 'पता सुरक्षित करें' : 'Save Address'}
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={actionLoading || isAdding || editingIndex >= 0}
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

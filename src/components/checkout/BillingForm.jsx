import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Check, AlertTriangle } from "lucide-react";
import LocationMap from "../shop/LocationMap";
import { AddressSkeleton } from "../xerox/XeroxSkeletons";

const BillingForm = ({
  initialPhone,
  initialAddressDetails,
  address,
  coordinates,
  geolocating,
  outOfRange,
  distance,
  isWithinDeliveryHours,
  currentLang,
  onLocationVerify,
  onFormChange,
  addresses = [],
  onAddressSelect,
}) => {
  const [phone, setPhone] = useState(initialPhone || "");
  const [addressDetails, setAddressDetails] = useState(initialAddressDetails || "");
  const [selectedAddrIndex, setSelectedAddrIndex] = useState(() => {
    if (addresses.length > 0) {
      const idx = addresses.findIndex((a) => a.isDefault);
      return idx >= 0 ? idx : 0;
    }
    return -1;
  });

  useEffect(() => {
    if (initialPhone) {
      setPhone(initialPhone);
    }
  }, [initialPhone]);

  useEffect(() => {
    if (initialAddressDetails !== undefined) {
      setAddressDetails(initialAddressDetails || "");
    }
  }, [initialAddressDetails]);

  useEffect(() => {
    if (addresses.length > 0) {
      const idx = addresses.findIndex((a) => a.isDefault);
      setSelectedAddrIndex(idx >= 0 ? idx : 0);
    } else {
      setSelectedAddrIndex(-1);
    }
  }, [addresses]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
    onFormChange("phone", value);
  };

  const handleAddressDetailsChange = (e) => {
    const value = e.target.value;
    setAddressDetails(value);
    onFormChange("addressDetails", value);
  };

  const handleSelectSavedAddress = (idx) => {
    setSelectedAddrIndex(idx);
    onAddressSelect(addresses[idx]);
  };

  const handleSelectNewAddress = () => {
    setSelectedAddrIndex(-1);
    onAddressSelect(null);
  };

  return (
    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded flex flex-col gap-4 shadow-sm">
      <h3 className="font-heading text-base font-bold text-slate-800 mb-2">
        {currentLang === "hi" ? "बिलिंग विवरण" : "Billing Details"}
      </h3>
      
      <div className="flex flex-col">
        <label className="block mb-1.5 text-xs font-semibold text-slate-500">
          {currentLang === "hi" ? "मोबाइल नंबर " : "Phone Number"} *
        </label>
        <input
          type="tel"
          maxLength="10"
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
          placeholder="10 digit mobile number"
          value={phone}
          onChange={handlePhoneChange}
          required
        />
      </div>

      {/* Multiple Saved Addresses Selector */}
      {addresses.length > 0 && (
        <div className="flex flex-col gap-3 mt-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {currentLang === "hi" ? "डिलीवरी पता चुनें" : "Select Delivery Address"} *
          </span>
          <div className="flex flex-col gap-3">
            {addresses.map((item, idx) => {
              const SHOP_LAT = 26.671782;
              const SHOP_LON = 82.008832;
              const calculateDistance = (lat1, lon1, lat2, lon2) => {
                const R = 6371;
                const dLat = (lat2 - lat1) * (Math.PI / 180);
                const dLon = (lon2 - lon1) * (Math.PI / 180);
                const a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * (Math.PI / 180)) *
                    Math.cos(lat2 * (Math.PI / 180)) *
                    Math.sin(dLon / 2) *
                    Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return Number((R * c).toFixed(2));
              };
              const dist = calculateDistance(
                SHOP_LAT,
                SHOP_LON,
                item.coordinates.latitude,
                item.coordinates.longitude
              );
              const isOutOfRange = dist > 15;

              return (
                <label
                  key={idx}
                  className={`p-4 border rounded-2xl flex items-start gap-3 cursor-pointer transition-all ${
                    selectedAddrIndex === idx
                      ? "border-blue-500 bg-blue-50/10"
                      : "border-slate-200 bg-white hover:bg-slate-50/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryAddressSelect"
                    checked={selectedAddrIndex === idx}
                    onChange={() => handleSelectSavedAddress(idx)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800">
                        {currentLang === "hi" ? `पता ${idx + 1}` : `Address ${idx + 1}`}
                      </span>
                      {item.isDefault && (
                        <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
                          {currentLang === "hi" ? "डिफ़ॉल्ट" : "Default"}
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          isOutOfRange ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {dist} km {isOutOfRange ? (currentLang === "hi" ? "(सीमा से बाहर)" : "(Out of range)") : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-650 mt-1 leading-relaxed">{item.address}</p>
                    {item.landmark && (
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        {currentLang === "hi" ? `लैंडमार्क: ${item.landmark}` : `Landmark: ${item.landmark}`}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}

            <label
              className={`p-4 border rounded-2xl flex items-start gap-3 cursor-pointer transition-all ${
                selectedAddrIndex === -1
                  ? "border-blue-500 bg-blue-50/10"
                  : "border-slate-200 bg-white hover:bg-slate-50/30"
              }`}
            >
              <input
                type="radio"
                name="deliveryAddressSelect"
                checked={selectedAddrIndex === -1}
                onChange={handleSelectNewAddress}
                className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {currentLang === "hi" ? "अन्य स्थान / नया पता उपयोग करें" : "Use a different address / location"}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {currentLang === "hi"
                    ? "जीपीएस का उपयोग करके नया डिलीवरी स्थान दर्ज करें"
                    : "Enter a new delivery location using GPS"}
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-2 border-t border-slate-100 pt-4">
        {selectedAddrIndex === -1 && !coordinates && !geolocating && (
          <button
            type="button"
            onClick={onLocationVerify}
            className="flex items-center justify-center gap-2 py-4 px-6 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/20 text-blue-600 rounded-2xl font-semibold text-xs transition-all cursor-pointer bg-transparent w-full"
          >
            <Navigation size={16} className="animate-pulse" /> {currentLang === "hi" ? "लोकेशन सत्यापित करें (आवश्यक)" : "Verify Location coordinates (Required)"}
          </button>
        )}

        {selectedAddrIndex === -1 && geolocating && <AddressSkeleton />}

        {coordinates && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Range Banner status */}
            <div
              className={`flex items-center gap-3 p-4 border rounded-2xl text-xs font-semibold ${
                outOfRange
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {outOfRange ? (
                <>
                  <AlertTriangle size={20} className="flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">
                      {currentLang === "hi" ? `डिलीवरी सीमा से बाहर! (${distance} किमी)` : `Out of service range (${distance} km)`}
                    </p>
                    <p className="text-[10px] opacity-90 mt-0.5">
                      {currentLang === "hi"
                        ? "आपका स्थान हमारी 15 किमी डिलीवरी सीमा से बाहर है।"
                        : "Your location is further than our maximum service limit of 15km."}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Check size={20} className="bg-emerald-500 text-white rounded-full p-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">
                      {currentLang === "hi" ? `स्थान सत्यापित (${distance} किमी दूर)` : `Location Verified (${distance} km away)`}
                    </p>
                    <p className="text-[10px] opacity-90 mt-0.5">
                      {currentLang === "hi" ? "आप हमारे डिलीवरी क्षेत्र में हैं।" : "You are within our delivery zone."}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Address Details Output */}
            {!outOfRange && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={10} /> {currentLang === "hi" ? "सत्यापित डिलीवरी स्थान" : "Geocoded Address"}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-1">
                    {address}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-2 font-mono">
                    Coords: {coordinates?.latitude.toFixed(6)}, {coordinates?.longitude.toFixed(6)}
                  </p>
                </div>

                {/* Manual Landmark / House No (Editable) */}
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                    {currentLang === "hi"
                      ? "फ्लैट / मकान नंबर, बिल्डिंग, लैंडमार्क (आवश्यक) *"
                      : "Flat, House No., Building, Landmark Details (Required) *"}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-semibold text-slate-800"
                    placeholder={
                      currentLang === "hi"
                        ? "उदा. फ्लैट नंबर 402, शिव मंदिर के पास..."
                        : "e.g. Flat 402, Near Shiv Temple..."
                    }
                    value={addressDetails}
                    onChange={handleAddressDetailsChange}
                    required
                  />
                </div>
              </div>
            )}

            {selectedAddrIndex === -1 && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onLocationVerify}
                  className="text-[10px] text-slate-400 hover:text-slate-650 font-bold transition-all border-0 bg-transparent cursor-pointer underline decoration-dotted"
                >
                  {currentLang === "hi" ? "लोकेशन दोबारा खोजें" : "Re-detect current location"}
                </button>
              </div>
            )}

            <LocationMap coordinates={coordinates} />
          </div>
        )}

        {/* Timing Alert */}
        {!isWithinDeliveryHours && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs font-semibold">
            {currentLang === "hi"
              ? "🚚 डिलीवरी शेड्यूल: हमारे डिलीवरी ऑपरेशंस का समय सुबह 9 बजे से शाम 6 बजे तक है। आपका आदेश कल वितरित किया जाएगा।"
              : "🚚 Delivery Schedule: Delivery hours are 9:00 AM - 6:00 PM. Since it is currently outside these hours, your order will be delivered tomorrow."}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(BillingForm);

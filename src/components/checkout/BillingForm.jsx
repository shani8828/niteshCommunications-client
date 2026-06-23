import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import LocationMap from "../shop/LocationMap";

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
}) => {
  const [phone, setPhone] = useState(initialPhone || "");
  const [addressDetails, setAddressDetails] = useState(initialAddressDetails || "");

  useEffect(() => {
    if (initialPhone) {
      setPhone(initialPhone);
    }
  }, [initialPhone]);

  useEffect(() => {
    if (initialAddressDetails) {
      setAddressDetails(initialAddressDetails);
    }
  }, [initialAddressDetails]);

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
      <div className="flex flex-col gap-4">
        {!coordinates ? (
          <div className="p-6 bg-blue-50/40 border border-blue-200 rounded text-center flex flex-col items-center gap-3.5 shadow-sm mt-2">
            <div className="bg-blue-600/10 text-blue-600 p-3.5 rounded-full flex justify-center items-center">
              <MapPin
                size={28}
                className={geolocating ? "animate-bounce" : ""}
              />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-slate-800 text-sm md:text-base">
                {currentLang === "hi"
                  ? "लोकेशन सत्यापन आवश्यक है"
                  : "Location Verification Required"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                {currentLang === "hi"
                  ? "डिलीवरी सीमा (15 किमी) की पुष्टि करने के लिए कृपया अपनी वर्तमान लोकेशन सत्यापित करें।"
                  : "To verify your delivery range (15km), please share your current location via GPS."}
              </p>
            </div>
            <button
              type="button"
              onClick={onLocationVerify}
              disabled={geolocating}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer border-0 disabled:opacity-50"
            >
              {geolocating ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  {currentLang === "hi"
                    ? "लोकेशन खोजी जा रही है..."
                    : "Locating..."}
                </>
              ) : (
                <>
                  <MapPin size={14} />
                  {currentLang === "hi"
                    ? "लोकेशन सत्यापित करें"
                    : "Verify Location"}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Geolocated Address (Read-only) */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-500">
                  {currentLang === "hi"
                    ? "सत्यापित डिलीवरी स्थान (रीड-ओनली) *"
                    : "Verified Delivery Location (Read-Only) *"}
                </label>
                <button
                  type="button"
                  onClick={onLocationVerify}
                  disabled={geolocating}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-semibold disabled:text-slate-400 transition-colors"
                >
                  <MapPin
                    size={14}
                    className={geolocating ? "animate-bounce" : ""}
                  />
                  {geolocating
                    ? "खोज रहे हैं... / Locating..."
                    : "लोकेशन बदलें / Change Location"}
                </button>
              </div>
              <textarea
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-slate-500 placeholder-slate-400 outline-none cursor-not-allowed text-sm"
                rows="2"
                value={address}
                readOnly
                disabled
                required
              />
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
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                placeholder={
                  currentLang === "hi"
                    ? "उदा. फ्लैट नंबर 402, शिव मंदिर के पास, करमडांडा..."
                    : "e.g. Flat 402, Near Shiv Temple, Patkhauli..."
                }
                value={addressDetails}
                onChange={handleAddressDetailsChange}
                required
              />
            </div>

            <LocationMap coordinates={coordinates} />
          </div>
        )}

        {/* Range and Time Alerts */}
        <div className="flex flex-col gap-2.5 mt-2">
          {/* Delivery Range status */}
          {coordinates &&
            (outOfRange ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-semibold">
                {currentLang === "hi"
                  ? `✖ डिलीवरी सीमा से बाहर! हम केवल अपनी दुकान (पटखौली चौराहा, अयोध्या) से 15 किमी के भीतर ही डिलीवरी करते हैं।`
                  : `✖ Out of Delivery Range! We only deliver within a 15km radius of our shop (Patkhauli Chauraha, Ayodhya).`}
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-semibold">
                {currentLang === "hi"
                  ? `✔ डिलीवरी रेंज के भीतर! आपका स्थान दुकान से 15 किमी के भीतर है।`
                  : `✔ Within Delivery Range! Your location is within 15km from our shop.`}
              </div>
            ))}

          {/* Delivery Timing status */}
          {!isWithinDeliveryHours && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs font-semibold">
              {currentLang === "hi"
                ? "🚚 डिलीवरी शेड्यूल: हमारे डिलीवरी ऑपरेशंस का समय सुबह 9 बजे से शाम 6 बजे तक है। आपका ऑर्डर कल डिलीवर किया जाएगा।"
                : "🚚 Delivery Schedule: Delivery hours are 9:00 AM - 6:00 PM. Since it is currently outside these hours, your order will be delivered tomorrow."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BillingForm);

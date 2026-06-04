import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { AddressSkeleton } from './XeroxSkeletons';

const SHOP_LAT = 26.671782;
const SHOP_LON = 82.008832;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2));
};

const XeroxLocationStep = ({ coordinates, setCoordinates, address, setAddress, landmark, setLandmark, onBack, onNext }) => {
  const [geolocating, setGeolocating] = useState(false);
  const [distance, setDistance] = useState(null);
  const [outOfRange, setOutOfRange] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);

  useEffect(() => {
    if (coordinates) {
      const dist = calculateDistance(
        SHOP_LAT,
        SHOP_LON,
        coordinates.latitude,
        coordinates.longitude
      );
      setDistance(dist);
      setOutOfRange(dist > 15);
      setLocationFetched(true);
    }
  }, [coordinates]);

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast.error("Your browser does not support Geolocation / आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता है");
      return;
    }

    setGeolocating(true);
    setLocationFetched(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });

        const dist = calculateDistance(SHOP_LAT, SHOP_LON, latitude, longitude);
        setDistance(dist);
        setOutOfRange(dist > 15);

        if (dist > 15) {
          setGeolocating(false);
          setLocationFetched(true);
          showToast.error("We only deliver within 15km of our shop / हम केवल दुकान से 15 किमी के दायरे में डिलीवरी करते हैं");
          return;
        }

        try {
          // OpenStreetMap Nominatim reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            showToast.success("Location detected successfully!");
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          console.error(err);
          setAddress(`${latitude}, ${longitude}`);
          showToast.warning("Location detected, but failed to fetch address name.");
        } finally {
          setGeolocating(false);
          setLocationFetched(true);
        }
      },
      (error) => {
        console.error(error);
        setGeolocating(false);
        setLocationFetched(false);
        showToast.error(
          "Location permission denied or unavailable. Geolocation is required for document delivery. / डिलीवरी के लिए लोकेशन परमिशन आवश्यक है।"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setCoordinates, setAddress]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center md:text-left">
        <h3 className="font-heading text-lg font-bold text-slate-800">
          Delivery Address & Range Check
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          To ensure accurate delivery, we require high-accuracy location coordinates. Delivery is only available within 15km of our store.
        </p>
      </div>

      {/* Geolocation Trigger & Status */}
      <div className="flex flex-col gap-4">
        {!locationFetched && !geolocating && (
          <button
            type="button"
            onClick={handleDetectLocation}
            className="flex items-center justify-center gap-2 py-4 px-6 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/20 text-blue-600 rounded-2xl font-semibold text-xs transition-all cursor-pointer bg-transparent"
          >
            <Navigation size={16} className="animate-pulse" /> Verify Location coordinates (Required)
          </button>
        )}

        {geolocating && <AddressSkeleton />}

        {locationFetched && !geolocating && (
          <div className="flex flex-col gap-4">
            {/* Range Banner status */}
            <div
              className={`flex items-center gap-3 p-4 border rounded-2xl text-xs font-semibold ${
                outOfRange
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {outOfRange ? (
                <>
                  <AlertTriangle size={20} className="flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Out of service range ({distance} km)</p>
                    <p className="text-[10px] opacity-90 mt-0.5">
                      Your location is further than our maximum service limit of 15km from Ayodhya.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Check size={20} className="bg-emerald-500 text-white rounded-full p-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Location Verified ({distance} km away)</p>
                    <p className="text-[10px] opacity-90 mt-0.5">
                      You are within our delivery zone.
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
                    <MapPin size={10} /> Geocoded Address
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-1">
                    {address}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-2 font-mono">
                    Coords: {coordinates?.latitude.toFixed(6)}, {coordinates?.longitude.toFixed(6)}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Flat/House No, Building & Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Ram Mandir Gate, House 4B"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 w-full font-semibold text-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleDetectLocation}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold transition-all border-0 bg-transparent cursor-pointer underline decoration-dotted"
              >
                Re-detect current location
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation actions */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all border-0 flex items-center justify-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!locationFetched || outOfRange || geolocating}
          className="py-3 px-4 bg-brand-cyan hover:bg-brand-cyan-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-cyan/15 transition-all border-0 flex items-center justify-center gap-1 cursor-pointer"
        >
          Proceed to Summary
        </button>
      </div>
    </div>
  );
};

export default XeroxLocationStep;

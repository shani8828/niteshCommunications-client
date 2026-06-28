import React, { useState, useEffect } from "react";
import { Compass, Save, MapPin, Plus, Trash2, Edit2, Star } from "lucide-react";
import { showToast } from "../../utils/toast";
import ProfileMap from "./ProfileMap";
import { getCurrentPositionWithFallback, handleGeolocationError } from "../../utils/geolocation";

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

const ProfileEditTab = ({
  user,
  t,
  onUpdateProfile,
  actionLoading,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Multiple addresses state
  const [addresses, setAddresses] = useState([]);

  // Sub-form state for adding/editing address
  const [newAddressText, setNewAddressText] = useState("");
  const [newCoordinates, setNewCoordinates] = useState(null);
  const [newLandmark, setNewLandmark] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [geolocating, setGeolocating] = useState(false);

  // Edit / View mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialState, setInitialState] = useState({
    name: "",
    phone: "",
    email: "",
    addresses: [],
  });

  useEffect(() => {
    if (user) {
      const uName = user.name || "";
      const uPhone = user.mobile || "";
      const uEmail = user.email || "";

      let initialAddresses = user.addresses || [];
      if (initialAddresses.length === 0 && user.address) {
        initialAddresses = [
          {
            address: user.address,
            coordinates: user.coordinates || {
              latitude: 26.671782,
              longitude: 82.008832,
            },
            landmark: "",
            isDefault: true,
          },
        ];
      }
      setName(uName);
      setPhone(uPhone);
      setEmail(uEmail);
      setAddresses(initialAddresses);
      setInitialState({
        name: uName,
        phone: uPhone,
        email: uEmail,
        addresses: initialAddresses,
      });
      setIsEditMode(false); // Lock the details on mount or profile update
    }
  }, [user]);

  // Deep comparison of state to detect changes
  const hasChanges =
    name !== initialState.name ||
    phone !== initialState.phone ||
    email !== initialState.email ||
    JSON.stringify(addresses) !== JSON.stringify(initialState.addresses);

  if (!user) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fadeIn">
        <div className="h-6 w-36 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="flex flex-col gap-5 p-6 md:p-8 bg-white border border-slate-200/80 rounded shadow-sm animate-pulse">
          <div className="grid gap-1 grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-100 rounded" />
          </div>
          <div className="h-12 bg-slate-200 rounded mt-2" />
        </div>
      </div>
    );
  }
  const handleLocateNewAddress = async () => {
    setGeolocating(true);
    try {
      const position = await getCurrentPositionWithFallback();
      const { latitude, longitude } = position.coords;

      const dist = calculateDistance(SHOP_LAT, SHOP_LON, latitude, longitude);
      if (dist > 15) {
        showToast.error(
          t("auth:location_out_of_range", "We only deliver/service within 15km of our shop / हम केवल दुकान से 15 किमी के दायरे में डिलीवरी/सेवाएं प्रदान करते हैं")
        );
        setNewCoordinates(null);
        return;
      }

      setNewCoordinates({ latitude, longitude });
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.display_name) {
          setNewAddressText(data.display_name);
          showToast.success(t("auth:location_retrieved", "Location retrieved successfully"));
        } else {
          setNewAddressText(`${latitude}, ${longitude}`);
        }
      } catch (err) {
        console.error(err);
        setNewAddressText(`${latitude}, ${longitude}`);
      }
    } catch (error) {
      handleGeolocationError(error, t);
    } finally {
      setGeolocating(false);
    }
  };

  const handleSaveAddressForm = () => {
    if (!newAddressText.trim()) {
      showToast.error(t("auth:enter_address_error", "Please enter address"));
      return;
    }
    if (!newCoordinates) {
      showToast.error(t("auth:location_warning", "Please verify location using 'Get Current Location' first"));
      return;
    }

    const newAddrObj = {
      address: newAddressText.trim(),
      coordinates: newCoordinates,
      landmark: newLandmark.trim(),
      isDefault:
        addresses.length === 0 ||
        (editingIndex >= 0 && addresses[editingIndex].isDefault),
    };

    if (editingIndex >= 0) {
      // Editing existing address
      const updated = [...addresses];
      updated[editingIndex] = newAddrObj;
      setAddresses(updated);
      showToast.success(t("auth:address_updated", "Address updated"));
    } else {
      // Adding new address
      if (addresses.length >= 3) {
        showToast.error(t("auth:max_address_reached", "Maximum 3 addresses allowed"));
        return;
      }
      setAddresses([...addresses, newAddrObj]);
      showToast.success(t("auth:address_added", "New address added"));
    }

    // Reset sub-form state
    setNewAddressText("");
    setNewCoordinates(null);
    setNewLandmark("");
    setIsAdding(false);
    setEditingIndex(-1);
  };

  const handleEditAddressClick = (idx) => {
    const addr = addresses[idx];
    setNewAddressText(addr.address);
    setNewCoordinates(addr.coordinates);
    setNewLandmark(addr.landmark || "");
    setEditingIndex(idx);
    setIsAdding(false);
  };

  const handleCancelForm = () => {
    setNewAddressText("");
    setNewCoordinates(null);
    setNewLandmark("");
    setIsAdding(false);
    setEditingIndex(-1);
  };

  const handleCancelEditMode = () => {
    setName(initialState.name);
    setPhone(initialState.phone);
    setEmail(initialState.email);
    setAddresses(initialState.addresses);
    setIsEditMode(false);
    // Cancel form edit states
    setNewAddressText("");
    setNewCoordinates(null);
    setNewLandmark("");
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
    showToast.success(t("auth:address_removed", "Address removed"));
  };

  const handleSetDefault = (idx) => {
    const updated = addresses.map((item, i) => ({
      ...item,
      isDefault: i === idx,
    }));
    setAddresses(updated);
    showToast.success(t("auth:default_address_updated", "Default address updated"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast.error(t("auth:fill_all_fields"));
      return;
    }
    if (addresses.length === 0) {
      showToast.error(t("auth:add_address_warning", "Please add at least one delivery address"));
      return;
    }

    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
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
        {t("auth:profile_settings")}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 p-6 md:p-8 bg-white border border-slate-200/80 rounded shadow-sm"
      >
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t("auth:full_name")} *
            </label>
            <input
              type="text"
              disabled={!isEditMode}
              className="w-full px-4 py-2.5 bg-white disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-slate-100 border border-slate-200 rounded text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-1.5 text-xs font-semibold text-slate-500">
              {t("auth:phone_number")} *
            </label>
            <input
              type="tel"
              maxLength="10"
              disabled={!isEditMode}
              className="w-full px-4 py-2.5 bg-white disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-slate-100 border border-slate-200 rounded text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block mb-1.5 text-xs font-semibold text-slate-500">
            {t("auth:email")}
          </label>
          <input
            type="email"
            disabled={!isEditMode}
            className="w-full px-4 py-2.5 bg-white disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-slate-100 border border-slate-200 rounded text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. name@gmail.com"
          />
        </div>

        {/* Addresses Section */}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 mt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t("auth:delivery_addresses")} *
            </label>
            {isEditMode && !isAdding && editingIndex === -1 && addresses.length < 3 && (
              <button
                type="button"
                onClick={() => {
                  setIsAdding(true);
                  setNewAddressText("");
                  setNewCoordinates(null);
                  setNewLandmark("");
                  setEditingIndex(-1);
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-bold transition-all"
              >
                <Plus size={14} />
                {t("auth:add_new_address")}
              </button>
            )}
          </div>

          {/* Addresses list */}
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {addresses.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 border rounded flex flex-col justify-between gap-2 relative transition-all ${
                  item.isDefault
                    ? "border-blue-500 bg-blue-50/10"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-2.5 items-start">
                    <MapPin
                      className={`mt-0.5 flex-shrink-0 ${
                        item.isDefault ? "text-blue-500" : "text-slate-400"
                      }`}
                      size={16}
                    />
                    <div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {t("auth:address_index")} {idx + 1}
                        </span>
                        {item.isDefault && (
                          <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-0.5 rounded font-bold">
                            {t("auth:default_badge")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed text-left">
                        {item.address}
                      </p>
                      {item.landmark && (
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold text-left">
                          {t("auth:landmark_label")}: {item.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditMode && (
                  <div className="flex gap-1.5 items-center justify-end mt-2 pt-2 border-t border-slate-100/50">
                    {!item.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(idx)}
                        title={t("auth:set_default")}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-all border-0 bg-transparent cursor-pointer"
                      >
                        <Star size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEditAddressClick(idx)}
                      title={t("auth:edit")}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-all border-0 bg-transparent cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(idx)}
                        title={t("auth:delete")}
                        className="p-1.5 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-700 transition-all border-0 bg-transparent cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add / Edit Sub-form */}
          {isEditMode && (isAdding || editingIndex >= 0) && (
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {editingIndex >= 0
                    ? t("auth:edit_address")
                    : t("auth:add_new_address")}
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs font-bold text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer"
                >
                  {t("common:cancel")}
                </button>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <label className="text-[10px] font-bold text-slate-500">
                    {t("auth:location_address")} *
                  </label>
                  <button
                    type="button"
                    onClick={handleLocateNewAddress}
                    disabled={geolocating}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer font-bold disabled:text-slate-400 transition-colors"
                  >
                    <Compass
                      size={12}
                      className={geolocating ? "animate-spin" : ""}
                    />
                    <span>
                      {geolocating
                        ? t("auth:locating")
                        : t("auth:get_current_location")}
                    </span>
                  </button>
                </div>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-semibold text-slate-800"
                  placeholder={t("auth:enter_full_address")}
                  value={newAddressText}
                  onChange={(e) => setNewAddressText(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-500">
                  {t("auth:landmark_placeholder")}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-semibold text-slate-800"
                  placeholder="e.g. Near Shiv Temple, House 12"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                />
              </div>

              {newCoordinates && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-mono text-left">
                    Coords: {newCoordinates.latitude.toFixed(6)},{" "}
                    {newCoordinates.longitude.toFixed(6)}
                  </span>
                  <ProfileMap
                    latitude={newCoordinates.latitude}
                    longitude={newCoordinates.longitude}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveAddressForm}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all border-0 cursor-pointer self-start"
              >
                {t("auth:save_address")}
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Buttons depending on Edit Mode */}
        {!isEditMode ? (
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="w-full py-3.5 mt-2 font-heading font-bold text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0 flex items-center justify-center gap-2 transition-all"
          >
            <Edit2 size={16} />
            <span>{t("auth:edit_profile")}</span>
          </button>
        ) : (
          <div className="flex gap-4 w-full mt-2">
            <button
              type="button"
              onClick={handleCancelEditMode}
              className="flex-1 py-3.5 font-heading font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer border-0 transition-all text-center"
            >
              {t("common:cancel")}
            </button>
            <button
              type="submit"
              disabled={actionLoading || !hasChanges || isAdding || editingIndex >= 0}
              className="flex-[2] py-3.5 font-heading font-bold text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer border-0 disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 transition-all"
            >
              {actionLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>
                {actionLoading ? t("auth:saving") : t("auth:save_details")}
              </span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default React.memo(ProfileEditTab);

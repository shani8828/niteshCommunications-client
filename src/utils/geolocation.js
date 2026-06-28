import { showToast } from "./toast";

/**
 * Robust geolocation helper that queries location with high accuracy,
 * and falls back to low accuracy if it fails or times out.
 * 
 * @param {Object} options Options to override defaults
 * @returns {Promise<GeolocationPosition>}
 */
export const getCurrentPositionWithFallback = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const error = new Error("Geolocation not supported by browser");
      error.code = 0; // custom code for unsupported
      reject(error);
      return;
    }

    const firstOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 15000,
      maximumAge: options.maximumAge ?? 0,
    };

    console.log("Attempting geolocation (high accuracy) with options:", firstOptions);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Geolocation successful on first attempt");
        resolve(position);
      },
      (error) => {
        console.log("First geolocation attempt failed:", error.code, error.message);
        
        // If permission is denied by the user, do not retry
        if (error.code === error.PERMISSION_DENIED) {
          reject(error);
          return;
        }

        // Retry with low accuracy
        const fallbackOptions = {
          enableHighAccuracy: false,
          timeout: options.fallbackTimeout ?? 20000,
          maximumAge: options.maximumAge ?? 0,
        };

        console.log("Retrying geolocation with fallback options:", fallbackOptions);
        navigator.geolocation.getCurrentPosition(
          (fallbackPosition) => {
            console.log("Geolocation successful on fallback attempt");
            resolve(fallbackPosition);
          },
          (fallbackError) => {
            console.log("Fallback geolocation attempt failed:", fallbackError.code, fallbackError.message);
            reject(fallbackError);
          },
          fallbackOptions
        );
      },
      firstOptions
    );
  });
};

/**
 * Handle geolocation error and show appropriate localized toast messages.
 * Logs the error code, message, and full error stack as requested.
 * 
 * @param {GeolocationPositionError} error The error object
 * @param {Function} [t] Optional translation function
 * @param {string} [lang] Language identifier if t is not available
 */
export const handleGeolocationError = (error, t, lang = "en") => {
  console.log("Geolocation error code:", error.code);
  console.log("Geolocation error message:", error.message);
  console.log("Geolocation full error:", error);

  // If translation function is provided
  if (typeof t === "function") {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        showToast.error(
          t("auth:location_permission_denied", "Location permission denied / स्थान अनुमति अस्वीकृत")
        );
        break;
      case error.POSITION_UNAVAILABLE:
        showToast.error(
          t("auth:location_unavailable", "Location unavailable / स्थान अनुपलब्ध")
        );
        break;
      case error.TIMEOUT:
        showToast.error(
          t("auth:location_timeout", "Location request timed out / स्थान अनुरोध का समय समाप्त")
        );
        break;
      default:
        showToast.error(
          error.message || t("auth:location_failed", "Failed to retrieve location / स्थान प्राप्त करने में विफल")
        );
    }
    return;
  }

  // Fallback to standard dual-language strings based on lang code
  const isHi = lang === "hi";
  switch (error.code) {
    case error.PERMISSION_DENIED:
      showToast.error(
        isHi
          ? "लोकेशन अनुमति अस्वीकृत (कृपया सेटिंग्स जांचें)"
          : "Location permission denied (please check settings)"
      );
      break;
    case error.POSITION_UNAVAILABLE:
      showToast.error(
        isHi
          ? "लोकेशन अनुपलब्ध (जीपीएस या डिवाइस स्थान सेवाएं चालू करें)"
          : "Location unavailable (turn on GPS or device location services)"
      );
      break;
    case error.TIMEOUT:
      showToast.error(
        isHi
          ? "स्थान अनुरोध का समय समाप्त (पुनः प्रयास करें)"
          : "Location request timed out (please try again)"
      );
      break;
    default:
      showToast.error(
        error.message || (isHi ? "स्थान प्राप्त करने में विफल" : "Failed to retrieve location")
      );
  }
};

let razorpayPromise = null;

/**
 * Load Razorpay's checkout script once and reuse it. Call it early (when a
 * payment screen opens) so the script is ready by the time the customer pays.
 * Resolves to true when window.Razorpay is available, false if loading failed.
 */
export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayPromise) {
    razorpayPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        // Allow a retry on the next attempt
        razorpayPromise = null;
        script.remove();
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return razorpayPromise;
};

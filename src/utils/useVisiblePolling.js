import { useEffect, useRef } from "react";

/**
 * Call `callback` every `intervalMs` while the browser tab is visible.
 * Polling stops completely in background tabs (no wasted requests or battery)
 * and runs once immediately when the user comes back, so data is fresh on return.
 */
const useVisiblePolling = (callback, intervalMs, enabled = true) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;

    let timer = null;
    const tick = () => callbackRef.current();
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const start = () => {
      stop();
      timer = setInterval(tick, intervalMs);
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        tick();
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs, enabled]);
};

export default useVisiblePolling;

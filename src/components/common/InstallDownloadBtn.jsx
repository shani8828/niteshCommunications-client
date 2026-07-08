import { useEffect, useState } from "react";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed app
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone
    ) {
      setInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (installed) {
      alert("App is already installed.");
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      console.log("Install Result:", outcome);

      setDeferredPrompt(null);
      return;
    }

    // Fallback for unsupported browsers
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isIOS) {
      alert(
        "To install this app:\n\nTap the Share button\nthen tap 'Add to Home Screen'.",
      );
    } else {
      alert(
        "Open your browser menu (⋮) and choose 'Install App' or 'Add to Home Screen' if available.",
      );
    }
  };

  return (
    <button
      onClick={installApp}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-all duration-300 hover:cursor-pointer hover:font-semibold"
    >
      {installed ? "App Installed" : "Download App"}
    </button>
  );
}

import { useState, useEffect } from "react";

interface PWAHook {
  canInstall: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => void;
}

export const usePWA = (): PWAHook => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null,
  );

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      try {
        if (
          window.matchMedia &&
          window.matchMedia("(display-mode: standalone)").matches
        ) {
          setIsInstalled(true);
        }
      } catch (error) {
        console.warn("Could not check installation status:", error);
      }
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for service worker updates
    const handleServiceWorkerUpdate = () => {
      try {
        if ("serviceWorker" in navigator && window.isSecureContext) {
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload();
          });

          navigator.serviceWorker.ready
            .then((registration) => {
              registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  setWaitingWorker(newWorker);
                  newWorker.addEventListener("statechange", () => {
                    if (
                      newWorker.state === "installed" &&
                      navigator.serviceWorker.controller
                    ) {
                      setUpdateAvailable(true);
                    }
                  });
                }
              });
            })
            .catch((error) => {
              console.warn("Service worker registration failed:", error);
            });
        }
      } catch (error) {
        console.warn("Service worker setup failed:", error);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    handleServiceWorkerUpdate();

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) return;

    try {
      if (!window.isSecureContext) {
        console.warn("Install prompt requires secure context");
        return;
      }

      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      }

      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error("Error installing app:", error);
      setCanInstall(false);
    }
  };

  const updateApp = (): void => {
    try {
      if (waitingWorker && window.isSecureContext) {
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
        setUpdateAvailable(false);
      }
    } catch (error) {
      console.warn("Failed to update app:", error);
      setUpdateAvailable(false);
    }
  };

  return {
    canInstall,
    isInstalled,
    isOnline,
    installApp,
    updateAvailable,
    updateApp,
  };
};

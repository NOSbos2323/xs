import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import {
  registerServiceWorker,
  clearOldCaches,
  preloadCriticalResources,
} from "./utils/performance";

const basename = import.meta.env.BASE_URL;

// Enhanced service worker registration with performance optimizations
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // Use Promise.allSettled for better error handling
      const [swResult, cacheResult] = await Promise.allSettled([
        registerServiceWorker(),
        clearOldCaches(),
      ]);

      if (swResult.status === "rejected") {
        console.warn("Service worker registration failed:", swResult.reason);
      }
      if (cacheResult.status === "rejected") {
        console.warn("Cache cleanup failed:", cacheResult.reason);
      }

      // Preload critical resources with better scheduling
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            preloadCriticalResources();
          },
          { timeout: 2000 },
        );
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          preloadCriticalResources();
        }, 100);
      }
    } catch (error) {
      console.error("Performance initialization failed:", error);
    }
  });
}

// Network status context with enhanced offline detection
export const NetworkStatusContext = React.createContext({
  isOnline: true,
});

const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
  }, []);

  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [mounted]);

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

// Performance monitoring
if (process.env.NODE_ENV === "development") {
  // Monitor performance in development
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "measure") {
        console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
      }
    }
  }).observe({ entryTypes: ["measure"] });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NetworkProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </NetworkProvider>
  </React.StrictMode>,
);

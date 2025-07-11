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

// Simplified service worker registration
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await registerServiceWorker();
      await clearOldCaches();
      setTimeout(() => preloadCriticalResources(), 1000);
    } catch (error) {
      console.warn("Service worker initialization failed:", error);
    }
  });
}

// Simplified network status context
export const NetworkStatusContext = React.createContext({
  isOnline: true,
});

const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <NetworkProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </NetworkProvider>
    </React.StrictMode>,
  );
}

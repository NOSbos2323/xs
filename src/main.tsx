import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

const basename = import.meta.env.BASE_URL;

// Simplified service worker registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("SW registered: ", registration);
    } catch (error) {
      console.warn("Service worker registration failed:", error);
    }
  });
}

// Simple network status context
const createNetworkStatusContext = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

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

  return { isOnline };
};

export const NetworkStatusContext = React.createContext({
  isOnline: navigator.onLine,
});

const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const networkStatus = createNetworkStatusContext();
  return (
    <NetworkStatusContext.Provider value={networkStatus}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NetworkProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </NetworkProvider>
  </React.StrictMode>,
);

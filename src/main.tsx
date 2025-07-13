import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Enhanced service worker registration for offline functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none", // Always check for updates
      });
      console.log("Service Worker registered successfully for offline support");

      // Check for updates every 30 seconds when page is visible
      const checkForUpdates = () => {
        if (!document.hidden) {
          registration.update().catch((err) => {
            console.log("SW update check failed:", err);
          });
        }
      };

      setInterval(checkForUpdates, 30000);
      document.addEventListener("visibilitychange", checkForUpdates);

      // Listen for service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log("New service worker installing...");
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log(
                "New service worker available - app updated for better offline support",
              );
              // Optionally show update notification to user
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification("Amino Gym", {
                  body: "تم تحديث التطبيق لتحسين الأداء دون انترنت",
                  icon: "/yacin-gym-logo.png",
                });
              }
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "OFFLINE_READY") {
          console.log("App is ready for offline use");
        }
        if (event.data && event.data.type === "BACKGROUND_SYNC") {
          console.log("Background sync status:", event.data.payload);
        }
      });

      // Register for background sync if supported
      if (
        "serviceWorker" in navigator &&
        "sync" in window.ServiceWorkerRegistration.prototype
      ) {
        registration.sync.register("background-sync").catch((err) => {
          console.log("Background sync registration failed:", err);
        });
      }
    } catch (error) {
      console.warn("Service Worker registration failed:", error);
    }
  });

  // Handle service worker errors
  navigator.serviceWorker.addEventListener("error", (error) => {
    console.error("Service Worker error:", error);
  });
}

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
}

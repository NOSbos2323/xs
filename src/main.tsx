import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Enhanced service worker registration for offline functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully for offline support");

      // Listen for service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker is available
              console.log(
                "New service worker available - app updated for better offline support",
              );
              // Show update notification
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification("Amino Gym - تحديث متاح", {
                  body: "تم تحديث التطبيق لدعم أفضل للعمل بدون انترنت",
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
          // Show offline ready notification
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("Amino Gym - جاهز للعمل بدون انترنت", {
              body: "التطبيق الآن جاهز للعمل بالكامل بدون انترنت",
              icon: "/yacin-gym-logo.png",
            });
          }
        }
        if (event.data && event.data.type === "BACKGROUND_SYNC") {
          console.log("Background sync status:", event.data.payload);
        }
      });

      // Request notification permission for offline features
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    } catch (error) {
      console.warn("Service Worker registration failed:", error);
    }
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

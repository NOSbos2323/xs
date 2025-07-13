import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Routes,
  Route,
  useRoutes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { offlineStorage } from "@/utils/offlineStorage";

// Simple lazy loading without complex utilities
const Home = lazy(() => import("./components/home"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const PaymentsPage = lazy(() => import("./components/payments/PaymentsPage"));
const LandingPage = lazy(() => import("./components/LandingPage"));

// Simple loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-500 animate-pulse" />
      <p className="text-white text-sm">جاري التحميل...</p>
    </div>
  </div>
);

// Component to handle PWA routing logic
const PWARouter = () => {
  const { isInstalled } = useInstallPrompt();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    // Initialize offline storage and check readiness
    const initOfflineSupport = async () => {
      try {
        await offlineStorage.requestNotificationPermission();
        const status = await offlineStorage.getOfflineQueueStatus();
        console.log("Offline queue status:", status);
        setIsOfflineReady(true);
      } catch (error) {
        console.error("Error initializing offline support:", error);
        setIsOfflineReady(true); // Continue anyway
      }
    };

    initOfflineSupport();

    // Only run this logic on the root path
    if (location.pathname === "/" && !hasCheckedAuth && isOfflineReady) {
      setHasCheckedAuth(true);

      // Check if user is logged in
      const user = localStorage.getItem("user");
      let isLoggedIn = false;

      if (user) {
        try {
          const userData = JSON.parse(user);
          isLoggedIn = userData.loggedIn;
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
        }
      }

      // If app is installed (PWA mode) and user is logged in, go to home
      if (isInstalled && isLoggedIn) {
        navigate("/home", { replace: true });
      }
      // If app is installed but user is not logged in, go to login
      else if (isInstalled && !isLoggedIn) {
        navigate("/login", { replace: true });
      }
      // If app is not installed, stay on landing page (handled by Routes below)
    }
  }, [
    isInstalled,
    navigate,
    location.pathname,
    hasCheckedAuth,
    isOfflineReady,
  ]);

  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/payments" element={<PaymentsPage />} />

      {/* Tempo routes */}
      {import.meta.env.VITE_TEMPO === "true" && (
        <Route path="/tempobook/*" element={<div />} />
      )}

      {/* Landing page for non-installed users, login redirect for others */}
      <Route path="/" element={isInstalled ? <LoginPage /> : <LandingPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

function App() {
  // Try to render tempo routes if available
  let tempoRoutesElement = null;
  if (import.meta.env.VITE_TEMPO === "true") {
    try {
      const routes = require("tempo-routes").default || [];
      if (Array.isArray(routes) && routes.length > 0) {
        tempoRoutesElement = useRoutes(routes);
      }
    } catch (error) {
      // Silently handle tempo routes not being available
    }
  }

  // If tempo routes match, render them
  if (tempoRoutesElement) {
    return (
      <div className="min-h-screen bg-slate-900">{tempoRoutesElement}</div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Suspense fallback={<PageLoader />}>
        <PWARouter />
      </Suspense>
    </div>
  );
}

export default App;

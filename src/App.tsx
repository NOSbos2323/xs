import React, { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, useRoutes, useNavigate } from "react-router-dom";

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

// Component to handle PWA installation detection and routing
const PWARouter = () => {
  const navigate = useNavigate();
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkInstallationStatus = () => {
      // تهيئة نظام إدارة الجلسات عند بدء التطبيق
      import("./services/sessionService").then(({ sessionService }) => {
        // التحقق من سلامة البيانات عند بدء التطبيق
        sessionService.validateDataIntegrity();
        // إنشاء نسخة احتياطية عند بدء التطبيق
        sessionService.createBackup();
      });

      // تهيئة نظام التخزين المحلي للعمل بدون انترنت
      import("./utils/offlineStorage").then(({ offlineStorage }) => {
        // طلب إذن الإشعارات للميزات المحلية
        offlineStorage.requestNotificationPermission();
        console.log("Offline storage initialized");
      });

      // Check if app is running as PWA (installed)
      const isPWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");

      setIsInstalled(isPWA);
      setIsLoading(false);

      // If PWA is installed and user is on root path, redirect to home if logged in
      if (isPWA && window.location.pathname === "/") {
        const user = localStorage.getItem("user");
        if (user) {
          try {
            const userData = JSON.parse(user);
            if (userData.loggedIn) {
              navigate("/home", { replace: true });
              return;
            }
          } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("user");
          }
        }
        // If not logged in, redirect to login
        navigate("/login", { replace: true });
      }
    };

    checkInstallationStatus();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener("change", checkInstallationStatus);

    return () => {
      mediaQuery.removeEventListener("change", checkInstallationStatus);
    };
  }, [navigate]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/payments" element={<PaymentsPage />} />

      {/* Tempo routes */}
      {import.meta.env.VITE_TEMPO === "true" && (
        <Route path="/tempobook/*" element={<div />} />
      )}

      {/* Root route - show landing page only if not installed */}
      <Route path="/" element={isInstalled ? <LoginPage /> : <LandingPage />} />

      {/* Catch all - redirect based on installation status */}
      <Route path="*" element={isInstalled ? <LoginPage /> : <LandingPage />} />
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

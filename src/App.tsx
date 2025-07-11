import React, { useEffect } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { createLazyComponent } from "./utils/performance";
import PWAInstallBanner from "./components/ui/pwa-install-banner";

// Lazy load components for better performance
const Home = createLazyComponent(() => import("./components/home"));
const LoginPage = createLazyComponent(
  () => import("./components/auth/LoginPage"),
);
const PaymentsPage = createLazyComponent(
  () => import("./components/payments/PaymentsPage"),
);

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-500 animate-pulse" />
      <p className="text-white text-sm">جاري التحميل...</p>
    </div>
  </div>
);

function App() {
  // Initialize routes conditionally
  const [tempoRoutes, setTempoRoutes] = React.useState<any[]>([]);

  useEffect(() => {
    const loadRoutes = async () => {
      if (import.meta.env.VITE_TEMPO) {
        try {
          // Use dynamic import with a variable to avoid TypeScript module resolution issues
          const moduleName = "tempo-routes";
          const routesModule = await import(/* @vite-ignore */ moduleName);
          setTempoRoutes(routesModule.default || []);
        } catch (error) {
          console.log("Tempo routes not available:", error);
          setTempoRoutes([]);
        }
      } else {
        setTempoRoutes([]);
      }
    };
    loadRoutes();
  }, []);

  // Render tempo routes if available
  const tempoRoutesElement =
    import.meta.env.VITE_TEMPO && tempoRoutes.length > 0
      ? useRoutes(tempoRoutes)
      : null;

  // If tempo routes match, render them
  if (tempoRoutesElement) {
    return (
      <div className="min-h-screen bg-background">
        {tempoRoutesElement}
        <PWAInstallBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payments" element={<PaymentsPage />} />

          {/* Add this before the catchall route */}
          {import.meta.env.VITE_TEMPO && (
            <Route path="/tempobook/*" element={<div />} />
          )}

          {/* Redirect root to login */}
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Suspense>

      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
}

export default App;

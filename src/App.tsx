import React from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load components
const Home = lazy(() => import("./components/home"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const PaymentsPage = lazy(() => import("./components/payments/PaymentsPage"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-500 animate-pulse" />
      <p className="text-white text-sm">جاري التحميل...</p>
    </div>
  </div>
);

// Tempo routes handler - only in development
const TempoRoutes = () => {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  try {
    if (import.meta.env.VITE_TEMPO) {
      // Use dynamic import with proper error handling
      import("tempo-routes")
        .then((routes) => {
          if (routes.default) {
            return useRoutes(routes.default);
          }
        })
        .catch((error) => {
          console.warn("Tempo routes not available:", error);
        });
    }
  } catch (error) {
    console.warn("Tempo routes error:", error);
  }
  return null;
};

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PageLoader />}>
        {/* Tempo routes for storyboards - only in development */}
        {process.env.NODE_ENV === "development" && <TempoRoutes />}

        <Routes>
          {/* Allow tempo to capture routes before catchall - only in development */}
          {process.env.NODE_ENV === "development" &&
            import.meta.env.VITE_TEMPO && (
              <Route path="/tempobook/*" element={<div />} />
            )}

          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;

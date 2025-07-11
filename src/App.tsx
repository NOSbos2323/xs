import React, { lazy, Suspense } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";

// Simple lazy loading without complex utilities
const Home = lazy(() => import("./components/home"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const PaymentsPage = lazy(() => import("./components/payments/PaymentsPage"));

// Simple loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-500 animate-pulse" />
      <p className="text-white text-sm">جاري التحميل...</p>
    </div>
  </div>
);

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
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payments" element={<PaymentsPage />} />

          {/* Tempo routes */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={<div />} />
          )}

          {/* Default routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;

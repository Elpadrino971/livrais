import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./i18n";
import "./App.css";
import { Toaster } from "./components/ui/sonner";

// Pages
import HomePage from "./pages/HomePage";
import CreateRequestPage from "./pages/CreateRequestPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import DelivererModePage from "./pages/DelivererModePage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import TrackingPage from "./pages/TrackingPage";
import CommunityPage from "./pages/CommunityPage";

// Components
import BottomNav from "./components/BottomNav";

function AppContent() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const hideNav = location.pathname === "/payment-success" || location.pathname.startsWith("/tracking/");

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateRequestPage />} />
        <Route path="/request/:id" element={<RequestDetailPage />} />
        <Route path="/tracking/:id" element={<TrackingPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/deliverer" element={<DelivererModePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage setTheme={setTheme} currentTheme={theme} />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
      </Routes>
      
      {!hideNav && <BottomNav />}
      <Toaster richColors position="top-center" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

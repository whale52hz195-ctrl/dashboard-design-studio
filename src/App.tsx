import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import UserVerification from "./pages/UserVerification";
import HostApplications from "./pages/HostApplications";
import HostManagement from "./pages/HostManagement";
import Agencies from "./pages/Agencies";
import CoinTraders from "./pages/CoinTraders";
import SplashBanner from "./pages/SplashBanner";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/user" element={<UserManagement />} />
          <Route path="/apps/user" element={<UserManagement />} />
          <Route path="/user-verification" element={<UserVerification />} />
          <Route path="/verification" element={<UserVerification />} />
          <Route path="/apps/user-verification" element={<UserVerification />} />
          <Route path="/host-applications" element={<HostApplications />} />
          <Route path="/host-application" element={<HostApplications />} />
          <Route path="/hosts" element={<HostManagement />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/coin-traders" element={<CoinTraders />} />
          <Route path="/coin-trader" element={<CoinTraders />} />
          <Route path="/banners" element={<SplashBanner />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/setting" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

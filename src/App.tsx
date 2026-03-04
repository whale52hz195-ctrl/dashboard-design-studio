import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import UserVerification from "./pages/UserVerification";
import HostApplications from "./pages/HostApplications";
import HostManagement from "./pages/HostManagement";
import Agencies from "./pages/Agencies";
import CoinTraders from "./pages/CoinTraders";
import SplashBanner from "./pages/SplashBanner";
import SplashPage from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import Settings from "./pages/Settings";
import PayoutMethods from "./pages/PayoutMethods";
import PayoutRequests from "./pages/PayoutRequests";
import GameList from "./pages/GameList";
import GamePage from "./pages/GamePage";
import GameDataUploader from "./pages/GameDataUploader";
import GameHistory from "./pages/GameHistory";
import GameHistoryUploader from "./pages/GameHistoryUploader";
import RealisticGameHistoryUploader from "./pages/RealisticGameHistoryUploader";
import CoinPlans from "./pages/CoinPlans";
import OrderHistory from "./pages/OrderHistory";
import WealthLevels from "./pages/WealthLevels";
import HelpRequests from "./pages/HelpRequests";
import ReferralSystem from "./pages/ReferralSystem";
import ReportManagement from "./pages/ReportManagement";
import Profile from "./pages/Profile";
import BeautyEffects from "./pages/BeautyEffects";
import Reactions from "./pages/Reactions";
import GiftCategorys from "./pages/GiftCategorys";
import Gifts from "./pages/Gifts";
import GiftPage from "./pages/GiftPage";
import HashtagPage from "./pages/HashtagPage";
import RechargeAgents from "./pages/RechargeAgents";
import TranslationsManager from "./pages/TranslationsManager";
import APIManagement from "./pages/APIManagement";
import NotFound from "./pages/NotFound";
import { StoreRides, StoreThemes, StoreFrames } from "./pages/Store";
import LiveStreaming from "./pages/LiveStreaming";
import PaymentManagement from "./pages/PaymentManagement";
import NotificationManager from "./pages/NotificationManager";
import ContentModeration from "./pages/ContentModeration";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/users" element={<RequireAuth><UserManagement /></RequireAuth>} />
            <Route path="/user" element={<RequireAuth><UserManagement /></RequireAuth>} />
            <Route path="/apps/user" element={<RequireAuth><UserManagement /></RequireAuth>} />
            <Route path="/user-verification" element={<RequireAuth><UserVerification /></RequireAuth>} />
            <Route path="/verification" element={<RequireAuth><UserVerification /></RequireAuth>} />
            <Route path="/apps/user-verification" element={<RequireAuth><UserVerification /></RequireAuth>} />
            <Route path="/host-applications" element={<RequireAuth><HostApplications /></RequireAuth>} />
            <Route path="/host-application" element={<RequireAuth><HostApplications /></RequireAuth>} />
            <Route path="/hosts" element={<RequireAuth><HostManagement /></RequireAuth>} />
            <Route path="/agencies" element={<RequireAuth><Agencies /></RequireAuth>} />
            <Route path="/coin-traders" element={<RequireAuth><CoinTraders /></RequireAuth>} />
            <Route path="/coin-trader" element={<RequireAuth><CoinTraders /></RequireAuth>} />
            <Route path="/store/rides" element={<RequireAuth><StoreRides /></RequireAuth>} />
            <Route path="/store/themes" element={<RequireAuth><StoreThemes /></RequireAuth>} />
            <Route path="/store/frames" element={<RequireAuth><StoreFrames /></RequireAuth>} />
            <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/splash" element={<RequireAuth><SplashPage /></RequireAuth>} />
            <Route path="/banners" element={<RequireAuth><SplashBanner /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/setting" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/payout-method" element={<RequireAuth><PayoutMethods /></RequireAuth>} />
            <Route path="/payout-request" element={<RequireAuth><PayoutRequests /></RequireAuth>} />
            <Route path="/game" element={<RequireAuth><GamePage /></RequireAuth>} />
            <Route path="/game-list" element={<RequireAuth><GameList /></RequireAuth>} />
            <Route path="/upload-games" element={<RequireAuth><GameDataUploader /></RequireAuth>} />
            <Route path="/game-history" element={<RequireAuth><GameHistory /></RequireAuth>} />
            <Route path="/upload-game-history" element={<RequireAuth><GameHistoryUploader /></RequireAuth>} />
            <Route path="/upload-realistic-game-history" element={<RequireAuth><RealisticGameHistoryUploader /></RequireAuth>} />
            <Route path="/coin-plan" element={<RequireAuth><CoinPlans /></RequireAuth>} />
            <Route path="/order-history" element={<RequireAuth><OrderHistory /></RequireAuth>} />
            <Route path="/wealth-level" element={<RequireAuth><WealthLevels /></RequireAuth>} />
            <Route path="/help" element={<RequireAuth><HelpRequests /></RequireAuth>} />
            <Route path="/referral-system" element={<RequireAuth><ReferralSystem /></RequireAuth>} />
            <Route path="/report" element={<RequireAuth><ReportManagement /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/beauty-effect" element={<RequireAuth><BeautyEffects /></RequireAuth>} />
            <Route path="/reaction" element={<RequireAuth><Reactions /></RequireAuth>} />
            <Route path="/store/giftcategorys" element={<RequireAuth><GiftCategorys /></RequireAuth>} />
            <Route path="/store/gift-categorys" element={<RequireAuth><GiftCategorys /></RequireAuth>} />
            <Route path="/gift" element={<RequireAuth><GiftPage /></RequireAuth>} />
            <Route path="/store/gifts" element={<RequireAuth><Gifts /></RequireAuth>} />
            <Route path="/hashtag" element={<RequireAuth><HashtagPage /></RequireAuth>} />
            <Route path="/recharge-agents" element={<RequireAuth><RechargeAgents /></RequireAuth>} />
            <Route path="/translations" element={<RequireAuth><TranslationsManager /></RequireAuth>} />
            <Route path="/live-streaming" element={<RequireAuth><LiveStreaming /></RequireAuth>} />
            <Route path="/payment-management" element={<RequireAuth><PaymentManagement /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><NotificationManager /></RequireAuth>} />
            <Route path="/content-moderation" element={<RequireAuth><ContentModeration /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><AnalyticsDashboard /></RequireAuth>} />
            <Route path="/api-management" element={<RequireAuth><APIManagement /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

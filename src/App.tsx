import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
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
import NotFound from "./pages/NotFound";
import { StoreRides, StoreThemes, StoreFrames } from "./pages/Store";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
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
            <Route path="/store/rides" element={<StoreRides />} />
            <Route path="/store/themes" element={<StoreThemes />} />
            <Route path="/store/frames" element={<StoreFrames />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/splash" element={<SplashPage />} />
            <Route path="/banners" element={<SplashBanner />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/setting" element={<Settings />} />
            <Route path="/payout-method" element={<PayoutMethods />} />
            <Route path="/payout-request" element={<PayoutRequests />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/game-list" element={<GameList />} />
            <Route path="/upload-games" element={<GameDataUploader />} />
            <Route path="/game-history" element={<GameHistory />} />
            <Route path="/upload-game-history" element={<GameHistoryUploader />} />
            <Route path="/upload-realistic-game-history" element={<RealisticGameHistoryUploader />} />
            <Route path="/coin-plan" element={<CoinPlans />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/wealth-level" element={<WealthLevels />} />
            <Route path="/help" element={<HelpRequests />} />
            <Route path="/referral-system" element={<ReferralSystem />} />
            <Route path="/report" element={<ReportManagement />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/beauty-effect" element={<BeautyEffects />} />
            <Route path="/reaction" element={<Reactions />} />
            <Route path="/store/giftcategorys" element={<GiftCategorys />} />
            <Route path="/store/gift-categorys" element={<GiftCategorys />} />
            <Route path="/gift" element={<GiftPage />} />
            <Route path="/store/gifts" element={<Gifts />} />
            <Route path="/hashtag" element={<HashtagPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

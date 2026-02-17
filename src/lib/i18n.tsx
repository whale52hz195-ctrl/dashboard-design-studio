import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type Language = "en" | "ar";

const translations: Record<string, Record<Language, string>> = {
  // Sidebar sections
  "sidebar.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "sidebar.userManagement": { en: "USER MANAGEMENT", ar: "إدارة المستخدمين" },
  "sidebar.user": { en: "User", ar: "المستخدم" },
  "sidebar.userVerification": { en: "User Verification", ar: "توثيق المستخدم" },
  "sidebar.hostApplication": { en: "Host Application", ar: "طلب الاستضافة" },
  "sidebar.coinTrader": { en: "Coin Trader", ar: "تاجر العملات" },
  "sidebar.banner": { en: "BANNER", ar: "البانر" },
  "sidebar.splash": { en: "Splash", ar: "شاشة البداية" },
  "sidebar.home": { en: "Home", ar: "الرئيسية" },
  "sidebar.gift": { en: "Gift", ar: "الهدية" },
  "sidebar.game": { en: "Game", ar: "اللعبة" },
  "sidebar.content": { en: "CONTENT", ar: "المحتوى" },
  "sidebar.hashtag": { en: "Hashtag", ar: "هاشتاق" },
  "sidebar.engagement": { en: "ENGAGEMENT", ar: "التفاعل" },
  "sidebar.gifts": { en: "Gifts", ar: "الهدايا" },
  "sidebar.giftCategory": { en: "Gift Category", ar: "فئة الهدايا" },
  "sidebar.store": { en: "Store", ar: "المتجر" },
  "sidebar.ride": { en: "Ride", ar: "المركبة" },
  "sidebar.theme": { en: "Theme", ar: "الثيم" },
  "sidebar.frame": { en: "Frame", ar: "الإطار" },
  "sidebar.reaction": { en: "Reaction", ar: "التفاعل" },
  "sidebar.beautyEffect": { en: "Beauty Effect", ar: "تأثيرات الجمال" },
  "sidebar.gameSection": { en: "GAME", ar: "الألعاب" },
  "sidebar.gameList": { en: "Game List", ar: "قائمة الألعاب" },
  "sidebar.gameHistory": { en: "Game History", ar: "سجل الألعاب" },
  "sidebar.package": { en: "PACKAGE", ar: "الباقات" },
  "sidebar.coinPlan": { en: "Coin Plan", ar: "خطة العملات" },
  "sidebar.orderHistory": { en: "Order History", ar: "سجل الطلبات" },
  "sidebar.wealthLevel": { en: "WEALTH LEVEL", ar: "مستوى الثروة" },
  "sidebar.wealthLevelItem": { en: "Wealth Level", ar: "مستوى الثروة" },
  "sidebar.support": { en: "SUPPORT & REPORTING", ar: "الدعم والتقارير" },
  "sidebar.help": { en: "Help", ar: "المساعدة" },
  "sidebar.report": { en: "Report", ar: "البلاغات" },
  "sidebar.referralSystem": { en: "REFERRAL SYSTEM", ar: "نظام الإحالة" },
  "sidebar.referralSystemItem": { en: "Referral System", ar: "نظام الإحالة" },
  "sidebar.financial": { en: "FINANCIAL", ar: "المالية" },
  "sidebar.payoutMethod": { en: "Payout Method", ar: "طريقة الدفع" },
  "sidebar.payoutRequest": { en: "Payout Request", ar: "طلب السحب" },
  "sidebar.system": { en: "SYSTEM", ar: "النظام" },
  "sidebar.setting": { en: "Setting", ar: "الإعدادات" },
  "sidebar.profile": { en: "Profile", ar: "الملف الشخصي" },
  "sidebar.logout": { en: "Logout", ar: "تسجيل الخروج" },
  "sidebar.adminPanel": { en: "Admin Panel", ar: "لوحة الإدارة" },

  // TopBar
  "topbar.search": { en: "Search...", ar: "بحث..." },

  // Login
  "login.title": { en: "Login to your account", ar: "تسجيل الدخول إلى حسابك" },
  "login.welcome": { en: "Welcome back! Please enter your details to sign in again.", ar: "مرحباً بعودتك! يرجى إدخال بياناتك لتسجيل الدخول." },
  "login.email": { en: "Email", ar: "البريد الإلكتروني" },
  "login.password": { en: "Password", ar: "كلمة المرور" },
  "login.rememberMe": { en: "Remember me?", ar: "تذكرني؟" },
  "login.forgotPassword": { en: "Forgot Password?", ar: "نسيت كلمة المرور؟" },
  "login.logIn": { en: "Log In", ar: "تسجيل الدخول" },
  "login.demoLogIn": { en: "Demo Log In", ar: "دخول تجريبي" },

  // Dashboard
  "dashboard.title": { en: "Dashboard", ar: "لوحة التحكم" },
  "dashboard.subtitle": { en: "Real-time overview of your platform", ar: "نظرة عامة في الوقت الفعلي على منصتك" },
  "dashboard.totalUsers": { en: "Total Users", ar: "إجمالي المستخدمين" },
  "dashboard.vipUsers": { en: "VIP Users", ar: "مستخدمين VIP" },
  "dashboard.totalHosts": { en: "Total Hosts", ar: "إجمالي المضيفين" },
  "dashboard.agencies": { en: "Agencies", ar: "الوكالات" },
  "dashboard.totalCoins": { en: "Total Coins", ar: "إجمالي العملات" },
  "dashboard.activeUsers": { en: "Active Users", ar: "المستخدمين النشطين" },
  "dashboard.newToday": { en: "New Today", ar: "الجدد اليوم" },
  "dashboard.revenue": { en: "Revenue", ar: "الإيرادات" },
  "dashboard.activityOverview": { en: "Activity Overview", ar: "نظرة عامة على النشاط" },
  "dashboard.topContributors": { en: "Top Contributors", ar: "أبرز المساهمين" },
  "dashboard.loading": { en: "Loading real-time data...", ar: "جاري تحميل البيانات..." },

  // Settings
  "settings.title": { en: "Settings", ar: "الإعدادات" },
  "settings.saveChanges": { en: "Save Changes", ar: "حفظ التغييرات" },
  "settings.general": { en: "General", ar: "عام" },
  "settings.payment": { en: "Payment", ar: "الدفع" },
  "settings.contentModeration": { en: "Content Moderation", ar: "إدارة المحتوى" },
  "settings.reportReasons": { en: "Report Reasons", ar: "أسباب البلاغ" },
  "settings.currency": { en: "Currency", ar: "العملة" },
  "settings.withdrawal": { en: "Withdrawal", ar: "السحب" },
  "settings.profileManagement": { en: "Profile Management", ar: "إدارة الملف الشخصي" },
  "settings.audioManagement": { en: "Audio Management", ar: "إدارة الصوتيات" },
  "settings.videoManagement": { en: "Video Management", ar: "إدارة الفيديو" },
  "settings.gameSetting": { en: "Game", ar: "اللعبة" },
  "settings.loading": { en: "Loading settings...", ar: "جاري تحميل الإعدادات..." },

  // User Management
  "users.title": { en: "User Management", ar: "إدارة المستخدمين" },
  "users.subtitle": { en: "Manage and monitor user accounts", ar: "إدارة ومراقبة حسابات المستخدمين" },
  "users.searchUser": { en: "Search User", ar: "بحث عن مستخدم" },
  "users.totalUsers": { en: "Total users", ar: "إجمالي المستخدمين" },
  "users.males": { en: "Males", ar: "ذكور" },
  "users.females": { en: "Females", ar: "إناث" },
  "users.vipUsers": { en: "VIP users", ar: "مستخدمين VIP" },
  "users.allUsers": { en: "All Users", ar: "جميع المستخدمين" },
  "users.realUsers": { en: "Real Users", ar: "مستخدمين حقيقيين" },
  "users.botUsers": { en: "Bot Users", ar: "مستخدمين آليين" },
  "users.allStatus": { en: "All Status", ar: "جميع الحالات" },
  "users.active": { en: "Active", ar: "نشط" },
  "users.banned": { en: "Banned", ar: "محظور" },
  "users.allRoles": { en: "All Roles", ar: "جميع الأدوار" },
  "users.filterByDate": { en: "Filter by Date", ar: "تصفية بالتاريخ" },
  "users.clearFilters": { en: "Clear Filters", ar: "مسح الفلاتر" },
  "users.showing": { en: "Showing", ar: "عرض" },
  "users.to": { en: "to", ar: "إلى" },
  "users.of": { en: "of", ar: "من" },
  "users.entries": { en: "entries", ar: "سجل" },
  "users.noUsers": { en: "No users found", ar: "لم يتم العثور على مستخدمين" },
  "users.loadingUsers": { en: "Loading users...", ar: "جاري تحميل المستخدمين..." },

  // Common
  "common.save": { en: "Save", ar: "حفظ" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.delete": { en: "Delete", ar: "حذف" },
  "common.edit": { en: "Edit", ar: "تعديل" },
  "common.add": { en: "Add", ar: "إضافة" },
  "common.search": { en: "Search", ar: "بحث" },
  "common.actions": { en: "Actions", ar: "إجراءات" },
  "common.status": { en: "Status", ar: "الحالة" },
  "common.show": { en: "Show", ar: "عرض" },
  "common.entries": { en: "entries", ar: "سجل" },
  "common.loading": { en: "Loading...", ar: "جاري التحميل..." },
  "common.remove": { en: "Remove", ar: "إزالة" },
  "common.upload": { en: "Upload", ar: "رفع" },
  "common.enable": { en: "Enable", ar: "تفعيل" },

  // Pages
  "page.homeBanner": { en: "Home Banner Management", ar: "إدارة بانر الرئيسية" },
  "page.giftBanner": { en: "Gift Announcement Banner", ar: "بانر إعلانات الهدايا" },
  "page.gameBanner": { en: "Game Banner Management", ar: "إدارة بانر الألعاب" },
  "page.splashBanner": { en: "Splash Banner Management", ar: "إدارة بانر البداية" },
  "page.reactions": { en: "Reactions", ar: "التفاعلات" },
  "page.coinTraders": { en: "Coin Traders", ar: "تجار العملات" },
  "page.coinPlans": { en: "Coin Plans", ar: "خطط العملات" },
  "page.orderHistory": { en: "Order History", ar: "سجل الطلبات" },
  "page.wealthLevels": { en: "Wealth Levels", ar: "مستويات الثروة" },
  "page.helpRequests": { en: "Help Requests", ar: "طلبات المساعدة" },
  "page.referralSystem": { en: "Referral System", ar: "نظام الإحالة" },
  "page.reportManagement": { en: "Report Management", ar: "إدارة البلاغات" },
  "page.beautyEffects": { en: "Beauty Effects", ar: "تأثيرات الجمال" },
  "page.hashtag": { en: "Hashtag Management", ar: "إدارة الهاشتاق" },
  "page.giftCategory": { en: "Gift Categories", ar: "فئات الهدايا" },
  "page.gifts": { en: "Gifts", ar: "الهدايا" },
  "page.gameList": { en: "Game List", ar: "قائمة الألعاب" },
  "page.gameHistory": { en: "Game History", ar: "سجل الألعاب" },
  "page.payoutMethods": { en: "Payout Methods", ar: "طرق الدفع" },
  "page.payoutRequests": { en: "Payout Requests", ar: "طلبات السحب" },
  "page.userVerification": { en: "User Verification", ar: "توثيق المستخدم" },
  "page.hostApplications": { en: "Host Applications", ar: "طلبات الاستضافة" },
  "page.addBanner": { en: "Add Banner", ar: "إضافة بانر" },
  "page.createReaction": { en: "Create Reaction", ar: "إنشاء تفاعل" },
  "page.manageBanners": { en: "Manage your banners", ar: "إدارة البانرات" },
  "page.manageGiftBanner": { en: "Manage your gift banner", ar: "إدارة بانر الهدايا" },
  "page.manageReactions": { en: "Manage your reactions", ar: "إدارة التفاعلات" },
  "page.totalBanners": { en: "Total Banners", ar: "إجمالي البانرات" },
  "page.profile": { en: "Profile", ar: "الملف الشخصي" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved === "ar" || saved === "en") ? saved : "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string) => {
      return translations[key]?.[language] || key;
    },
    [language]
  );

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export const mockReportReasons = [
  { id: "1", title: "Inappropriate Content", createdAt: "2024-01-15", updatedAt: "2024-03-10" },
  { id: "2", title: "Spam or Scam", createdAt: "2024-01-15", updatedAt: "2024-02-20" },
  { id: "3", title: "Harassment or Bullying", createdAt: "2024-01-15", updatedAt: "2024-04-05" },
  { id: "4", title: "Fake Profile", createdAt: "2024-02-01", updatedAt: "2024-03-15" },
  { id: "5", title: "Violence or Threats", createdAt: "2024-02-10", updatedAt: "2024-05-01" },
  { id: "6", title: "Nudity or Sexual Content", createdAt: "2024-03-01", updatedAt: "2024-04-20" },
];

export const mockCurrencies = [
  { id: "1", name: "US Dollar", symbol: "$", countryCode: "US", currencyCode: "USD", isDefault: true },
  { id: "2", name: "Euro", symbol: "€", countryCode: "EU", currencyCode: "EUR", isDefault: false },
  { id: "3", name: "British Pound", symbol: "£", countryCode: "GB", currencyCode: "GBP", isDefault: false },
  { id: "4", name: "Indian Rupee", symbol: "₹", countryCode: "IN", currencyCode: "INR", isDefault: false },
  { id: "5", name: "Saudi Riyal", symbol: "﷼", countryCode: "SA", currencyCode: "SAR", isDefault: false },
];

export const mockProfileImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop",
];

export const mockAudioFiles = [
  { id: "1", name: "Welcome Sound", url: "#", duration: "0:30" },
  { id: "2", name: "Notification Tone", url: "#", duration: "0:05" },
];

export const mockVideoFiles = [
  { id: "1", name: "Intro Video", url: "#", duration: "1:30", thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop" },
];

export const defaultGeneralSettings = {
  privateVideoCallRate: "50",
  privateAudioCallRate: "30",
  loginBonus: "10",
  durationOfShorts: "60",
  pkEndTime: "300",
  adminRate: "10",
  agoraAppId: "",
  agoraAppCertificate: "",
  minGiftAnnouncementCoin: "1000",
  minGameAnnouncementCoin: "500",
  fakeDataEnabled: false,
  privacyPolicyLink: "https://example.com/privacy",
  termsOfUseLink: "https://example.com/terms",
  shortsEffectEnabled: true,
  shortsLicenseKey: "",
  shortsLicenseSecret: "",
  watermarkEnabled: false,
  adminTaxPercent: "10",
  receiverSharePercent: "90",
  firebasePrivateKey: "",
};

export const defaultPaymentSettings = {
  stripeEnabled: true,
  stripePublishableKey: "",
  stripeSecretKey: "",
  razorpayEnabled: false,
  razorpayId: "",
  razorpaySecretKey: "",
  flutterwaveEnabled: false,
  flutterwaveId: "",
  googlePlayEnabled: false,
  googlePlayServiceEmail: "",
  googlePlayPrivateKey: "",
};

export const defaultWithdrawalSettings = {
  currency: "USD",
  coins: "100",
  minCoinsPayoutUser: "5000",
  minCoinsPayoutAgency: "10000",
};

export const defaultGameSettings = {
  bet1: "10",
  bet1Description: "Small Bet",
  bet2: "50",
  bet2Description: "Medium Bet",
  bet3: "100",
  bet3Description: "Large Bet",
  bet4: "500",
  bet4Description: "High Roller",
  bet5: "1000",
  bet5Description: "Jackpot Bet",
};

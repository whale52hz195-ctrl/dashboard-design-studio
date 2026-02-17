// Simple script to demonstrate the settings structure
// Copy this JSON and upload it manually to Firebase Console at /settings/app

const settingsData = {
  general: {
    privateVideoCallRate: "10",
    privateAudioCallRate: "5", 
    loginBonus: "100",
    durationOfShorts: "30",
    pkEndTime: "300",
    adminRate: "10",
    agoraAppId: "",
    agoraAppCertificate: "",
    minGiftAnnouncementCoin: "1000",
    minGameAnnouncementCoin: "500",
    fakeDataEnabled: false,
    privacyPolicyLink: "https://example.com/privacy",
    termsOfUseLink: "https://example.com/terms",
    shortsEffectEnabled: false,
    shortsLicenseKey: "",
    shortsLicenseSecret: "",
    watermarkEnabled: false,
    watermarkImage: "",
    adminTaxPercent: "5",
    receiverSharePercent: "95",
    firebasePrivateKey: ""
  },
  payment: {
    stripeEnabled: false,
    stripePublishableKey: "",
    stripeSecretKey: "",
    razorpayEnabled: false,
    razorpayId: "",
    razorpaySecretKey: "",
    flutterwaveEnabled: false,
    flutterwaveId: "",
    googlePlayEnabled: false,
    googlePlayServiceEmail: "",
    googlePlayPrivateKey: ""
  },
  withdrawal: {
    currency: "USD",
    coins: "1000",
    minCoinsPayoutUser: "5000",
    minCoinsPayoutAgency: "10000"
  },
  game: {
    bets: {
      "1": "100",
      "2": "200", 
      "3": "500",
      "4": "1000",
      "5": "2000"
    }
  },
  reportReasons: [
    { id: "1", title: "Inappropriate Content", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    { id: "2", title: "Spam", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    { id: "3", title: "Harassment", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    { id: "4", title: "Fake Account", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    { id: "5", title: "Copyright Violation", createdAt: "2024-01-01", updatedAt: "2024-01-01" }
  ],
  currencies: [
    { id: "1", name: "US Dollar", symbol: "$", countryCode: "US", currencyCode: "USD", isDefault: true },
    { id: "2", name: "Euro", symbol: "€", countryCode: "EU", currencyCode: "EUR", isDefault: false },
    { id: "3", name: "British Pound", symbol: "£", countryCode: "GB", currencyCode: "GBP", isDefault: false }
  ],
  profileImages: [
    "https://picsum.photos/seed/profile1/200/200.jpg",
    "https://picsum.photos/seed/profile2/200/200.jpg",
    "https://picsum.photos/seed/profile3/200/200.jpg"
  ],
  audioFiles: [
    { id: "1", name: "Background Music 1", duration: "3:45", url: "https://example.com/audio1.mp3" },
    { id: "2", name: "Sound Effect 1", duration: "0:15", url: "https://example.com/sfx1.mp3" }
  ],
  videoFiles: [
    { id: "1", name: "Intro Video", duration: "0:30", thumbnail: "https://picsum.photos/seed/video1/200/200.jpg", url: "https://example.com/video1.mp4" }
  ],
  contentModeration: {
    sightengineUser: "",
    sightengineApiSecret: "",
    videoBannedKeywords: ["violence", "nudity", "hate", "drugs", "weapons"],
    postBannedKeywords: ["spam", "abuse", "scam", "fake", "hate"]
  },
  updatedAt: new Date().toISOString()
};

console.log('Settings data structure:');
console.log(JSON.stringify(settingsData, null, 2));
console.log('\nTo upload this data:');
console.log('1. Go to Firebase Console');
console.log('2. Navigate to Firestore Database');
console.log('3. Create a collection called "settings"');
console.log('4. Create a document with ID "app"');
console.log('5. Copy and paste the JSON data above');

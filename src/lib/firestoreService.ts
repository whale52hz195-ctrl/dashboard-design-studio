import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { mockUsersData } from '@/data/mockUsersData';

export interface PayoutRequest {
  id: string;
  requestId: string;
  agencyName?: string;
  agencyImage?: string;
  hostName?: string;
  hostImage?: string;
  coins: number;
  amount: number;
  paymentMethod: string;
  paymentDetails: string | string[];
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  userType: 'agency' | 'host' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface PayoutMethod {
  id: string;
  name: string;
  image: string;
  requiredDetails: string[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  name: string;
  userName: string;
  email: string;
  image: string;
  gender: string;
  age: number;
  country: string;
  countryCode: string;
  countryFlagImage: string;
  coin: number;
  coins: number;
  followers: number;
  followersCount: number;
  followingCount: number;
  followings: number;
  isVerified: boolean;
  isProfilePicBanned: boolean;
  loginType: number;
  bio: string;
  fcmToken: string;
  createdAt: string;
  updatedAt: string;
  wealthLevel: {
    level: number;
    name: string;
  };
}

export interface AppSettings {
  general: {
    privateVideoCallRate: string;
    privateAudioCallRate: string;
    loginBonus: string;
    durationOfShorts: string;
    pkEndTime: string;
    adminRate: string;
    agoraAppId: string;
    agoraAppCertificate: string;
    minGiftAnnouncementCoin: string;
    minGameAnnouncementCoin: string;
    fakeDataEnabled: boolean;
    privacyPolicyLink: string;
    termsOfUseLink: string;
    shortsEffectEnabled: boolean;
    shortsLicenseKey: string;
    shortsLicenseSecret: string;
    watermarkEnabled: boolean;
    watermarkImage?: string;
    adminTaxPercent: string;
    receiverSharePercent: string;
    firebasePrivateKey: string;
  };
  payment: {
    stripeEnabled: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    razorpayEnabled: boolean;
    razorpayId: string;
    razorpaySecretKey: string;
    flutterwaveEnabled: boolean;
    flutterwaveId: string;
    googlePlayEnabled: boolean;
    googlePlayServiceEmail: string;
    googlePlayPrivateKey: string;
  };
  withdrawal: {
    currency: string;
    coins: string;
    minCoinsPayoutUser: string;
    minCoinsPayoutAgency: string;
  };
  game: {
    bets: { [key: string]: string };
  };
  reportReasons: Array<{
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }>;
  currencies: Array<{
    id: string;
    name: string;
    symbol: string;
    countryCode: string;
    currencyCode: string;
    isDefault: boolean;
  }>;
  profileImages: string[];
  audioFiles: Array<{
    id: string;
    name: string;
    duration: string;
    url: string;
  }>;
  videoFiles: Array<{
    id: string;
    name: string;
    duration: string;
    thumbnail: string;
    url: string;
  }>;
  contentModeration: {
    sightengineUser: string;
    sightengineApiSecret: string;
    videoBannedKeywords: string[];
    postBannedKeywords: string[];
  };
  updatedAt: string;
}

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  try {
    return db && typeof db === 'object';
  } catch (error) {
    return false;
  }
};

export const getUsers = async (lastDoc?: any, pageSize = 10) => {
  // Use mock data if Firebase is not configured
  if (!isFirebaseConfigured()) {
    return {
      users: mockUsersData.slice(0, pageSize),
      lastDoc: null,
      hasMore: false
    };
  }

  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, orderBy('createdAt', 'desc'), limit(pageSize));
    
    if (lastDoc) {
      q = query(usersRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
    }
    
    const snapshot = await getDocs(q);
    const users: User[] = [];
    
    snapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as User);
    });
    
    return {
      users,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    // Fallback to mock data
    return {
      users: mockUsersData.slice(0, pageSize),
      lastDoc: null,
      hasMore: false
    };
  }
};

export const getUserById = async (uid: string) => {
  // Use mock data if Firebase is not configured
  if (!isFirebaseConfigured()) {
    return mockUsersData.find(user => user.uid === uid) || null;
  }

  try {
    const userDoc = doc(db, 'users', uid);
    const snapshot = await getDoc(userDoc);
    
    if (snapshot.exists()) {
      return { uid: snapshot.id, ...snapshot.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return mockUsersData.find(user => user.uid === uid) || null;
  }
};

export const searchUsers = async (searchTerm: string) => {
  // Use mock data if Firebase is not configured
  if (!isFirebaseConfigured()) {
    return mockUsersData.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name'), limit(20));
    const snapshot = await getDocs(q);
    
    const users: User[] = [];
    snapshot.forEach((doc) => {
      const userData = { uid: doc.id, ...doc.data() } as User;
      if (userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userData.userName.toLowerCase().includes(searchTerm.toLowerCase())) {
        users.push(userData);
      }
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    // Fallback to mock data
    return mockUsersData.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

export const filterUsers = async (filters: {
  gender?: string;
  country?: string;
  isVerified?: boolean;
  loginType?: number;
}) => {
  // Use mock data if Firebase is not configured
  if (!isFirebaseConfigured()) {
    return mockUsersData.filter(user => {
      if (filters.gender && user.gender !== filters.gender) return false;
      if (filters.country && user.country !== filters.country) return false;
      if (filters.isVerified !== undefined && user.isVerified !== filters.isVerified) return false;
      if (filters.loginType !== undefined && user.loginType !== filters.loginType) return false;
      return true;
    });
  }

  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, orderBy('createdAt', 'desc'));
    
    if (filters.gender) {
      q = query(q, where('gender', '==', filters.gender));
    }
    
    if (filters.country) {
      q = query(q, where('country', '==', filters.country));
    }
    
    if (filters.isVerified !== undefined) {
      q = query(q, where('isVerified', '==', filters.isVerified));
    }
    
    if (filters.loginType !== undefined) {
      q = query(q, where('loginType', '==', filters.loginType));
    }
    
    const snapshot = await getDocs(q);
    const users: User[] = [];
    
    snapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as User);
    });
    
    return users;
  } catch (error) {
    console.error('Error filtering users:', error);
    // Fallback to mock data
    return mockUsersData.filter(user => {
      if (filters.gender && user.gender !== filters.gender) return false;
      if (filters.country && user.country !== filters.country) return false;
      if (filters.isVerified !== undefined && user.isVerified !== filters.isVerified) return false;
      if (filters.loginType !== undefined && user.loginType !== filters.loginType) return false;
      return true;
    });
  }
};

export const getUserStats = async () => {
  // Use mock data if Firebase is not configured
  if (!isFirebaseConfigured()) {
    const stats = {
      total: mockUsersData.length,
      males: mockUsersData.filter(u => u.gender === 'Male').length,
      females: mockUsersData.filter(u => u.gender === 'Female').length,
      vips: mockUsersData.filter(u => u.wealthLevel?.level > 1).length,
      verified: mockUsersData.filter(u => u.isVerified).length,
      banned: mockUsersData.filter(u => u.isProfilePicBanned).length
    };
    return stats;
  }

  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const stats = {
      total: snapshot.size,
      males: 0,
      females: 0,
      vips: 0,
      verified: 0,
      banned: 0
    };
    
    snapshot.forEach((doc) => {
      const user = doc.data() as User;
      if (user.gender === 'Male') stats.males++;
      if (user.gender === 'Female') stats.females++;
      if (user.wealthLevel?.level > 1) stats.vips++;
      if (user.isVerified) stats.verified++;
      if (user.isProfilePicBanned) stats.banned++;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    // Fallback to mock data
    const stats = {
      total: mockUsersData.length,
      males: mockUsersData.filter(u => u.gender === 'Male').length,
      females: mockUsersData.filter(u => u.gender === 'Female').length,
      vips: mockUsersData.filter(u => u.wealthLevel?.level > 1).length,
      verified: mockUsersData.filter(u => u.isVerified).length,
      banned: mockUsersData.filter(u => u.isProfilePicBanned).length
    };
    return stats;
  }
};

// Settings service functions
export const getAppSettings = async (): Promise<AppSettings | null> => {
  if (!isFirebaseConfigured()) {
    // Return mock settings if Firebase is not configured
    return {
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
        privacyPolicyLink: "",
        termsOfUseLink: "",
        shortsEffectEnabled: false,
        shortsLicenseKey: "",
        shortsLicenseSecret: "",
        watermarkEnabled: false,
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
        { id: "3", title: "Harassment", createdAt: "2024-01-01", updatedAt: "2024-01-01" }
      ],
      currencies: [
        { id: "1", name: "US Dollar", symbol: "$", countryCode: "US", currencyCode: "USD", isDefault: true },
        { id: "2", name: "Euro", symbol: "€", countryCode: "EU", currencyCode: "EUR", isDefault: false }
      ],
      profileImages: [],
      audioFiles: [],
      videoFiles: [],
      contentModeration: {
        sightengineUser: "",
        sightengineApiSecret: "",
        videoBannedKeywords: ["violence", "nudity", "hate"],
        postBannedKeywords: ["spam", "abuse", "scam"]
      },
      updatedAt: new Date().toISOString()
    };
  }

  try {
    const settingsDoc = doc(db, 'settings', 'dashboard');
    const snapshot = await getDoc(settingsDoc);
    
    if (snapshot.exists()) {
      return snapshot.data() as AppSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
};

export const updateAppSettings = async (settings: Partial<AppSettings>): Promise<boolean> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, simulating update');
    return true;
  }

  try {
    const settingsDoc = doc(db, 'settings', 'dashboard');
    const updateData = {
      ...settings,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(settingsDoc, updateData);
    return true;
  } catch (error) {
    console.error('Error updating app settings:', error);
    return false;
  }
};

export const createAppSettings = async (settings: AppSettings): Promise<boolean> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, simulating creation');
    return true;
  }

  try {
    const settingsDoc = doc(db, 'settings', 'dashboard');
    const settingsData = {
      ...settings,
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(settingsDoc, settingsData);
    return true;
  } catch (error) {
    console.error('Error creating app settings:', error);
    return false;
  }
};

// Payout Methods service functions
const mockPayoutMethods: PayoutMethod[] = [
  {
    id: "1",
    name: "UPI / Google Pay",
    image: "/placeholder.svg",
    requiredDetails: ["Full Name", "UPI ID / Google Pay ID", "Mobile Number"],
    status: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: "2",
    name: "Bank Transfer",
    image: "/placeholder.svg",
    requiredDetails: ["Full Name", "Bank Name", "Account Number", "IFSC/SWIFT Code", "Country"],
    status: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  }
];

export const getPayoutMethods = async (): Promise<PayoutMethod[]> => {
  if (!isFirebaseConfigured()) {
    return mockPayoutMethods;
  }

  try {
    const payoutMethodsRef = collection(db, 'payoutMethods');
    const q = query(payoutMethodsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const payoutMethods: PayoutMethod[] = [];
    snapshot.forEach((doc) => {
      payoutMethods.push({ id: doc.id, ...doc.data() } as PayoutMethod);
    });
    
    return payoutMethods;
  } catch (error) {
    console.error('Error fetching payout methods:', error);
    return mockPayoutMethods;
  }
};

export const createPayoutMethod = async (method: Omit<PayoutMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, simulating creation');
    return true;
  }

  try {
    const payoutMethodsRef = collection(db, 'payoutMethods');
    const newMethod = {
      ...method,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0]
    };
    
    const newDocRef = doc(payoutMethodsRef);
    await setDoc(newDocRef, newMethod);
    return true;
  } catch (error) {
    console.error('Error creating payout method:', error);
    return false;
  }
};

export const updatePayoutMethod = async (id: string, method: Partial<PayoutMethod>): Promise<boolean> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, simulating update');
    return true;
  }

  try {
    const methodDoc = doc(db, 'payoutMethods', id);
    const updateData = {
      ...method,
      updatedAt: new Date().toISOString().split("T")[0]
    };
    
    await updateDoc(methodDoc, updateData);
    return true;
  } catch (error) {
    console.error('Error updating payout method:', error);
    return false;
  }
};

export const deletePayoutMethod = async (id: string): Promise<boolean> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, simulating deletion');
    return true;
  }

  try {
    const methodDoc = doc(db, 'payoutMethods', id);
    await deleteDoc(methodDoc);
    return true;
  } catch (error) {
    console.error('Error deleting payout method:', error);
    return false;
  }
};

// Payout Requests service functions
const mockPayoutRequests: PayoutRequest[] = [
  {
    id: "1",
    requestId: "HIS-55D4CF",
    agencyName: "Demo Agency",
    agencyImage: "https://picsum.photos/seed/demo/100/100.jpg",
    coins: 300,
    amount: 30.00,
    paymentMethod: "UPI / Google Pay",
    paymentDetails: ["Jayesh ladva", "Ladvajayesh@okabi", "9987933004"],
    requestDate: "1/21/2026, 11:43:22 AM",
    status: "pending",
    userType: "agency",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    requestId: "REQ002",
    hostName: "Mike Chen",
    hostImage: "https://picsum.photos/seed/mike/100/100.jpg",
    coins: 75000,
    amount: 375.00,
    paymentMethod: "Bank Transfer",
    paymentDetails: "****1234",
    requestDate: "2024-01-14",
    status: "pending",
    userType: "host",
    createdAt: "2024-01-14T15:45:00Z",
    updatedAt: "2024-01-14T15:45:00Z"
  },
  {
    id: "3",
    requestId: "REQ003",
    agencyName: "Tech Agency",
    agencyImage: "https://picsum.photos/seed/tech/100/100.jpg",
    coins: 30000,
    amount: 150.00,
    paymentMethod: "PayPal",
    paymentDetails: ["tech.agency@email.com", "Business Account"],
    requestDate: "2024-01-13",
    status: "approved",
    userType: "agency",
    createdAt: "2024-01-13T09:20:00Z",
    updatedAt: "2024-01-13T14:30:00Z"
  },
  {
    id: "4",
    requestId: "REQ004",
    hostName: "Alex Kumar",
    hostImage: "https://picsum.photos/seed/alex/100/100.jpg",
    coins: 100000,
    amount: 500.00,
    paymentMethod: "Wise Transfer",
    paymentDetails: "alex.kumar@wise.com",
    requestDate: "2024-01-12",
    status: "pending",
    userType: "user",
    createdAt: "2024-01-12T11:15:00Z",
    updatedAt: "2024-01-12T11:15:00Z"
  },
  {
    id: "5",
    requestId: "REQ005",
    hostName: "Lisa Anderson",
    hostImage: "https://picsum.photos/seed/lisa/100/100.jpg",
    coins: 45000,
    amount: 225.00,
    paymentMethod: "Skrill",
    paymentDetails: "lisa.anderson@skrill",
    requestDate: "2024-01-11",
    status: "rejected",
    userType: "host",
    createdAt: "2024-01-11T16:00:00Z",
    updatedAt: "2024-01-12T09:00:00Z"
  }
];

export const getPayoutRequests = async (): Promise<PayoutRequest[]> => {
  if (!isFirebaseConfigured()) {
    return mockPayoutRequests;
  }

  try {
    const payoutRequestsRef = collection(db, 'payoutRequests');
    const q = query(payoutRequestsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const payoutRequests: PayoutRequest[] = [];
    snapshot.forEach((doc) => {
      payoutRequests.push({ id: doc.id, ...doc.data() } as PayoutRequest);
    });
    
    return payoutRequests;
  } catch (error) {
    console.error('Error fetching payout requests:', error);
    return mockPayoutRequests;
  }
};

export const createPayoutRequest = async (request: Omit<PayoutRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, simulating creation');
    return true;
  }

  try {
    const payoutRequestsRef = collection(db, 'payoutRequests');
    const newRequest = {
      ...request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const newDocRef = doc(payoutRequestsRef);
    await setDoc(newDocRef, newRequest);
    return true;
  } catch (error) {
    console.error('Error creating payout request:', error);
    return false;
  }
};

export const updatePayoutRequest = async (id: string, request: Partial<PayoutRequest>): Promise<boolean> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, simulating update');
    return true;
  }

  try {
    const requestDoc = doc(db, 'payoutRequests', id);
    
    // Check if document exists first
    const docSnapshot = await getDoc(requestDoc);
    if (!docSnapshot.exists()) {
      console.error('Document does not exist:', id);
      return false;
    }
    
    const updateData = {
      ...request,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(requestDoc, updateData);
    return true;
  } catch (error) {
    console.error('Error updating payout request:', error);
    return false;
  }
};

export const deletePayoutRequest = async (id: string): Promise<boolean> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, simulating deletion');
    return true;
  }

  try {
    const requestDoc = doc(db, 'payoutRequests', id);
    await deleteDoc(requestDoc);
    return true;
  } catch (error) {
    console.error('Error deleting payout request:', error);
    return false;
  }
};

// Dashboard statistics service functions
export interface DashboardStats {
  totalUsers: number;
  vipUsers: number;
  totalHosts: number;
  totalAgencies: number;
  totalCoins: number;
  activeUsers: number;
  newUsersToday: number;
  revenue: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  if (!isFirebaseConfigured()) {
    // Return mock data if Firebase is not configured
    return {
      totalUsers: 24580,
      vipUsers: 1890,
      totalHosts: 456,
      totalAgencies: 32,
      totalCoins: 15890000,
      activeUsers: 18420,
      newUsersToday: 145,
      revenue: 89500,
    };
  }

  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const stats: DashboardStats = {
      totalUsers: usersSnapshot.size,
      vipUsers: 0,
      totalHosts: 0,
      totalAgencies: 0,
      totalCoins: 0,
      activeUsers: 0,
      newUsersToday: 0,
      revenue: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.toISOString();

    usersSnapshot.forEach((doc) => {
      const user = doc.data() as User;
      
      // Count VIP users (wealth level > 1)
      if (user.wealthLevel?.level > 1) {
        stats.vipUsers++;
      }
      
      // Count total coins
      stats.totalCoins += user.coins || 0;
      
      // Count active users (users with coins > 0 or followers > 0)
      if ((user.coins && user.coins > 0) || (user.followersCount && user.followersCount > 0)) {
        stats.activeUsers++;
      }
      
      // Count new users today
      if (user.createdAt && user.createdAt >= todayTimestamp) {
        stats.newUsersToday++;
      }
    });

    // Get hosts count
    const hostsRef = collection(db, 'hosts');
    const hostsSnapshot = await getDocs(hostsRef);
    stats.totalHosts = hostsSnapshot.size;

    // Get agencies count
    const agenciesRef = collection(db, 'agencies');
    const agenciesSnapshot = await getDocs(agenciesRef);
    stats.totalAgencies = agenciesSnapshot.size;

    // Calculate revenue (this could be from orders, transactions, etc.)
    // For now, we'll estimate based on total coins
    stats.revenue = Math.floor(stats.totalCoins * 0.01); // 1% of total coins as revenue estimate

    return stats;
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    // Fallback to mock data
    return {
      totalUsers: 24580,
      vipUsers: 1890,
      totalHosts: 456,
      totalAgencies: 32,
      totalCoins: 15890000,
      activeUsers: 18420,
      newUsersToday: 145,
      revenue: 89500,
    };
  }
};

// Activity data for charts
export interface ActivityData {
  name: string;
  users: number;
  hosts: number;
  revenue: number;
}

export const getActivityData = async (): Promise<ActivityData[]> => {
  if (!isFirebaseConfigured()) {
    // Return mock activity data
    return [
      { name: "Jan", users: 4000, hosts: 240, revenue: 12000 },
      { name: "Feb", users: 5200, hosts: 310, revenue: 15000 },
      { name: "Mar", users: 4800, hosts: 280, revenue: 13500 },
      { name: "Apr", users: 6100, hosts: 350, revenue: 18000 },
      { name: "May", users: 7200, hosts: 420, revenue: 22000 },
      { name: "Jun", users: 6800, hosts: 390, revenue: 20000 },
      { name: "Jul", users: 8100, hosts: 480, revenue: 25000 },
      { name: "Aug", users: 7500, hosts: 440, revenue: 23000 },
      { name: "Sep", users: 9200, hosts: 520, revenue: 28000 },
      { name: "Oct", users: 8800, hosts: 500, revenue: 27000 },
      { name: "Nov", users: 10500, hosts: 580, revenue: 32000 },
      { name: "Dec", users: 11200, hosts: 620, revenue: 35000 },
    ];
  }

  try {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const activityData: ActivityData[] = [];

    for (let i = 0; i < 12; i++) {
      const month = i + 1;
      const monthStart = new Date(currentYear, month - 1, 1).toISOString();
      const monthEnd = new Date(currentYear, month, 0, 23, 59, 59).toISOString();

      // Get users created in this month
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        where('createdAt', '>=', monthStart),
        where('createdAt', '<=', monthEnd)
      );
      const usersSnapshot = await getDocs(usersQuery);

      // Get hosts created in this month
      const hostsRef = collection(db, 'hosts');
      const hostsQuery = query(
        hostsRef,
        where('createdAt', '>=', monthStart),
        where('createdAt', '<=', monthEnd)
      );
      const hostsSnapshot = await getDocs(hostsQuery);

      // Calculate revenue for this month (this could be from orders collection)
      // For now, we'll estimate based on user activity
      const revenue = usersSnapshot.size * 50; // Estimate $50 per user

      activityData.push({
        name: months[i],
        users: usersSnapshot.size,
        hosts: hostsSnapshot.size,
        revenue: revenue,
      });
    }

    return activityData;
  } catch (error) {
    console.error('Error getting activity data:', error);
    // Fallback to mock data
    return [
      { name: "Jan", users: 4000, hosts: 240, revenue: 12000 },
      { name: "Feb", users: 5200, hosts: 310, revenue: 15000 },
      { name: "Mar", users: 4800, hosts: 280, revenue: 13500 },
      { name: "Apr", users: 6100, hosts: 350, revenue: 18000 },
      { name: "May", users: 7200, hosts: 420, revenue: 22000 },
      { name: "Jun", users: 6800, hosts: 390, revenue: 20000 },
      { name: "Jul", users: 8100, hosts: 480, revenue: 25000 },
      { name: "Aug", users: 7500, hosts: 440, revenue: 23000 },
      { name: "Sep", users: 9200, hosts: 520, revenue: 28000 },
      { name: "Oct", users: 8800, hosts: 500, revenue: 27000 },
      { name: "Nov", users: 10500, hosts: 580, revenue: 32000 },
      { name: "Dec", users: 11200, hosts: 620, revenue: 35000 },
    ];
  }
};

// Top contributors
export interface TopContributor {
  name: string;
  avatar: string;
  coins: number;
}

export const getTopContributors = async (): Promise<TopContributor[]> => {
  if (!isFirebaseConfigured()) {
    // Return mock top contributors
    return [
      { name: "Omar Youssef", avatar: "https://i.pravatar.cc/40?img=8", coins: 120000 },
      { name: "Sara Ali", avatar: "https://i.pravatar.cc/40?img=5", coins: 89500 },
      { name: "Layla Ibrahim", avatar: "https://i.pravatar.cc/40?img=10", coins: 67800 },
      { name: "Mohamed Khaled", avatar: "https://i.pravatar.cc/40?img=3", coins: 45200 },
      { name: "Nadia Samir", avatar: "https://i.pravatar.cc/40?img=16", coins: 34500 },
    ];
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('coins', 'desc'), limit(5));
    const snapshot = await getDocs(q);
    
    const topContributors: TopContributor[] = [];
    snapshot.forEach((doc) => {
      const user = doc.data() as User;
      topContributors.push({
        name: user.name,
        avatar: user.image,
        coins: user.coins || 0,
      });
    });
    
    return topContributors;
  } catch (error) {
    console.error('Error getting top contributors:', error);
    // Fallback to mock data
    return [
      { name: "Omar Youssef", avatar: "https://i.pravatar.cc/40?img=8", coins: 120000 },
      { name: "Sara Ali", avatar: "https://i.pravatar.cc/40?img=5", coins: 89500 },
      { name: "Layla Ibrahim", avatar: "https://i.pravatar.cc/40?img=10", coins: 67800 },
      { name: "Mohamed Khaled", avatar: "https://i.pravatar.cc/40?img=3", coins: 45200 },
      { name: "Nadia Samir", avatar: "https://i.pravatar.cc/40?img=16", coins: 34500 },
    ];
  }
};

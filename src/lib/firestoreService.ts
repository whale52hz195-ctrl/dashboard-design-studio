import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import { mockUsersData } from '@/data/mockUsersData';

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

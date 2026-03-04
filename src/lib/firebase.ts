import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for alkasser-d7701 project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForTesting", // Get from Firebase Console > Project Settings > Web apps
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "alkasser-d7701.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "alkasser-d7701",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "alkasser-d7701.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "107246385920819292580",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:107246385920819292580:web:abcdef123456", // Get from Firebase Console
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


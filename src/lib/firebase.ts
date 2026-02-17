import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for alkasser-d7701 project
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTesting", // Get from Firebase Console > Project Settings > Web apps
  authDomain: "alkasser-d7701.firebaseapp.com",
  projectId: "alkasser-d7701",
  storageBucket: "alkasser-d7701.appspot.com",
  messagingSenderId: "107246385920819292580",
  appId: "1:107246385920819292580:web:abcdef123456" // Get from Firebase Console
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);


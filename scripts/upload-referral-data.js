import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration for alkasser-d7701 project
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTesting",
  authDomain: "alkasser-d7701.firebaseapp.com",
  projectId: "alkasser-d7701",
  storageBucket: "alkasser-d7701.appspot.com",
  messagingSenderId: "107246385920819292580",
  appId: "1:107246385920819292580:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample referral data matching the image
const sampleReferralData = [
  {
    targetReferrals: 50,
    rewardCoins: 100,
    createdAt: '2026-01-15 10:30:00',
    updatedAt: '2026-01-15 10:30:00',
    status: 'active'
  },
  {
    targetReferrals: 100,
    rewardCoins: 200,
    createdAt: '2026-01-14 14:20:00',
    updatedAt: '2026-01-14 14:20:00',
    status: 'completed'
  },
  {
    targetReferrals: 25,
    rewardCoins: 50,
    createdAt: '2026-01-13 09:15:00',
    updatedAt: '2026-01-13 09:15:00',
    status: 'expired'
  },
  {
    targetReferrals: 75,
    rewardCoins: 150,
    createdAt: '2026-01-12 16:45:00',
    updatedAt: '2026-01-12 16:45:00',
    status: 'active'
  },
  {
    targetReferrals: 150,
    rewardCoins: 300,
    createdAt: '2026-01-11 11:20:00',
    updatedAt: '2026-01-11 11:20:00',
    status: 'completed'
  },
  {
    targetReferrals: 30,
    rewardCoins: 60,
    createdAt: '2026-01-10 08:45:00',
    updatedAt: '2026-01-10 08:45:00',
    status: 'active'
  },
  {
    targetReferrals: 200,
    rewardCoins: 400,
    createdAt: '2026-01-09 15:30:00',
    updatedAt: '2026-01-09 15:30:00',
    status: 'expired'
  },
  {
    targetReferrals: 85,
    rewardCoins: 170,
    createdAt: '2026-01-08 13:10:00',
    updatedAt: '2026-01-08 13:10:00',
    status: 'active'
  }
];

async function uploadReferralData() {
  try {
    console.log('Starting to upload referral data to Firestore...');
    
    const referralsCollection = collection(db, 'referrals');
    
    for (const referral of sampleReferralData) {
      const docRef = await addDoc(referralsCollection, {
        ...referral,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Uploaded referral: Target ${referral.targetReferrals}, Reward ${referral.rewardCoins} coins (ID: ${docRef.id})`);
    }
    
    console.log(`\n🎉 Successfully uploaded ${sampleReferralData.length} referral entries to Firestore!`);
    
  } catch (error) {
    console.error('❌ Error uploading referral data:', error);
    process.exit(1);
  }
}

// Run the upload
uploadReferralData().then(() => {
  console.log('Upload completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('Upload failed:', error);
  process.exit(1);
});

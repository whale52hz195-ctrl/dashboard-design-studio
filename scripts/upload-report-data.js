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

// Sample report data matching the provided data
const sampleReportData = [
  {
    description: "User was being rude in chat",
    reason: "Harassment",
    reportedId: "user_2",
    reporterId: "user_1",
    status: "Pending",
    type: "User",
    createdAt: new Date("2026-01-04T02:13:01+02:00")
  },
  {
    description: "Stream contains violence",
    reason: "Inappropriate Content",
    reportedId: "stream_0",
    reporterId: "user_2",
    status: "Resolved",
    type: "Stream",
    createdAt: new Date("2026-01-03T23:13:01+02:00")
  },
  {
    description: "Spamming links",
    reason: "Spam",
    reportedId: "post_12",
    reporterId: "user_4",
    status: "Dismissed",
    type: "Post",
    createdAt: new Date("2026-01-03T01:42:50+02:00")
  }
];

async function uploadReportData() {
  try {
    console.log('Starting to upload report data to Firestore...');
    
    const reportsCollection = collection(db, 'reports');
    
    for (const report of sampleReportData) {
      const docRef = await addDoc(reportsCollection, {
        ...report,
        createdAt: serverTimestamp()
      });
      
      console.log(`✅ Uploaded report: ${report.type} - ${report.reason} (ID: ${docRef.id})`);
    }
    
    console.log(`\n🎉 Successfully uploaded ${sampleReportData.length} report entries to Firestore!`);
    
  } catch (error) {
    console.error('❌ Error uploading report data:', error);
    process.exit(1);
  }
}

// Run the upload
uploadReportData().then(() => {
  console.log('Upload completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('Upload failed:', error);
  process.exit(1);
});

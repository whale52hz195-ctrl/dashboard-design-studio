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

// Sample help requests data matching the image
const sampleHelpRequests = [
  {
    user: {
      name: 'Mr John Smith',
      username: '@john',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      hasHeart: true
    },
    helpRequest: 'I want to suggest an improvement for the library\'s collection system. The current interface could be more user-friendly with better search filters and categorization options.',
    contact: '+917226838645',
    date: '11/14/2025, 10:45:25 AM',
    image: 'https://picsum.photos/seed/help1/40/40',
    status: 'pending'
  },
  {
    user: {
      name: 'Sarah Johnson',
      username: '@sarahj',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      hasHeart: false
    },
    helpRequest: 'The leakage in pipes has for the past month or so been causing issues in the main building. We need immediate attention to this matter as it\'s affecting daily operations.',
    contact: '+917283834658',
    date: '11/14/2025, 11:02:16 AM',
    image: 'https://picsum.photos/seed/help2/40/40',
    status: 'pending'
  },
  {
    user: {
      name: 'Michael Chen',
      username: '@mchen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      hasHeart: true
    },
    helpRequest: 'Having trouble accessing my account after the recent update. The password reset link is not working and I need to submit urgent documents.',
    contact: '+917345678901',
    date: '11/13/2025, 3:30:45 PM',
    image: 'https://picsum.photos/seed/help3/40/40',
    status: 'solved'
  },
  {
    user: {
      name: 'Emily Davis',
      username: '@emilyd',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      hasHeart: false
    },
    helpRequest: 'Requesting information about the upcoming events schedule. The website calendar seems to be outdated and doesn\'t show the latest updates.',
    contact: '+917234567890',
    date: '11/13/2025, 2:15:30 PM',
    image: 'https://picsum.photos/seed/help4/40/40',
    status: 'solved'
  },
  {
    user: {
      name: 'Robert Wilson',
      username: '@rwilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
      hasHeart: true
    },
    helpRequest: 'Need assistance with the payment system. My recent transaction was declined but the amount was deducted from my account. Please investigate this issue.',
    contact: '+917456789012',
    date: '11/12/2025, 9:45:00 AM',
    image: 'https://picsum.photos/seed/help5/40/40',
    status: 'pending'
  }
];

async function uploadHelpRequests() {
  try {
    console.log('Starting to upload help requests to Firestore...');
    
    const helpRequestsCollection = collection(db, 'helpRequests');
    
    for (const request of sampleHelpRequests) {
      const docRef = await addDoc(helpRequestsCollection, {
        ...request,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Uploaded help request: ${request.user.name} (ID: ${docRef.id})`);
    }
    
    console.log(`\n🎉 Successfully uploaded ${sampleHelpRequests.length} help requests to Firestore!`);
    
  } catch (error) {
    console.error('❌ Error uploading help requests:', error);
    process.exit(1);
  }
}

// Check if config file exists and load Firebase config
const configPath = path.join(__dirname, '../src/lib/firebase.ts');
if (fs.existsSync(configPath)) {
  try {
    const firebaseConfigContent = fs.readFileSync(configPath, 'utf8');
    const configMatch = firebaseConfigContent.match(/export const firebaseConfig = ({[\s\S]*?});/);
    
    if (configMatch) {
      const configString = configMatch[1];
      const evalConfig = eval(`(${configString})`);
      Object.assign(firebaseConfig, evalConfig);
      console.log('✅ Loaded Firebase config from existing project');
    }
  } catch (error) {
    console.log('⚠️  Could not load Firebase config, using placeholder values');
  }
} else {
  console.log('⚠️  Firebase config file not found, using placeholder values');
  console.log('Please update the firebaseConfig object in this script with your actual Firebase configuration');
}

// Run the upload
uploadHelpRequests().then(() => {
  console.log('Upload completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('Upload failed:', error);
  process.exit(1);
});

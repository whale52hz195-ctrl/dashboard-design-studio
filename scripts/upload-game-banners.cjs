const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

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

// Game banner data
const gameBannersData = [
  {
    image: 'https://images.unsplash.com/photo-1511519549404-497d0f95c75f?w=800&h=200&fit=crop',
    redirectUrl: 'https://www.google.com/',
    status: 'Active',
    createdAt: Timestamp.fromDate(new Date('2025-08-07T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-07T00:00:00Z'))
  },
  {
    image: 'https://images.unsplash.com/photo-1517248131756-7c3971b47dc8?w=800&h=200&fit=crop',
    redirectUrl: 'https://www.facebook.com/',
    status: 'Active',
    createdAt: Timestamp.fromDate(new Date('2025-08-06T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-06T00:00:00Z'))
  },
  {
    image: 'https://images.unsplash.com/photo-1550537400-5c1a461d6d72?w=800&h=200&fit=crop',
    redirectUrl: 'https://www.instagram.com/',
    status: 'Active',
    createdAt: Timestamp.fromDate(new Date('2025-08-05T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-05T00:00:00Z'))
  },
  {
    image: 'https://images.unsplash.com/photo-1618461514105-c18fd2ce869d?w=800&h=200&fit=crop',
    redirectUrl: 'https://www.twitter.com/',
    status: 'Inactive',
    createdAt: Timestamp.fromDate(new Date('2025-08-04T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-04T00:00:00Z'))
  },
  {
    image: 'https://images.unsplash.com/photo-1558628025-126894d95cbb5?w=800&h=200&fit=crop',
    redirectUrl: 'https://www.youtube.com/',
    status: 'Active',
    createdAt: Timestamp.fromDate(new Date('2025-08-03T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-03T00:00:00Z'))
  }
];

async function uploadGameBanners() {
  try {
    console.log('Starting to upload game banners data...');
    
    const bannersCollection = collection(db, 'gameBanners');
    let uploadedCount = 0;
    
    for (const banner of gameBannersData) {
      try {
        const docRef = await addDoc(bannersCollection, banner);
        
        console.log(`✅ Uploaded banner: ${banner.redirectUrl} (ID: ${docRef.id})`);
        uploadedCount++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to upload banner: ${banner.redirectUrl}`, error);
      }
    }
    
    console.log(`\n🎉 Upload complete! Successfully uploaded ${uploadedCount}/${gameBannersData.length} game banners`);
    
  } catch (error) {
    console.error('❌ Error uploading game banners:', error);
  }
}

// Run the upload
uploadGameBanners().then(() => {
  console.log('✨ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});

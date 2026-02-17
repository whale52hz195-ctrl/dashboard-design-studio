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

// Gift banner data
const giftBannersData = [
  {
    image: 'https://picsum.photos/seed/giftbanner1/800/200.jpg',
    redirectUrl: 'https://www.google.com/',
    status: 'Active',
    createdAt: Timestamp.fromDate(new Date('2025-08-07T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-07T00:00:00Z'))
  },
  {
    image: 'https://picsum.photos/seed/giftbanner2/800/200.jpg',
    redirectUrl: 'https://www.facebook.com/',
    status: 'Active',
    createdAt: Timestamp.fromDate(new Date('2025-08-06T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-06T00:00:00Z'))
  },
  {
    image: 'https://picsum.photos/seed/giftbanner3/800/200.jpg',
    redirectUrl: 'https://www.instagram.com/',
    status: 'Active',
    createdAt: Timestamp.fromDate(new Date('2025-08-05T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-05T00:00:00Z'))
  },
  {
    image: 'https://picsum.photos/seed/giftbanner4/800/200.jpg',
    redirectUrl: 'https://www.twitter.com/',
    status: 'Inactive',
    createdAt: Timestamp.fromDate(new Date('2025-08-04T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-04T00:00:00Z'))
  },
  {
    image: 'https://picsum.photos/seed/giftbanner5/800/200.jpg',
    redirectUrl: 'https://www.youtube.com/',
    status: 'Active',
    createdAt: Timestamp.fromDate(new Date('2025-08-03T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-08-03T00:00:00Z'))
  }
];

async function uploadGiftBanners() {
  try {
    console.log('Starting to upload gift banners data...');
    
    const bannersCollection = collection(db, 'giftBanners');
    let uploadedCount = 0;
    
    for (const banner of giftBannersData) {
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
    
    console.log(`\n🎉 Upload complete! Successfully uploaded ${uploadedCount}/${giftBannersData.length} gift banners`);
    
  } catch (error) {
    console.error('❌ Error uploading gift banners:', error);
  }
}

// Run the upload
uploadGiftBanners().then(() => {
  console.log('✨ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});

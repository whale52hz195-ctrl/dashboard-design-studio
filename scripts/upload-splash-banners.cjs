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

// Splash banner data with the provided image
const splashBannersData = [
  {
    title: 'Welcome Splash',
    imageUrl: 'https://tingle.digicean.com/storage/1770902403898.jpg',
    linkTo: '/dashboard',
    linkType: 'internal',
    status: 'Active',
    type: 'splash',
    startDate: Timestamp.fromDate(new Date('2026-01-04T04:13:01+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-02-03T04:13:01+02:00')),
    order: 1,
    views: 12340,
    clicks: 890,
    clickRate: 7.2,
    createdAt: Timestamp.fromDate(new Date('2026-01-04T04:13:01+02:00'))
  },
  {
    title: 'New Year Splash',
    imageUrl: 'https://picsum.photos/seed/newyear/1920x1080.jpg',
    linkTo: '/events',
    linkType: 'internal',
    status: 'Active',
    type: 'splash',
    startDate: Timestamp.fromDate(new Date('2026-01-01T00:00:00+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-01-31T23:59:59+02:00')),
    order: 2,
    views: 25680,
    clicks: 3420,
    clickRate: 13.32,
    createdAt: Timestamp.fromDate(new Date('2026-01-01T00:00:00+02:00'))
  },
  {
    title: 'Special Offer Splash',
    imageUrl: 'https://picsum.photos/seed/specialoffer/1920x1080.jpg',
    linkTo: '/store',
    linkType: 'internal',
    status: 'Active',
    type: 'splash',
    startDate: Timestamp.fromDate(new Date('2026-01-15T00:00:00+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-01-25T00:00:00+02:00')),
    order: 3,
    views: 18920,
    clicks: 2150,
    clickRate: 11.36,
    createdAt: Timestamp.fromDate(new Date('2026-01-15T00:00:00+02:00'))
  },
  {
    title: 'Maintenance Notice',
    imageUrl: 'https://picsum.photos/seed/maintenance/1920x1080.jpg',
    linkTo: '/status',
    linkType: 'internal',
    status: 'Inactive',
    type: 'splash',
    startDate: Timestamp.fromDate(new Date('2026-01-20T00:00:00+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-01-21T00:00:00+02:00')),
    order: 4,
    views: 5670,
    clicks: 234,
    clickRate: 4.13,
    createdAt: Timestamp.fromDate(new Date('2026-01-20T00:00:00+02:00'))
  },
  {
    title: 'Holiday Celebration',
    imageUrl: 'https://picsum.photos/seed/holiday/1920x1080.jpg',
    linkTo: 'https://example.com/holiday',
    linkType: 'external',
    status: 'Active',
    type: 'splash',
    startDate: Timestamp.fromDate(new Date('2026-01-25T00:00:00+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-02-05T00:00:00+02:00')),
    order: 5,
    views: 34210,
    clicks: 4890,
    clickRate: 14.29,
    createdAt: Timestamp.fromDate(new Date('2026-01-25T00:00:00+02:00'))
  }
];

async function uploadSplashBanners() {
  try {
    console.log('Starting to upload splash banners data...');
    
    const bannersCollection = collection(db, 'splashBanners');
    let uploadedCount = 0;
    
    for (const banner of splashBannersData) {
      try {
        const docRef = await addDoc(bannersCollection, banner);
        
        console.log(`✅ Uploaded splash banner: ${banner.title} (ID: ${docRef.id})`);
        uploadedCount++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to upload splash banner: ${banner.title}`, error);
      }
    }
    
    console.log(`\n🎉 Upload complete! Successfully uploaded ${uploadedCount}/${splashBannersData.length} splash banners`);
    
  } catch (error) {
    console.error('❌ Error uploading splash banners:', error);
  }
}

// Run the upload
uploadSplashBanners().then(() => {
  console.log('✨ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
